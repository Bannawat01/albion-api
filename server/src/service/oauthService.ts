import crypto from "crypto"
import type { GoogleTokenResponse, GoogleUserInfo, User } from "../types/UserType"
import type { DatabaseService } from "../repository/authRepository"
import { DatabaseManager } from '../configs/databaseManager'
import { OAUTH_CONFIG } from "../configs/Oauth"

class SomeService {
  async initialize() {
    // ตรวจสอบว่า indexes ถูกสร้างแล้วหรือยัง
    await DatabaseManager.getInstance().initializeIndexes()
  }
}
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
        code_challenge_method: 'S256',
        access_type: 'offline',
        prompt: 'consent'
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
      const errorText = await response.text()
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`)
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
      const errorText = await response.text()
      throw new Error(`Failed to fetch user info: ${response.status} ${errorText}`)
    }

    const userInfo = await response.json()
    if (!userInfo.id || !userInfo.email) {
      throw new Error('Invalid user info received from Google')
    }

    return userInfo
  }

  async handleCallback(code: string, state: string): Promise<User> {
    const requestKey = `${code}-${state}`
    if (this.pendingRequests.has(requestKey)) {
      // console.log('Duplicate callback request detected, waiting for existing request...'); // ลบออก
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

      let user = await this.db.findUserByGoogleId(userInfo.id)

      if (user) {
        user = await this.db.updateUser(userInfo.id, {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        })
        // console.log(`Updated existing user: ${userInfo.email}`) // ลบออก
      } else {
        user = await this.db.createUser({
          googleId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        })
        // console.log(`Created new user: ${userInfo.email}`) // ลบออก
      }

      if (!user) {
        throw new Error('Failed to create or update user')
      }

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