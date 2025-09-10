import Elysia from "elysia"
import { BadRequestError, ExternalApiError, NotFoundError } from "../middleware/customError"
import { ItemRepository } from "../repository/itemRepository"
import type { Price } from "../interface/priceInterface"
import type { PaginationQuery } from "../interface/paginationInterface"
import { HttpClient } from "../service/httpClient"
const httpClient = HttpClient.getInstance()

// สร้าง instance ของ ItemRepository
const itemRepository = ItemRepository.getInstance()
export const itemController = new Elysia({
    prefix: "/api"
})

    .get("/items", async ({ set }) => {
        try {
            set.headers['Cache-Control'] = 'public, max-age=3600'

            const metadata = await itemRepository.fetchMetadata()
            const itemList = metadata.items.map((itemId: string) => {
                const itemInfo = metadata.itemsData[itemId]
                const itemName = itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || itemId

                return {
                    id: itemId,
                    name: itemName,
                    uniqueName: itemInfo?.UniqueName || itemId
                }
            })

            return {
                total: metadata.items.length,
                showing: itemList.length,
                items: itemList
            }
        } catch (error) {
            if (error instanceof ExternalApiError) {
                throw error
            }
            throw new Error(error instanceof Error ? error.message : "Failed to fetch item list")
        }

    })

    .get("/item/:id", async ({ params: { id } }) => {
        try {
            const metadata = await itemRepository.fetchMetadata()

            const itemInfo = metadata.itemsData[id]

            if (!itemInfo) {
                throw new BadRequestError(`Item with ID '${id}' not found or invalid`)
            }

            const itemName = itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || id

            return {
                id: id,
                name: itemName,
                uniqueName: itemInfo?.UniqueName || id,
                locations: itemInfo?.Locations || [],
            }
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error
            }
            throw new Error(error instanceof Error ? error.message : "Failed to fetch item details")
        }
    })

    .get("/item", async ({ query }) => {
        const itemId = query.id

        if (!itemId) {
            throw new BadRequestError("Missing item ID")
        }

        try {
            const metadata = await itemRepository.fetchMetadata()
            const itemInfo = metadata.itemsData[itemId]

            if (!itemInfo) {
                throw new NotFoundError(`No item found with ID ${itemId}`)
            }

            const itemName = itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || itemId

            return {
                success: true,
                item: {
                    id: itemId,
                    name: itemName,
                    uniqueName: itemInfo?.UniqueName || itemId,
                    data: itemInfo
                }
            }
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error
            }
            throw new Error(error instanceof Error ? error.message : "Failed to fetch item details")
        }

    })

    .get("/item/price", async ({ query: { id, city }, set }) => {
        try {
            const metadata = await itemRepository.fetchMetadata()
            const itemInfo = metadata.itemsData[id]

            if (!itemInfo) {
                throw new BadRequestError(`Item ID '${id}' does not exist in game data`)
            }

            const result: Price[] | string = city
                ? await itemRepository.fetchItemPriceAndLocation(id, city)
                : await itemRepository.fetchItemPrice(id)

            if (typeof result === 'string') {
                throw new NotFoundError(result)
            }

            if (result.length > 0) {
                const expectedItemName = itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName
                const actualItemName = result[0].itemName
                if (expectedItemName && actualItemName !== expectedItemName) {
                    console.warn(`[itemController] Name mismatch for id=${id}: expected='${expectedItemName}' got='${actualItemName}'`)
                }
            }

            // Cache for clients/proxies ~60s, allow short stale
            set.headers['Cache-Control'] = 'public, max-age=60, stale-while-revalidate=30'
            return { success: true, data: result }

        } catch (error) {
            if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ExternalApiError) {
                throw error
            }
            // Convert unknown errors to ExternalApiError so clients don't see 500
            throw new ExternalApiError(error instanceof Error ? error.message : "Failed to fetch item price")
        }
    })

    .get("/cache/stats", async () => {
        try {
            const stats = itemRepository.getCacheStats()
            return {
                success: true,
                data: stats
            }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to get cache stats")
        }
    })

    .delete("/cache/clear", async () => {
        try {
            itemRepository.clearMetadataCache()
            return {
                success: true,
                message: "Cache cleared successfully"
            }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to clear cache")
        }
    })

    // Pagination endpoints
    .get("/items/paginated", async ({ query }) => {
        try {
            const paginationQuery: PaginationQuery = {
                page: query.page ? parseInt(query.page as string) : 1,
                limit: query.limit ? parseInt(query.limit as string) : 10
            }

            const searchTerm = query.search as string | undefined
            const result = await itemRepository.fetchItemsPaginated(paginationQuery, searchTerm)

            return {
                success: true,
                data: result.data,
                pagination: result.pagination,
                message: result.message
            }
        } catch (error) {
            if (error instanceof BadRequestError) {
                throw error
            }
            throw new Error(error instanceof Error ? error.message : "Failed to fetch paginated items")
        }
    })

    .get("/item/:id/prices/paginated", async ({ params: { id }, query }) => {
        try {
            // ตรวจสอบว่า item ID มีอยู่จริง
            const metadata = await itemRepository.fetchMetadata()
            const itemInfo = metadata.itemsData[id]

            if (!itemInfo) {
                throw new BadRequestError(`Item ID '${id}' does not exist in game data`)
            }

            const paginationQuery: PaginationQuery = {
                page: query.page ? parseInt(query.page as string) : 1,
                limit: query.limit ? parseInt(query.limit as string) : 10
            }

            const result = await itemRepository.fetchItemPricesPaginated(id, paginationQuery)

            return {
                success: true,
                itemId: id,
                itemName: itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || id,
                data: result.data,
            }
        } catch (error) {
            if (error instanceof BadRequestError || error instanceof NotFoundError) {
                throw error
            }
            throw new Error(error instanceof Error ? error.message : "Failed to fetch paginated item prices")
        }
    })

    .get("/items/popular/paginated", async ({ query }) => {
        try {
            const paginationQuery: PaginationQuery = {
                page: query.page ? parseInt(query.page as string) : 1,
                limit: query.limit ? parseInt(query.limit as string) : 5
            }

            const result = await itemRepository.fetchPopularItemsPaginated(paginationQuery)

            return {
                success: true,
                data: result.data,
            }
        } catch (error) {
            if (error instanceof BadRequestError) {
                throw error
            }
            throw new Error(error instanceof Error ? error.message : "Failed to fetch popular items")
        }
    })

    .get("/item/:id/image", async ({ params: { id }, query, set }) => {
        try {
            const { quality = 1, size = 217 } = query
            const imageUrl = `https://render.albiononline.com/v1/item/${id}.png?quality=${quality}&size=${size}`

            // Cache และ proxy ภาพผ่าน server
            const response = await httpClient.get(imageUrl)

            if (!response.ok) {
                throw new NotFoundError(`Image not found for item: ${id}`)
            }

            // Set proper headers for image response
            set.headers['Content-Type'] = 'image/png'
            set.headers['Cache-Control'] = 'public, max-age=86400'

            // Return the image data as ArrayBuffer
            return new Response(await response.arrayBuffer(), {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=86400'
                }
            })
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error
            }
            throw new Error(error instanceof Error ? error.message : "Failed to fetch item image")
        }
    })

    // Batch prices endpoint
    .post("/items/prices/batch", async ({ body, set }) => {
        try {
            const payload = (body ?? {}) as any
            const { ids, city } = payload
            if (!Array.isArray(ids) || ids.length === 0) {  
                throw new BadRequestError("'ids' must be a non-empty array")
            }

            // Validate ids exist in metadata (optional, cheap cache lookup)
            const metadata = await itemRepository.fetchMetadata()
            const validIds = ids.filter((id: string) => !!metadata.itemsData[id])
            if (validIds.length === 0) {
                throw new BadRequestError("No valid item ids provided")
            }

            const data = await itemRepository.fetchItemsPricesBatch(validIds, city)

            set.headers['Cache-Control'] = 'public, max-age=60, stale-while-revalidate=30'
            return { success: true, data }
        } catch (error) {
            if (error instanceof BadRequestError || error instanceof ExternalApiError || error instanceof NotFoundError) {
                throw error
            }
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch batch prices')
        }
    })