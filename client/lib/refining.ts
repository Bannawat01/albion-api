export function estimateT4Refining(input: { rawPrice: number; lowerTierPrice: number; outputPrice: number; stationFee: number; returnRate: number; quantity: number; salesTax: number }) {
  const { rawPrice, lowerTierPrice, outputPrice, stationFee, returnRate, quantity, salesTax } = input
  if ([rawPrice, lowerTierPrice, outputPrice, stationFee, returnRate, quantity, salesTax].some(value => !Number.isFinite(value) || value < 0) || returnRate >= 100 || salesTax >= 100 || !Number.isInteger(quantity) || quantity < 1) return null
  const materials = 2 * rawPrice + lowerTierPrice
  const upfront = (materials + stationFee) * quantity
  const expectedCost = (materials * (1 - returnRate / 100) + stationFee) * quantity
  const saleAfterTax = outputPrice * (1 - salesTax / 100) * quantity
  return { upfront, expectedCost, saleAfterTax, profit: saleAfterTax - expectedCost }
}
