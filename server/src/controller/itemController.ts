import Elysia from "elysia"
import { connectToAlbion } from "../configs/albionbase"
import { ItemRepository } from "../repository/itemRepository"

export const itemController = new Elysia({
    prefix: "/api"
})
    

.get("/items", async () => {
            try {
                const metadata = await connectToAlbion.connect()
                const itemList = metadata.items.map((itemId: string) => {
                    const itemInfo = metadata.itemsData[itemId]
                    const   itemName = itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || itemId
                   
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
                return {
                    success: false,
                    error: "Failed to fetch items",
                    message: error instanceof Error ? error.message : "Unknown error"
                }
            }
    })

.get("/item/:id", async ({ params: { id } }) => {
          try {
            const metadata = await connectToAlbion.connect()
            
            const itemInfo = metadata.itemsData[id]

            if (!itemInfo) {
                return {
                    success: false,
                    error: "Item not found",
                    message: `No item found with ID ${id}`
                }
            }

            const itemName = itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || id

            return {
                
                    id: id,
                    name: itemName,
                    uniqueName: itemInfo?.UniqueName || id,
                    locations : itemInfo?.Locations || [],
                   
              
            }
          } catch (error) {
            return {
                success: false,
                error: "Failed to fetch item details",
                message: error instanceof Error ? error.message : "Unknown error"
            }
            
          }
    })


.get("/item", async ({ query }) => {
    const itemId = query.id
    
    if (!itemId) {
        return {
            success: false,
            error: "Missing item ID",
            message: "Please provide an item ID in query parameter"
        }
    }
    
    try {
        const metadata = await connectToAlbion.connect()
        const itemInfo = metadata.itemsData[itemId]

        if (!itemInfo) {
            return {
                success: false,
                error: "Item not found",
                message: `No item found with ID ${itemId}`
            }
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
        return {
            success: false,
            error: "Failed to fetch item details",
            message: error instanceof Error ? error.message : "Unknown error"
        }
    }
})    

.get("/item/price", async ({ query: { id, city } }) => {
    try {
        
        const result = city 
            ? await ItemRepository.prototype.fetchItemPriceAndLocation(id, city)
            : await ItemRepository.prototype.fetchItemPrice(id);

        if (typeof result === 'string') {
            return {
                success: false,
                error: result,
                message: city 
                    ? `No price data available for ${id} in ${city}`
                    : `No price data available for ${id}`
            }
        }
        
        return {
            success: true,
            data: result
        }
    } catch (error) {
        return {
            success: false,
            error: "Failed to fetch price",
        }
    }
})