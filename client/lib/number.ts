export const safeNumber = (v: any): number | null => {
  const x = Number(v)
  return Number.isFinite(x) && x > 0 ? x : null
}

export const minDefined = (a?: number | null, b?: number | null) =>
  a == null ? (b ?? null) : b == null ? a : Math.min(a, b)

export const maxDefined = (a?: number | null, b?: number | null) =>
  a == null ? (b ?? null) : b == null ? a : Math.max(a, b)
