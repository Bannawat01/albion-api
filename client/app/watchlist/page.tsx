'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { itemApi } from '@/api'
import { CITIES, ItemCard, cityMap, type CityMap } from '@/components/ItemSearch'
import PaginationControls from '@/components/pagination/PaginationControls'
import { useWatchlist } from '@/hooks/useWatchlist'

const PAGE_SIZE = 20

export default function WatchlistPage() {
  const watchlist = useWatchlist()
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(watchlist.items.length / PAGE_SIZE))
  const items = watchlist.items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const ids = useMemo(() => items.map(item => item.uniqueName), [items])
  const priceQuery = useQuery({
    queryKey: ['watchlist-prices', ids],
    queryFn: ({ signal }) => itemApi.getItemsPricesBatch(ids, CITIES.join(','), signal),
    enabled: ids.length > 0,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
  const prices = useMemo<Record<string, CityMap>>(() => Object.fromEntries(
    items.map(item => [item.uniqueName, cityMap(priceQuery.data?.data?.[item.uniqueName] ?? [])])
  ), [items, priceQuery.data])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-7">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">Asia Server</p>
        <h1 className="font-ledger mt-2 flex items-center gap-3 text-4xl font-bold text-gold-gradient"><Star className="h-7 w-7 fill-primary text-primary" /> Watchlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your saved items and their latest community-uploaded market prices.</p>
      </div>

      {!watchlist.items.length ? (
        <section className="state-card">
          <Star className="mx-auto h-8 w-8 text-primary" />
          <h2 className="font-ledger mt-3 text-xl font-semibold">Your watchlist is empty</h2>
          <p>Save an item with the star button to check it here later.</p>
          <Link href="/" className="nav-link nav-link-primary mt-5">Browse items</Link>
        </section>
      ) : (
        <>
          {priceQuery.isError && <div className="state-card mb-4"><h2>Could not load watchlist prices</h2><p>Please try again shortly.</p></div>}
          <div className="grid gap-4 lg:grid-cols-2" aria-busy={priceQuery.isFetching}>
            {items.map((item, index) => (
              <ItemCard key={item.uniqueName} item={item} prices={prices[item.uniqueName]} cities={CITIES} loading={priceQuery.isFetching} imagePriority={index < 2} watched onToggleWatchlist={watchlist.toggle} />
            ))}
          </div>
          {totalPages > 1 && <div className="mt-8"><PaginationControls page={page} totalPages={totalPages} isFetching={priceQuery.isFetching} onChange={setPage} /></div>}
        </>
      )}
    </main>
  )
}
