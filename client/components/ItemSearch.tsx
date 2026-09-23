'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BarChart3, ChevronDown, ImageOff, RefreshCw, Search, Share2, SlidersHorizontal, Sparkles, Star, X } from 'lucide-react'
import { itemApi, useSearchItems, type ItemSummary, type TradeRecommendation } from '@/api'
import { useDebounce } from '@/hooks/useDebounce'
import { rowsFrom } from '@/helpers/helperItem'
import PaginationControls from '@/components/pagination/PaginationControls'
import { useWatchlist } from '@/hooks/useWatchlist'
import { track } from '@/lib/analytics'
import { useLanguage } from '@/hooks/useLanguage'
import { usePathname } from 'next/navigation'

type Metric = { sellMin: number | null; buyMax: number | null; updatedAt: string | null }
export type CityMap = Record<string, Metric>
type PriceMap = Record<string, CityMap>

export const CITIES = ['Brecilien', 'Caerleon', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Black Market'] as const
const CITY_STYLE: Record<string, string> = {
  Brecilien: 'city-brecilien',
  Caerleon: 'city-caerleon',
  Thetford: 'city-thetford',
  'Fort Sterling': 'city-fort-sterling',
  Lymhurst: 'city-lymhurst',
  Bridgewatch: 'city-bridgewatch',
  Martlock: 'city-martlock',
  'Black Market': 'city-black-market',
}

export function cityMap(rows: any[]): CityMap {
  const result: CityMap = {}
  for (const row of rows) {
    const city = String(row.city || '').trim()
    if (!city) continue
    const sell = Number(row.sell_Price_Min)
    const buy = Number(row.buy_Price_max)
    const current = result[city] ||= { sellMin: null, buyMax: null, updatedAt: null }
    if (sell > 0) current.sellMin = current.sellMin == null ? sell : Math.min(current.sellMin, sell)
    if (buy > 0) current.buyMax = current.buyMax == null ? buy : Math.max(current.buyMax, buy)
    const updatedAt = [row.sell_Price_Min_Date, row.buy_Price_Max_Date]
      .filter(Boolean)
      .sort()
      .at(-1)
    if (updatedAt && (!current.updatedAt || updatedAt > current.updatedAt)) current.updatedAt = updatedAt
  }
  return result
}

export default function ItemSearch({ initialQuery = '', initialPage = 1, locale }: { initialQuery?: string; initialPage?: number; locale?: 'th' | 'en' }) {
  const storedLanguage = useLanguage()
  const th = locale ? locale === 'th' : storedLanguage.th
  const [query, setQuery] = useState(initialQuery)
  const search = useDebounce(query.trim(), 250)
  const [page, setPage] = useState(initialPage)
  const [selectedCities, setSelectedCities] = useState<Set<string>>(() => new Set(CITIES))
  const watchlist = useWatchlist()
  const { data, isFetching, isError, error } = useSearchItems(search || undefined, page, 12)

  const items = useMemo(() => data?.data ?? [], [data?.data])
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1

  useEffect(() => setPage(1), [search])
  useEffect(() => {
    if (search.length >= 2) track('search')
  }, [search])

  const itemIds = useMemo(() => items.map((item) => item.uniqueName), [items])
  const priceQuery = useQuery({
    queryKey: ['items', 'prices', 'batch', itemIds],
    queryFn: ({ signal }) => itemApi.getItemsPricesBatch(itemIds, CITIES.join(','), signal),
    enabled: itemIds.length > 0,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
  const prices = useMemo<PriceMap>(() => {
    const next: PriceMap = {}
    for (const item of items) {
      next[item.uniqueName] = cityMap(rowsFrom({ data: priceQuery.data?.data?.[item.uniqueName] ?? [] }))
    }
    return next
  }, [items, priceQuery.data])
  const pricesLoading = priceQuery.isFetching
  const [slowLoading, setSlowLoading] = useState(false)

  useEffect(() => {
    if (!isFetching && !pricesLoading) {
      setSlowLoading(false)
      return
    }
    const timer = window.setTimeout(() => setSlowLoading(true), 2000)
    return () => window.clearTimeout(timer)
  }, [isFetching, pricesLoading])

  const visibleCities = useMemo(() => CITIES.filter((city) => selectedCities.has(city)), [selectedCities])

  const toggleCity = (city: string) => {
    setSelectedCities((current) => {
      const next = new Set(current)
      next.has(city) ? next.delete(city) : next.add(city)
      return next
    })
  }

  const changePage = (next: number) => {
    if (next === page || next < 1 || next > totalPages) return
    setPage(next)
    document.getElementById('market-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6">
      <div className="market-search">
        <Search className="h-5 w-5 text-primary" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={th ? 'ค้นหา: ดาบ กระเป๋า โพชัน...' : 'Search: sword, bag, potion...'}
          aria-label={th ? 'ค้นหาไอเทม Albion' : 'Search Albion items'}
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="icon-button" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        )}
        <span className="hidden sm:block text-xs text-muted-foreground">{isFetching ? 'Searching...' : 'Live results'}</span>
      </div>

      <section className="city-filter" aria-labelledby="city-filter-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="city-filter-title" className="flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4 text-primary" /> {th ? 'เมืองที่ต้องการดู' : 'Markets'}
          </h2>
          <div className="flex gap-2 text-xs">
            <button type="button" onClick={() => setSelectedCities(new Set(CITIES))} className="text-primary hover:underline">{th ? 'เลือกทั้งหมด' : 'Select all'}</button>
            <span className="text-border">|</span>
            <button type="button" onClick={() => setSelectedCities(new Set())} className="text-muted-foreground hover:text-foreground">{th ? 'ล้าง' : 'Clear'}</button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CITIES.map((city) => {
            const active = selectedCities.has(city)
            return (
              <button
                type="button"
                key={city}
                onClick={() => toggleCity(city)}
                aria-pressed={active}
                className={'city-toggle ' + CITY_STYLE[city] + (active ? ' is-active' : '')}
              >
                {city}
              </button>
            )
          })}
        </div>
      </section>

      <div id="market-results" className="scroll-mt-24 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary">{th ? 'ผลการค้นหา' : 'Market results'}</p>
          <h2 className="mt-1 text-xl font-semibold">{search ? (th ? `ผลลัพธ์สำหรับ “${search}”` : `Matches for "${search}"`) : (th ? 'เลือกดูสินค้าทั้งหมด' : 'Browse all items')}</h2>
        </div>
        {pagination && <p className="text-sm text-muted-foreground">{pagination.totalItems.toLocaleString()} items | Page {page} of {totalPages}</p>}
      </div>

      {isError && <StateCard title="Could not load the market" detail={error instanceof Error ? error.message : 'Please try again.'} />}
      {slowLoading && <p className='text-sm text-amber-300' role='status'>The free market server is waking up. Please wait a moment.</p>}
      {isFetching && !items.length && <ItemSkeletons />}
      {!isFetching && !isError && !items.length && <StateCard title="No items found" detail="Try a shorter name or a different spelling." />}

      {!!items.length && (
        <div className="grid gap-4 lg:grid-cols-2" aria-busy={pricesLoading}>
          {items.map((item, index) => <ItemCard key={item.id} item={item} prices={prices[item.uniqueName]} cities={visibleCities} loading={pricesLoading} imagePriority={index < 2} watched={watchlist.items.some(saved => saved.uniqueName === item.uniqueName)} onToggleWatchlist={watchlist.toggle} />)}
        </div>
      )}

      {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} isFetching={isFetching} onChange={changePage} hrefForPage={(value) => `/${locale || (th ? 'th' : 'en')}?page=${value}${search ? `&q=${encodeURIComponent(search)}` : ''}`} />}
    </div>
  )
}

export function ItemCard({ item, prices, cities, loading, imagePriority, watched = false, onToggleWatchlist }: { item: ItemSummary; prices?: CityMap; cities: readonly string[]; loading: boolean; imagePriority: boolean; watched?: boolean; onToggleWatchlist?: (item: ItemSummary) => void }) {
  const locale = usePathname().startsWith('/en') ? 'en' : 'th'
  const rows = cities.flatMap((city) => {
    const metric = prices?.[city]
    return metric && (metric.sellMin || metric.buyMax) ? [{ city, ...metric }] : []
  })
  const bestSell = rows.reduce<{ city: string; value: number } | null>((best, row) =>
    row.sellMin && (!best || row.sellMin < best.value) ? { city: row.city, value: row.sellMin } : best, null)
  const bestBuy = rows.reduce<{ city: string; value: number } | null>((best, row) =>
    row.buyMax && (!best || row.buyMax > best.value) ? { city: row.city, value: row.buyMax } : best, null)
  const latestUpdate = rows.map(row => row.updatedAt).filter(Boolean).sort().at(-1) ?? null
  const fresh = latestUpdate ? Date.now() - new Date(latestUpdate).getTime() <= 30 * 60 * 1000 : false

  return (
    <article className="market-item">
      <div className="flex items-start gap-4">
        <ItemImage item={item} priority={imagePriority} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 truncate text-lg font-semibold"><Link href={`/${locale}/item/${encodeURIComponent(item.uniqueName)}`} className="hover:text-primary">{item.name}</Link></h3>
            {onToggleWatchlist && (
              <button type="button" onClick={() => onToggleWatchlist(item)} className={'watchlist-button' + (watched ? ' is-active' : '')} aria-label={watched ? `Remove ${item.name} from watchlist` : `Add ${item.name} to watchlist`} aria-pressed={watched}>
                <Star className="h-4 w-4" fill={watched ? 'currentColor' : 'none'} />
              </button>
            )}
            <button type="button" onClick={() => shareItem(item)} className="watchlist-button" aria-label={`Share ${item.name}`}>
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <p className="truncate font-mono text-xs text-muted-foreground">{item.uniqueName}</p>
          <p className={'mt-1 text-[10px] font-semibold uppercase tracking-wide ' + (fresh ? 'text-emerald-400' : 'text-amber-300')}>
            {fresh ? 'Fresh' : 'Old'}{latestUpdate ? ` · ${new Date(latestUpdate).toLocaleString()}` : ' · Update time unavailable'}
          </p>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
            <PriceSummary label="Best sell" result={bestSell} tone="sell" />
            <PriceSummary label="Best buy order" result={bestBuy} tone="buy" />
          </div>
        </div>
      </div>
      <details className="market-details">
        <summary><span>{loading && !prices ? 'Loading city prices...' : `${rows.length} city ${rows.length === 1 ? 'price' : 'prices'}`}</span><ChevronDown className="h-4 w-4" /></summary>
        <div className="grid gap-2 pt-3 sm:grid-cols-2">
          {rows.length ? rows.map((row) => (
            <div key={row.city} className="price-row">
              <span className={'city-dot ' + CITY_STYLE[row.city]} />
              <span className="truncate text-xs font-medium">{row.city}</span>
              <span className="ml-auto text-xs text-muted-foreground">Sell <b className="text-foreground">{row.sellMin?.toLocaleString() ?? '-'}</b></span>
              <span className="text-xs text-muted-foreground">Buy <b className="text-foreground">{row.buyMax?.toLocaleString() ?? '-'}</b></span>
            </div>
          )) : <p className="text-sm text-muted-foreground">No recent prices in selected markets.</p>}
        </div>
      </details>
      <MarketHistory item={item} city={bestSell?.city ?? rows[0]?.city ?? 'Bridgewatch'} />
      <TradeFinder item={item} />
    </article>
  )
}

function MarketHistory({ item, city }: { item: ItemSummary; city: string }) {
  const [open, setOpen] = useState(false)
  const history = useQuery({
    queryKey: ['item-history', item.uniqueName, city],
    queryFn: ({ signal }) => itemApi.getItemHistory(item.uniqueName, city, signal),
    enabled: open,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
  const maxVolume = Math.max(...(history.data?.points.map(point => point.volume) ?? [1]), 1)

  return (
    <div className="market-history">
      <button type="button" onClick={() => setOpen(value => { if (!value) track('history_open'); return !value })} aria-expanded={open}>
        <BarChart3 className="h-4 w-4" aria-hidden="true" />
        {open ? 'Hide 7-day market pulse' : 'View 7-day market pulse'}
        <ChevronDown className="ml-auto h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <div className="market-history-panel">
          {history.isFetching && <p role="status">Loading history...</p>}
          {history.isError && <p className="text-red-300">Price history is unavailable right now.</p>}
          {history.data && history.data.points.length > 0 && (
            <>
              <div className="history-stats">
                <span>7-day volume <b>{history.data.totalVolume.toLocaleString()}</b></span>
                <span>Sold / day <b>{history.data.averageDailyVolume.toLocaleString()}</b></span>
                <span>Average price <b>{history.data.averagePrice.toLocaleString()}</b></span>
              </div>
              <div className="history-bars" aria-label={`Daily sales volume in ${city}`}>
                {history.data.points.map(point => (
                  <div key={point.date} title={`${new Date(point.date).toLocaleDateString()}: ${point.volume.toLocaleString()} sold at ${point.averagePrice.toLocaleString()} average`}>
                    <i style={{ height: `${Math.max(8, point.volume / maxVolume * 100)}%` }} />
                    <small>{new Date(point.date).toLocaleDateString(undefined, { weekday: 'short' })}</small>
                  </div>
                ))}
              </div>
              <p className="history-note">{city} · Daily player-reported sales</p>
            </>
          )}
          {history.data && history.data.points.length === 0 && <p>No sales history found for {city}.</p>}
        </div>
      )}
    </div>
  )
}

function ItemImage({ item, priority }: { item: ItemSummary; priority: boolean }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const source = itemApi.getItemImageUrl(item.id, 1, 96) + (attempt ? '&retry=' + attempt : '')

  const retry = () => {
    setStatus('loading')
    setAttempt((value) => value + 1)
  }

  return (
    <div className="item-image" aria-busy={status === 'loading'}>
      {status === 'loading' && (
        <div className="item-image-loading" role="status">
          <span className="item-image-spinner" />
          <span className="sr-only">Loading image for {item.name}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="item-image-error">
          <ImageOff className="h-6 w-6" aria-hidden="true" />
          <button type="button" onClick={retry} aria-label={'Retry image for ' + item.name}>
            <RefreshCw className="h-3 w-3" aria-hidden="true" /> Retry
          </button>
        </div>
      )}
      <Image
        key={attempt}
        src={source}
        alt={item.name}
        width={96}
        height={96}
        priority={priority}
        decoding="async"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={status === 'loaded' ? 'is-loaded' : ''}
      />
    </div>
  )
}

function TradeFinder({ item }: { item: ItemSummary }) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('Bridgewatch')
  const [qty, setQty] = useState(1)
  const [quality, setQuality] = useState(1)
  const [strategy, setStrategy] = useState<'list' | 'quick'>('list')
  const [mode, setMode] = useState<'profit' | 'safe' | 'balanced'>('profit')
  const marketsQuery = useQuery({
    queryKey: ['item-markets', item.uniqueName, quality],
    queryFn: ({ signal }) => itemApi.getItemMarkets(item.uniqueName, quality, signal),
    enabled: open,
    staleTime: 60 * 1000,
    retry: 1,
  })
  const sourceCities = marketsQuery.data?.filter(market => market.sellPrice > 0).map(market => market.city) ?? []
  const selectedFrom = sourceCities.includes(from) ? from : sourceCities[0] ?? ''
  const tradeQuery = useQuery({
    queryKey: ['trade-routes', item.uniqueName, selectedFrom, qty, quality, strategy, mode],
    queryFn: ({ signal }) => itemApi.getTradeRecommendations(
      item.uniqueName,
      { from: selectedFrom, qty, quality, strategy, mode },
      signal
    ),
    enabled: open && !!selectedFrom,
    staleTime: 60 * 1000,
    retry: 1,
  })
  const routes = tradeQuery.data?.recommendations ?? []

  return (
    <div className='mt-4 border-t border-primary/20 pt-3'>
      <button
        type='button'
        onClick={() => setOpen(value => { if (!value) track('route_open'); return !value })}
        aria-expanded={open}
        className='flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20'
      >
        <Sparkles className='h-4 w-4' aria-hidden='true' />
        {open ? 'Hide route planner' : 'Plan a profitable route'}
      </button>

      {open && (
        <div className='mt-3 space-y-3 rounded-lg bg-background/45 p-3'>
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
            <TradeField label='Origin city'>
              <select value={selectedFrom} onChange={event => setFrom(event.target.value)} className='trade-control' disabled={!sourceCities.length}>
                {sourceCities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </TradeField>
            <TradeField label='quantity'>
              <input
                type='number'
                min={1}
                max={10000}
                value={qty}
                onChange={event => setQty(Math.min(10000, Math.max(1, Number(event.target.value) || 1)))}
                className='trade-control'
              />
            </TradeField>
            <TradeField label='quality'>
              <select value={quality} onChange={event => setQuality(Number(event.target.value))} className='trade-control'>
                <option value={1}>1 Normal</option>
                <option value={2}>2 Good</option>
                <option value={3}>3 Outstanding</option>
                <option value={4}>4 Excellent</option>
                <option value={5}>5 Masterpiece</option>
              </select>
            </TradeField>
            <TradeField label='How to sell'>
              <select value={strategy} onChange={event => setStrategy(event.target.value as 'list' | 'quick')} className='trade-control'>
                <option value='list'>List for sale</option>
                <option value='quick'>Sell ​​immediately</option>
              </select>
            </TradeField>
          </div>
          <div className='flex flex-wrap gap-2' aria-label='Ranking format'>
            {([
              ['profit', 'Maximum profit'],
              ['balanced', 'balance'],
              ['safe', 'safe'],
            ] as const).map(([value, label]) => (
              <button
                type='button'
                key={value}
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={`rounded-full border px-3 py-1 text-xs ${mode === value ? 'border-primary bg-primary/20 text-primary' : 'border-border text-muted-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {(marketsQuery.isFetching || tradeQuery.isFetching) && <p className='text-sm text-muted-foreground' role='status'>Calculating the latest prices...</p>}
          {marketsQuery.isError && <p className='text-sm text-red-300'>No market data is available for this quality yet.</p>}
          {tradeQuery.isError && <p className='text-sm text-red-300'>The route could not be calculated. Please try again.</p>}
          {!marketsQuery.isFetching && !marketsQuery.isError && !sourceCities.length && (
            <p className='text-sm text-muted-foreground'>No city has a recent sell price for this quality.</p>
          )}
          {!marketsQuery.isFetching && !tradeQuery.isFetching && !marketsQuery.isError && !tradeQuery.isError && !!sourceCities.length && routes.length === 0 && (
            <p className='text-sm text-muted-foreground'>No profitable routes were found based on the latest data.</p>
          )}
          {!!routes.length && (
            <div className='space-y-2'>
              {routes.map((route, index) => <TradeRoute key={route.city} route={route} rank={index + 1} from={selectedFrom} />)}
              <p className='text-[11px] text-muted-foreground'>Estimated after-tax price: 6.5% • Please check in-game prices before purchasing.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

async function shareItem(item: ItemSummary) {
  const url = new URL(`/item/${encodeURIComponent(item.uniqueName)}`, location.origin)
  try {
    if (navigator.share) await navigator.share({ title: item.name, text: `Albion Asia price: ${item.name}`, url: url.toString() })
    else await navigator.clipboard.writeText(url.toString())
    track('share')
  } catch {}
}

function TradeField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className='space-y-1 text-xs text-muted-foreground'><span>{label}</span>{children}</label>
}

function TradeRoute({ route, rank, from }: { route: TradeRecommendation; rank: number; from: string }) {
  const risk = route.riskScore >= 0.5 ? 'High risk' : route.riskScore >= 0.3 ? 'Medium risk' : 'Low risk'
  return (
    <div className='rounded-lg border border-border/80 bg-card/70 p-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary'>{rank}</span>
        <span className='text-xs text-muted-foreground'>{from}</span>
        <ArrowRight className='h-3.5 w-3.5 text-primary' aria-hidden='true' />
        <strong className='text-sm'>{route.city}</strong>
        <strong className='ml-auto text-emerald-400'>+{Math.round(route.netProfit).toLocaleString()} silver</strong>
      </div>
      <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
        <span>buy {route.sourcePrice.toLocaleString()}</span>
        <span>sell {route.targetPrice.toLocaleString()}</span>
        <span className='text-emerald-300'>{route.profitPercent.toFixed(1)}%</span>
        <span>{risk}</span>
        {route.isStale && <span className='text-amber-300'>The information may be outdated.</span>}
      </div>
    </div>
  )
}

function PriceSummary({ label, result, tone }: { label: string; result: { city: string; value: number } | null; tone: 'sell' | 'buy' }) {
  return (
    <div className={'price-summary ' + tone}>
      <p>{label}</p>
      <strong>{result?.value.toLocaleString() ?? '-'}</strong>
      <span>{result?.city ?? 'No data'}</span>
    </div>
  )
}

function StateCard({ title, detail }: { title: string; detail: string }) {
  return <div className="state-card"><h3>{title}</h3><p>{detail}</p></div>
}

function ItemSkeletons() {
  return <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="market-item h-48 animate-pulse bg-card/50" />)}</div>
}
