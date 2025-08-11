import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from './config'

// Types
export type ItemSummary = {
  id: string
  name: string
  uniqueName: string
}

export type ItemsResponse = {
  total: number
  showing: number
  items: ItemSummary[]
}

export type PaginatedResponse<T> = {
  success: true
  data: T[]
}

export type Price = {
  itemId: string
  itemName: string
  city: string
  sellPriceMin: number
  buyPriceMax: number
  quality: number
  timestamp: string
}

// API Functions
const itemApi = {
  // Get all items
  getItemImageUrl: (itemId: string, quality: number = 1, size: number = 64): string => {
    return `https://render.albiononline.com/v1/item/${encodeURIComponent(itemId)}.png?quality=${quality}&size=${size}`
  },
  getAllItems: async (): Promise<ItemsResponse> => {
    const { data } = await axiosInstance.get('/items')
    return data
  },

  // Search items with pagination
  searchItems: async (searchTerm?: string, page = 1, limit = 20): Promise<PaginatedResponse<ItemSummary>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (searchTerm) {
      params.append('search', searchTerm)
    }

    const { data } = await axiosInstance.get(`/items/paginated?${params}`)
    return data
  },

  // Get single item details
  getItem: async (itemId: string) => {
    const { data } = await axiosInstance.get(`/item/${encodeURIComponent(itemId)}`)
    return data
  },

  // Get item prices
  getItemPrices: async (itemId: string, city?: string) => {
    const params = new URLSearchParams({ id: itemId })
    if (city) {
      params.append('city', city)
    }
    const { data } = await axiosInstance.get(`/item/price?${params}`)
    return data
  },
  getGoldPrice: async () => {
    const { data } = await axiosInstance.get('/gold?count=50')
    return data
  }
}

// React Query Hooks
export const useItems = () => {
  return useQuery({
    queryKey: ['items'],
    queryFn: itemApi.getAllItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSearchItems = (searchTerm?: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['items', 'search', searchTerm, page, limit],
    queryFn: () => itemApi.searchItems(searchTerm, page, limit),
    enabled: true, // Always enabled, will search all items if no searchTerm
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useItem = (itemId: string) => {
  return useQuery({
    queryKey: ['item', itemId],
    queryFn: () => itemApi.getItem(itemId),
    enabled: !!itemId,
  })
}

export const useItemPrices = (itemId: string, city?: string) => {
  return useQuery({
    queryKey: ['item', 'prices', itemId, city],
    queryFn: () => itemApi.getItemPrices(itemId, city),
    enabled: !!itemId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for live prices
  })
}

// Mutations for creating/updating data
export const useCreateItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newItem: Partial<ItemSummary>) => {
      const { data } = await axiosInstance.post('/items', newItem)
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch items list
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export { itemApi }
