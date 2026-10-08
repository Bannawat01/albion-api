import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { ItemRepository, rankByPopularity, rankFeaturedItems, rankSearchItems } from './itemRepository'

const realFetch = globalThis.fetch
let priceCalls = 0
let failNextPriceCall = false
let failNextMetadataCall = false

beforeAll(async () => {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('items.json')) {
      if (failNextMetadataCall) {
        failNextMetadataCall = false
        return new Response('unavailable', { status: 503 })
      }
      return Response.json([
        { UniqueName: 'T4_BAG', LocalizedNames: { 'EN-US': "Adept's Bag" } },
        { UniqueName: 'T4_CAPE', LocalizedNames: { 'EN-US': "Adept's Cape" } },
      ])
    }
    if (url.includes('world.json')) return Response.json({})
    if (url.includes('/stats/prices/')) {
      priceCalls++
      if (failNextPriceCall) {
        failNextPriceCall = false
        return new Response('unavailable', { status: 503 })
      }
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
  it('starts without upstream metadata and retries after a temporary failure', async () => {
    const repository = new ItemRepository()
    failNextMetadataCall = true
    await expect(repository.fetchMetadata()).rejects.toThrow('Unable to fetch game metadata')
    expect((await repository.fetchMetadata()).items).toContain('T4_BAG')
  })

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

  it('reports upstream failure as partial and retries instead of caching an empty market', async () => {
    const repository = ItemRepository.getInstance()
    failNextPriceCall = true
    priceCalls = 0
    const first = await repository.fetchItemsPricesBatchWithStatus(['T4_BAG'], 'Martlock')
    const second = await repository.fetchItemsPricesBatchWithStatus(['T4_BAG'], 'Martlock')
    expect(first.partial).toBe(true)
    expect(first.data.T4_BAG).toEqual([])
    expect(second.partial).toBe(false)
    expect(second.data.T4_BAG[0]?.sell_Price_Min).toBe(100)
    expect(priceCalls).toBe(2)
  })
})

it('ranks popular items first without changing ties', () => {
  expect(rankByPopularity(['A', 'B', 'C'], new Map([['B', 3]]))).toEqual(['B', 'A', 'C'])
})

it('puts current, two-sided market data ahead of stale or missing prices', () => {
  const now = Date.parse('2026-10-08T15:00:00Z')
  const row = (city: string, time: string) => ({
    city, quantity: 1, sell_Price_Min: 100, buy_Price_max: 90,
    sell_Price_Min_Date: time, buy_Price_Max_Date: time
  })
  expect(rankFeaturedItems(['STALE', 'SOME', 'BEST', 'NONE'], {
    STALE: [row('A', '2026-10-07T12:00:00')],
    SOME: [row('A', '2026-10-08T14:00:00')],
    BEST: [row('A', '2026-10-08T14:50:00'), row('B', '2026-10-08T14:45:00')],
    NONE: [{ ...row('A', '2026-10-08T14:50:00'), buy_Price_max: 0 }]
  } as any, now)).toEqual(['BEST', 'SOME'])
})

it('keeps exact and prefix search matches ahead of popularity', () => {
  expect(rankSearchItems(['B', 'C', 'A'], 'bag', {
    A: 'Bag', B: 'Small Bag', C: 'Baggins'
  }, new Map([['B', 99]]))).toEqual(['A', 'C', 'B'])
})
