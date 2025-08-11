const requiredEnvVars = [
    'MONGO_USERNAME',
    'MONGO_PASSWORD',
    'JWT_SECRET',
    'PORT'
]

export const validateEnv = () => {
    const missing = requiredEnvVars.filter(key => !Bun.env[key])
    if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`)
    }
}