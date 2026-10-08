type GoldPoint = { price: number; timestamp: string }

export function goldTime(value: string): number {
  // AODP timestamps without an offset are UTC, not the visitor's local time.
  return Date.parse(/(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value}Z`)
}

export function goldDayChange(points: GoldPoint[]): { amount: number; percent: number } | null {
  const latest = points.at(-1)
  if (!latest) return null
  const target = goldTime(latest.timestamp) - 24 * 60 * 60_000
  const previous = points.slice(0, -1).reduce<GoldPoint | null>((best, point) =>
    !best || Math.abs(goldTime(point.timestamp) - target) < Math.abs(goldTime(best.timestamp) - target) ? point : best, null)
  if (!previous || !Number.isFinite(goldTime(previous.timestamp)) || Math.abs(goldTime(previous.timestamp) - target) > 2 * 60 * 60_000) return null
  return { amount: latest.price - previous.price, percent: (latest.price - previous.price) / previous.price * 100 }
}

export function goldCost(amount: string, price: number): number | null {
  const quantity = Number(amount)
  return /^\d+$/.test(amount) && Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 1_000_000 && Number.isFinite(price) && price > 0
    ? quantity * price : null
}
