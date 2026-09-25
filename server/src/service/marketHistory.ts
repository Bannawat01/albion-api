import { albionDataBaseUrl } from '../configs/runtime'
import { ExternalApiError } from '../middleware/customError'
import { TTLCache, TTL_CONSTANTS } from './timeToLive'

type HistoryPoint = { item_count: number; avg_price: number; timestamp: string }
const cache = new TTLCache<ReturnType<typeof summarizeHistory>>(500)

export function summarizeHistory(points: HistoryPoint[], days: number, now = Date.now()) {
  const data = points.filter(point => {
    const timestamp = Date.parse(point.timestamp)
    return Number.isFinite(point.item_count) && point.item_count >= 0
      && Number.isFinite(point.avg_price) && point.avg_price >= 0
      && Number.isFinite(timestamp) && timestamp <= now
  }).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)).slice(-Math.max(1, Math.min(days, 365)))
    .map(point => ({ date: point.timestamp, volume: point.item_count, averagePrice: point.avg_price }))
  const totalVolume = data.reduce((sum, point) => sum + point.volume, 0)
  const pricedVolume = data.reduce((sum, point) => sum + point.averagePrice * point.volume, 0)
  return { points: data, totalVolume, averageDailyVolume: data.length ? Math.round(totalVolume / data.length) : 0, averagePrice: totalVolume ? Math.round(pricedVolume / totalVolume) : 0 }
}

export async function fetchHistorySummary(itemId: string, city: string, quality = 1, days = 7) {
  const key = `${itemId}:${city}:${quality}:${days}`
  const hit = cache.get(key)
  if (hit) return hit
  try {
    const url = `${albionDataBaseUrl}/api/v2/stats/history/${encodeURIComponent(itemId)}.json?locations=${encodeURIComponent(city)}&qualities=${quality}&time-scale=24`
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!response.ok) throw new Error(`History API returned ${response.status}`)
    const rows = await response.json() as Array<{ data?: HistoryPoint[] }>
    const data = summarizeHistory(rows[0]?.data ?? [], days)
    cache.set(key, data, TTL_CONSTANTS.FIVE_MINUTES)
    return data
  } catch (error) {
    throw new ExternalApiError(error instanceof Error ? error.message : 'Unable to fetch market history')
  }
}
