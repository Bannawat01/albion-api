/**
 * Central runtime flags and shared configuration.
 * Source of truth for environment-dependent behavior (production gating, CORS).
 */

export const isProduction = Bun.env.NODE_ENV === 'production'

const DEFAULT_ORIGINS = [
    'http://localhost:3000',
    'https://albion-market-ai.online',
    'https://www.albion-market-ai.online',
]

/**
 * Allowed browser origins for credentialed CORS.
 * Override with a comma-separated CORS_ORIGINS env var; otherwise use the
 * known frontend origins. Never falls back to "allow any" when credentials
 * are enabled, which would be unsafe.
 */
export const allowedOrigins: string[] = (() => {
    const fromEnv = (Bun.env.CORS_ORIGINS || '')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean)
    return fromEnv.length ? fromEnv : DEFAULT_ORIGINS
})()

const DEV_JWT_FALLBACK = 'fallback-secret-for-dev'

/**
 * Resolve the JWT signing secret. In production a real secret is mandatory;
 * the dev fallback is refused so tokens are never signed with a public value.
 */
export function getJwtSecret(): string {
    const secret = Bun.env.JWT_SECRET
    if (isProduction) {
        if (!secret || secret === DEV_JWT_FALLBACK) {
            throw new Error('JWT_SECRET must be set to a strong value in production')
        }
        return secret
    }
    return secret || DEV_JWT_FALLBACK
}
