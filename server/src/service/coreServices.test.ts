import { describe, expect, it } from 'bun:test'
import { PaginationService } from './paginationService'
import { TTLCache } from './timeToLive'
import { PriceAdvisoryService, distanceFactor, type CityMarketStat } from './priceAdvisoryService'
import { summarizeHistory } from '../controller/recommendationController'
import { validAnalyticsEvent } from '../controller/analyticsController'

describe('PaginationService', () => {
  it('normalizes unsafe pagination values', () => {
    expect(PaginationService.validateParams({ page: -2, limit: 999 })).toEqual({
      page: 1,
      limit: 100,
      offset: 0,
    })
  })

  it('creates navigation metadata', () => {
    expect(PaginationService.createMeta(2, 10, 25)).toEqual({
      currentPage: 2,
      totalPages: 3,
      totalItems: 25,
      itemsPerPage: 10,
      hasNextPage: true,
      hasPreviousPage: true,
      nextPage: 3,
      previousPage: 1,
    })
  })
})

describe('TTLCache', () => {
  it('stores, deletes, and clears values', () => {
    const cache = new TTLCache<number>()
    cache.set('silver', 42, 1000)
    expect(cache.get('silver')).toBe(42)
    expect(cache.has('silver')).toBe(true)
    expect(cache.delete('silver')).toBe(true)
    expect(cache.get('silver')).toBeNull()
    cache.set('gold', 7, 1000)
    cache.clear()
    expect(cache.size()).toBe(0)
  })

  it('does not return expired values', async () => {
    const cache = new TTLCache<number>()
    cache.set('expired', 1, 1)
    await Bun.sleep(5)
    expect(cache.get('expired')).toBeNull()
  })
})

describe('PriceAdvisoryService', () => {
  const markets: CityMarketStat[] = [
    { city: 'Bridgewatch', sellPrice: 100, buyPrice: 90, sampleSize: 1, lastUpdated: '' },
    { city: 'Martlock', sellPrice: 180, buyPrice: 160, sampleSize: 1, lastUpdated: '' },
    { city: 'Black Market', sellPrice: 240, buyPrice: 220, sampleSize: 1, lastUpdated: '' },
  ]

  it('ranks the most profitable destination first', async () => {
    const rows = await PriceAdvisoryService.getInstance().recommend(markets, {
      fromCity: 'Bridgewatch',
      itemWeight: 1,
      quantity: 1,
      taxRate: 0.065,
      mode: 'profit',
    })
    expect(rows[0]?.city).toBe('Black Market')
    expect(rows.every((row) => row.net > 0)).toBe(true)
  })

  it('keeps safe mode inside royal cities', async () => {
    const rows = await PriceAdvisoryService.getInstance().recommend(markets, {
      fromCity: 'Bridgewatch',
      itemWeight: 1,
      quantity: 1,
      taxRate: 0.065,
      mode: 'safe',
    })
    expect(rows.map((row) => row.city)).toEqual(['Martlock'])
    expect(distanceFactor('Bridgewatch', 'Martlock')).toBe(1)
    expect(distanceFactor('Bridgewatch', 'Black Market')).toBe(1.2)
  })

  it('calculates arbitrage from source cost without invented transport fees', async () => {
    const rows = await PriceAdvisoryService.getInstance().recommend(markets, {
      fromCity: 'Bridgewatch',
      itemWeight: 1,
      quantity: 1,
      taxRate: 0.065,
      mode: 'profit',
      scenario: 'arbitrage',
      strategy: 'list',
    })
    const martlock = rows.find(row => row.city === 'Martlock')
    expect(martlock?.transport).toBe(0)
    expect(martlock?.purchaseCost).toBe(100)
    expect(martlock?.netProfit).toBeCloseTo(68.3)
    expect(martlock?.profitPercent).toBeCloseTo(68.3)
  })
})

describe('market history', () => {
  it('keeps the latest days and calculates volume-weighted totals', () => {
    const result = summarizeHistory([
      { item_count: 10, avg_price: 100, timestamp: '2026-09-20T00:00:00' },
      { item_count: 20, avg_price: 200, timestamp: '2026-09-21T00:00:00' },
      { item_count: 30, avg_price: 300, timestamp: '2026-09-22T00:00:00' },
    ], 2)
    expect(result.points.map(point => point.date)).toEqual(['2026-09-21T00:00:00', '2026-09-22T00:00:00'])
    expect(result.totalVolume).toBe(50)
    expect(result.averageDailyVolume).toBe(25)
    expect(result.averagePrice).toBe(260)
  })
})

describe('analytics privacy boundary', () => {
  it('accepts only known events with anonymous browser ids', () => {
    expect(validAnalyticsEvent({ event: 'search', visitorId: '12345678-1234-1234-1234-123456789abc', path: '/' })).toBe(true)
    expect(validAnalyticsEvent({ event: 'email', visitorId: 'me@example.com' })).toBe(false)
  })
})
