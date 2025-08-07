// Base User interface
export interface User {
  _id?: string
  googleId: string
  email: string
  name: string
  picture: string
  createdAt: Date
  updatedAt: Date
}

// OAuth State interface for PKCE flow
export interface OAuthState {
  _id?: string
  state: string
  codeVerifier: string
  createdAt: Date
  expiresAt: Date
}

// Google OAuth Token Response
export interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  refresh_token?: string
  id_token?: string
}

// Google User Info Response
export interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale?: string
}

// JWT Payload interface
export interface JWTPayload {
  googleId: string
  email: string
  name: string
  iat: number
  exp: number
}

// API Response interfaces
export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    googleId: string
    email: string
    name: string
    picture: string
  }
}

export interface ErrorResponse {
  error: string
  message?: string
  code?: string
}

export interface UserProfileResponse {
  id: string
  googleId: string
  email: string
  name: string
  picture: string
  createdAt: Date
  updatedAt: Date
}

// OAuth Flow interfaces
export interface AuthorizationUrlResponse {
  url: string
  state: string
}

export interface OAuthCallbackParams {
  code?: string
  state?: string
  error?: string
  error_description?: string
}

// Database operation interfaces
export interface CreateUserData extends Omit<User, '_id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateUserData extends Partial<Omit<User, '_id' | 'googleId' | 'createdAt'>> {}

// Service configuration interface
export interface OAuthProviderConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string
  responseType: string
  accessType: string
  prompt: string
  codeChallengeMethod: string
  maxAge: number
  includeGrantedScopes: boolean
}

// Utility types
export type DatabaseUser = User & { _id: string }
export type SafeUser = Omit<User, '_id'> & { id: string }

// Convert database user to safe user (for API responses)
export const toSafeUser = (user: DatabaseUser): SafeUser => ({
  id: user._id,
  googleId: user.googleId,
  email: user.email,
  name: user.name,
  picture: user.picture,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
})

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateGoogleId = (googleId: string): boolean => {
  return typeof googleId === 'string' && googleId.length > 0
}