import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import WatchlistPage from '@/app/watchlist/page'
import { isLocale } from '@/lib/seo'

export const metadata: Metadata = { title: 'Watchlist', robots: { index: false, follow: true } }
export default async function LocalizedWatchlist({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <div lang={locale}><WatchlistPage locale={locale} /></div> }
