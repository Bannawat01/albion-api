import Elysia from "elysia"
import { connectToDatabase } from "./configs/database"
import { connectToAlbion } from "./configs/albionbase"
import { tlsConfig } from "./configs/tls"
import type { CityName, CityLocationId } from "./types/itemBase"

console.log("Hello via Bun suiiii!")

// Connect to database first
await connectToDatabase.connect()

// Test Albion metadata fetching
try {
    const metadata = await connectToAlbion.connect()
    console.log(`Successfully loaded ${metadata.items.length} items and ${metadata.locations.length} locations`)
} catch (error) {
    console.error("Failed to load Albion metadata:", error)
}

const app = new Elysia()
    //     .get("/api/items", async () => {
    //         try {
    //             const metadata = await connectToAlbion.connect()
    //             const itemList = metadata.items.map((itemId: string) => {
    //                 const itemInfo = metadata.itemsData[itemId]
    //                 const itemName = itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || itemId
    //                 return {
    //                     id: itemId,
    //                     name: itemName,
    //                     uniqueName: itemInfo?.UniqueName || itemId
    //                 }
    //             })

    //             return {
    //                 success: true,
    //                 total: metadata.items.length,
    //                 showing: itemList.length,
    //                 items: itemList
    //             }
    //         } catch (error) {
    //             return {
    //                 success: false,
    //                 error: "Failed to fetch items",
    //                 message: error instanceof Error ? error.message : "Unknown error"
    //             }
    //         }
    // })
    .listen({
        port: Bun.env.PORT || 8800,
        tls: tlsConfig
    })



let protocol = 'http'
if ('cert' in tlsConfig ) {  
    protocol = 'https'
}
console.log(`${protocol}://${app.server?.hostname}:${app.server?.port}`)