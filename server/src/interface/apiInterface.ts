// Common API interfaces and error handling

// API response wrapper (some endpoints may wrap responses)
export interface ApiResponse<T> {
    data: T
    timestamp?: string
}

// Error response from API
export interface ApiError {
    error: string
    message?: string
    statusCode?: number
}

// Rate limit information
export interface RateLimitInfo {
    remaining: number
    reset: number
    limit: number
}

// API configuration interface
export interface ApiConfig {
    baseUrl: string
    timeout?: number
    retryAttempts?: number
    useCompression?: boolean
}