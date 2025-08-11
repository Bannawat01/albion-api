import cors from "@elysiajs/cors"
import jwt from "@elysiajs/jwt"
import Elysia from "elysia"
import { OAuthService } from "../service/oauthService"
import { connectToDatabase } from "../configs/database"
import { DatabaseService } from "../repository/authRepository"
import { DatabaseManager } from "../configs/databaseManager"
import { ConnectionError } from "../middleware/customError"
import { handleOAuthError } from "../middleware/oauthErrorHandler"

let dbService: any
let oauthService: OAuthService

const initializeServices = async () => {
  try {
    // ตรวจสอบว่าฐานข้อมูลเชื่อมต่อแล้วหรือยัง
    if (!connectToDatabase.isConnected()) {
      await connectToDatabase.connect()
    }

    const healthCheck = await DatabaseManager.getInstance().healthCheck()
    if (healthCheck.status !== 'healthy') {
      throw new ConnectionError('Database is not healthy')
    }

    const client = connectToDatabase.getClient()
    const db = connectToDatabase.getDb()

    if (!client || !db) {
      throw new Error('MongoClient or Db is undefined!')
    }

    const databaseInstance = new DatabaseService(client, db) // ✅
    dbService = databaseInstance
    oauthService = new OAuthService(databaseInstance)

    if (!dbService) {
      throw new Error('Database service is null after connection')
    }

    oauthService = new OAuthService(dbService)
  } catch (error) {
    console.error('Service initialization error:', error)
    throw error
  }
}


// Initialize services
await initializeServices()

export const OauthController = new Elysia({ prefix: "/api" })
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: Bun.env.JWT_SECRET || 'fallback-secret-for-dev'
  }))

  // Start OAuth flow
  .get('/auth/:provider', async ({ params, set }) => {
    try {


      if (params.provider !== 'google') {
        set.status = 400
        return { error: 'Unsupported provider' }
      }

      if (!oauthService) {
        throw new Error('OAuth service is not initialized')
      }


      const { url, state } = await oauthService.getAuthorizationUrl('google')
      // console.log('Generated URL:', url); // ลบออก
      return {
        success: true,
        message: 'Redirecting to OAuth provider',
        url,
        state
      }
    } catch (error) {
      console.error('OAuth error:', error) // เก็บเฉพาะ error สำคัญ
      set.status = 500
      return { error: 'Failed to initialize OAuth flow' }
    }
  })

  // OAuth callback
  // OAuth callback - Updated error handling
  .get('/auth/:provider/callback', async ({ params, query, set, jwt }) => {
    try {
      if (params.provider !== 'google') {
        set.status = 400
        return { error: 'Unsupported provider' }
      }

      const { code, state, error } = query as {
        code?: string
        state?: string
        error?: string
      }
<<<<<<< Updated upstream

      // Handle OAuth errors
      if (error) {
        return handleOAuthError(error)
      }

      if (!code || !state) {
        set.status = 400
        return { error: 'Missing code or state parameter' }
      }

      // Handle OAuth callback
      const user = await oauthService.handleCallback(code, state)


      const token = await jwt.sign({
        googleId: user.googleId,
        email: user.email,
        name: user.name
      })

      // Set cookie
      set.cookie = {
        'auth-token': {
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 // 7 days
        }
      }

      // Redirect to frontend with success
      set.status = 302
      set.headers = {
        'Location': `http://localhost:3000/?token=${token}&success=true`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
      return

    } catch (error) {
      console.error('OAuth callback error:', error)

      // More specific error handling
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'

      if (error instanceof Error) {
        // You can add specific error type checking here
        if (error.message.includes('invalid_grant')) {
          errorMessage = 'รหัสการตรวจสอบหมดอายุ กรุณาลองใหม่อีกครั้ง'
        } else if (error.message.includes('network')) {
          errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
        }
      }

      // Redirect to frontend with error
      set.status = 302
      set.headers = {
        'Location': `http://localhost:3000/login?error=${encodeURIComponent(errorMessage)}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
      return
    }
  })

  // Get current user
  .get('/auth/me', async ({ headers, jwt, set }) => {
    try {
      const authHeader = headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        set.status = 401
        return { error: 'Missing or invalid token' }
      }

      const token = authHeader.slice(7)
      const payload = await jwt.verify(token)

      if (!payload) {
        set.status = 401
        return { error: 'Invalid token' }
      }

      // ใช้ dbService ที่ initialize แล้ว
      const user = await dbService.findUserByGoogleId(String(payload.googleId))
      if (!user) {
        set.status = 404
        return { error: 'User not found' }
      }

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    } catch (error) {
      set.status = 401
      return { error: 'Token verification failed' }
    }
  })

  // Logout
  .post('/auth/logout', ({ set }) => {
    set.cookie = {
      'auth-token': {
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0
      }
    }
    return { message: 'Logged out successfully' }
  })