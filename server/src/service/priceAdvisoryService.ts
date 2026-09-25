import { ItemRepository } from "../repository/itemRepository"
import type { Price } from "../interface/priceInterface"

export interface CityMarketStat {
  city: string
  sellPrice: number
  buyPrice: number
  sampleSize: number
  lastUpdated: string
  sellUpdatedAt?: string
  buyUpdatedAt?: string
}

export interface TransportContext {
  fromCity: string
  itemWeight: number // ถ้าไม่รู้ให้ default 1
  quantity: number
  taxRate: number
  mode: 'profit' | 'safe' | 'balanced'
  strategy?: 'list' | 'quick' // ใช้ sellPrice (list) หรือ buyPrice (quick)
  scenario?: 'haveStock' | 'arbitrage' // ถือของอยู่แล้ว หรือ ซื้อที่เมืองต้นทางก่อน
}

export interface CityRecommendation {
  city: string
  gross: number
  tax: number
  transport: number
  riskPenalty: number
  net: number
  riskScore: number
  sourcePrice: number
  targetPrice: number
  purchaseCost: number
  netProfit: number
  profitPercent: number
  sourceUpdatedAt: string
  targetUpdatedAt: string
  isStale: boolean
  confidence: 'high' | 'medium' | 'low'
  coverage: number
  dailyVolume: number | null
  staleReasons: string[]
  score?: number // สำหรับ balanced
}

// ---------------- Constants & Config ----------------
const ROYAL_CITIES = ['Bridgewatch', 'Martlock', 'Thetford', 'Lymhurst', 'Fort Sterling'] as const

// Risk score per city (0 = very safe, 1 = very risky)
const CITY_RISK: Record<string, number> = {
  Bridgewatch: 0.1,
  Martlock: 0.1,
  Lymhurst: 0.1,
  'Fort Sterling': 0.1,
  Thetford: 0.1,
  Caerleon: 0.35,
  'Black Market': 0.55
}

// Mode weighting for composite scoring
const MODE_WEIGHTS: Record<TransportContext['mode'], { profit: number; safety: number }> = {
  profit: { profit: 1, safety: 0 },
  safe: { profit: 0.4, safety: 0.6 },
  balanced: { profit: 0.6, safety: 0.4 }
}

export const FRESH_AFTER_MS = 30 * 60 * 1000
export const MAX_ROUTE_AGE_MS = 24 * 60 * 60 * 1000

export function routeConfidence(sourceUpdatedAt: string, targetUpdatedAt: string, coverage: number, dailyVolume: number | null, now = Date.now()) {
  const ages = [sourceUpdatedAt, targetUpdatedAt].map(value => now - new Date(value).getTime())
  const invalid = ages.some(age => !Number.isFinite(age) || age < 0)
  const staleReasons = invalid ? ['Missing or invalid update time'] : [
    ...(ages.some(age => age > FRESH_AFTER_MS) ? ['Price data is older than 30 minutes'] : []),
    ...(coverage < 4 ? ['Few cities have usable prices'] : []),
    ...(dailyVolume !== null && dailyVolume < 10 ? ['Low recent sales volume'] : []),
  ]
  const tooOld = invalid || ages.some(age => age > MAX_ROUTE_AGE_MS)
  const confidence = !tooOld && ages.every(age => age <= FRESH_AFTER_MS) && coverage >= 4 && dailyVolume !== null && dailyVolume >= 10
    ? 'high'
    : !tooOld && ages.every(age => age <= FRESH_AFTER_MS) && coverage >= 2 && (dailyVolume === null || dailyVolume >= 1) ? 'medium' : 'low'
  return { confidence: confidence as 'high' | 'medium' | 'low', staleReasons, tooOld, isStale: invalid || ages.some(age => age > FRESH_AFTER_MS) }
}

// ---------------- Internal Helpers ----------------

function computeRecommendations(markets: CityMarketStat[], ctx: TransportContext): CityRecommendation[] {
  const from = markets.find(m => m.city === ctx.fromCity)
  if (!from || from.sellPrice <= 0) return []

  // Filter for safe mode (royal cities only)
  const candidateMarkets = ctx.mode === 'safe'
    ? markets.filter(m => ROYAL_CITIES.includes(m.city as any) && m.city !== ctx.fromCity)
    : markets.filter(m => m.city !== ctx.fromCity)
  const strategy = ctx.strategy || 'list'
  const scenario = ctx.scenario || 'haveStock'
  const costBasisPerUnit = scenario === 'arbitrage' ? from.sellPrice : 0

  const rows: CityRecommendation[] = []
  let maxNet = 0
  for (const m of candidateMarkets) {
    const targetSell = strategy === 'quick' ? (m.buyPrice || 0) : (m.sellPrice || 0)
    if (!targetSell || targetSell <= 0) continue
    const qty = ctx.quantity
    const grossRevenue = targetSell * qty
    const tax = grossRevenue * ctx.taxRate
    const riskScore = CITY_RISK[m.city] ?? 0.5
    const costBasisTotal = costBasisPerUnit * qty
    const net = grossRevenue - tax - costBasisTotal
    const sourceUpdatedAt = from.sellUpdatedAt || from.lastUpdated
    const targetUpdatedAt = strategy === 'quick'
      ? (m.buyUpdatedAt || m.lastUpdated)
      : (m.sellUpdatedAt || m.lastUpdated)
    const trust = routeConfidence(sourceUpdatedAt, targetUpdatedAt, markets.length, null)
    if (trust.tooOld) continue
    maxNet = Math.max(maxNet, net)
    rows.push({
      city: m.city, gross: grossRevenue, tax, transport: 0, riskPenalty: 0, net, riskScore,
      sourcePrice: from.sellPrice,
      targetPrice: targetSell,
      purchaseCost: costBasisTotal,
      netProfit: net,
      profitPercent: costBasisTotal > 0 ? (net / costBasisTotal) * 100 : 0,
      sourceUpdatedAt,
      targetUpdatedAt,
      isStale: trust.isStale,
      confidence: trust.confidence,
      coverage: markets.length,
      dailyVolume: null,
      staleReasons: trust.staleReasons,
    })
  }

  const weights = MODE_WEIGHTS[ctx.mode]
  if (ctx.mode === 'profit') {
    rows.sort((a, b) => b.net - a.net)
  } else {
    rows.forEach(r => {
      r.score = (weights.profit * (r.net / (maxNet || 1))) + (weights.safety * (1 - r.riskScore))
    })
    rows.sort((a, b) => (b.score! - a.score!))
  }
  return rows.filter(r => r.net > 0) // keep only profitable
}

function classify(city: string): string {
  return (ROYAL_CITIES as readonly string[]).includes(city) ? 'royal' : 'outlands'
}
export function distanceFactor(from: string , to: string): number {
    const fromClass = classify(from)
    const toClass = classify(to)
    if (fromClass === toClass) return 1
    return 1.2 // ข้ามโซนมีค่าขนส่งเพิ่ม
}

export class PriceAdvisoryService {
    static instance: PriceAdvisoryService
    static getInstance() {
        if (!PriceAdvisoryService.instance) {
            PriceAdvisoryService.instance = new PriceAdvisoryService()
        }
        return PriceAdvisoryService.instance
    }
    async getMarketSnapshot(itemId:string, quality = 1): Promise<CityMarketStat[]> {
        const pricesRaw = await ItemRepository.getInstance().fetchItemPrice(itemId)

        // ถ้า fetch คืนค่าเป็น string (error message) หรือไม่ใช่ array ให้คืนว่าง
        if (!Array.isArray(pricesRaw)) return []

        const prices: Price[] = pricesRaw
        const cityMap: Record<string, {
            city: string,
            sellPrice: number,
            buyPrice: number,
            sampleSize: number,
            sellUpdatedAt: string,
            buyUpdatedAt: string
        }> = {}

    prices.filter(p => Number(p.quantity) === quality).forEach(p => {
            const city = p.city ?? 'Unknown'
            if (!cityMap[city]) {
                cityMap[city] = { city, sellPrice: 0, buyPrice: 0, sampleSize: 0, sellUpdatedAt: '', buyUpdatedAt: '' }
            }
            const entry = cityMap[city]

            if (p.sell_Price_Min > 0 && (!entry.sellPrice || p.sell_Price_Min < entry.sellPrice)) {
              entry.sellPrice = p.sell_Price_Min
              entry.sellUpdatedAt = p.sell_Price_Min_Date
            }
            if (p.buy_Price_max > entry.buyPrice) {
              entry.buyPrice = p.buy_Price_max
              entry.buyUpdatedAt = p.buy_Price_Max_Date
            }
            entry.sampleSize += 1

        })

        return Object.values(cityMap).map(m => ({
            city: m.city,
            sellPrice: m.sellPrice,
            buyPrice: m.buyPrice,
            sampleSize: m.sampleSize,
            lastUpdated: m.sellUpdatedAt || m.buyUpdatedAt,
            sellUpdatedAt: m.sellUpdatedAt,
            buyUpdatedAt: m.buyUpdatedAt,
        }))
    }
  async recommend(markets: CityMarketStat[], ctx: TransportContext): Promise<CityRecommendation[]> {
    // Basic input validation (could be expanded)
    if (!ctx.fromCity || !ctx.mode) return []
    if (!Number.isSafeInteger(ctx.quantity) || ctx.quantity < 1 || ctx.quantity > 10_000) return []
    return computeRecommendations(markets, ctx)
  }
}
