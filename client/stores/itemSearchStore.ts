import { create } from "zustand"
import type { ItemSummary } from "../api"

type ItemSearchState = {
  searchTerm: string
  setSearchTerm: (v: string) => void

  items: ItemSummary[]
  setItems: (items: ItemSummary[]) => void

  loading: boolean
  setLoading: (b: boolean) => void

  error: string | null
  setError: (msg: string | null) => void

  currentPage: number
  setCurrentPage: (n: number) => void

  totalItems: number
  setTotalItems: (n: number) => void

  itemsPerPage: number

  abortController: AbortController | null
  setAbortController: (c: AbortController | null) => void

  nextPageItems: ItemSummary[] | null
  setNextPageItems: (items: ItemSummary[] | null) => void

  lastQueryKey: string | null
  setLastQueryKey: (k: string | null) => void

}

export const useItemSearchStore = create<ItemSearchState>((set) => ({
  searchTerm: "",
  setSearchTerm: (v) => set({ searchTerm: v }),

  items: [],
  setItems: (items) => set({ items }),

  loading: false,
  setLoading: (b) => set({ loading: b }),

  error: null,
  setError: (msg) => set({ error: msg }),

  currentPage: 1,
  setCurrentPage: (n) => set({ currentPage: n }),

  totalItems: 0,
  setTotalItems: (n) => set({ totalItems: n }),

  itemsPerPage: 6,
  
  abortController: null,
  setAbortController: (c) => set({ abortController: c }),

  nextPageItems: null,
  setNextPageItems: (items) => set({ nextPageItems: items }),

  lastQueryKey: null,
  setLastQueryKey: (k) => set({ lastQueryKey: k }),
}))
