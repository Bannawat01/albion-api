import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from './config'
import type { AxiosRequestConfig } from 'axios'

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

export type PaginationMeta = {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number | null
  previousPage: number | null
}

export type PaginatedResponse<T> = {
  success: true
  data: T[]
  pagination: PaginationMeta
  message?: string
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
  getItemImageUrl: (itemId: string, quality: number = 1, size: number = 64): string => {
    return `https://render.albiononline.com/v1/item/${encodeURIComponent(itemId)}.png?quality=${quality}&size=${size}`
  },
  getAllItems: async (): Promise<ItemsResponse> => {
    const { data } = await axiosInstance.get('/items')
    return data
  },

  // Search items with pagination
  searchItems: async (searchTerm?: string, page = 1, limit = 20, signal?: AbortSignal): Promise<PaginatedResponse<ItemSummary>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (searchTerm) {
      params.append('search', searchTerm)
    }

    const config: AxiosRequestConfig = { signal }
    const { data } = await axiosInstance.get(`/items/paginated?${params}`, config)
    
    // Return server response directly (server now includes pagination metadata)
    return {
      success: data.success,
      data: data.data,
      pagination: data.pagination,
      message: data.message
    }
  },

  // Get single item details
  getItem: async (itemId: string) => {
    const { data } = await axiosInstance.get(`/item/${encodeURIComponent(itemId)}`)
    return data
  },

  // Get item prices
  getItemPrices: async (itemId: string, city?: string, signal?: AbortSignal) => {
    const params = new URLSearchParams({ id: itemId })
    if (city) {
      params.append('city', city)
    }
    const config: AxiosRequestConfig = { signal }
    const { data } = await axiosInstance.get(`/item/price?${params}`, config)
    return data
  },
  // Batch prices
  getItemsPricesBatch: async (ids: string[], city?: string, signal?: AbortSignal) => {
    const body = { ids, city }
    const config: AxiosRequestConfig = { signal }
    const { data } = await axiosInstance.post(`/items/prices/batch`, body, config)
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
    select: data => data,
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
        mutationFn: async (payload: { id: string; name: string }) => {
      const { data } = await axiosInstance.put(`/items/${payload.id}`, payload)
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['item', variables.id] })
    },
  })
}

export { itemApi }
