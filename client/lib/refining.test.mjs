import { expect, test } from 'bun:test'
import { estimateRefining, estimateT4Refining, refiningItemIds, returnRatePreset } from './refining.ts'

test('T4 refining counts two raw materials, one T3 refined material, returns and fees', () => {
  expect(estimateT4Refining({ rawPrice: 100, lowerTierPrice: 50, outputPrice: 400, stationFee: 20, returnRate: 20, quantity: 10, salesTax: 6.5 })).toEqual({ upfront: 2700, expectedCost: 2200, saleAfterTax: 3740, profit: 1540 })
  expect(estimateT4Refining({ rawPrice: 100, lowerTierPrice: 50, outputPrice: 400, stationFee: 20, returnRate: 100, quantity: 10, salesTax: 6.5 })).toBeNull()
  expect(estimateT4Refining({ rawPrice: 100, lowerTierPrice: 50, outputPrice: 400, stationFee: 20, returnRate: 0, quantity: 0, salesTax: 6.5 })).toBeNull()
})

test('higher tiers use 3/4/5/5 raw materials plus one lower refined material', () => {
  const base = { rawPrice: 100, lowerTierPrice: 50, outputPrice: 1000, stationFee: 0, returnRate: 0, quantity: 1, salesTax: 0 }
  expect(estimateRefining({ ...base, tier: 5 })?.upfront).toBe(350)
  expect(estimateRefining({ ...base, tier: 6 })?.upfront).toBe(450)
  expect(estimateRefining({ ...base, tier: 7 })?.upfront).toBe(550)
  expect(estimateRefining({ ...base, tier: 8 })?.upfront).toBe(550)
  expect(estimateRefining({ ...base, tier: 3 })).toBeNull()
})

test('return rate presets and item ids', () => {
  expect(returnRatePreset(false, false)).toBe(15.2)
  expect(returnRatePreset(true, false)).toBe(36.7)
  expect(returnRatePreset(false, true)).toBe(43.5)
  expect(returnRatePreset(true, true)).toBe(53.9)
  expect(refiningItemIds(6, 'LEATHER')).toEqual({ raw: 'T6_HIDE', lower: 'T5_LEATHER', output: 'T6_LEATHER' })
})
