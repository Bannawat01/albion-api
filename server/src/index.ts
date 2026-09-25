import Elysia from "elysia"
import { connectToDatabase } from "./configs/database"
import { tlsConfig } from "./configs/tls"
import { itemController } from "./controller/itemController"
import { goldController } from "./controller/goldController"
import { recommendationController } from "./controller/recommendationController"
import { analyticsController } from "./controller/analyticsController"
import { opportunitiesController } from "./controller/opportunitiesController"
import { errorHandler } from "./middleware/errorHandler"
import { OauthController } from "./controller/authcontroller"
import { DatabaseManager } from "./configs/databaseManager"
import { securityHeaders } from "./middleware/security"
import { requestLogger } from "./middleware/logger"
import { performanceMonitor } from "./service/performanceMonitor"
import { cors } from "@elysiajs/cors"
import { validateEnv } from "./configs/env"
import { allowedOrigins } from "./configs/runtime"

// Fail fast on missing/invalid configuration before accepting traffic.
validateEnv()

await connectToDatabase.connect()

try {
    await DatabaseManager.getInstance().initializeIndexes()
    console.log('Database indexes initialized successfully')
} catch (error) {
    console.error('Failed to initialize database indexes:', error)
}


const app = new Elysia()
    .onError(errorHandler)
    .use(requestLogger())
    .use(securityHeaders())
 .use(cors({
   origin: allowedOrigins, // allowed frontends (override with CORS_ORIGINS env)
   credentials: true,
   allowedHeaders: ['Content-Type', 'Authorization', 'X-Analytics-Key']
 }))
    .get('/', () => ({
        message: 'Albion API Server',
        version: '1.0.0',
        status: 'running'
    }))
    .get('/favicon.ico', ({ set }) => {
        set.status = 204
        return
    })
    .use(itemController)
    .use(goldController)
    .use(OauthController)
    .use(recommendationController)
    .use(analyticsController)
    .use(opportunitiesController)
    .get('/api/health', () => ({ status: 'ok' }))
    .get('/health/database', async ({ request, set }) => {
        if (!Bun.env.ANALYTICS_KEY || request.headers.get('x-analytics-key') !== Bun.env.ANALYTICS_KEY) {
            set.status = 404
            return { message: 'Not found' }
        }
        const healthStatus = await DatabaseManager.getInstance().healthCheck()
        return healthStatus
    })
    .get('/health/performance', ({ request, set }) => {
        if (!Bun.env.ANALYTICS_KEY || request.headers.get('x-analytics-key') !== Bun.env.ANALYTICS_KEY) {
            set.status = 404
            return { message: 'Not found' }
        }
        return performanceMonitor.getSystemHealth()
    })
    .get('/metrics/endpoints', ({ request, set }) => {
        if (!Bun.env.ANALYTICS_KEY || request.headers.get('x-analytics-key') !== Bun.env.ANALYTICS_KEY) {
            set.status = 404
            return { message: 'Not found' }
        }
        return performanceMonitor.getEndpointStats()
    })
    .get('/metrics/connections', ({ request, set }) => {
        if (!Bun.env.ANALYTICS_KEY || request.headers.get('x-analytics-key') !== Bun.env.ANALYTICS_KEY) {
            set.status = 404
            return { message: 'Not found' }
        }
        return connectToDatabase.getConnectionStats()
    })
    .listen({
        port: Bun.env.PORT || 8800,
        hostname: '0.0.0.0',
        tls: tlsConfig
    })



const hasTLS = typeof (tlsConfig as any).cert !== 'undefined'
const protocol = hasTLS ? 'https' : 'http'
console.log(`[server] Listening on ${protocol}://${app.server?.hostname}:${app.server?.port}`)
if (!hasTLS) {
    console.log('[server] TLS disabled (set ENABLE_TLS=true to enable self-signed cert)')
} else {
    console.log('[server] TLS enabled (self-signed). If browser shows ERR_SSL_PROTOCOL_ERROR try:')
    console.log('  1) Clear HSTS / force reload (Chrome: chrome://net-internals/#hsts)')
    console.log('  2) Use curl -k https://localhost:8800/')
    console.log('  3) Confirm cert files in ssl/ match localhost CN')
}
