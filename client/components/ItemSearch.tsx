'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { itemApi, useSearchItems, type ItemSummary } from '@/api'
import { useDebounce } from '@/hooks/useDebounce'
import { rowsFrom } from '@/helpers/helperItem'
import PaginationControls from '@/components/pagination/PaginationControls'

type Metric = { sellMin: number | null; buyMax: number | null }
type CityMap = Record<string, Metric>
type PriceMap = Record<string, CityMap>

const CITIES = ['Brecilien', 'Caerleon', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Black Market'] as const
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

function cityMap(rows: any[]): CityMap {
  const result: CityMap = {}
  for (const row of rows) {
    const city = String(row.city || '').trim()
    if (!city) continue
    const sell = Number(row.sell_Price_Min)
    const buy = Number(row.buy_Price_max)
    const current = result[city] ||= { sellMin: null, buyMax: null }
    if (sell > 0) current.sellMin = current.sellMin == null ? sell : Math.min(current.sellMin, sell)
    if (buy > 0) current.buyMax = current.buyMax == null ? buy : Math.max(current.buyMax, buy)
  }
  return result
}

export default function ItemSearch() {
  const [query, setQuery] = useState('')
  const search = useDebounce(query.trim(), 250)
  const [page, setPage] = useState(1)
  const [selectedCities, setSelectedCities] = useState<Set<string>>(() => new Set(CITIES))
  const [prices, setPrices] = useState<PriceMap>({})
  const [pricesLoading, setPricesLoading] = useState(false)
  const { data, isFetching, isError, error } = useSearchItems(search || undefined, page, 12)

  const items = useMemo(() => data?.data ?? [], [data?.data])
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1

  useEffect(() => setPage(1), [search])

  useEffect(() => {
    if (!items.length) {
      setPrices({})
      return
    }
    const controller = new AbortController()
    setPricesLoading(true)
    void itemApi.getItemsPricesBatch(items.map((item) => item.uniqueName), CITIES.join(','), controller.signal)
      .then((response) => {
        const next: PriceMap = {}
        for (const item of items) next[item.uniqueName] = cityMap(rowsFrom({ data: response.data?.[item.uniqueName] ?? [] }))
        setPrices(next)
      })
      .catch((reason) => {
        if (reason?.name !== 'CanceledError') setPrices({})
      })
      .finally(() => {
        if (!controller.signal.aborted) setPricesLoading(false)
      })
    return () => controller.abort()
  }, [items])

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
          placeholder="Search: sword, bag, potion..."
          aria-label="Search Albion items"
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
            <SlidersHorizontal className="h-4 w-4 text-primary" /> Markets
          </h2>
          <div className="flex gap-2 text-xs">
            <button type="button" onClick={() => setSelectedCities(new Set(CITIES))} className="text-primary hover:underline">Select all</button>
            <span className="text-border">|</span>
            <button type="button" onClick={() => setSelectedCities(new Set())} className="text-muted-foreground hover:text-foreground">Clear</button>
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
          <p className="text-xs uppercase tracking-[0.22em] text-primary">Market results</p>
          <h2 className="mt-1 text-xl font-semibold">{search ? 'Matches for "' + search + '"' : 'Browse all items'}</h2>
        </div>
        {pagination && <p className="text-sm text-muted-foreground">{pagination.totalItems.toLocaleString()} items | Page {page} of {totalPages}</p>}
      </div>

      {isError && <StateCard title="Could not load the market" detail={error instanceof Error ? error.message : 'Please try again.'} />}
      {isFetching && !items.length && <ItemSkeletons />}
      {!isFetching && !isError && !items.length && <StateCard title="No items found" detail="Try a shorter name or a different spelling." />}

      {!!items.length && (
        <div className="grid gap-4 lg:grid-cols-2" aria-busy={pricesLoading}>
          {items.map((item) => <ItemCard key={item.id} item={item} prices={prices[item.uniqueName]} cities={visibleCities} loading={pricesLoading} />)}
        </div>
      )}

      {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} isFetching={isFetching} onChange={changePage} />}
    </div>
  )
}

function ItemCard({ item, prices, cities, loading }: { item: ItemSummary; prices?: CityMap; cities: readonly string[]; loading: boolean }) {
  const rows = cities.flatMap((city) => {
    const metric = prices?.[city]
    return metric && (metric.sellMin || metric.buyMax) ? [{ city, ...metric }] : []
  })
  const bestSell = rows.reduce<{ city: string; value: number } | null>((best, row) =>
    row.sellMin && (!best || row.sellMin < best.value) ? { city: row.city, value: row.sellMin } : best, null)
  const bestBuy = rows.reduce<{ city: string; value: number } | null>((best, row) =>
    row.buyMax && (!best || row.buyMax > best.value) ? { city: row.city, value: row.buyMax } : best, null)

  return (
    <article className="market-item">
      <div className="flex items-start gap-4">
        <div className="item-image"><img src={itemApi.getItemImageUrl(item.id, 1, 96)} alt="" loading="lazy" /></div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{item.name}</h3>
          <p className="truncate font-mono text-xs text-muted-foreground">{item.uniqueName}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <PriceSummary label="Best sell" result={bestSell} tone="sell" />
            <PriceSummary label="Best buy order" result={bestBuy} tone="buy" />
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-border/70 pt-3">
        {loading && !prices ? <p className="text-sm text-muted-foreground">Loading city prices...</p> :
          rows.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {rows.map((row) => (
                <div key={row.city} className="price-row">
                  <span className={'city-dot ' + CITY_STYLE[row.city]} />
                  <span className="truncate text-xs font-medium">{row.city}</span>
                  <span className="ml-auto text-xs text-muted-foreground">S <b className="text-foreground">{row.sellMin?.toLocaleString() ?? '-'}</b></span>
                  <span className="text-xs text-muted-foreground">B <b className="text-foreground">{row.buyMax?.toLocaleString() ?? '-'}</b></span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">No recent prices in selected markets.</p>}
      </div>
    </article>
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
