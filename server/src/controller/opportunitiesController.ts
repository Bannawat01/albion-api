import Elysia from 'elysia'
import { ItemRepository } from '../repository/itemRepository'
import type { Price } from '../interface/priceInterface'
import { fetchHistorySummary } from '../service/marketHistory'
import { MAX_ROUTE_AGE_MS, routeConfidence } from '../service/priceAdvisoryService'
import { validateCities } from '../service/validation'
import { TTLCache, TTL_CONSTANTS } from '../service/timeToLive'

export const OPPORTUNITY_ITEMS = [
  'T4_WOOD','T5_WOOD','T6_WOOD','T7_WOOD','T8_WOOD','T4_ROCK','T5_ROCK','T6_ROCK','T7_ROCK','T8_ROCK',
  'T4_ORE','T5_ORE','T6_ORE','T7_ORE','T8_ORE','T4_HIDE','T5_HIDE','T6_HIDE','T7_HIDE','T8_HIDE',
  'T4_FIBER','T5_FIBER','T6_FIBER','T7_FIBER','T8_FIBER','T4_CLOTH','T5_CLOTH','T6_CLOTH',
  'T4_LEATHER','T5_LEATHER','T6_LEATHER','T4_METALBAR','T5_METALBAR','T6_METALBAR','T4_PLANKS','T5_PLANKS','T6_PLANKS',
  'T4_STONEBLOCK','T5_STONEBLOCK','T6_STONEBLOCK','T4_BAG','T5_BAG','T6_BAG','T7_BAG','T8_BAG',
  'T4_CAPE','T5_CAPE','T6_CAPE','T7_CAPE','T8_CAPE',
] as const

export type Confidence = 'high' | 'medium' | 'low'
export interface Opportunity {
  itemId: string; itemName: string; sourceCity: string; targetCity: string; quantity: number
  buyPrice: number; sellPrice: number; investment: number; tax: number; netProfit: number; margin: number
  dailyVolume: number | null; sourceUpdatedAt: string; targetUpdatedAt: string; coverage: number
  confidence: Confidence; staleReasons: string[]
}

type Filters = { origin?: string; budget: number; minProfit: number; minVolume: number; maxAgeMinutes: number; strategy: 'list' | 'quick'; limit: number }

export function rankOpportunityCandidates(prices: Record<string, Price[]>, filters: Filters, now = Date.now()): Opportunity[] {
  const rows: Opportunity[] = []
  const isFreshEnough = (value: string) => {
    const age = now - new Date(value).getTime()
    return Number.isFinite(age) && age >= 0 && age <= MAX_ROUTE_AGE_MS && age <= filters.maxAgeMinutes * 60_000
  }
  for (const [itemId, itemPrices] of Object.entries(prices)) {
    const quality = itemPrices.filter(price => Number(price.quantity) === 1)
    const coverage = new Set(quality.map(price => price.city)).size
    const sources = quality.filter(price => price.sell_Price_Min > 0 && isFreshEnough(price.sell_Price_Min_Date) && (!filters.origin || price.city === filters.origin))
    const source = sources.sort((a, b) => a.sell_Price_Min - b.sell_Price_Min)[0]
    if (!source) continue
    const targets = quality.filter(price => price.city !== source.city).map(price => ({
      row: price,
      value: filters.strategy === 'quick' ? price.buy_Price_max : price.sell_Price_Min,
      updatedAt: filters.strategy === 'quick' ? price.buy_Price_Max_Date : price.sell_Price_Min_Date,
    })).filter(target => target.value > 0 && isFreshEnough(target.updatedAt)).sort((a, b) => b.value - a.value)
    const sourceUpdatedAt = source.sell_Price_Min_Date
    const quantity = Math.min(10_000, Math.floor(filters.budget / source.sell_Price_Min))
    if (quantity < 1) continue
    for (const target of targets.slice(0, filters.minVolume > 0 ? 3 : 1)) {
      const investment = source.sell_Price_Min * quantity
      const tax = target.value * quantity * 0.065
      const netProfit = target.value * quantity - tax - investment
      if (netProfit < filters.minProfit || netProfit <= 0) continue
      const trust = routeConfidence(sourceUpdatedAt, target.updatedAt, coverage, null, now)
      rows.push({ itemId, itemName: String(source.itemName || itemId), sourceCity: String(source.city), targetCity: String(target.row.city), quantity, buyPrice: source.sell_Price_Min, sellPrice: target.value, investment, tax, netProfit, margin: investment ? netProfit / investment * 100 : 0, dailyVolume: null, sourceUpdatedAt, targetUpdatedAt: target.updatedAt, coverage, confidence: trust.confidence, staleReasons: trust.staleReasons })
    }
  }
  return rows.sort((a, b) => b.netProfit - a.netProfit)
}

const cache = new TTLCache<unknown>(200)
export const opportunitiesController = new Elysia({ prefix: '/api' }).get('/opportunities', async ({ query }) => {
  const origin = validateCities(query.origin)
  const filters: Filters = {
    origin,
    budget: Math.min(1_000_000_000, Math.max(0, Number(query.budget) || 0)),
    minProfit: Math.min(1_000_000_000, Math.max(0, Number(query.minProfit) || 0)),
    minVolume: Math.min(1_000_000, Math.max(0, Number(query.minVolume) || 0)),
    maxAgeMinutes: Math.min(1440, Math.max(1, Number(query.maxAgeMinutes) || 30)),
    strategy: query.strategy === 'quick' ? 'quick' : 'list',
    limit: Math.min(20, Math.max(1, Number(query.limit) || 10)),
  }
  const cacheKey = JSON.stringify(filters)
  const hit = cache.get(cacheKey)
  if (hit) return hit
  const batch = await ItemRepository.getInstance().fetchItemsPricesBatchWithStatus([...OPPORTUNITY_ITEMS])
  let partial = batch.partial
  const prices = batch.data
  const ranked = rankOpportunityCandidates(prices, filters)
  const primaryIds = [...new Set(ranked.map(item => item.itemId))].slice(0, filters.minVolume > 0 ? 5 : 10)
  const candidates = ranked.filter(item => primaryIds.includes(item.itemId)).slice(0, 10)
  const enriched = await Promise.all(candidates.map(async opportunity => {
    try {
      const history = await fetchHistorySummary(opportunity.itemId, opportunity.targetCity, 1, 7)
      const trust = routeConfidence(opportunity.sourceUpdatedAt, opportunity.targetUpdatedAt, opportunity.coverage, history.averageDailyVolume)
      return { ...opportunity, dailyVolume: history.averageDailyVolume, confidence: trust.confidence, staleReasons: trust.staleReasons }
    } catch { partial = true; return opportunity }
  }))
  const seen = new Set<string>()
  const items = enriched.filter(item => {
    if ((item.dailyVolume ?? 0) < filters.minVolume || seen.has(item.itemId)) return false
    seen.add(item.itemId)
    return true
  }).slice(0, filters.limit)
  const value = { generatedAt: new Date().toISOString(), partial, filters, items }
  cache.set(cacheKey, value, TTL_CONSTANTS.FIVE_MINUTES)
  return value
})
