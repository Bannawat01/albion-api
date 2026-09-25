import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

export type TradeRecommendation = {
  city: string
  sourcePrice: number
  targetPrice: number
  purchaseCost: number
  tax: number
  netProfit: number
  profitPercent: number
  riskScore: number
  sourceUpdatedAt: string
  targetUpdatedAt: string
  isStale: boolean
  confidence: 'high' | 'medium' | 'low'
  coverage: number
  dailyVolume: number | null
  staleReasons: string[]
}

export type Opportunity = {
  itemId: string; itemName: string; sourceCity: string; targetCity: string; quantity: number
  buyPrice: number; sellPrice: number; investment: number; tax: number; netProfit: number; margin: number
  dailyVolume: number | null; sourceUpdatedAt: string; targetUpdatedAt: string; coverage: number
  confidence: 'high' | 'medium' | 'low'; staleReasons: string[]
}
export type OpportunityFilters = { origin?: string; budget?: number; minProfit?: number; minVolume?: number; maxAgeMinutes?: number; strategy?: 'list' | 'quick'; limit?: number }
export type OpportunityResponse = { generatedAt: string; partial: boolean; filters: Required<Omit<OpportunityFilters, 'origin'>> & { origin?: string }; items: Opportunity[] }

export type TradeRecommendationResponse = {
  itemId: string
  fromCity: string
  mode: 'profit' | 'safe' | 'balanced'
  generatedAt: string
  recommendations: TradeRecommendation[]
}

export type MarketSnapshot = {
  city: string
  sellPrice: number
  buyPrice: number
}

export type MarketHistory = {
  itemId: string
  city: string
  quality: number
  totalVolume: number
  averageDailyVolume: number
  averagePrice: number
  points: { date: string; volume: number; averagePrice: number }[]
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
  getTradeRecommendations: async (
    itemId: string,
    params: { from: string; qty: number; quality: number; strategy: 'list' | 'quick'; mode: 'profit' | 'safe' | 'balanced'; includeOld?: boolean },
    signal?: AbortSignal
  ): Promise<TradeRecommendationResponse> => {
    const query = new URLSearchParams({
      from: params.from,
      qty: String(params.qty),
      quality: String(params.quality),
      strategy: params.strategy,
      mode: params.mode,
      scenario: 'arbitrage',
      taxRate: '0.065',
      limit: '3',
      includeOld: String(!!params.includeOld),
    })
    const { data } = await axiosInstance.get(
      `/items/${encodeURIComponent(itemId)}/recommendations?${query}`,
      { signal }
    )
    return data
  },
  getItemMarkets: async (itemId: string, quality: number, signal?: AbortSignal): Promise<MarketSnapshot[]> => {
    const { data } = await axiosInstance.get(
      `/items/${encodeURIComponent(itemId)}/markets?quality=${quality}`,
      { signal }
    )
    return data.markets
  },
  getItemHistory: async (itemId: string, city: string, signal?: AbortSignal): Promise<MarketHistory> => {
    const query = new URLSearchParams({ city, quality: '1', days: '7' })
    const { data } = await axiosInstance.get(`/items/${encodeURIComponent(itemId)}/history?${query}`, { signal })
    return data
  },
  getGoldPrice: async () => {
    const { data } = await axiosInstance.get('/gold?count=50')
    return data
  },
  getOpportunities: async (filters: OpportunityFilters, signal?: AbortSignal): Promise<OpportunityResponse> => {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) if (value !== undefined && value !== '') query.set(key, String(value))
    const { data } = await axiosInstance.get(`/opportunities?${query}`, { signal })
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
    queryFn: ({ signal }) => itemApi.searchItems(searchTerm, page, limit, signal),
    enabled: true, // Always enabled, will search all items if no searchTerm
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: keepPreviousData,
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
