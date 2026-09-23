import Elysia from 'elysia'
import { PriceAdvisoryService } from '../service/priceAdvisoryService'
import { assertValidItemId, validateCities } from '../service/validation'
import { albionDataBaseUrl } from '../configs/runtime'
import { ExternalApiError } from '../middleware/customError'
import { fetchHistorySummary, summarizeHistory } from '../service/marketHistory'
import { routeConfidence } from '../service/priceAdvisoryService'
export { summarizeHistory } from '../service/marketHistory'

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
  .get('/items/:id/history', async ({ params, query }) => {
    const { id } = params as { id: string }
    assertValidItemId(id)
    const city = validateCities(query.city) || 'Bridgewatch'
    const quality = Math.min(5, Math.max(1, parseInt(query.quality as string) || 1))
    const days = Math.min(30, Math.max(1, parseInt(query.days as string) || 7))
    const cacheKey = `history:${id}:${city}:${quality}:${days}`
    const cached = getCached<ReturnType<typeof summarizeHistory>>(cacheKey)
    if (cached) return { itemId: id, city, quality, ...cached }

    try {
      const summary = await fetchHistorySummary(id, city, quality, days)
      setCached(cacheKey, summary)
      return { itemId: id, city, quality, ...summary }
    } catch (error) {
      throw new ExternalApiError(error instanceof Error ? error.message : 'Unable to fetch market history')
    }
  })
  .get('/items/:id/markets', async ({ params, query, set }) => {
    const { id } = params as { id: string }
    assertValidItemId(id)
    const fresh = 'fresh' in query
    const quality = Math.min(5, Math.max(1, parseInt(query.quality as string) || 1))
    const cacheKey = `markets:${id}:${quality}`
    let markets = !fresh ? getCached<any[]>(cacheKey) : null
    if (!markets) {
      markets = await PriceAdvisoryService.getInstance().getMarketSnapshot(id, quality)
      if (!fresh) setCached(cacheKey, markets)
    }
    if (!markets || markets.length === 0) {
      set.status = 404
      return { message: 'NO_MARKET_DATA', itemId: id }
    }
    return { itemId: id, quality, markets, generatedAt: new Date().toISOString() }
  })
  .get('/items/:id/recommendations', async ({ params, query, set }) => {
    const { id } = params as { id: string }
    assertValidItemId(id)
    const from = (query.from as string) || ''
    const requestedMode = query.mode as string
    const mode = (['profit', 'safe', 'balanced'].includes(requestedMode) ? requestedMode : 'profit') as 'profit' | 'safe' | 'balanced'
    const qty = Math.max(1, parseInt(query.qty as string) || 1)
    const weight = Math.max(0.01, parseFloat(query.weight as string) || 1)
    const taxRate = Math.min(0.5, Math.max(0, parseFloat(query.taxRate as string) || 0.065))
    const limit = Math.min(20, Math.max(1, parseInt(query.limit as string) || 5))
    const strategy = query.strategy === 'quick' ? 'quick' : 'list'
    const scenario = query.scenario === 'arbitrage' ? 'arbitrage' : 'haveStock'
    const quality = Math.min(5, Math.max(1, parseInt(query.quality as string) || 1))
    const includeOld = query.includeOld === 'true'

    if (!from) {
      set.status = 400
      return { message: 'MISSING_FROM_CITY' }
    }

    const cacheKey = `markets:${id}:${quality}`
    let markets = getCached<any[]>(cacheKey)
    if (!markets) {
      markets = await PriceAdvisoryService.getInstance().getMarketSnapshot(id, quality)
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

    const visible = recs.filter(route => includeOld || !route.isStale).slice(0, limit)
    const enriched = await Promise.all(visible.map(async route => {
      try {
        const history = await fetchHistorySummary(id, route.city, quality, 7)
        const trust = routeConfidence(route.sourceUpdatedAt, route.targetUpdatedAt, route.coverage, history.averageDailyVolume)
        return { ...route, dailyVolume: history.averageDailyVolume, confidence: trust.confidence, staleReasons: trust.staleReasons }
      } catch { return route }
    }))
    return {
      itemId: id,
      fromCity: from,
      mode,
      params: { qty, weight, taxRate, strategy, scenario, quality },
      generatedAt: new Date().toISOString(),
      recommendations: enriched
    }
  })
