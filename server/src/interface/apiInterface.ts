// Common API interfaces and error handling

import type { Region } from "../types/itemBase"

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

export interface ApiConfig {
    baseUrls: Record<Region, string>
    rateLimits: {
        perMinute: number
        perFiveMinutes: number
    }
    urlMaxLength: number
}