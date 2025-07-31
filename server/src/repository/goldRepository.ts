import type { GoldPrice, GoldPriceOptions } from "../interface/goldInterface"
import { BadRequestError, ExternalApiError } from "../middleware/customError"

export class GoldRepository {

    async fetchGoldPrices(options: GoldPriceOptions = {}): Promise<GoldPrice[] | string> {
        try {
            const { count = 10 } = options
            const response = await fetch(`https://east.albion-online-data.com/api/v2/stats/gold.json?count=${count}`)

            if (!response.ok) {
                throw new BadRequestError(`Failed to fetch gold prices: ${response.status}`)
            }

            const data: GoldPrice[] = await response.json()

            if (data.length === 0) {
                return "Gold price data not available"
            }

            return data
        } catch (error) {
            console.error("Error fetching gold prices:", error)
            throw new ExternalApiError("Unable to fetch price data from Albion Online API")
        }
    }

}