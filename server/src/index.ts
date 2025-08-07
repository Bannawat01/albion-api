import Elysia from "elysia"
import { connectToDatabase } from "./configs/database"
import { tlsConfig } from "./configs/tls"
import { itemController } from "./controller/itemController"
import { goldController } from "./controller/goldController"
import { errorHandler } from "./middleware/errorHandler"
import { OauthController } from "./controller/authcontroller"
import { DatabaseManager } from "./configs/databaseManager"


await connectToDatabase.connect()

try {
    await DatabaseManager.getInstance().initializeIndexes()
    console.log('Database indexes initialized successfully')
} catch (error) {
    console.error('Failed to initialize database indexes:', error)
}


const app = new Elysia()
    .onError(errorHandler)
    .use(itemController)
    .use(goldController)
    .use(OauthController)
    .listen({
        port: Bun.env.PORT || 8800,
        tls: tlsConfig
    })
app.get('/health/database', async () => {
    const healthStatus = await DatabaseManager.getInstance().healthCheck()
    return healthStatus
})



let protocol = 'http'
if ('cert' in tlsConfig) {
    protocol = 'https'
}
console.log(`${protocol}://${app.server?.hostname}:${app.server?.port}`)
