import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { ItemRepository, rankByPopularity } from './itemRepository'

const realFetch = globalThis.fetch
let priceCalls = 0

beforeAll(async () => {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('items.json')) {
      return Response.json([
        { UniqueName: 'T4_BAG', LocalizedNames: { 'EN-US': "Adept's Bag" } },
        { UniqueName: 'T4_CAPE', LocalizedNames: { 'EN-US': "Adept's Cape" } },
      ])
    }
    if (url.includes('world.json')) return Response.json({})
    if (url.includes('/stats/prices/')) {
      priceCalls++
      return Response.json([
        {
          item_id: 'T4_BAG', city: 'Bridgewatch', quality: 1,
          sell_price_min: 100, sell_price_min_date: '2026-09-20T10:00:00Z',
          sell_price_max: 110, sell_price_max_date: '2026-09-20T10:00:00Z',
          buy_price_min: 80, buy_price_min_date: '2026-09-20T10:00:00Z',
          buy_price_max: 90, buy_price_max_date: '2026-09-20T10:00:00Z',
        },
        {
          item_id: 'T4_CAPE', city: 'Bridgewatch', quality: 1,
          sell_price_min: 200, sell_price_min_date: '2026-09-20T10:00:00Z',
          sell_price_max: 210, sell_price_max_date: '2026-09-20T10:00:00Z',
          buy_price_min: 180, buy_price_min_date: '2026-09-20T10:00:00Z',
          buy_price_max: 190, buy_price_max_date: '2026-09-20T10:00:00Z',
        },
      ])
    }
    throw new Error(`Unexpected URL: ${url}`)
  }) as typeof fetch
  await ItemRepository.getInstance().fetchMetadata()
})

afterAll(() => {
  globalThis.fetch = realFetch
})

describe('ItemRepository batch prices', () => {
  it('fetches multiple item IDs once and reuses the item cache', async () => {
    const repository = ItemRepository.getInstance()
    priceCalls = 0
    const first = await repository.fetchItemsPricesBatch(['T4_BAG', 'T4_CAPE'], 'Bridgewatch')
    const second = await repository.fetchItemsPricesBatch(['T4_BAG', 'T4_CAPE'], 'Bridgewatch')

    expect(priceCalls).toBe(1)
    expect(first.T4_BAG[0]?.sell_Price_Min).toBe(100)
    expect(first.T4_CAPE[0]?.sell_Price_Min).toBe(200)
    expect(second).toEqual(first)
  })
})

it('ranks popular items first without changing ties', () => {
  expect(rankByPopularity(['A', 'B', 'C'], new Map([['B', 3]]))).toEqual(['B', 'A', 'C'])
})
