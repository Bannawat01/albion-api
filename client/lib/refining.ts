/** Albion refining recipe per output tier: raw resources + 1 refined resource of the tier below. */
export const REFINING_RECIPE: Record<number, { raw: number; lower: number }> = {
  4: { raw: 2, lower: 1 },
  5: { raw: 3, lower: 1 },
  6: { raw: 4, lower: 1 },
  7: { raw: 5, lower: 1 },
  8: { raw: 5, lower: 1 },
}

/** Resource return rate (%) = 1 - 1/(1 + production bonus): 18% base, +40% city specialty, +59% Focus. */
export const RETURN_RATES = { base: 15.2, city: 36.7, focus: 43.5, cityFocus: 53.9 } as const

/** Refined product -> raw resource item id suffix, and the royal city with the refining bonus for it. */
export const REFINING_RESOURCES = {
  METALBAR: { raw: 'ORE', city: 'Thetford' },
  PLANKS: { raw: 'WOOD', city: 'Fort Sterling' },
  CLOTH: { raw: 'FIBER', city: 'Lymhurst' },
  LEATHER: { raw: 'HIDE', city: 'Martlock' },
  STONEBLOCK: { raw: 'ROCK', city: 'Bridgewatch' },
} as const
export type RefiningResource = keyof typeof REFINING_RESOURCES

export function returnRatePreset(cityBonus: boolean, focus: boolean): number {
  return cityBonus ? (focus ? RETURN_RATES.cityFocus : RETURN_RATES.city) : (focus ? RETURN_RATES.focus : RETURN_RATES.base)
}

export function refiningItemIds(tier: number, resource: RefiningResource) {
  return { raw: `T${tier}_${REFINING_RESOURCES[resource].raw}`, lower: `T${tier - 1}_${resource}`, output: `T${tier}_${resource}` }
}

export function estimateRefining(input: { tier: number; rawPrice: number; lowerTierPrice: number; outputPrice: number; stationFee: number; returnRate: number; quantity: number; salesTax: number }) {
  const { tier, rawPrice, lowerTierPrice, outputPrice, stationFee, returnRate, quantity, salesTax } = input
  const recipe = REFINING_RECIPE[tier]
  if (!recipe) return null
  if ([rawPrice, lowerTierPrice, outputPrice, stationFee, returnRate, quantity, salesTax].some(value => !Number.isFinite(value) || value < 0) || returnRate >= 100 || salesTax >= 100 || !Number.isInteger(quantity) || quantity < 1) return null
  const materials = recipe.raw * rawPrice + recipe.lower * lowerTierPrice
  const upfront = (materials + stationFee) * quantity
  const expectedCost = (materials * (1 - returnRate / 100) + stationFee) * quantity
  const saleAfterTax = outputPrice * (1 - salesTax / 100) * quantity
  return { upfront, expectedCost, saleAfterTax, profit: saleAfterTax - expectedCost }
}

export function estimateT4Refining(input: { rawPrice: number; lowerTierPrice: number; outputPrice: number; stationFee: number; returnRate: number; quantity: number; salesTax: number }) {
  return estimateRefining({ tier: 4, ...input })
}
