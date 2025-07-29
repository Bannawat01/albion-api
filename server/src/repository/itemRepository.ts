import { Db } from "mongodb"

export class ItemRepository {
    private db: Db

    constructor(db: Db) {
        this.db = db
    }

    // Fetch items and locations metadata
    async fetchMetadata(): Promise<{ items: string[], locations: string[] }> {
        try {
            console.log("Fetching metadata...")

            const itemsResponse = await fetch(
                "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json",
                { headers: { "Accept-Encoding": "gzip" } }
            )
            const itemsData = await itemsResponse.json()

            const locationsResponse = await fetch(
                "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/world.json",
                { headers: { "Accept-Encoding": "gzip" } }
            )
            const locationsData = await locationsResponse.json()

            const items = Object.keys(itemsData)
            const locations = Object.keys(locationsData)

            console.log(`Found ${items.length} items and ${locations.length} locations`)

            return { items, locations }
        } catch (error) {
            console.error("Error fetching metadata:", error)
            throw error
        }
    }
}