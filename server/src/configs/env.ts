export const validateEnv = () => {
    const needBasic = ['JWT_SECRET', 'PORT']
    const missingBasic = needBasic.filter(k => !Bun.env[k])
    if (missingBasic.length) {
        throw new Error(`Missing environment variables: ${missingBasic.join(', ')}`)
    }

    const hasDirect = !!Bun.env.MONGODB_URI
    const hasUserPass = !!Bun.env.MONGO_USERNAME && !!Bun.env.MONGO_PASSWORD
    if (!hasDirect && !hasUserPass) {
        console.warn('[env] Neither MONGODB_URI nor (MONGO_USERNAME+MONGO_PASSWORD) provided; using local dev fallback if available')
    }
}