"use client"

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useState, useCallback, memo, useEffect } from "react"
import { useSearchItems, itemApi } from "../api"
import { Card, CardContent } from "./ui/card"
import { cn } from "@/lib/utils"

import Image from "next/image"
import { shimmer, toBase64 } from "@/lib/image"
import { safeNumber as n, minDefined as minDef, maxDefined as maxDef } from "@/lib/number"

type CityMetrics = { sellMin?: number | null; sellMax?: number | null; buyMin?: number | null; buyMax?: number | null }
type CityMap = Record<string, CityMetrics>
type CityPricesByItem = Record<string, CityMap>

const CITY_ORDER = ["Brecilien","Caerleon","Thetford","Fort Sterling","Lymhurst","Bridgewatch","Martlock","Black Market"] as const
const CITY_COLOR: Record<string,string> = {
  Brecilien:"bg-violet-500 text-white", Caerleon:"bg-black text-white", Thetford:"bg-rose-600 text-white",
  "Fort Sterling":"bg-slate-100 text-slate-900", Lymhurst:"bg-lime-700 text-white", Bridgewatch:"bg-orange-600 text-white",
  Martlock:"bg-sky-600 text-white", "Black Market":"bg-gray-800 text-white",
}

// shimmer & toBase64 moved to lib/image

// Optimized price fetching with caching
const priceCache = new Map<string, { data: CityMap; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

// PriceDisplaySection component - View layer for price display
const PriceDisplaySection = memo(({ priceMap }: { priceMap?: CityMap }) => {
  const noData = !priceMap || Object.keys(priceMap).length === 0 || CITY_ORDER.every(c => !priceMap[c] || (!priceMap[c]?.sellMin && !priceMap[c]?.buyMax))
  
  if (noData) {
    return (
      <div className="text-center py-3 text-slate-400 bg-slate-900/20 rounded-lg border border-dashed border-slate-700/50">
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-slate-800/50 flex items-center justify-center">
            <span className="text-slate-500 text-xs">💰</span>
          </div>
          <span className="text-xs font-medium">ไม่มีข้อมูลราคา</span>
          <span className="text-xs text-slate-500">กรุณาลองค้นหาไอเทมอื่น</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-0.5 h-3 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
        <h3 className="text-xs font-semibold text-slate-300">ราคาตามเมือง</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-slate-700/50 to-transparent"></div>
      </div>
      
      <div className="grid gap-0.5">
        {CITY_ORDER.filter(city => priceMap?.[city] && (priceMap[city].sellMin || priceMap[city].buyMax)).map(city => (
          <CityPriceCard key={city} city={city} prices={priceMap[city]} />
        ))}
      </div>
    </div>
  )
})

// CityPriceCard component - Individual city price display
const CityPriceCard = memo(({ city, prices }: { city: string, prices: CityMetrics }) => {
  const sell = typeof prices.sellMin === 'number' && prices.sellMin > 0 ? prices.sellMin : null
  const buy = typeof prices.buyMax === 'number' && prices.buyMax > 0 ? prices.buyMax : null
  const usedType: 'sell' | 'buy' | null = sell != null ? 'sell' : buy != null ? 'buy' : null
  const displayPrice = usedType === 'sell' ? sell : usedType === 'buy' ? buy : null

  if (displayPrice == null) return null

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/40 hover:scale-[1.02] backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent"></div>
      
      <div className="relative flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-400 to-purple-500 shadow-sm"></div>
          <span className={cn("px-4 py-2 rounded-lg text-sm font-bold shadow-lg border border-opacity-20 backdrop-blur-sm transition-all duration-200 group-hover:shadow-xl", CITY_COLOR[city])}>
            {city}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={cn("text-xs font-medium", usedType === 'sell' ? "text-red-400" : "text-green-400")}>{usedType === 'sell' ? 'ขาย' : 'ซื้อ'}</div>
          <span className={cn("text-xl font-bold bg-clip-text text-transparent tabular-nums drop-shadow-sm", usedType === 'sell' ? "bg-gradient-to-r from-red-400 to-orange-400" : "bg-gradient-to-r from-emerald-400 to-green-400") }>
            {displayPrice.toLocaleString()}
          </span>
          <div className={cn("w-1 h-6 rounded-full ml-1", usedType === 'sell' ? "bg-gradient-to-b from-red-400/60 to-orange-400/60" : "bg-gradient-to-b from-emerald-400/60 to-green-400/60")} />
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent"></div>
    </div>
  )
})

// PriceDisplay component - Individual price display unit
const PriceDisplay = memo(({ label, value, type, icon }: {
  label: string
  value: number
  type: 'sell' | 'buy'
  icon: string
}) => {
  const colorClass = type === 'sell' ? 'text-red-400' : 'text-green-400'
  const bgClass = type === 'sell' ? 'bg-red-500/10' : 'bg-green-500/10'
  
  return (
    <div className={cn("flex flex-col items-end p-1.5 rounded transition-all duration-200 hover:scale-105", bgClass)}>
      <div className="flex items-center gap-0.5 mb-0.5">
        <span className="text-xs">{icon}</span>
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <span className={cn("font-bold text-sm tabular-nums", colorClass)}>
        {value.toLocaleString()}
      </span>
    </div>
  )
})

// Memoized ItemCard component for better performance
const ItemCard = memo(({ item, index, currentPage, priceMap }: {
  item: any;
  index: number;
  currentPage: number;
  priceMap?: CityMap;
}) => {
  const noData = !priceMap || CITY_ORDER.every(c => !priceMap[c]?.sellMin && !priceMap[c]?.sellMax && !priceMap[c]?.buyMin && !priceMap[c]?.buyMax)
  
  return (
    <Card key={item.uniqueName} className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0 group">
            <div className="w-16 h-16 bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600/30 group-hover:border-primary/30 transition-colors">
              <Image
              src={itemApi.getItemImageUrl(item.id, 1, 64)} 
              alt={item.name} 
              width={64}
              height={64}
              priority={index < 2}
              loading={index < 2 ? 'eager' : 'lazy'}
              fetchPriority={index < 2 ? 'high' : 'auto'}
              unoptimized
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(64,64))}`}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">{((currentPage-1)*20)+index+1}</div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{item.uniqueName}</p>
              </div>
            </div>

            <PriceDisplaySection priceMap={priceMap} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ItemCard.displayName = 'ItemCard'

export default function ItemSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [priceData, setPriceData] = useState<Record<string, CityMap>>({})
  const [vTick, setVTick] = useState(0)
  
  const { data: searchResults, isLoading, error, isPlaceholderData } = useSearchItems(
    searchTerm || undefined,
    currentPage, 
    20
  )

  const items = searchResults?.data || []
  const pagination = searchResults?.pagination
  const totalItems = pagination?.totalItems || 0
  const totalPages = pagination?.totalPages || 1
  const hasNextPage = pagination?.hasNextPage || false
  const hasPreviousPage = pagination?.hasPreviousPage || false

  const scrollParentRef = useRef<HTMLDivElement | null>(null)
  const handleVirtualChange = useCallback(() => {
    setTimeout(() => setVTick((t) => t + 1), 0)
  }, [])

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 180, // adjust per row height
    overscan: 8,
  getItemKey: (index) => items[index]?.uniqueName ?? index,
  onChange: handleVirtualChange,
  })
  
  const getPageNumbers = () => {
    const delta = 2, pages: (number | "...")[] = [1]
    const s = Math.max(2, currentPage - delta), e = Math.min(totalPages - 1, currentPage + delta)
    if (s > 2) pages.push("..."); for (let i = s; i <= e; i++) pages.push(i); if (e < totalPages - 1) pages.push("..."); if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  // helpers
  const isMarketItem = (u: string) => /^T[2-8]_/.test(u)
  const n = (v:any) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : null }
  const minDef = (a?:number|null, b?:number|null) => a==null ? b??null : b==null ? a : Math.min(a,b)
  const maxDef = (a?:number|null, b?:number|null) => a==null ? b??null : b==null ? a : Math.max(a,b)
  const rowsFrom = (res:any) => Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : []

  const fetchCityPricesOptimized = async (uniqueName: string): Promise<CityMap> => {
    if (!isMarketItem(uniqueName)) return {}
    try {
      let res = await itemApi.getItemPrices(uniqueName, CITIES_PARAM)
      let rows:any[] = rowsFrom(res)
      if (!rows.length) { res = await itemApi.getItemPrices(uniqueName); rows = rowsFrom(res) }

      const map: CityMap = {}
      for (const r of rows) {
        const city = String(r.city ?? "").trim()
        if (!city) continue
        const cm = (map[city] ??= {})
        
        cm.sellMin = minDef(cm.sellMin, n(r.sell_Price_Min))
        cm.sellMax = maxDef(cm.sellMax, n(r.sell_Price_Max))
        cm.buyMin = minDef(cm.buyMin, n(r.buy_Price_Min))
        cm.buyMax = maxDef(cm.buyMax, n(r.buy_Price_Max))
      }

      // Cache the result
      priceCache.set(uniqueName, { data: map, timestamp: Date.now() })
      return map
    } catch {
      return {}
    }
  }

  // Batch fetch prices for visible items
  const fetchPricesForItems = useCallback(async (itemsToFetch: typeof items) => {
    if (!itemsToFetch.length) return

    // Batch fetch prices in chunks to avoid overwhelming the API
    const CHUNK_SIZE = 5
    for (let i = 0; i < itemsToFetch.length; i += CHUNK_SIZE) {
      const chunk = itemsToFetch.slice(i, i + CHUNK_SIZE)
      const pricePromises = chunk.map(async (item) => {
        const prices = await fetchCityPricesOptimized(item.uniqueName)
        return [item.uniqueName, prices] as const
      })

      const chunkResults = await Promise.all(pricePromises)
      setPriceData(prev => {
        const next = { ...prev }
        chunkResults.forEach(([uniqueName, prices]) => {
          next[uniqueName] = prices
        })
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
            <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="ค้นหาไอเทม... (เช่น sword, armor, potion)" className={cn("w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-background text-foreground","placeholder:text-muted-foreground","focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent","transition-all duration-200")} />
          </div>
          <button type="submit" disabled={loading} className={cn("px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium","hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2","disabled:opacity-50 disabled:cursor-not-allowed","transition-all duration-200 min-w-[120px]")}>
            {loading ? (<div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>กำลังค้นหา...</div>) : ("ค้นหา")}
          </button>
        </div>
      </form>

      {error && (<Card className="border-red-500/30 bg-slate-800/50 backdrop-blur-sm"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-5 h-5 text-red-400"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className="text-red-300 font-medium">เกิดข้อผิดพลาด: {error}</p></div></CardContent></Card>)}

      {/* Header */}
      <div id="search-results" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-xl font-semibold text-white">{searchTerm ? <>ผลการค้นหา <span className="text-primary">"{searchTerm}"</span></> : "ไอเทมทั้งหมด"}</h2>
          <p className="text-sm text-slate-300 mt-1">แสดง {items.length} รายการ {totalItems>0 && `จากทั้งหมด ${totalItems.toLocaleString()} รายการ`}{totalPages>1 && <span className="ml-2">(หน้า {currentPage} จาก {totalPages})</span>}</p>
        </div>
        <div className="text-sm text-slate-300">แสดง {itemsPerPage} รายการต่อหน้า</div>

      </div>

      {loading && items.length===0 && (<div className="flex items-center justify-center py-12"><div className="flex items-center gap-3 text-slate-300"><div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div><span>กำลังโหลดข้อมูล...</span></div></div>)}

      {!loading && items.length===0 && !error && (<Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm border-dashed"><CardContent className="pt-6"><div className="text-center py-8"><div className="w-16 h-16 mx-auto mb-4 text-slate-600"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-8a8 8 0 018 8 8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8z" /></svg></div><h3 className="text-lg font-medium text-white mb-2">ไม่พบไอเทมที่ค้นหา</h3><p className="text-slate-400">ลองค้นหาด้วยคำอื่น หรือใช้คำค้นหาที่สั้นกว่า</p></div></CardContent></Card>)}

      {items.length>0 && (
        <div className="grid gap-4">
          {items.map((item, index) => {
            const pMap = cityPricesByItem[item.uniqueName]
            const noData = !pMap || CITY_ORDER.every(c => !pMap[c]?.sellMin && !pMap[c]?.sellMax && !pMap[c]?.buyMin && !pMap[c]?.buyMax)
            return (
              <Card key={`${item.id}-${index}`} className={cn("hover:shadow-lg transition-all duration-200 cursor-pointer group","hover:border-primary/20")}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-slate-700/30 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src={itemApi.getItemImageUrl(item.id, 1, 64)} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">{((currentPage-1)*itemsPerPage)+index+1}</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-white bg-white/10 px-2 py-1 rounded">ID: {item.id}</span>
                        <span className="text-xs font-medium text-white bg-white/10 px-2 py-1 rounded">{item.uniqueName}</span>
                      </div>

                      <div className="mt-3 space-y-1">
                        {noData ? (
                          <span className="text-sm text-slate-400">ไม่มีข้อมูลราคา</span>
                        ) : (
                          <>
                            <ChipsRow label="Sell Min" metric="sellMin" map={pMap} />
                            <ChipsRow label="Sell Max" metric="sellMax" map={pMap} />
                            <ChipsRow label="Buy Min"  metric="buyMin"  map={pMap} />
                            <ChipsRow label="Buy Max"  metric="buyMax"  map={pMap} />
{items.length > 0 && (
  <div className="mt-2"><Legend /></div>
)}                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-400 group-hover:text-primary transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
function setTotalItems(arg0: number) {
  throw new Error('Function not implemented.')
}

