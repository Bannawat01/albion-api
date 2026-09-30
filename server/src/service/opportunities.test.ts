import { describe, expect, test } from 'bun:test'
import { opportunityEmptyReason, opportunitiesController, rankOpportunityCandidates, type OpportunityDiagnostics } from '../controller/opportunitiesController'
import { ItemRepository } from '../repository/itemRepository'
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
  test('keeps backup targets when volume filtering is requested', () => {
    const rows = rankOpportunityCandidates({ T4_BAG: [
      price('Bridgewatch', 1000, 0, 5),
      price('Martlock', 0, 1600, 5),
      price('Thetford', 0, 1500, 5),
    ] }, { ...filters, minVolume: 1 }, now)
    expect(rows.map(row => row.targetCity)).toEqual(['Martlock', 'Thetford'])
  })
  test('confidence uses freshness, coverage and volume', () => {
    const fresh = new Date(now - 5 * 60_000).toISOString()
    expect(routeConfidence(fresh, fresh, 5, 20, now).confidence).toBe('high')
    expect(routeConfidence(fresh, fresh, 2, null, now).confidence).toBe('medium')
    expect(routeConfidence('', fresh, 5, 20, now).tooOld).toBe(true)
  })

  test('counts the stage that removes an item without changing route ranking', () => {
    const stats = (): OpportunityDiagnostics => ({ candidateItems: 1, itemsWithPrice: 0, itemsWithFreshSource: 0, itemsWithFreshPair: 0, itemsWithinBudget: 0, profitableItems: 0, historyChecked: 0, historyUnavailable: 0, returnedItems: 0 })
    const cases = [
      { rows: [price('Bridgewatch', 1000, 0, 31), price('Martlock', 0, 1500, 5)], reason: 'no_fresh_source' },
      { rows: [price('Bridgewatch', 1000, 0, 5), price('Martlock', 0, 1500, 31)], reason: 'no_fresh_pair' },
      { rows: [price('Bridgewatch', 20_000, 0, 5), price('Martlock', 0, 30_000, 5)], reason: 'over_budget' },
      { rows: [price('Bridgewatch', 1000, 0, 5), price('Martlock', 0, 950, 5)], reason: 'no_profit' },
    ] as const
    for (const { rows, reason } of cases) {
      const diagnostics = stats()
      expect(rankOpportunityCandidates({ T4_BAG: [...rows] }, filters, now, diagnostics)).toHaveLength(0)
      expect(opportunityEmptyReason(diagnostics, false)).toBe(reason)
    }
    const diagnostics = stats()
    expect(rankOpportunityCandidates({ T4_BAG: [price('Bridgewatch', 1000, 0, 5), price('Martlock', 0, 1500, 5)] }, filters, now, diagnostics)).toHaveLength(1)
    expect(diagnostics.profitableItems).toBe(1)
    expect(opportunityEmptyReason(diagnostics, false)).toBe('volume_filter')
    diagnostics.returnedItems = 1
    expect(opportunityEmptyReason(diagnostics, false)).toBeNull()
    expect(opportunityEmptyReason(stats(), true)).toBe('partial_upstream')
  })
})

test('partial empty opportunity results are not cached as a confirmed empty market', async () => {
  const repository = ItemRepository.getInstance()
  const original = repository.fetchItemsPricesBatchWithStatus
  let calls = 0
  repository.fetchItemsPricesBatchWithStatus = async () => ({ data: {}, partial: ++calls === 1 })
  try {
    const url = 'http://localhost/api/opportunities?budget=77123&maxAgeMinutes=119'
    const first = await (await opportunitiesController.handle(new Request(url))).json()
    const second = await (await opportunitiesController.handle(new Request(url))).json()
    expect(first.partial).toBe(true)
    expect(first.emptyReason).toBe('partial_upstream')
    expect(first.diagnostics.candidateItems).toBe(50)
    expect(second.partial).toBe(false)
    expect(second.emptyReason).toBe('no_fresh_source')
    expect((await (await opportunitiesController.handle(new Request(url))).json()).diagnostics).toEqual(second.diagnostics)
    expect(calls).toBe(2)
  } finally {
    repository.fetchItemsPricesBatchWithStatus = original
  }
})
