'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { itemApi } from '@/api'
import { CITIES, ItemCard, cityMap, type CityMap } from '@/components/ItemSearch'
import PaginationControls from '@/components/pagination/PaginationControls'
import { useWatchlist } from '@/hooks/useWatchlist'
import { watchlistStatus } from '@/lib/watchlistStatus'

const PAGE_SIZE = 20
const CITY_KEY = 'albion-watchlist-city-v1'
const SEEN_KEY = 'albion-watchlist-seen-v1'

export default function WatchlistPage({ locale = 'en' }: { locale?: 'th' | 'en' }) {
  const th = locale === 'th'
  const watchlist = useWatchlist()
  const [page, setPage] = useState(1)
  const [city, setCity] = useState('Bridgewatch')
  const [previousReports, setPreviousReports] = useState<Record<string, string>>({})
  const ids = useMemo(() => watchlist.items.map(item => item.uniqueName), [watchlist.items])
  const priceQuery = useQuery({
    queryKey: ['watchlist-prices', ids],
    queryFn: ({ signal }) => itemApi.getItemsPricesBatch(ids, CITIES.join(','), signal),
    enabled: ids.length > 0,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
  const prices = useMemo<Record<string, CityMap>>(() => Object.fromEntries(
    watchlist.items.map(item => [item.uniqueName, cityMap(priceQuery.data?.data?.[item.uniqueName] ?? [])])
  ), [watchlist.items, priceQuery.data])
  const ranked = useMemo(() => {
    const rows = watchlist.items.map(item => {
    const status = watchlistStatus(prices[item.uniqueName]?.[city], previousReports[`${item.uniqueName}:${city}`])
    return { item, status }
    })
    return priceQuery.data ? rows.sort((a, b) => Number(b.status.updated) - Number(a.status.updated) ||
    Number(a.status.state === 'missing') - Number(b.status.state === 'missing') ||
    Number(a.status.state === 'stale') - Number(b.status.state === 'stale') || a.item.name.localeCompare(b.item.name)) : rows
  }, [watchlist.items, prices, city, previousReports, priceQuery.data])
  const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE))
  const items = ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    try {
      const savedCity = localStorage.getItem(CITY_KEY)
      if (savedCity && CITIES.some(value => value === savedCity)) setCity(savedCity)
      const savedReports = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
      if (savedReports && typeof savedReports === 'object' && !Array.isArray(savedReports)) setPreviousReports(savedReports)
    } catch {}
  }, [])

  useEffect(() => {
    if (!priceQuery.data) return
    try {
      const stored = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
      const saved: Record<string, string> = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
      for (const item of watchlist.items) {
        const key = `${item.uniqueName}:${city}`
        const latest = watchlistStatus(prices[item.uniqueName]?.[city], undefined).latest
        if (latest > (Date.parse(saved[key] || '') || 0)) saved[key] = new Date(latest).toISOString()
      }
      localStorage.setItem(SEEN_KEY, JSON.stringify(saved))
    } catch {}
  }, [city, priceQuery.data, prices, watchlist.items])

  const changeCity = (value: string) => {
    setCity(value)
    setPage(1)
    try { localStorage.setItem(CITY_KEY, value) } catch {}
  }

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-7">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">Asia Server</p>
        <h1 className="font-ledger mt-2 flex items-center gap-3 text-4xl font-bold text-gold-gradient"><Star className="h-7 w-7 fill-primary text-primary" /> {th ? 'รายการโปรด' : 'Watchlist'}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{th ? 'สินค้าที่บันทึกไว้และราคาล่าสุดที่ชุมชนรายงาน' : 'Your saved items and their latest community-uploaded market prices.'}</p>
      </div>

      {watchlist.storageError && <section className="state-card mb-4" role="alert"><h2>{th ? 'บันทึกรายการโปรดไม่ได้' : 'Could not save the watchlist'}</h2><p>{th ? 'เบราว์เซอร์อาจปิดกั้นพื้นที่จัดเก็บหรือพื้นที่เต็ม' : 'Browser storage may be blocked or full.'}</p></section>}

      {!watchlist.items.length ? (
        <section className="state-card">
          <Star className="mx-auto h-8 w-8 text-primary" />
          <h2 className="font-ledger mt-3 text-xl font-semibold">{th ? 'ยังไม่มีสินค้าในรายการโปรด' : 'Your watchlist is empty'}</h2>
          <p>{th ? 'กดดาวบนสินค้าเพื่อกลับมาเช็กราคาได้ง่ายขึ้น' : 'Save an item with the star button to check it here later.'}</p>
          <Link href={`/${locale}`} className="nav-link nav-link-primary mt-5">{th ? 'ค้นหาสินค้า' : 'Browse items'}</Link>
        </section>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-y border-border py-4">
            <div><p className="text-xs uppercase tracking-wider text-primary">{th ? 'โต๊ะเฝ้าราคา' : 'Market watch'}</p><p className="mt-1 text-sm text-muted-foreground">{th ? 'รายงานใหม่เรียงก่อน · ราคาและเวลาจากผู้เล่น' : 'New reports first · player-reported prices and times'}</p></div>
            <label className="text-xs text-muted-foreground">{th ? 'เมืองที่ติดตาม' : 'City to watch'}<select className="trade-control mt-1 min-w-44" value={city} onChange={event => changeCity(event.target.value)}>{CITIES.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          </div>
          {priceQuery.isError && <div className="state-card mb-4"><h2>{th ? 'โหลดราคาสินค้าไม่ได้' : 'Could not load watchlist prices'}</h2><p>{th ? 'โปรดลองใหม่อีกครั้ง' : 'Please try again shortly.'}</p></div>}
          <div className="grid gap-4 lg:grid-cols-2" aria-busy={priceQuery.isFetching}>
            {items.map(({ item, status }, index) => (
              <div key={item.uniqueName} className="min-w-0">
                <div className="mb-2 flex min-h-6 flex-wrap items-center gap-2 text-xs">
                  {status.updated && <span className="text-emerald-400">{th ? '● รายงานใหม่ตั้งแต่ครั้งก่อน' : '● New report since last visit'}</span>}
                  <span className={status.state === 'fresh' && priceQuery.data ? 'text-emerald-400' : status.state === 'stale' && priceQuery.data ? 'text-amber-300' : 'text-muted-foreground'}>{!priceQuery.data ? (priceQuery.isError ? (th ? 'โหลดราคาไม่ได้' : 'Prices unavailable') : (th ? 'กำลังโหลดราคา…' : 'Loading prices…')) : status.state === 'fresh' ? (th ? 'ข้อมูลไม่เกิน 30 นาที' : 'Reported within 30 min') : status.state === 'stale' ? (th ? 'ข้อมูลเก่าหรือไม่ทราบเวลา' : 'Old or undated report') : (th ? 'ไม่มีราคาในเมืองนี้' : 'No price in this city')}</span>
                </div>
                <ItemCard item={item} prices={prices[item.uniqueName]} cities={[city]} loading={priceQuery.isFetching} imagePriority={index < 2} watched onToggleWatchlist={watchlist.toggle} />
              </div>
            ))}
          </div>
          {totalPages > 1 && <div className="mt-8"><PaginationControls page={page} totalPages={totalPages} isFetching={priceQuery.isFetching} onChange={setPage} locale={locale} /></div>}
        </>
      )}
    </main>
  )
}
