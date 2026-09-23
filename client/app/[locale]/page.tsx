import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BarChart3, Search, ShieldCheck } from 'lucide-react'
import ItemSearch from '@/components/ItemSearch'
import { alternateLanguages, COPY, isLocale, type Locale } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const c = COPY[locale]
  return { title: c.title, description: c.description, alternates: { canonical: `/${locale}`, languages: alternateLanguages() }, openGraph: { title: c.title, description: c.description, url: `/${locale}`, locale: locale === 'th' ? 'th_TH' : 'en_US' } }
}

export default async function LocalizedHome({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string; q?: string }> }) {
  const { locale: value } = await params
  if (!isLocale(value)) notFound()
  const locale: Locale = value
  const c = COPY[locale]
  const query = await searchParams
  const initialPage = Math.max(1, Number.parseInt(query.page || '1') || 1)
  return <div className="min-h-screen animated-bg" lang={locale}>
    <section className="ledger-hero"><div className="container mx-auto flex max-w-5xl items-center gap-5 px-4 py-8 sm:py-10">
      <img src="/images/market-ledger-logo.png" alt="" width="96" height="96" className="hidden h-20 w-20 object-contain drop-shadow-2xl sm:block" />
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{c.eyebrow}</p><h1 className="font-ledger text-3xl font-bold tracking-tight sm:text-5xl">{c.title}</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{c.lead}</p><div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="hero-proof"><Search /> Search</span><span className="hero-proof"><BarChart3 /> All cities</span><span className="hero-proof"><ShieldCheck /> Player-reported</span></div></div>
    </div></section>
    <div className="container mx-auto px-4 py-6"><section className="ledger-panel mx-auto max-w-5xl p-4 sm:p-6" aria-labelledby="item-search-title">
      <div className="mb-5 flex items-center gap-3 border-b border-border pb-4"><span className="ledger-icon"><Search className="h-4 w-4" /></span><div><h2 id="item-search-title" className="font-ledger text-xl font-semibold">{c.search}</h2><p className="text-xs text-muted-foreground">{c.note}</p></div></div>
      <ItemSearch locale={locale} initialQuery={query.q || ''} initialPage={initialPage} />
      <a href="https://pow.east.albion-online-data.com/" target="_blank" rel="noopener noreferrer" className="aodp-cta"><ShieldCheck className="h-5 w-5" /><span><b>{locale === 'th' ? 'ช่วยให้ราคา Asia สดขึ้น' : 'Help keep Asia prices fresh'}</b><small className="mt-1 block text-xs text-muted-foreground">{locale === 'th' ? 'เปิด AODP Client ขณะเล่นและเข้าดูตลาดในเกม' : 'Run the AODP Client while browsing in-game markets.'}</small></span></a>
    </section></div>
  </div>
}
