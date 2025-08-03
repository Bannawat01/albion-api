import type { ItemId } from "../types/itemBase"
import type { Price } from "../interface/priceInterface"
import { ExternalApiError } from "../middleware/customError"
import { mapPriceData } from "../service/filterPriceService"
import { TTLCache, TTL_CONSTANTS } from '../service/timeToLive'

export class ItemRepository {
    private metadataCache = new TTLCache<{ items: any[], locations: string[], itemsData: any }>()
    private priceCache = new TTLCache<Price[]>()

    clearMetadataCache(): void {
        this.metadataCache.clear()
        this.priceCache.clear()
        console.log('clear cache')
    }

    // เมธอดสำหรับดู cache statistics
    getCacheStats() {
        return {
            metadata: {
                size: this.metadataCache.size(),
                entries: this.metadataCache.entries().length
            },
            prices: {
                size: this.priceCache.size(),
                entries: this.priceCache.entries().length
            }
        }
    }


    async fetchMetadata(): Promise<{ items: any[], locations: string[], itemsData: any }> {
        const cacheKey = 'metadata'
        const cachedData = this.metadataCache.get(cacheKey)
        if (cachedData) {
            console.log('metadata form cache')
            return cachedData
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

            interface ItemData {
                UniqueName: string
                [key: string]: any // For other properties that may exist
            }

            const itemsDataMap: Record<string, ItemData> = {}
            const items: string[] = []

            for (const item of itemsData as ItemData[]) {
                if (item.UniqueName) {
                    itemsDataMap[item.UniqueName] = item
                    items.push(item.UniqueName)
                }
            }

            const locations = () => Object.keys(locationsData)

            const result = { items, locations: locations(), itemsData: itemsDataMap }

            // Cache the result
            this.metadataCache.set(cacheKey, result, TTL_CONSTANTS.ONE_HOUR)
            return result

        } catch (error) {
            console.error("Error fetching metadata:", error)
            throw new ExternalApiError("Unable to fetch game metadata")
        }
    }
    async fetchItemPrice(itemId: ItemId): Promise<Price[] | string> {
        const cacheKey = `price_${itemId}`

        // ตรวจสอบ price cache ก่อน
        const cachedPrice = this.priceCache.get(cacheKey)
        if (cachedPrice) {
            console.log(`get price from cache`)
            return cachedPrice
        }

        try {
            const itemInfo = (await this.fetchMetadata()).itemsData[itemId]
            if (!itemInfo) {
                throw new ExternalApiError("Item not found in game data")
            }

            const response = await fetch(`https://albion-online-data.com/api/v2/stats/prices/${itemId}`)
            if (!response.ok) {
                throw new ExternalApiError("Unable to fetch price data from Albion Online API")
            }
            const data = await response.json()

            if (data.length === 0) {
                throw new ExternalApiError("No price data available for this item")
            }

            const mappedData = mapPriceData(data, itemInfo, itemId)

            // เก็บข้อมูลลง price cache
            this.priceCache.set(cacheKey, mappedData, TTL_CONSTANTS.FIVE_MINUTES)
            return mappedData

        } catch (error) {
            console.error("Error fetching item price:", error)
            throw new ExternalApiError("Unable to fetch price data from Albion Online API")
        }
    }
    async fetchItemPriceAndLocation(itemId: ItemId, city: string): Promise<
        Price[] | string> {
        try {
            const response = await fetch(`https://albion-online-data.com/api/v2/stats/prices/${itemId}?locations=${city}`)
            if (!response.ok) {
                throw new ExternalApiError("Unable to fetch price data from Albion Online API")
            }

            const data = await response.json()
            const itemInfo = (await this.fetchMetadata()).itemsData[itemId]
            if (data.length === 0) {
                throw new ExternalApiError("No price data available for this item in the specified location")
            }

            const mappedData = mapPriceData(data, itemInfo, itemId)
            return mappedData

        } catch (error) {
            console.error("Error fetching item price and location:", error)
            throw new ExternalApiError("Unable to fetch price data from Albion Online API")
        }
    }

}