export const OAUTH_CONFIG = {
  google: {
    clientId: Bun.env.GOOGLE_CLIENT_ID!,
    clientSecret: Bun.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: Bun.env.GOOGLE_REDIRECT_URI!,  // ✅ ใช้จาก .env โดยตรง
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scope: 'openid email profile'
  }
}