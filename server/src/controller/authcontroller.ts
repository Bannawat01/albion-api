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

    const databaseInstance = new DatabaseService(client, db)
    dbService = databaseInstance

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

export const OauthController = new Elysia()
.use(cors({
  origin: true, // Allow any origin for development
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}))
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
      return {
        success: true,
        message: 'Redirecting to OAuth provider',
        url,
        state
      }
    } catch (error) {
      console.error('OAuth error:', error)
      set.status = 500
      return { error: 'Failed to initialize OAuth flow' }
    }
  })

  // OAuth callback
  .get('/auth/google/callback', async ({ query, set, jwt }) => {
    try {

      const { code, state, error } = query as {
        code?: string
        state?: string
        error?: string
      }

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

      set.cookie = {
  'auth-token': {
    value: token,
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  },
  // 👇 เพิ่มคุกกี้สถานะให้ middleware ใช้ gate หน้า
  'logged_in': {
    value: '1',
    httpOnly: false,       // ให้ Next/middleware อ่านได้
    secure: false,         // dev: false; prod ควร true
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  }
}

return new Response(null, {
  status: 303,
  headers: {
    Location: `${Bun.env.FRONTEND_URL || 'https://albion-market-ai.online'}/auth/callback?token=${encodeURIComponent(token)}`
  }
})
    } catch (error) {
      console.error('OAuth callback error:', error)
      set.status = 500
      return {
        error: 'Authentication failed',
      }
    }
  })

  // Get current user
  .get('/auth/me', async ({ headers, jwt, set }) => {
    try {
      const auth = headers.authorization
      const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined
      if (!token) { set.status = 401; return { error: 'Missing token' } }

      const payload = await jwt.verify(token)
      if (!payload) { set.status = 401; return { error: 'Invalid token' } }

      const user = await dbService.findUserByGoogleId(String(payload.googleId))
      if (!user) { set.status = 404; return { error: 'User not found' } }

      return { id: user._id, email: user.email, name: user.name, picture: user.picture }
    } catch (error) {
      console.error('Auth me error:', error)
      set.status = 500
      return { error: 'Internal server error' }
    }
  })

.post('/auth/logout', ({ set }) => {
  set.cookie = {
    'auth-token': { value: '', httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 },
    'logged_in':  { value: '', httpOnly: false, sameSite: 'lax', path: '/', maxAge: 0 } // 👈 เพิ่ม
  }
  return { message: 'Logged out successfully' }
})