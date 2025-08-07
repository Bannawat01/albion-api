import Elysia from "elysia"
import { connectToDatabase } from "./configs/database"
import { tlsConfig } from "./configs/tls"
import { itemController } from "./controller/itemController"
import { goldController } from "./controller/goldController"
import { errorHandler } from "./middleware/errorHandler"
import { OauthController } from "./controller/authcontroller"


await connectToDatabase.connect()

// Test Albion metadata fetching
// try {
//     const metadata = await connectToAlbion.connect()
//     console.log(`Successfully loaded ${metadata.items.length} items and ${metadata.locations.length} locations`)
// } catch (error) {
//     console.error("Failed to load Albion metadata:", error)
// }

const app = new Elysia()
    .onError(errorHandler)
    .use(itemController)
    .use(goldController)
    .use(OauthController)
    .listen({
        port: Bun.env.PORT || 8800,
        tls: tlsConfig
    })



let protocol = 'http'
if ('cert' in tlsConfig) {
    protocol = 'https'
}
console.log(`${protocol}://${app.server?.hostname}:${app.server?.port}`)
