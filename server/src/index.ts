import Elysia from "elysia";
import { connectToDatabase } from "./configs/database"

console.log("Hello via Bun suiiii!")
await connectToDatabase.connect()

const app = new Elysia()
.listen({
    port: Bun.env.PORT || 8800
  })

let protocol = 'http'

console.log(`${protocol}://${app.server?.hostname}:${app.server?.port}`)