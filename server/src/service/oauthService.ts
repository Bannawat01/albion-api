import crypto from "crypto"
import type { GoogleTokenResponse, GoogleUserInfo, User } from "../types/UserType"
import type { DatabaseService } from "../repository/authRepository"
import { DatabaseManager } from '../configs/databaseManager'
import { OAUTH_CONFIG } from "../configs/Oauth"

export class OAuthService {
  private db: DatabaseService
  // ลดขนาด Sets และ Maps
  private pendingStates = new Set<string>()
  private pendingRequests = new Map<string, Promise<User>>()

  constructor(db: DatabaseService) {
    if (!db) {
      throw new Error('DatabaseService is required')
    }
    this.db = db

    // เพิ่มความถี่ในการ cleanup (ทุก 2 นาที แทน 5 นาที)
    setInterval(() => {
      this.db.cleanupExpiredStates().catch(console.error)
      // เพิ่มการ cleanup pending states ที่เก่า
      this.cleanupOldPendingStates()
    }, 2 * 60 * 1000)
  }

  // เพิ่ม method สำหรับ cleanup pending states
  private cleanupOldPendingStates() {
    if (this.pendingStates.size > 100) {
      console.warn(`Large number of pending states: ${this.pendingStates.size}`)
    }
    if (this.pendingRequests.size > 50) {
      console.warn(`Large number of pending requests: ${this.pendingRequests.size}`)
    }
  }

  generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url')
  }

  generateCodeChallenge(verifier: string): string {
    return crypto.createHash('sha256').update(verifier).digest('base64url')
  }

  generateState(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  async getAuthorizationUrl(provider: 'google'): Promise<{ url: string; state: string }> {
    const config = OAUTH_CONFIG[provider]
    let state: string
    let attempts = 0

    // สร้าง unique state
    do {
      state = this.generateState()
      attempts++
      if (attempts > 10) {
        throw new Error('Failed to generate unique state after 10 attempts')
      }
    } while (this.pendingStates.has(state))

    this.pendingStates.add(state)

    try {
      const codeVerifier = this.generateCodeVerifier()
      const codeChallenge = this.generateCodeChallenge(codeVerifier)

      // Save state to database
      await this.db.saveOAuthState(state, codeVerifier, config.redirectUri)

      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scope,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      })

      // Auto-cleanup pending state after 10 minutes
      setTimeout(() => {
        this.pendingStates.delete(state)
      }, 10 * 60 * 1000)

      return {
        url: `${config.authUrl}?${params.toString()}`,
        state
      }
    } catch (error) {
      this.pendingStates.delete(state)
      throw error
    }
  }


  async exchangeCodeForToken(code: string, state: string): Promise<GoogleTokenResponse> {
    const config = OAUTH_CONFIG.google

    // เพิ่ม validation
    if (!this.db || typeof this.db.getOAuthState !== 'function') {
      throw new Error('Database service not properly initialized or getOAuthState method not found')
    }

    // Verify state and get code verifier
    const stateData = await this.db.getOAuthState(state)
    if (!stateData) {
      throw new Error('Invalid or expired state parameter')
    }

    // Delete used state immediately
    await this.db.deleteOAuthState(state)

    const tokenParams = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
      code_verifier: stateData.codeVerifier
    })

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams.toString()
    })

    if (!response.ok) {
      // Avoid logging/propagating the raw token-endpoint body (may echo secrets)
      await response.text().catch(() => '')
      throw new Error(`Token exchange failed with status ${response.status}`)
    }

    const tokenData = await response.json()
    if (tokenData.error) {
      throw new Error(`OAuth error: ${tokenData.error_description || tokenData.error}`)
    }

    return tokenData
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(OAUTH_CONFIG.google.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Google user info error: status', response.status)
      throw new Error(`Failed to fetch user info (status ${response.status})`)
    }

    const userInfo = await response.json()

    // Google uses 'sub' instead of 'id'
    if (!userInfo.sub || !userInfo.email) {
      console.error('Invalid user info received from Google (missing sub/email)')
      throw new Error('Invalid user info received from Google')
    }

    // Map 'sub' to 'id' for compatibility
    return {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    }
  }

  async handleCallback(code: string, state: string): Promise<User> {
    const requestKey = `${code}-${state}`
    if (this.pendingRequests.has(requestKey)) {
      return await this.pendingRequests.get(requestKey)!
    }

    const callbackPromise = this.processCallback(code, state)
    this.pendingRequests.set(requestKey, callbackPromise)

    try {
      const result = await callbackPromise
      return result
    } finally {
      this.pendingRequests.delete(requestKey)
      this.pendingStates.delete(state)
    }
  }

  private async processCallback(code: string, state: string): Promise<User> {
    try {
      const tokenResponse = await this.exchangeCodeForToken(code, state)
      const userInfo = await this.getUserInfo(tokenResponse.access_token)

      // Use id (which is mapped from sub) or fallback to sub
      const googleId = userInfo.id || userInfo.sub!
      if (!googleId) {
        throw new Error('No Google ID found in user info')
      }

      let user = await this.db.findUserByGoogleId(googleId)

      if (user) {
        user = await this.db.updateUser(googleId, {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        })
      } else {
        user = await this.db.createUser({
          googleId: googleId,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        })
      }

      if (!user) {
        throw new Error('Failed to create or update user')
      }

      console.log('OAuth callback completed successfully')
      return user
    } catch (error) {
      console.error('OAuth callback processing error:', error)
      throw error
    }
  }

  // Cleanup method สำหรับการปิด service
  cleanup() {
    this.pendingStates.clear()
    this.pendingRequests.clear()
  }
}
