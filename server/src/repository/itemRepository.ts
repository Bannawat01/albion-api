import { Db } from "mongodb"
import type { ItemId } from "../types/itemBase"
import type { Price } from "../interface/priceInterface"
import { ExternalApiError } from "../middleware/customError"
import { mapPriceData } from "../service/filterPriceService"
export class ItemRepository {
    private db: Db
    private metadataCache: { items: any[], locations: string[], itemsData: any } | null = null

    constructor(db: Db) {
        this.db = db
    }

    // Clear metadata cache to force refresh
    clearMetadataCache(): void {
        this.metadataCache = null
    }

    // Fetch items and locations metadata
    async fetchMetadata(): Promise<{ items: any[], locations: string[], itemsData: any }> {
        // Return cached data if available
        if (this.metadataCache) {
            return this.metadataCache
        }

        try {

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



            // Convert array to object with UniqueName as key for easier lookup
            const itemsDataMap: any = {}
            const items: string[] = []

            itemsData.forEach((item: any) => {
                if (item.UniqueName) {
                    itemsDataMap[item.UniqueName] = item
                    items.push(item.UniqueName)
                }
            })

            const locations = Object.keys(locationsData)

            // Cache the result
            this.metadataCache = { items, locations, itemsData: itemsDataMap }

            return this.metadataCache
        } catch (error) {
            console.error("Error fetching metadata:", error)
            throw new ExternalApiError("Unable to fetch game metadata")
        }
    }
    async fetchItemPrice(itemId: ItemId): Promise<Price[] | string> {
        try {
            const itemInfo = (await this.fetchMetadata()).itemsData[itemId]
            if (!itemInfo) {
                return "Item not found in game data"
            }

            const response = await fetch(`https://albion-online-data.com/api/v2/stats/prices/${itemId}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch item price: ${response.status}`)
            }
            const data = await response.json()


            if (data.length === 0) {
                return "Price not available"
            }
            const mappedData = mapPriceData(data, itemInfo, itemId)
            return mappedData

        } catch (error) {
            console.error("Error fetching item price:", error)
            return "Price not available"
        }
    }
    async fetchItemPriceAndLocation(itemId: ItemId, city: string): Promise<
        Price[] | string> {
        try {
            const response = await fetch(`https://east.albion-online-data.com/api/v2/stats/prices/${itemId}?locations=${city}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch item price: ${response.status}`)
            }
            const data = await response.json()
            const itemInfo = (await this.fetchMetadata()).itemsData[itemId]

            if (data.length === 0) {
                return "Price not available"
            }

            const mappedData = mapPriceData(data, itemInfo, itemId)
            return mappedData

        } catch (error) {
            console.error("Error fetching item price and location:", error)
            throw new ExternalApiError("Unable to fetch price data from Albion Online API")
        }
    }

}