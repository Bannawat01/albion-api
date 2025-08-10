import Elysia from "elysia"

export const securityHeaders = () => new Elysia()
    .onBeforeHandle(({ set }) => {
        set.headers['X-Content-Type-Options'] = 'nosniff'
        set.headers['X-Frame-Options'] = 'DENY'
        set.headers['X-XSS-Protection'] = '1; mode=block'
    })