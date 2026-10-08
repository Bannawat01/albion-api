import { expect, test } from 'bun:test'
import { estimateT4Refining } from './refining.ts'

test('T4 refining counts two raw materials, one T3 refined material, returns and fees', () => {
  expect(estimateT4Refining({ rawPrice: 100, lowerTierPrice: 50, outputPrice: 400, stationFee: 20, returnRate: 20, quantity: 10, salesTax: 6.5 })).toEqual({ upfront: 2700, expectedCost: 2200, saleAfterTax: 3740, profit: 1540 })
  expect(estimateT4Refining({ rawPrice: 100, lowerTierPrice: 50, outputPrice: 400, stationFee: 20, returnRate: 100, quantity: 10, salesTax: 6.5 })).toBeNull()
  expect(estimateT4Refining({ rawPrice: 100, lowerTierPrice: 50, outputPrice: 400, stationFee: 20, returnRate: 0, quantity: 0, salesTax: 6.5 })).toBeNull()
})
