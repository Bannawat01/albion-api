import { apiClient } from "./config";

// TypeScript types matching your server responses
export type ItemSummary = {
  id: string;
  name: string;
  uniqueName: string;
};

export type ItemsResponse = {
  total: number;
  showing: number;
  items: ItemSummary[];
};

export type ItemDetail = {
  id: string;
  name: string;
  uniqueName: string;
  locations?: string[];
};

export type PaginatedResponse<T> = {
  success: true;
  data: T[];
};

export type Price = {
  itemId: string;
  itemName: string;
  city: string;
  sellPriceMin: number;
  buyPriceMax: number;
  quality: number;
  timestamp: string;
};

// Item API functions
export const itemApi = {
  // Get all items
  async getAllItems(): Promise<ItemsResponse> {
    return apiClient.get<ItemsResponse>("/items");
  },

  // Search items with pagination
  async searchItems(searchTerm?: string, page = 1, limit = 20): Promise<PaginatedResponse<ItemSummary>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (searchTerm) {
      params.append("search", searchTerm);
    }

    return apiClient.get<PaginatedResponse<ItemSummary>>(`/items/paginated?${params}`);
  },

  // Get single item details
  async getItem(itemId: string): Promise<ItemDetail> {
    return apiClient.get<ItemDetail>(`/item/${encodeURIComponent(itemId)}`);
  },

  // Get item prices
  async getItemPrices(itemId: string, city?: string): Promise<{ success: true; data: Price[] }> {
    const params = new URLSearchParams({ id: itemId });
    if (city) {
      params.append("city", city);
    }
    return apiClient.get<{ success: true; data: Price[] }>(`/item/price?${params}`);
  },

  // Get item image URL
  getItemImageUrl(itemId: string, quality = 1, size = 217): string {
    const params = new URLSearchParams({
      quality: quality.toString(),
      size: size.toString(),
    });
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:8800"}/api/item/${encodeURIComponent(itemId)}/image?${params}`;
  },
};