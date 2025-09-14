import { ItemRepository } from "../repository/itemRepository"
import type { Price } from "../interface/priceInterface"

export interface CityMarketStat {
  city: string
  sellPrice: number
  buyPrice: number
  sampleSize: number
  lastUpdated: string
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

const BASE_TRANSPORT_UNIT = 12 // ปรับใหม่ให้สมดุลมากขึ้น
const RISK_PENALTY_WEIGHT = 0.15 // portion of gross used in risk penalty for non-profit modes

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
    const transport = BASE_TRANSPORT_UNIT * distanceFactor(ctx.fromCity, m.city) * Math.max(0.01, ctx.itemWeight) * qty
    const riskScore = CITY_RISK[m.city] ?? 0.5
    const riskPenalty = ctx.mode === 'profit' ? 0 : grossRevenue * (riskScore * RISK_PENALTY_WEIGHT)
    const costBasisTotal = costBasisPerUnit * qty
    const net = grossRevenue - tax - transport - riskPenalty - costBasisTotal
    maxNet = Math.max(maxNet, net)
    rows.push({ city: m.city, gross: grossRevenue, tax, transport, riskPenalty, net, riskScore })
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
    async getMarketSnapshot(itemId:string): Promise<CityMarketStat[]> {
        const pricesRaw = await ItemRepository.getInstance().fetchItemPrice(itemId)

        // ถ้า fetch คืนค่าเป็น string (error message) หรือไม่ใช่ array ให้คืนว่าง
        if (!Array.isArray(pricesRaw)) return []

        const prices: Price[] = pricesRaw
        const cityMap: Record<string, {
            city: string,
            sellTotal: number,
            buyTotal: number,
            sampleSize: number,
            lastUpdated: string | null
        }> = {}

    prices.forEach(p => {
            const city = p.city ?? 'Unknown'
            if (!cityMap[city]) {
                cityMap[city] = { city, sellTotal: 0, buyTotal: 0, sampleSize: 0, lastUpdated: null }
            }
            const entry = cityMap[city]

            if (typeof p.sell_Price_Max === 'number') entry.sellTotal += p.sell_Price_Max
            if (typeof p.buy_Price_max === 'number') entry.buyTotal += p.buy_Price_max
            entry.sampleSize += 1

            // หา timestamp ล่าสุดจากฟิลด์วันที่ที่มีใน record
            const dateCandidates: (string | undefined)[] = [
              (p as any).sell_Price_Max_Date,
              (p as any).sell_Price_Min_Date,
              (p as any).buy_Price_Max_Date,
              (p as any).buy_Price_Min_Date
            ]
            for (const raw of dateCandidates) {
              if (!raw) continue
              const dt = new Date(raw)
              if (Number.isNaN(dt.getTime())) continue
              if (!entry.lastUpdated || dt > new Date(entry.lastUpdated)) {
                entry.lastUpdated = dt.toISOString()
              }
            }
        })

        return Object.values(cityMap).map(m => ({
            city: m.city,
            // คำนวณค่าเฉลี่ย (ปัดเป็นจำนวนเต็ม) — ปรับตามต้องการ (median, weighted, ฯลฯ)
            sellPrice: m.sampleSize ? Math.round(m.sellTotal / m.sampleSize) : 0,
            buyPrice: m.sampleSize ? Math.round(m.buyTotal / m.sampleSize) : 0,
            sampleSize: m.sampleSize,
            lastUpdated: m.lastUpdated ?? ''
        }))
    }
  async recommend(markets: CityMarketStat[], ctx: TransportContext): Promise<CityRecommendation[]> {
    // Basic input validation (could be expanded)
    if (!ctx.fromCity || !ctx.mode) return []
    if (ctx.quantity <= 0) return []
    return computeRecommendations(markets, ctx)
  }
}
