import type { GoldPrice, GoldPriceOptions } from "../interface/goldInterface"
import { BadRequestError, ExternalApiError } from "../middleware/customError"
import { HttpClient } from "../service/httpClient"
import { TTLCache, TTL_CONSTANTS } from '../service/timeToLive'
export class GoldRepository {
    private goldPriceCache = new TTLCache<GoldPrice[]>()
    private httpClient: HttpClient

    constructor() {
        this.httpClient = HttpClient.getInstance()
        this.preloadPopularData()
    }

    private async preloadPopularData(): Promise<void> {
        try {
            // Preload popular count values to reduce cold start TTFB
            const popularCounts = [2, 10, 20]
            await Promise.all(
                popularCounts.map(count =>
                    this.fetchGoldPrices({ count }).catch(() => { }) // Ignore errors during preload
                )
            )
        } catch (error) {
            console.warn('Failed to preload gold price data:', error)
        }
    }

    getCacheStats() {
        return {
            goldPrices: {
                size: this.goldPriceCache.size(),
                entries: this.goldPriceCache.entries().length
            }
        }
    }

    clearCache(): void {
        this.goldPriceCache.clear()
    }

    async fetchGoldPrices(options: GoldPriceOptions = {}): Promise<GoldPrice[] | string> {
        try {
            const { count = 10 } = options
            const cacheKey = `gold_prices_${count}`

            const cacheData = this.goldPriceCache.get(cacheKey)
            if (cacheData) {
                return cacheData
            }

            const response = await this.httpClient.get(`https://east.albion-online-data.com/api/v2/stats/gold.json?count=${count}`, {
                signal: AbortSignal.timeout(5000), // 5 second timeout
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'AlbionAPI/1.0'
                }
            })

            if (!response.ok) {
                throw new BadRequestError(`Failed to fetch gold prices: ${response.status}`)
            }

            const data: GoldPrice[] = await response.json()

            if (data.length === 0) {
                return "Gold price data not available"
            }

            this.goldPriceCache.set(cacheKey, data, TTL_CONSTANTS.FIVE_MINUTES)



            return data
        } catch (error) {
            console.error("Error fetching gold prices:", error)
            throw new ExternalApiError("Unable to fetch price data from Albion Online API")
        }
    }


}