"use client"

import { useEffect, useState } from "react"
import { itemApi } from "../api"
import { Card, CardContent } from "./ui/card"
import { cn } from "@/lib/utils"
import { useItemSearchStore } from "@/stores/itemSearchStore"

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
  const { searchTerm, setSearchTerm, items, setItems, loading, setLoading, error, setError, currentPage, setCurrentPage, totalItems, setTotalItems, itemsPerPage } = useItemSearchStore()
  const [cityPricesByItem, setCityPricesByItem] = useState<CityPricesByItem>({})

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1
  const getPageNumbers = () => {
    const delta = 2, pages: (number | "...")[] = [1]
    const s = Math.max(2, currentPage - delta), e = Math.min(totalPages - 1, currentPage + delta)
    if (s > 2) pages.push("..."); for (let i = s; i <= e; i++) pages.push(i); if (e < totalPages - 1) pages.push("..."); if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  // helpers
  const isMarketItem = (u: string) => /^T[2-8]_/.test(u)
  const n = (v: any) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : null }
  const minDef = (a?: number | null, b?: number | null) => a == null ? b ?? null : b == null ? a : Math.min(a, b)
  const maxDef = (a?: number | null, b?: number | null) => a == null ? b ?? null : b == null ? a : Math.max(a, b)
  const rowsFrom = (res: any) => Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : []

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
        cm.buyMax = maxDef(cm.buyMax, n(r.buy_Price_Max))
      }
      return map
    } catch { return {} }
  }

  const searchItems = async (term: string, pageNum = 1, reset = true) => {
    setLoading(true); setError(null)
    try {
      const res = await itemApi.searchItems(term || undefined, pageNum, itemsPerPage)
      const pricePairs = await Promise.all(res.data.map(async (it) => [it.uniqueName, await fetchCityPrices(it.uniqueName)] as const))

      setCityPricesByItem(prev => {
        const next = reset ? {} : { ...prev }
        for (const [k, v] of pricePairs) next[k] = v
        return next
      })

      setItems(reset ? res.data : [...items, ...res.data])
      setTotalItems(res.data.length < itemsPerPage ? (pageNum - 1) * itemsPerPage + res.data.length : pageNum * itemsPerPage + 1)
    } catch (e: any) {
      setError(e?.message || "Failed to search items"); setItems([]); setTotalItems(0); setCityPricesByItem({})
    } finally { setLoading(false) }
  }

  useEffect(() => { searchItems("", 1) /* eslint-disable-next-line */ }, [])
  const handleSearch = async (e: React.FormEvent) => { e.preventDefault(); setCurrentPage(1); await searchItems(searchTerm, 1, true) }
  const handlePageChange = async (p: number) => { if (p === currentPage || p < 1 || p > totalPages) return; setCurrentPage(p); await searchItems(searchTerm, p, true); document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth" }) }

  // UI helpers
  const ChipsRow = ({ label, metric, map }:{
    label:string; metric:keyof CityMetrics; map?:CityMap
  }) => (
    <div className="space-y-1.5">
      {/* label: แสดงบรรทัดบนในมือถือ, ชิดซ้ายในจอใหญ่ */}
      <div className="sm:hidden text-[11px] font-semibold text-slate-300">{label}</div>
      <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 flex-wrap">
        <span className="hidden sm:block text-xs font-semibold text-slate-300 w-20 shrink-0">{label}</span>
        {/* mobile -> grid 3 คอลัมน์, desktop -> flex wrap */}
        <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:grid-cols-none sm:flex sm:flex-wrap sm:gap-2">
          {CITY_ORDER.map(city => {
            const val = map?.[city]?.[metric] ?? null
            const base = "px-1.5 py-0.5 rounded-md text-[11px] sm:text-xs font-bold leading-5 text-center min-w-[64px]"
            const color = val!=null ? (CITY_COLOR[city] || "bg-slate-600 text-white") : "bg-slate-700 text-slate-400 line-through opacity-60"
            return <span key={city+label} className={`${base} ${color}`} title={city}>{val!=null ? val.toLocaleString() : city}</span>
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
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              placeholder="ค้นหาไอเทม... (เช่น sword, armor, potion)"
              className={cn("w-full pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border border-input bg-background text-foreground","placeholder:text-muted-foreground","focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent","transition-all duration-200")}
              aria-label="ค้นหาไอเทม"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn("w-full sm:w-auto px-4 sm:px-8 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl font-medium","hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2","disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200")}
            aria-label="ปุ่มค้นหา"
          >
            {loading ? (<div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />กำลังค้นหา...</div>) : ("ค้นหา")}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <Card className="border-red-500/30 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-5 sm:pt-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-red-400"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <p className="text-red-300 text-sm sm:text-base font-medium">เกิดข้อผิดพลาด: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div id="search-results" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">{searchTerm ? <>ผลการค้นหา <span className="text-primary">"{searchTerm}"</span></> : "ไอเทมทั้งหมด"}</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5 sm:mt-1">
            แสดง {items.length} รายการ {totalItems>0 && `จากทั้งหมด ${totalItems.toLocaleString()} รายการ`}
            {totalPages>1 && <span className="ml-1.5 sm:ml-2">(หน้า {currentPage} จาก {totalPages})</span>}
          </p>
        </div>
        <div className="text-xs sm:text-sm text-slate-300">แสดง {itemsPerPage} รายการต่อหน้า</div>
      </div>

      {/* Legend – แสดงครั้งเดียว */}
      {items.length > 0 && <Legend />}

      {/* Loading/Empty */}
      {loading && items.length===0 && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      )}
      {!loading && items.length===0 && !error && (
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
          {items.map((item, index) => {
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
                        {(currentPage-1)*itemsPerPage + index + 1}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-semibold text-base sm:text-lg text-white">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                        <span className="text-[10px] sm:text-xs font-medium text-white/90 bg-white/10 px-2 py-1 rounded">ID: {item.id}</span>
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={()=>handlePageChange(currentPage-1)} disabled={!hasPrevPage||loading} aria-label="หน้าก่อนหน้า" className={cn("px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border","disabled:opacity-50 disabled:cursor-not-allowed",hasPrevPage?"bg-background hover:bg-muted border-input":"bg-muted border-muted text-muted-foreground")}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex items-center gap-1">
              {getPageNumbers().map((p,i)=>(
                <button key={i} onClick={()=>typeof p==="number"&&handlePageChange(p)} disabled={loading||p==="..."} className={cn("px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border min-w-[34px] sm:min-w-[40px]","disabled:cursor-not-allowed transition-all duration-200",p===currentPage?"bg-primary text-primary-foreground border-primary":p==="..."?"bg-transparent border-transparent text-muted-foreground cursor-default":"bg-background hover:bg-muted border-input")}>{p}</button>
              ))}
            </div>
            <button onClick={()=>handlePageChange(currentPage+1)} disabled={!hasNextPage||loading} aria-label="หน้าถัดไป" className={cn("px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border","disabled:opacity-50 disabled:cursor-not-allowed",hasNextPage?"bg-background hover:bg-muted border-input":"bg-muted border-muted text-muted-foreground")}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
