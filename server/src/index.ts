import Elysia from "elysia"
import { connectToDatabase } from "./configs/database"
import { tlsConfig } from "./configs/tls"

console.log("Hello via Bun suiiii!")
await connectToDatabase.connect()

const app = new Elysia().listen({
    port: Bun.env.PORT || 8800,
    tls: tlsConfig
})

let protocol = 'http'
if ('cert' in tlsConfig) {
    protocol = 'https'
}
console.log(`${protocol}://${app.server?.hostname}:${app.server?.port}`)


