import { isProduction } from "./runtime"

/**
 * Validate required environment at startup so misconfiguration fails fast
 * instead of surfacing as confusing runtime errors (or weak defaults).
 */
export const validateEnv = () => {
    // JWT secret is always required; PORT has a safe in-code fallback.
    const needBasic = ['JWT_SECRET']
    const missingBasic = needBasic.filter(k => !Bun.env[k])
    if (missingBasic.length) {
        throw new Error(`Missing environment variables: ${missingBasic.join(', ')}`)
    }

    if (isProduction) {
        // In production, OAuth + a real (non-fallback) secret are mandatory.
        const needProd = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI']
        const missingProd = needProd.filter(k => !Bun.env[k])
        if (missingProd.length) {
            throw new Error(`Missing production environment variables: ${missingProd.join(', ')}`)
        }
        if (Bun.env.JWT_SECRET === 'fallback-secret-for-dev') {
            throw new Error('JWT_SECRET must not use the development fallback value in production')
        }
    }

    const hasDirect = !!Bun.env.MONGODB_URI
    const hasUserPass = !!Bun.env.MONGO_USERNAME && !!Bun.env.MONGO_PASSWORD
    if (!hasDirect && !hasUserPass) {
        console.warn('[env] Neither MONGODB_URI nor (MONGO_USERNAME+MONGO_PASSWORD) provided; using local dev fallback if available')
    }
}
