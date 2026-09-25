'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ItemSummary } from '@/api'
import { track } from '@/lib/analytics'

const STORAGE_KEY = 'albion-market-watchlist-v1'
const CHANGE_EVENT = 'albion-watchlist-change'
export const WATCHLIST_LIMIT = 50

export function parseWatchlist(value: string | null): ItemSummary[] {
  try {
    const parsed = JSON.parse(value || '[]')
    if (!Array.isArray(parsed)) return []
    const unique = new Map<string, ItemSummary>()
    for (const item of parsed) {
      if (typeof item?.id === 'string' && typeof item?.name === 'string' && typeof item?.uniqueName === 'string') {
        unique.set(item.uniqueName, { id: item.id, name: item.name, uniqueName: item.uniqueName })
      }
    }
    return [...unique.values()].slice(0, WATCHLIST_LIMIT)
  } catch {
    return []
  }
}

export function useWatchlist() {
  const [items, setItems] = useState<ItemSummary[]>([])
  const [storageError, setStorageError] = useState(false)

  const refresh = useCallback(() => {
    try {
      setItems(parseWatchlist(localStorage.getItem(STORAGE_KEY)))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener(CHANGE_EVENT, refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(CHANGE_EVENT, refresh)
    }
  }, [refresh])

  const toggle = useCallback((item: ItemSummary) => {
    try {
      const current = parseWatchlist(localStorage.getItem(STORAGE_KEY))
      const exists = current.some(saved => saved.uniqueName === item.uniqueName)
      const next = exists ? current.filter(saved => saved.uniqueName !== item.uniqueName) : [item, ...current].slice(0, WATCHLIST_LIMIT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      if (!exists) track('watchlist_add')
      setStorageError(false)
      window.dispatchEvent(new Event(CHANGE_EVENT))
    } catch {
      setStorageError(true)
    }
  }, [])

  return { items, toggle, storageError }
}
