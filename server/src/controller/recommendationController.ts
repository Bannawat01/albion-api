import Elysia from 'elysia'
import { PriceAdvisoryService } from '../service/priceAdvisoryService'

// Simple in-memory cache (optional initial) for market snapshots
interface CacheEntry<T> { data: T; expires: number }
const marketCache = new Map<string, CacheEntry<any>>()
const MARKET_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = marketCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) { marketCache.delete(key); return null }
  return entry.data as T
}
function setCached<T>(key: string, data: T, ttl = MARKET_TTL_MS) {
  marketCache.set(key, { data, expires: Date.now() + ttl })
}

export const recommendationController = new Elysia({ prefix: '/api' })
  .get('/items/:id/markets', async ({ params, query, set }) => {
    const { id } = params as { id: string }
    const fresh = 'fresh' in query
    const cacheKey = `markets:${id}`
    let markets = !fresh ? getCached<any[]>(cacheKey) : null
    if (!markets) {
      markets = await PriceAdvisoryService.getInstance().getMarketSnapshot(id)
      if (!fresh) setCached(cacheKey, markets)
    }
    if (!markets || markets.length === 0) {
      set.status = 404
      return { message: 'NO_MARKET_DATA', itemId: id }
    }
    return { itemId: id, markets, generatedAt: new Date().toISOString() }
  })
  .get('/items/:id/recommendations', async ({ params, query, set }) => {
    const { id } = params as { id: string }
    const from = (query.from as string) || ''
    const mode = (query.mode as 'profit' | 'safe' | 'balanced') || 'profit'
    const qty = Math.max(1, parseInt(query.qty as string) || 1)
    const weight = Math.max(0.01, parseFloat(query.weight as string) || 1)
    const taxRate = Math.min(0.5, Math.max(0, parseFloat(query.taxRate as string) || 0.065))
    const limit = Math.min(20, Math.max(1, parseInt(query.limit as string) || 5))
    const strategy = (query.strategy as 'list' | 'quick') || 'list'
    const scenario = (query.scenario as 'haveStock' | 'arbitrage') || 'haveStock'

    if (!from) {
      set.status = 400
      return { message: 'MISSING_FROM_CITY' }
    }

    const cacheKey = `markets:${id}`
    let markets = getCached<any[]>(cacheKey)
    if (!markets) {
      markets = await PriceAdvisoryService.getInstance().getMarketSnapshot(id)
      setCached(cacheKey, markets)
    }
    if (!markets || markets.length === 0) {
      set.status = 404
      return { message: 'NO_MARKET_DATA', itemId: id }
    }

    if (!markets.find(m => m.city === from)) {
      set.status = 400
      return { message: 'UNKNOWN_FROM_CITY', supported: markets.map(m => m.city) }
    }

    const recs = await PriceAdvisoryService.getInstance().recommend(markets, {
      fromCity: from,
      mode,
      quantity: qty,
      itemWeight: weight,
      taxRate,
      strategy,
      scenario
    })

    return {
      itemId: id,
      fromCity: from,
      mode,
  params: { qty, weight, taxRate, strategy, scenario },
      generatedAt: new Date().toISOString(),
      recommendations: recs.slice(0, limit)
    }
  })
