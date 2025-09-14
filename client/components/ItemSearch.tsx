"use client"

import { useEffect, useRef, useState } from "react"
import { itemApi, useSearchItems } from "../api"
import PaginationControls from './pagination/PaginationControls'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from "./ui/card"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { isMarketItem, maxDef, minDef, n, rowsFrom } from "@/helpers/helperItem"

type CityMetrics = { sellMin?: number | null; sellMax?: number | null; buyMin?: number | null; buyMax?: number | null }
type CityMap = Record<string, CityMetrics>
type CityPricesByItem = Record<string, CityMap>

const CITY_ORDER = ["Brecilien", "Caerleon", "Thetford", "Fort Sterling", "Lymhurst", "Bridgewatch", "Martlock", "Black Market"] as const
const CITY_COLOR: Record<string, string> = {
  Brecilien: "bg-violet-500 text-white", Caerleon: "bg-black text-white", Thetford: "bg-rose-600 text-white",
  "Fort Sterling": "bg-slate-100 text-slate-900", Lymhurst: "bg-lime-700 text-white", Bridgewatch: "bg-orange-600 text-white",
  Martlock: "bg-sky-600 text-white", "Black Market": "bg-gray-800 text-white",
}
const CITIES_PARAM = CITY_ORDER.join(",")

export default function ItemSearch() {
  // Search & pagination state
  const [rawSearch, setRawSearch] = useState("")
  const debouncedSearch = useDebounce(rawSearch, 300)
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  // Price state & caches
  const [cityPricesByItem, setCityPricesByItem] = useState<CityPricesByItem>({})
  const priceCacheRef = useRef<Record<string, CityMap>>({})
  const lazyBatchTimer = useRef<NodeJS.Timeout | null>(null)
  const initialPriceSlice = 5 // first N items priced immediately (half page), remainder after short delay

  // React Query
  const { data, isFetching, isError, error, isPreviousData } = useSearchItems(debouncedSearch || undefined, page, itemsPerPage) as any
  const queryClient = useQueryClient()

  const items = data?.data || []
  const pagination = data?.pagination
  const totalItems = pagination?.totalItems || 0
  const totalPages = pagination?.totalPages || 1
  const hasNextPage = !!pagination?.hasNextPage
  const hasPrevPage = !!pagination?.hasPreviousPage

  const getPageNumbers = () => {
    const delta = 2, pages: (number | "...")[] = [1]
    const s = Math.max(2, page - delta), e = Math.min(totalPages - 1, page + delta)
    if (s > 2) pages.push("...")
    for (let i = s; i <= e; i++) pages.push(i)
    if (e < totalPages - 1) pages.push("...")
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  async function fetchCityPrices(uniqueName: string): Promise<CityMap> {
    if (!isMarketItem(uniqueName)) return {}
    try {
      let res = await itemApi.getItemPrices(uniqueName, CITIES_PARAM)
      let rows: any[] = rowsFrom(res)
      if (!rows.length) { res = await itemApi.getItemPrices(uniqueName); rows = rowsFrom(res) }

      const map: CityMap = {}
      for (const r of rows) {
        const city = String(r.city ?? "").trim(); if (!city) continue
        const cm = (map[city] ??= {})
        cm.sellMin = minDef(cm.sellMin, n(r.sell_Price_Min))
        cm.sellMax = maxDef(cm.sellMax, n(r.sell_Price_Max))
        cm.buyMin = minDef(cm.buyMin, n(r.buy_Price_Min))
        cm.buyMax = maxDef(cm.buyMax, n(r.buy_Price_max))
      }
      return map
    } catch { return {} }
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1) }
  const handlePageChange = (p: number) => { if (p===page||p<1||p>totalPages) return; setPage(p); document.getElementById("search-results")?.scrollIntoView({behavior:"smooth"}) }

  // Prefetch next page when current data resolved
  useEffect(() => {
    if (hasNextPage && !isPreviousData) {
      queryClient.prefetchQuery({
        queryKey: ['items','search', debouncedSearch || undefined, page + 1, itemsPerPage],
        queryFn: () => itemApi.searchItems(debouncedSearch || undefined, page + 1, itemsPerPage),
        staleTime: 2 * 60 * 1000,
      })
    }
  }, [hasNextPage, isPreviousData, debouncedSearch, page, itemsPerPage, queryClient])

  // Lazy price loading (first slice immediately, rest after small delay)
  useEffect(() => {
    if (!items.length) return

    // Cleanup any prior timer when dependencies change
    if (lazyBatchTimer.current) {
      clearTimeout(lazyBatchTimer.current)
      lazyBatchTimer.current = null
    }

    let cancelled = false

  const uncachedItems = items.filter((i: any) => !priceCacheRef.current[i.uniqueName])
    if (!uncachedItems.length) {
      // All already cached, ensure state synced
      setCityPricesByItem(prev => prev === priceCacheRef.current ? prev : { ...priceCacheRef.current })
      return () => { cancelled = true }
    }

    const firstSlice = uncachedItems.slice(0, initialPriceSlice)
    const remainder = uncachedItems.slice(initialPriceSlice)

    const fetchPricesFor = async (subset: typeof uncachedItems) => {
      const promises = subset.map((it: any) => fetchCityPrices(it.uniqueName))
      const results = await Promise.all(promises)
      results.forEach((map, idx) => {
        const name = subset[idx].uniqueName
        if (!priceCacheRef.current[name]) priceCacheRef.current[name] = map
      })
      if (!cancelled) setCityPricesByItem({ ...priceCacheRef.current })
    }

    // Immediate fetch for first slice
    if (firstSlice.length) fetchPricesFor(firstSlice)

    // Delayed fetch for remainder
    if (remainder.length) {
      lazyBatchTimer.current = setTimeout(() => {
        if (!cancelled) fetchPricesFor(remainder)
      }, 150)
    }

    return () => { cancelled = true; if (lazyBatchTimer.current) clearTimeout(lazyBatchTimer.current) }
  }, [items, debouncedSearch, page])

  // UI helpers
  const ChipsRow = ({ label, metric, map }:{
    label:string; metric:keyof CityMetrics; map?:CityMap
  }) => (
    <div className="space-y-1.5">
      {/* label: แสดงบรรทัดบนในมือถือ, ชิดซ้ายในจอใหญ่ */}
      <div className="sm:hidden text-[11px] font-semibold text-slate-300">{label}</div>
      <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 flex-wrap">
        <span className="hidden sm:block text-xs font-semibold text-slate-300 w-20 shrink-0">{label}</span> 
        {/* mobile -> grid 3 คอลัมน์, desktop -> flex wrap (แสดงเฉพาะเมืองที่มีราคา) */}
        <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:grid-cols-none sm:flex sm:flex-wrap sm:gap-2">
          {CITY_ORDER.filter(city => (map?.[city]?.[metric] ?? null) != null).map(city => {
            const val = map?.[city]?.[metric] as number
            const base = "px-1.5 py-0.5 rounded-md text-[11px] sm:text-xs font-bold leading-5 text-center min-w-[64px]"
            const color = CITY_COLOR[city] || "bg-slate-600 text-white"
            return <span key={city+label} className={`${base} ${color}`} title={city}>{val.toLocaleString()}</span>
          })}
        </div>
      </div>
    </div>
  )

  const Legend = () => (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[11px] sm:text-xs text-slate-400">
      <span className="font-medium">Prices legend:</span>
      {CITY_ORDER.map(c => <span key={c} className={`px-1.5 py-0.5 rounded-md font-semibold ${CITY_COLOR[c]}`}>{c}</span>)}
    </div>
  )

  return (
    <div className="space-y-6 px-3 sm:px-0">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" /></svg>
            </div>
            <input
              value={rawSearch}
              onChange={(e)=>setRawSearch(e.target.value)}
              placeholder="ค้นหาไอเทม... (เช่น sword, armor, potion)"
              className={cn("w-full pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border border-input bg-background text-foreground","placeholder:text-muted-foreground","focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent","transition-all duration-200")}
              aria-label="ค้นหาไอเทม"
            />
          </div>
          <button
            type="submit"
            disabled={isFetching && items.length===0}
            className={cn("w-full sm:w-auto px-4 sm:px-8 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl font-medium","hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2","disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200")}
            aria-label="ปุ่มค้นหา"
          >
            {isFetching && items.length===0 ? (<div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />กำลังค้นหา...</div>) : ("ค้นหา")}
          </button>
        </div>
      </form>

      {/* Error */}
      {isError && (
        <Card className="border-red-500/30 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-5 sm:pt-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-red-400"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <p className="text-red-300 text-sm sm:text-base font-medium">เกิดข้อผิดพลาด: {error instanceof Error ? error.message : String(error)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div id="search-results" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">{rawSearch ? <>ผลการค้นหา <span className="text-primary">"{rawSearch}"</span></> : "ไอเทมทั้งหมด"}</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5 sm:mt-1">
            แสดง {items.length} รายการ {totalItems>0 && `จากทั้งหมด ${totalItems.toLocaleString()} รายการ`}
            {totalPages>1 && <span className="ml-1.5 sm:ml-2">(หน้า {page} จาก {totalPages})</span>}
          </p>
        </div>
        <div className="text-xs sm:text-sm text-slate-300">แสดง {itemsPerPage} รายการต่อหน้า</div>
      </div>

      {/* Legend – แสดงครั้งเดียว */}
      {items.length > 0 && <Legend />}

      {/* Loading/Empty */}
      {isFetching && items.length===0 && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      )}
      {!isFetching && items.length===0 && !isError && (
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 text-slate-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-8a8 8 0 018 8 8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8z" /></svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">ไม่พบไอเทมที่ค้นหา</h3>
              <p className="text-slate-400">ลองค้นหาด้วยคำอื่น หรือใช้คำค้นหาที่สั้นกว่า</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      {items.length>0 && (
        <div className="grid gap-3.5 sm:gap-4">
          {items.map((item: any, index: number) => {
            const pMap = cityPricesByItem[item.uniqueName]
            const noData = !pMap || CITY_ORDER.every(c => !pMap[c]?.sellMin && !pMap[c]?.sellMax && !pMap[c]?.buyMin && !pMap[c]?.buyMax)
            return (
              <Card key={`${item.id}-${index}`} className={cn("hover:shadow-lg transition-all duration-200 hover:border-primary/20")}>
                <CardContent className="pt-5 sm:pt-6">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    {/* Image */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-700/30 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src={itemApi.getItemImageUrl(item.id, 1, 64)} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
                        {(page-1)*itemsPerPage + index + 1}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-semibold text-base sm:text-lg text-white">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                        <span className="text-[10px] sm:text-xs font-medium text-white/90 bg-white/10 px-2 py-1 rounded truncate max-w-[240px] sm:max-w-none">{item.uniqueName}</span>
                      </div>

                      <div className="mt-2.5 sm:mt-3 space-y-1.5">
                        {noData ? (
                          <span className="text-xs sm:text-sm text-slate-400">ไม่มีข้อมูลราคา</span>
                        ) : (
                          <>
                            <ChipsRow label="Sell Min" metric="sellMin" map={pMap} />
                            <ChipsRow label="Sell Max" metric="sellMax" map={pMap} />
                            <ChipsRow label="Buy Min"  metric="buyMin"  map={pMap} />
                            <ChipsRow label="Buy Max"  metric="buyMax"  map={pMap} />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-slate-400 self-center sm:self-start sm:mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages>1 && (
        <div className="pt-6">
          <PaginationControls
            page={page}
            totalPages={totalPages}
            isFetching={isFetching}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}
