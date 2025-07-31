import { Db } from "mongodb"
import type { ItemId } from "../types/itemBase"
import type { Price } from "../interface/priceInterface"
import { ExternalApiError } from "../middleware/customError"
export class ItemRepository {
    private db: Db

    constructor(db: Db) {
        this.db = db
    }

    // Fetch items and locations metadata
    async fetchMetadata(): Promise<{ items: any[], locations: string[], itemsData: any }> {
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

            return { items, locations, itemsData: itemsDataMap }
        } catch (error) {
            console.error("Error fetching metadata:", error)
            throw error
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

            const mappedData: Price[] = data.map((item: any) => ({
                itemName: itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || itemId,
                item_id: itemId,
                city: item.city,
                quantity: item.quality,
                sell_Price_Min: item.sell_price_min,
                sell_Price_Min_Date: item.sell_price_min_date,
                sell_Price_Max: item.sell_price_max,
                sell_Price_Max_Date: item.sell_price_max_date,
                buy_Price_max: item.buy_price_max,
                buy_Price_Max_Date: item.buy_price_max_date,
                buy_Price_Min: item.buy_price_min,
                buy_Price_Min_Date: item.buy_price_min_date,
            } as Price))

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


            const mappedData = data.map((item: any) => ({
                itemName: itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || itemId,
                city: city,
                quality: item.quality,
                Sell_Price_Min: item.sell_price_min,
                Sell_Price_Max: item.sell_price_max,
                Buy_Price_min: item.buy_price_min,
                Buy_Price_max: item.buy_price_max,
            }))

            return mappedData

        } catch (error) {
            console.error("Error fetching item price and location:", error)
            throw new ExternalApiError("Unable to fetch price data from Albion Online API")
        }
    }

}