import { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError, ValidationError, ExternalApiError, ConnectionError } from "./customError"

export const errorHandler = ({ error, code }: { error: any; code?: unknown }) => {
    if (code === 'NOT_FOUND') {
        return new Response(JSON.stringify({ error: 'Not Found', message: 'Not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        })
    }
    if (error instanceof BadRequestError) {
        return new Response(JSON.stringify({
            error: 'Bad Request',
            message: error.message
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    if (error instanceof UnauthorizedError) {
        return new Response(JSON.stringify({
            error: 'Unauthorized',
            message: error.message
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    if (error instanceof ForbiddenError) {
        return new Response(JSON.stringify({
            error: 'Forbidden',
            message: error.message
        }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }

    if (error instanceof NotFoundError) {
        return new Response(JSON.stringify({
            error: 'Not Found',
            message: error.message
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    if (error instanceof ValidationError) {
        return new Response(JSON.stringify({
            error: 'Validation Failed',
            message: error.message,
            errors: error.errors
        }), { status: 422, headers: { 'Content-Type': 'application/json' } })
    }

    if (error instanceof ExternalApiError) {
        return new Response(JSON.stringify({
            error: 'Bad Gateway',
            message: error.message
        }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }

    // ConnectionError extends Error, so it must be handled before the generic
    // Error branch below (otherwise it would be swallowed as a 500).
    if (error instanceof ConnectionError) {
        return new Response(JSON.stringify({
            error: 'Service Unavailable',
            message: 'Service temporarily unavailable, please try again later'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    // Unexpected errors: log the real detail server-side but never leak
    // internal messages/stack to the client.
    console.error('[errorHandler] Unhandled error:', error)
    return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'Something went wrong'
    }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    })
}
