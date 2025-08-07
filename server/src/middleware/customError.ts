export class NotFoundError extends Error {
    statusCode: number = 404

    constructor(message: string) {
        super(message)
        this.name = 'NotFoundError'
        Object.setPrototypeOf(this, NotFoundError.prototype)
    }
}

export class BadRequestError extends Error {
    statusCode: number = 400

    constructor(message: string) {
        super(message)
        this.name = 'BadRequestError'
        Object.setPrototypeOf(this, BadRequestError.prototype)
    }
}

export class UnauthorizedError extends Error {
    statusCode: number = 401

    constructor(message: string) {
        super(message)
        this.name = 'UnauthorizedError'
        Object.setPrototypeOf(this, UnauthorizedError.prototype)
    }
}

//User authenticated แต่ไม่มีสิทธิ์เข้าถึง
export class ForbiddenError extends Error {
    statusCode: number = 403

    constructor(message: string) {
        super(message)
        this.name = 'ForbiddenError'
        Object.setPrototypeOf(this, ForbiddenError.prototype)
    }
}

export class ValidationError extends Error {
    statusCode: number = 422
    public errors: Record<string, string[]>

    constructor(message: string = "Validation Failed", errors: Record<string, string[]> = {}) {
        super(message)
        this.name = 'ValidationError'
        this.errors = errors
        Object.setPrototypeOf(this, ValidationError.prototype)



    }
}

export class ConnectionError extends Error {
    statusCode: number = 85

    constructor(message: string = "Connection Error") {
        super(message)
        this.name = 'ConnectionError'
        Object.setPrototypeOf(this, ConnectionError.prototype)
    }
}

export class ExternalApiError extends Error {
    statusCode: number = 502

    constructor(message: string = "External API Error") {
        super(message)
        this.name = 'ExternalApiError'
        Object.setPrototypeOf(this, ExternalApiError.prototype)
    }
}

import { DatabaseManager } from '../configs/databaseManager'

export const databaseHealthMiddleware = async ({ set }: any) => {
    const health = await DatabaseManager.getInstance().healthCheck()
    if (health.status !== 'healthy') {
        set.status = 503
        return { error: 'Database unavailable' }
    }
}