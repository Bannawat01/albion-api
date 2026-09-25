import { describe, expect, test } from 'bun:test'
import { rankOpportunityCandidates } from '../controller/opportunitiesController'
import { routeConfidence } from './priceAdvisoryService'

const now = Date.parse('2026-09-23T10:00:00Z')
const price = (city: string, sell: number, buy: number, minutesOld: number) => ({
  itemName: 'Adept Bag', item_id: 'T4_BAG', city, quantity: 1,
  sell_Price_Min: sell, sell_Price_Min_Date: new Date(now - minutesOld * 60_000).toISOString(), sell_Price_Max: 0, sell_Price_Max_Date: '',
  buy_Price_max: buy, buy_Price_Max_Date: new Date(now - minutesOld * 60_000).toISOString(), buy_Price_Min: 0, buy_Price_Min_Date: '',
} as any)
const filters = { budget: 10_000, minProfit: 0, minVolume: 0, maxAgeMinutes: 30, strategy: 'quick' as const, limit: 10 }

describe('opportunity ranking', () => {
  test('calculates quantity, tax and profit after budget', () => {
    const rows = rankOpportunityCandidates({ T4_BAG: [price('Bridgewatch', 1000, 0, 5), price('Martlock', 1300, 1500, 5)] }, filters, now)
    expect(rows[0].quantity).toBe(10)
    expect(rows[0].tax).toBe(975)
    expect(rows[0].netProfit).toBe(4025)
  })
  test('drops missing, over-age and over-budget routes', () => {
    expect(rankOpportunityCandidates({ T4_BAG: [price('Bridgewatch', 1000, 0, 31), price('Martlock', 1300, 1500, 5)] }, filters, now)).toHaveLength(0)
    expect(rankOpportunityCandidates({ T4_BAG: [price('Bridgewatch', 20_000, 0, 5), price('Martlock', 0, 30_000, 5)] }, filters, now)).toHaveLength(0)
    expect(rankOpportunityCandidates({ T4_BAG: [price('Bridgewatch', 1000, 0, 5), price('Martlock', 0, 1500, 5)] }, { ...filters, budget: 0 }, now)).toHaveLength(0)
  })
  test('falls back to fresh cities when the cheapest or highest price is stale', () => {
    const rows = rankOpportunityCandidates({ T4_BAG: [
      price('Bridgewatch', 500, 0, 31),
      price('Lymhurst', 1000, 0, 5),
      price('Martlock', 0, 2000, 31),
      price('Thetford', 0, 1500, 5),
    ] }, filters, now)
    expect(rows[0].sourceCity).toBe('Lymhurst')
    expect(rows[0].targetCity).toBe('Thetford')
  })
  test('confidence uses freshness, coverage and volume', () => {
    const fresh = new Date(now - 5 * 60_000).toISOString()
    expect(routeConfidence(fresh, fresh, 5, 20, now).confidence).toBe('high')
    expect(routeConfidence(fresh, fresh, 2, null, now).confidence).toBe('medium')
    expect(routeConfidence('', fresh, 5, 20, now).tooOld).toBe(true)
  })
})
