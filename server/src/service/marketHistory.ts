import { albionDataBaseUrl } from '../configs/runtime'
import { ExternalApiError } from '../middleware/customError'

type HistoryPoint = { item_count: number; avg_price: number; timestamp: string }
const cache = new Map<string, { data: ReturnType<typeof summarizeHistory>; expires: number }>()

export function summarizeHistory(points: HistoryPoint[], days: number) {
  const data = points.filter(point => point.item_count >= 0 && point.avg_price >= 0 && point.timestamp)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-days)
    .map(point => ({ date: point.timestamp, volume: point.item_count, averagePrice: point.avg_price }))
  const totalVolume = data.reduce((sum, point) => sum + point.volume, 0)
  const pricedVolume = data.reduce((sum, point) => sum + point.averagePrice * point.volume, 0)
  return { points: data, totalVolume, averageDailyVolume: data.length ? Math.round(totalVolume / data.length) : 0, averagePrice: totalVolume ? Math.round(pricedVolume / totalVolume) : 0 }
}

export async function fetchHistorySummary(itemId: string, city: string, quality = 1, days = 7) {
  const key = `${itemId}:${city}:${quality}:${days}`
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.data
  try {
    const url = `${albionDataBaseUrl}/api/v2/stats/history/${encodeURIComponent(itemId)}.json?locations=${encodeURIComponent(city)}&qualities=${quality}&time-scale=24`
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!response.ok) throw new Error(`History API returned ${response.status}`)
    const rows = await response.json() as Array<{ data?: HistoryPoint[] }>
    const data = summarizeHistory(rows[0]?.data ?? [], days)
    cache.set(key, { data, expires: Date.now() + 5 * 60 * 1000 })
    return data
  } catch (error) {
    throw new ExternalApiError(error instanceof Error ? error.message : 'Unable to fetch market history')
  }
}
