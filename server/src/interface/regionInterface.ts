import type { Region } from "../types/itemBase"

// API response wrapper (some endpoints may wrap responses)
export interface ApiResponse<T> {
    data: T
    timestamp?: string
}

export interface RegionRequest {
    region: Region
}

export interface ApiRequestOptions {
    timeout?: number
    retries?: number
    headers?: Record<string, string>
}

export interface FilterRequest {
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface NameFilterRequest extends FilterRequest {
    name?: string
}

export interface ApiConfig {
    baseUrls: Record<Region, string>
    rateLimits: {
        perMinute: number
        perFiveMinutes: number
    }
    urlMaxLength: number
}

// Rate limit information
export interface RateLimitInfo {
    remaining: number
    reset: number
    limit: number
}