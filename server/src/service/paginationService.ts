import type {
    PaginationQuery,
    PaginationMeta,
    PaginatedResponse,
    PaginationConfig
} from '../interface/paginationInterface'
import type { ValidatedPaginationParams } from '../types/paginationType'
import { DEFAULT_PAGINATION_CONFIG } from '../types/paginationType'

export class PaginationService {
    // สร้าง pagination metadata
    static createMeta(
        currentPage: number,
        limit: number,
        totalItems: number
    ): PaginationMeta {
        const totalPages = Math.ceil(totalItems / limit)
        const hasNextPage = currentPage < totalPages
        const hasPreviousPage = currentPage > 1

        return {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage,
            hasPreviousPage,
            nextPage: hasNextPage ? currentPage + 1 : null,
            previousPage: hasPreviousPage ? currentPage - 1 : null
        }
    }

    /**
     * Validate และ normalize pagination parameters
     */
    static validateParams(
        query: PaginationQuery,
        config: PaginationConfig = DEFAULT_PAGINATION_CONFIG
    ): ValidatedPaginationParams {
        // ถ้ามี offset ให้คำนวณ page จาก offset
        let page = query.page || 1
        let limit = query.limit || config.defaultLimit

        if (query.offset !== undefined) {
            page = Math.floor(query.offset / limit) + 1
        }

        // Validate และ clamp values
        page = Math.max(1, Math.floor(page))
        limit = Math.max(config.minLimit, Math.min(config.maxLimit, Math.floor(limit)))

        const offset = (page - 1) * limit

        return { page, limit, offset }
    }

    /**
     * สร้าง paginated response
     */
    static createResponse<T>(
        data: T[],
        totalItems: number,
        params: ValidatedPaginationParams,
        message?: string
    ): PaginatedResponse<T> {
        return {
            data,
            pagination: this.createMeta(params.page, params.limit, totalItems),
            success: true,
            message
        }
    }

    /**
     * คำนวณ offset จาก page และ limit
     */
    static calculateOffset(page: number, limit: number): number {
        return (page - 1) * limit
    }

    /**
     * คำนวณ page จาก offset และ limit
     */
    static calculatePage(offset: number, limit: number): number {
        return Math.floor(offset / limit) + 1
    }

    /**
     * ตรวจสอบว่า pagination parameters ถูกต้องหรือไม่
     */
    static isValidPagination(query: PaginationQuery): boolean {
        const { page, limit, offset } = query

        // ตรวจสอบ page
        if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
            return false
        }

        // ตรวจสอบ limit
        if (limit !== undefined && (limit < 1 || !Number.isInteger(limit))) {
            return false
        }

        // ตรวจสอบ offset
        if (offset !== undefined && (offset < 0 || !Number.isInteger(offset))) {
            return false
        }

        return true
    }
}