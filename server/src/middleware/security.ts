import Elysia from "elysia"

export const securityHeaders = () => new Elysia()
    .onBeforeHandle(({ set, request }) => {
        // Content Security Policy
        set.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"

        // Prevent MIME type sniffing
        set.headers['X-Content-Type-Options'] = 'nosniff'

        // Prevent clickjacking
        set.headers['X-Frame-Options'] = 'DENY'

        // XSS protection
        set.headers['X-XSS-Protection'] = '1; mode=block'

        // HSTS (HTTP Strict Transport Security)
        if (request.url.startsWith('https://')) {
            set.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        }

        // Referrer Policy
        set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        // Permissions Policy
        set.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'

        // Remove server information
        set.headers['X-Powered-By'] = ''

        // Cache control for sensitive endpoints
        if (request.url.includes('/api/') && !request.url.includes('/health/')) {
            set.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            set.headers['Pragma'] = 'no-cache'
            set.headers['Expires'] = '0'
        }
    })