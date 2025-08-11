"use client"

import { useEffect, useState } from "react"
import { itemApi } from "../api"
import { Card, CardContent } from "./ui/card"
import { cn } from "@/lib/utils"
import { useItemSearchStore } from "@/stores/itemSearchStore"

type CityMetrics = { sellMin?: number | null; sellMax?: number | null; buyMin?: number | null; buyMax?: number | null }
type CityMap = Record<string, CityMetrics>
type CityPricesByItem = Record<string, CityMap>

const CITY_ORDER = ["Brecilien","Caerleon","Thetford","Fort Sterling","Lymhurst","Bridgewatch","Martlock","Black Market"] as const
const CITY_COLOR: Record<string,string> = {
  Brecilien:"bg-violet-500 text-white", Caerleon:"bg-black text-white", Thetford:"bg-rose-600 text-white",
  "Fort Sterling":"bg-slate-100 text-slate-900", Lymhurst:"bg-lime-700 text-white", Bridgewatch:"bg-orange-600 text-white",
  Martlock:"bg-sky-600 text-white", "Black Market":"bg-gray-800 text-white",
}
const CITIES_PARAM = CITY_ORDER.join(",")

export default function ItemSearch() {
  const { searchTerm, setSearchTerm, items, setItems, loading, setLoading, error, setError, currentPage, setCurrentPage, totalItems, setTotalItems, itemsPerPage } = useItemSearchStore()
  const [cityPricesByItem, setCityPricesByItem] = useState<CityPricesByItem>({})

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1
  const getPageNumbers = () => {
    const delta = 2, pages:(number|"...")[] = [1]
    const s = Math.max(2, currentPage - delta), e = Math.min(totalPages - 1, currentPage + delta)
    if (s > 2) pages.push("..."); for (let i=s;i<=e;i++) pages.push(i); if (e < totalPages - 1) pages.push("..."); if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  // --- helpers ---
  const isMarketItem = (u: string) => /^T[2-8]_/.test(u)
  const n = (v:any) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : null }
  const minDef = (a?:number|null, b?:number|null) => a==null ? b??null : b==null ? a : Math.min(a,b)
  const maxDef = (a?:number|null, b?:number|null) => a==null ? b??null : b==null ? a : Math.max(a,b)
  const rowsFrom = (res:any) => Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : []

  async function fetchCityPrices(uniqueName: string): Promise<CityMap> {
    if (!isMarketItem(uniqueName)) return {}
    try {
      let res = await itemApi.getItemPrices(uniqueName, CITIES_PARAM)
      let rows:any[] = rowsFrom(res)
      if (!rows.length) { res = await itemApi.getItemPrices(uniqueName); rows = rowsFrom(res) }

      const map: CityMap = {}
      for (const r of rows) {
        const city = String(r.city ?? "").trim(); if (!city) continue
        const cm = (map[city] ??= {})
        cm.sellMin = minDef(cm.sellMin, n(r.sell_Price_Min))
        cm.sellMax = maxDef(cm.sellMax, n(r.sell_Price_Max))
        cm.buyMin  = minDef(cm.buyMin,  n(r.buy_Price_Min))
        cm.buyMax  = maxDef(cm.buyMax,  n(r.buy_Price_Max))
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
    } catch (e:any) {
      setError(e?.message || "Failed to search items"); setItems([]); setTotalItems(0); setCityPricesByItem({})
    } finally { setLoading(false) }
  }

  useEffect(() => { searchItems("", 1) /* eslint-disable-next-line */ }, [])

  const handleSearch = async (e: React.FormEvent) => { e.preventDefault(); setCurrentPage(1); await searchItems(searchTerm, 1, true) }
  const handlePageChange = async (p:number) => { if (p===currentPage||p<1||p>totalPages) return; setCurrentPage(p); await searchItems(searchTerm, p, true); document.getElementById("search-results")?.scrollIntoView({behavior:"smooth"}) }

  // --- small presentational helpers ---
  const ChipsRow = ({ label, metric, map }:{label:string; metric:keyof CityMetrics; map?:CityMap}) => (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-slate-300 w-20">{label}</span>
      {CITY_ORDER.map(city => {
        const val = map?.[city]?.[metric] ?? null
        const base = "px-2 py-0.5 rounded-md text-xs font-bold"
        const color = val!=null ? (CITY_COLOR[city] || "bg-slate-600 text-white") : "bg-slate-700 text-slate-400 line-through opacity-60"
        return <span key={city+label} className={`${base} ${color}`} title={`${city}`}>{val!=null ? val.toLocaleString() : city}</span>
      })}
    </div>
  )
  const Legend = () => (
    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
      <span className="font-medium">Prices legend:</span>
      {CITY_ORDER.map(c => <span key={c} className={`px-2 py-0.5 rounded-md font-semibold ${CITY_COLOR[c]}`}>{c}</span>)}
    </div>
  )

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" /></svg>
            </div>
            <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="ค้นหาไอเทม... (เช่น sword, armor, potion)" className={cn("w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-background text-foreground","placeholder:text-muted-foreground","focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent","transition-all duration-200")} />
          </div>
          <button type="submit" disabled={loading} className={cn("px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium","hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2","disabled:opacity-50 disabled:cursor-not-allowed","transition-all duration-200 min-w-[120px]")}>
            {loading ? (<div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>กำลังค้นหา...</div>) : ("ค้นหา")}
          </button>
        </div>
      </form>

            {/* Error Display */}
            {/* Error Display */}
            {error && (
                <Card className="border-red-500/30 bg-slate-800/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 text-red-400">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-red-300 font-medium">เกิดข้อผิดพลาด: {error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}            {/* Results Header */}
            <div id="search-results" className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        {searchTerm ? (
                            <>ผลการค้นหา <span className="text-primary">"{searchTerm}"</span></>
                        ) : (
                            "ไอเทมทั้งหมด"
                        )}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        แสดง {items.length} รายการ {totalItems > 0 && `จากทั้งหมด ${totalItems.toLocaleString()} รายการ`}
                        {totalPages > 1 && (
                            <span className="ml-2">
                                (หน้า {currentPage} จาก {totalPages})
                            </span>
                        )}
                    </p>
                </div>

                {/* Items per page selector */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>แสดง {itemsPerPage} รายการต่อหน้า</span>
                </div>
            </div>

                    <div className="text-slate-400 group-hover:text-primary transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>
            )}

            {/* No Results */}
            {!loading && items.length === 0 && !error && (
                <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm border-dashed">
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 text-slate-600">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-8a8 8 0 018 8 8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">ไม่พบไอเทมที่ค้นหา</h3>
                            <p className="text-slate-400">
                                ลองค้นหาด้วยคำอื่น หรือใช้คำค้นหาที่สั้นกว่า
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}            {/* Items Grid */}
            {items.length > 0 && (
                <div className="grid gap-4">
                    {items.map((item, index) => (
                        <Card
                            key={`${item.id}-${index}`}
                            className={cn(
                                "hover:shadow-lg transition-all duration-200 cursor-pointer group",
                                "hover:border-primary/20"
                            )}
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center overflow-hidden">
                                            <img
                                                src={itemApi.getItemImageUrl(item.id, 1, 64)}
                                                alt={item.name}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.style.display = "none"
                                                    const parent = target.parentElement
                                                    if (parent) {
                                                        parent.innerHTML = `
                                                            <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                                            </svg>
                                                        `
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                                            {((currentPage - 1) * itemsPerPage) + index + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                            {item.name}
                                        </h3>
                                        <div className="flex flex-col gap-1 mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                                    ID: {item.id}
                                                </span>
                                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                                    {item.uniqueName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

      {totalPages>1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
          <div className="flex items-center gap-2">
            <button onClick={()=>handlePageChange(currentPage-1)} disabled={!hasPrevPage||loading} className={cn("px-3 py-2 text-sm font-medium rounded-lg border","disabled:opacity-50 disabled:cursor-not-allowed",hasPrevPage?"bg-background hover:bg-muted border-input text-foreground":"bg-muted border-muted text-muted-foreground")}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <div className="flex items-center gap-1">
              {getPageNumbers().map((p,i)=>(
                <button key={i} onClick={()=>typeof p==="number"&&handlePageChange(p)} disabled={loading||p==="..."} className={cn("px-3 py-2 text-sm font-medium rounded-lg border min-w-[40px]","disabled:cursor-not-allowed transition-all duration-200",p===currentPage?"bg-primary text-primary-foreground border-primary":p==="..."?"bg-transparent border-transparent text-muted-foreground cursor-default":"bg-background hover:bg-muted border-input text-foreground hover:border-primary/30")}>{p}</button>
              ))}
            </div>
            <button onClick={()=>handlePageChange(currentPage+1)} disabled={!hasNextPage||loading} className={cn("px-3 py-2 text-sm font-medium rounded-lg border","disabled:opacity-50 disabled:cursor-not-allowed",hasNextPage?"bg-background hover:bg-muted border-input text-foreground":"bg-muted border-muted text-muted-foreground")}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>
      )}
    </div>
  )
}
