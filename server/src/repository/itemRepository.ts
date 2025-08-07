import type { ItemId } from "../types/itemBase"
import type { Price } from "../interface/priceInterface"
import { ExternalApiError } from "../middleware/customError"
import { mapPriceData } from "../service/filterPriceService"
import { TTLCache, TTL_CONSTANTS } from '../service/timeToLive'
import { PaginationService } from '../service/paginationService'
import type { PaginationQuery, PaginatedResponse } from '../interface/paginationInterface'
import type { ValidatedPaginationParams } from '../types/paginationType'

export class ItemRepository {
    private static instance: ItemRepository
    private metadataCache = new TTLCache<{ items: any[], locations: string[], itemsData: any }>()
    private priceCache = new TTLCache<Price[]>()
    private popularItems = new Map<string, number>()

    private cacheStats = {
        metadata: { hits: 0, misses: 0 },
        prices: { hits: 0, misses: 0 }
    }

    private responseTimeStats = {
        cacheHits: [], // เวลาที่ใช้เมื่อ hit cache
        cacheMisses: [] // เวลาที่ใช้เมื่อ miss cache
    }

    public constructor() {
        this.initializePreloading()
    }

    public static getInstance(): ItemRepository { // Singleton pattern
        if (!ItemRepository.instance) {
            ItemRepository.instance = new ItemRepository()
        }
        return ItemRepository.instance
    }

    clearMetadataCache(): void {
        this.metadataCache.clear()
        this.priceCache.clear()
        console.log('clear cache')
    }
    private calculateHitRate(cacheType: 'metadata' | 'prices'): number {
        const stats = this.cacheStats[cacheType]
        const total = stats.hits + stats.misses
        return total > 0 ? (stats.hits / total) * 100 : 0
    }

    private calculateAvgResponseTime(cacheType: string): number {
        const times = this.responseTimeStats.cacheHits
        return times.length > 0 ? times.reduce((sum: number, current: number) => sum + current, 0) / times.length : 0
    }

    // เมธอดสำหรับดู cache statistics
    getCacheStats() {
        return {
            metadata: {
                size: this.metadataCache.size(),
                hitRate: this.calculateHitRate('metadata'),
                avgResponseTime: this.calculateAvgResponseTime('metadata'),
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
                prices: {
                    size: this.priceCache.size(),
                    hitRate: this.calculateHitRate('prices'),
                    avgResponseTime: this.calculateAvgResponseTime('prices'),
                    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
                }
            }
        }
    }

    private async initializePreloading(): Promise<void> {

        try {
            await this.preloadMetadata()

        } catch (error) {
            throw new ExternalApiError("Unable to preload game metadata")
        }
    }


    private async preloadMetadata(): Promise<void> {
        try {
            await this.fetchMetadata()
        } catch (error) {
            throw new ExternalApiError("Unable to preload game metadata")
        }
    }


    async fetchMetadata(): Promise<{ items: any[], locations: string[], itemsData: any }> {
        const cacheKey = 'metadata'
        const cachedData = this.metadataCache.get(cacheKey)
        const currentCount = this.popularItems.get(cacheKey) || 0
        this.popularItems.set(cacheKey, currentCount + 1)
        if (cachedData) {
            this.cacheStats.metadata.hits++
            return cachedData
        }
        this.cacheStats.metadata.misses++

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

    /**
     * ดึงรายการ items แบบ pagination
     * @param query - pagination query parameters
     * @param searchTerm - คำค้นหา (optional)
     * @returns PaginatedResponse ของ items
     */
    async fetchItemsPaginated(
        query: PaginationQuery,
        searchTerm?: string
    ): Promise<PaginatedResponse<{ id: string, name: string, uniqueName: string }>> {
        try {
            // Validate pagination parameters
            const params: ValidatedPaginationParams = PaginationService.validateParams(query)

            // ดึง metadata
            const metadata = await this.fetchMetadata()
            let items = metadata.items

            // Filter ตาม search term ถ้ามี
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase()
                items = items.filter(itemId => {
                    const itemInfo = metadata.itemsData[itemId]
                    return itemId.toLowerCase().includes(searchLower) ||
                        (itemInfo?.LocalizedNames?.['EN-US'] || '').toLowerCase().includes(searchLower)
                })
            }
            // คำนวณ total items
            const totalItems = items.length

            // Apply pagination
            const startIndex = params.offset
            const endIndex = startIndex + params.limit
            const paginatedItems = items.slice(startIndex, endIndex)

            // Map ข้อมูลให้อยู่ในรูปแบบที่ต้องการ
            const mappedItems = paginatedItems.map(itemId => {
                const itemInfo = metadata.itemsData[itemId]
                return {
                    id: itemId,
                    name: itemInfo?.LocalizedNames?.['EN-US'] || itemId,
                    uniqueName: itemInfo?.UniqueName || itemId
                }
            })

            // สร้าง paginated response
            return PaginationService.createResponse(
                mappedItems,
                totalItems,
                params,
                searchTerm ? `Found ${totalItems} items matching "${searchTerm}"` : undefined
            )

        } catch (error) {
            console.error("Error fetching paginated items:", error)
            throw new ExternalApiError("Unable to fetch items data")
        }
    }

    /**
     * ดึงรายการ prices แบบ pagination สำหรับ item ที่ระบุ
     * @param itemId - ID ของ item
     * @param query - pagination query parameters
     * @returns PaginatedResponse ของ prices
     */
    async fetchItemPricesPaginated(
        itemId: ItemId,
        query: PaginationQuery
    ): Promise<PaginatedResponse<Price>> {
        try {
            // Validate pagination parameters
            const params: ValidatedPaginationParams = PaginationService.validateParams(query)

            // ดึงข้อมูล prices
            const prices = await this.fetchItemPrice(itemId)

            if (typeof prices === 'string') {
                throw new ExternalApiError(prices)
            }

            // คำนวณ total items
            const totalItems = prices.length

            // Apply pagination
            const startIndex = params.offset
            const endIndex = startIndex + params.limit
            const paginatedPrices = prices.slice(startIndex, endIndex)

            // สร้าง paginated response
            return PaginationService.createResponse(
                paginatedPrices,
                totalItems,
                params,
                `Price data for item ${itemId}`
            )

        } catch (error) {
            console.error("Error fetching paginated prices:", error)
            throw new ExternalApiError("Unable to fetch price data")
        }
    }

    /**
     * ดึงรายการ popular items แบบ pagination
     * @param query - pagination query parameters
     * @returns PaginatedResponse ของ popular items
     */
    async fetchPopularItemsPaginated(
        query: PaginationQuery
    ): Promise<PaginatedResponse<{ id: string, name: string, requestCount: number }>> {
        try {
            // Validate pagination parameters
            const params: ValidatedPaginationParams = PaginationService.validateParams(query)

            // แปลง Map เป็น Array และ sort ตาม request count
            const popularItemsArray = Array.from(this.popularItems.entries())
                .filter(([key]) => key !== 'metadata') // กรอง metadata cache key ออก
                .map(([itemId, count]) => ({ itemId: itemId.replace('price_', ''), count }))
                .sort((a, b) => b.count - a.count)

            // ดึง metadata สำหรับ map ชื่อ
            const metadata = await this.fetchMetadata()

            // คำนวณ total items
            const totalItems = popularItemsArray.length

            // Apply pagination
            const startIndex = params.offset
            const endIndex = startIndex + params.limit
            const paginatedItems = popularItemsArray.slice(startIndex, endIndex)

            // Map ข้อมูลให้อยู่ในรูปแบบที่ต้องการ
            const mappedItems = paginatedItems.map(({ itemId, count }) => {
                const itemInfo = metadata.itemsData[itemId]
                return {
                    id: itemId,
                    name: itemInfo?.LocalizedNames?.['EN-US'] || itemId,
                    requestCount: count
                }
            })

            // สร้าง paginated response
            return PaginationService.createResponse(
                mappedItems,
                totalItems,
                params,
                'Popular items sorted by request count'
            )

        } catch (error) {
            console.error("Error fetching popular items:", error)
            throw new ExternalApiError("Unable to fetch popular items data")
        }
    }

}