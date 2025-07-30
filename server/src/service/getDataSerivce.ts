import type { ItemRepository } from "../repository/itemRepository"

// ใน service หรือ controller
export class AlbionService {
    constructor(private itemRepo: ItemRepository) { }

    async getGameMetadata() {
        const metadata = await this.itemRepo.fetchMetadata()
        return {
            totalItems: metadata.items.length,
            totalLocations: metadata.locations.length,
            items: metadata.items,
            locations: metadata.locations
        }
    }
}