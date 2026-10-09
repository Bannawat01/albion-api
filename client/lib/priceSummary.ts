export type CitySummary = { city: string; sellMin: number | null; buyMax: number | null; sellUpdatedAt: string | null; buyUpdatedAt: string | null }

const CITY_ORDER = ['Bridgewatch', 'Martlock', 'Lymhurst', 'Fort Sterling', 'Thetford', 'Caerleon', 'Brecilien', 'Black Market']
const valid = (value: unknown) => { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null }
const realDate = (value: unknown) => typeof value === 'string' && value && !value.startsWith('0001') ? value : null

/** Collapse raw AODP price rows to one lowest-sell / highest-buy entry per city (server-safe, no React). */
export function summarizeByCity(rows: unknown[]): CitySummary[] {
  const map = new Map<string, CitySummary>()
  for (const raw of rows) {
    const row = raw as Record<string, unknown>
    const city = String(row.city || '').trim()
    if (!city) continue
    const entry = map.get(city) ?? { city, sellMin: null, buyMax: null, sellUpdatedAt: null, buyUpdatedAt: null }
    const sell = valid(row.sell_Price_Min), buy = valid(row.buy_Price_max)
    if (sell && (entry.sellMin == null || sell < entry.sellMin)) { entry.sellMin = sell; entry.sellUpdatedAt = realDate(row.sell_Price_Min_Date) }
    if (buy && (entry.buyMax == null || buy > entry.buyMax)) { entry.buyMax = buy; entry.buyUpdatedAt = realDate(row.buy_Price_Max_Date) }
    map.set(city, entry)
  }
  return [...map.values()].filter(e => e.sellMin || e.buyMax).sort((a, b) => CITY_ORDER.indexOf(a.city) - CITY_ORDER.indexOf(b.city))
}

export function bestCities(summary: CitySummary[]) {
  const buyable = summary.filter(e => e.sellMin && e.city !== 'Black Market')
  const sellable = summary.filter(e => e.buyMax)
  return {
    cheapest: buyable.sort((a, b) => a.sellMin! - b.sellMin!)[0] ?? null,
    topBuyer: [...sellable].sort((a, b) => b.buyMax! - a.buyMax!)[0] ?? null,
  }
}

/** AODP timestamps are UTC without a zone suffix. */
export const formatUtc = (value: string | null) => value ? `${value.replace('T', ' ').slice(0, 16)} UTC` : '—'
