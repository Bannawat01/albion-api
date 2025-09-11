export const isMarketItem = (u: string) => /^T[2-8]_/.test(u)
export const n = (v: any) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : null }
export const minDef = (a?: number | null, b?: number | null) => a == null ? b ?? null : b == null ? a : Math.min(a, b)
export const maxDef = (a?: number | null, b?: number | null) => a == null ? b ?? null : b == null ? a : Math.max(a, b)
export const rowsFrom = (res: any) => Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : []
