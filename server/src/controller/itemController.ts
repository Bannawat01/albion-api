import Elysia from "elysia"
import { connectToAlbion } from "../configs/albionbase"
import { BadRequestError, ExternalApiError, NotFoundError } from "../middleware/customError"
import { ItemRepository } from "../repository/itemRepository"
import type { Price } from "../interface/priceInterface"

export const itemController = new Elysia({
    prefix: "/api"
})

    .get("/items", async () => {
        try {
            const metadata = await connectToAlbion.connect()
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
            const metadata = await connectToAlbion.connect()

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
            const metadata = await connectToAlbion.connect()
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

    .get("/item/price", async ({ query: { id, city } }) => {
        try {
            const metadata = await connectToAlbion.connect()
            const itemInfo = metadata.itemsData[id]

            if (!itemInfo) {
                throw new BadRequestError(`Item ID '${id}' does not exist in game data`)
            }

            const result: Price[] | string = city
                ? await ItemRepository.prototype.fetchItemPriceAndLocation(id, city)
                : await ItemRepository.prototype.fetchItemPrice(id)

            if (typeof result === 'string') {
                throw new NotFoundError(result)
            }

            if (result.length > 0) {
                const expectedItemName = itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName
                const actualItemName = result[0].itemName // Type-safe access

                if (expectedItemName && actualItemName !== expectedItemName) {
                    throw new Error(`Data inconsistency: Expected '${expectedItemName}' but got '${actualItemName}'`)
                }
            }

            return { success: true, data: result }

        } catch (error) {
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error
            }
            throw new Error(error instanceof Error ? error.message : "Failed to fetch item price")
        }
    })