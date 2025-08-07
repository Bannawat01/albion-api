import Elysia from "elysia"
import { connectToDatabase } from "./configs/database"
import { tlsConfig } from "./configs/tls"
import { itemController } from "./controller/itemController"
import { goldController } from "./controller/goldController"
import { errorHandler } from "./middleware/errorHandler"
import { OauthController } from "./controller/authcontroller"


await connectToDatabase.connect()



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
