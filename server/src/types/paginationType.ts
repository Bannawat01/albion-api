import type { PaginationConfig } from '../interface/paginationInterface'

// Helper type สำหรับ pagination parameters ที่ validated แล้ว
export interface ValidatedPaginationParams {
    page: number
    limit: number
    offset: number
}

// Default pagination configuration
export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
    defaultLimit: 20,
    maxLimit: 100,
    minLimit: 1
}

// Pagination constants
export const PAGINATION_CONSTANTS = {
    MIN_PAGE: 1,
    MIN_LIMIT: 1,
    MAX_LIMIT: 100,
    DEFAULT_LIMIT: 20
} as const

// Type สำหรับ pagination direction
export type PaginationDirection = 'next' | 'previous' | 'first' | 'last'

// Type สำหรับ sort order
export type SortOrder = 'asc' | 'desc'

// Extended pagination query with sorting
export interface ExtendedPaginationQuery {
    page?: number
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: SortOrder
}