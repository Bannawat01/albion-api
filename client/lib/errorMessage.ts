// API Error Types
export interface ApiErrorResponse {
    success: false
    message: string
    code?: string
    statusCode?: number
    details?: any
}

// Custom API Error Class
export class ApiError extends Error {
    public readonly statusCode: number
    public readonly code?: string
    public readonly details?: any

    constructor(
        message: string,
        statusCode: number = 500,
        code?: string,
        details?: any
    ) {
        super(message)
        this.name = 'ApiError'
        this.statusCode = statusCode
        this.code = code
        this.details = details

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError)
        }
    }

    // Convert to JSON for logging or API responses
    toJSON(): ApiErrorResponse {
        return {
            success: false,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details
        }
    }
}

// Network Error Class
export class NetworkError extends ApiError {
    constructor(message: string = 'Network connection failed') {
        super(message, 0, 'NETWORK_ERROR')
        this.name = 'NetworkError'
    }
}

// Validation Error Class
export class ValidationError extends ApiError {
    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details)
        this.name = 'ValidationError'
    }
}

// Authentication Error Class
export class AuthError extends ApiError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401, 'AUTH_ERROR')
        this.name = 'AuthError'
    }
}

// Authorization Error Class
export class AuthorizationError extends ApiError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR')
        this.name = 'AuthorizationError'
    }
}

// Not Found Error Class
export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND_ERROR')
        this.name = 'NotFoundError'
    }
}

// Error Handler Function
export const handleApiError = (error: any): ApiError => {
    // If it's already our custom error, return as is
    if (error instanceof ApiError) {
        return error
    }

    // Handle Axios errors
    if (error.response) {
        const { status, data } = error.response
        const message = data?.message || data?.error || 'Server error occurred'

        switch (status) {
            case 400:
                return new ValidationError(message, data?.details)
            case 401:
                return new AuthError(message)
            case 403:
                return new AuthorizationError(message)
            case 404:
                return new NotFoundError(message)
            default:
                return new ApiError(message, status, data?.code, data?.details)
        }
    }

    // Handle network errors
    if (error.request) {
        return new NetworkError('Unable to connect to server')
    }

    // Handle other errors
    if (error instanceof Error) {
        return new ApiError(error.message)
    }

    // Handle unknown errors
    return new ApiError('An unexpected error occurred')
}

// Utility function to get error message
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
        return error.message
    }
    if (error instanceof Error) {
        return error.message
    }
    if (typeof error === 'string') {
        return error
    }
    return 'An unexpected error occurred'
}

// Utility function to check error type
export const isApiError = (error: unknown): error is ApiError => {
    return error instanceof ApiError
}

export const isNetworkError = (error: unknown): error is NetworkError => {
    return error instanceof NetworkError
}

export const isAuthError = (error: unknown): error is AuthError => {
    return error instanceof AuthError
}

export const isValidationError = (error: unknown): error is ValidationError => {
    return error instanceof ValidationError
}

// Error logging utility
export const logError = (error: ApiError, context?: string) => {
    const errorInfo = {
        ...error.toJSON(),
        context,
        timestamp: new Date().toISOString(),
        stack: error.stack
    }

    console.error('API Error:', errorInfo)

    // Here you can add external logging service integration
    // e.g., Sentry, LogRocket, etc.
}

export type LoginErrorCode =
    | 'user_cancelled'
    | 'auth_failed'
    | 'oauth_error'
    | 'invalid_callback'
    | 'session_expired'
    | 'invalid_credentials'

// Login Error Class
export class LoginError extends ApiError {
    public readonly errorCode: LoginErrorCode

    constructor(code: LoginErrorCode, message?: string) {
        const defaultMessages: Record<LoginErrorCode, string> = {
            user_cancelled: 'Login cancelled by user',
            auth_failed: 'Authentication failed. Please try again',
            oauth_error: 'Error occurred with Google OAuth',
            invalid_callback: 'Invalid callback data',
            session_expired: 'Session expired. Please login again',
            invalid_credentials: 'Invalid login credentials'
        }

        super(message || defaultMessages[code], 401, code)
        this.name = 'LoginError'
        this.errorCode = code
    }
}

// Utility function for login errors
export const getLoginErrorMessage = (errorCode: string | null): string | null => {
    if (!errorCode) return null

    const loginErrorCodes: LoginErrorCode[] = [
        'user_cancelled',
        'auth_failed',
        'oauth_error',
        'invalid_callback',
        'session_expired',
        'invalid_credentials'
    ]

    if (loginErrorCodes.includes(errorCode as LoginErrorCode)) {
        const loginError = new LoginError(errorCode as LoginErrorCode)
        return loginError.message
    }

    return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
}

export const isLoginError = (error: unknown): error is LoginError => {
    return error instanceof LoginError
}