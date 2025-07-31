import { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError, ValidationError, ExternalApiError } from "./customError"

export const errorHandler = ({ error }: { error: any }) => {
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


    // Handle standard Error objects
    if (error instanceof Error) {
        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: error.message || 'Something went wrong'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    // Handle other error types
    return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'Something went wrong'
    }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    })
}