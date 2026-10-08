type MarketSide = { sellMin: number | null; buyMax: number | null; sellUpdatedAt: string | null; buyUpdatedAt: string | null }

function timestamp(value: string | null | undefined) {
  if (!value) return 0
  const time = Date.parse(/(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value}Z`)
  return Number.isFinite(time) ? time : 0
}

export function watchlistStatus(price: MarketSide | undefined, previous: string | undefined, now = Date.now()) {
  if (!price?.sellMin && !price?.buyMax) return { state: 'missing' as const, updated: false, latest: 0 }
  const latest = Math.max(price.sellMin ? timestamp(price.sellUpdatedAt) : 0, price.buyMax ? timestamp(price.buyUpdatedAt) : 0)
  return {
    state: latest && now - latest >= 0 && now - latest <= 30 * 60_000 ? 'fresh' as const : 'stale' as const,
    updated: !!timestamp(previous) && latest > timestamp(previous),
    latest,
  }
}
