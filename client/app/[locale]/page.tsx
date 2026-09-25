import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BarChart3, Search, ShieldCheck } from 'lucide-react'
import ItemSearch from '@/components/ItemSearch'
import { alternateLanguages, COPY, GUIDE_SLUGS, isLocale, type Locale } from '@/lib/seo'
import { guides } from '@/lib/guides'

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
    <section className="ledger-hero"><div className="container mx-auto flex max-w-5xl items-center gap-5 px-4 py-6 sm:py-8">
      <img src="/images/market-ledger-logo.png" alt="" width="96" height="96" className="hidden h-20 w-20 object-contain drop-shadow-2xl sm:block" />
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{c.eyebrow}</p><h1 className="font-ledger text-3xl font-bold tracking-tight sm:text-5xl">{c.title}</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{c.lead}</p><div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="hero-proof"><Search /> Search</span><span className="hero-proof"><BarChart3 /> All cities</span><span className="hero-proof"><ShieldCheck /> Player-reported</span></div></div>
    </div></section>
    <div className="container mx-auto px-4 py-6"><section className="ledger-panel mx-auto max-w-5xl p-4 sm:p-6" aria-labelledby="item-search-title">
      <div className="mb-5 flex items-center gap-3 border-b border-border pb-4"><span className="ledger-icon"><Search className="h-4 w-4" /></span><div><h2 id="item-search-title" className="font-ledger text-xl font-semibold">{c.search}</h2><p className="text-xs text-muted-foreground">{c.note}</p></div></div>
      <ItemSearch locale={locale} initialQuery={query.q || ''} initialPage={initialPage} />
      <a href="https://pow.east.albion-online-data.com/" target="_blank" rel="noopener noreferrer" className="aodp-cta"><ShieldCheck className="h-5 w-5" /><span><b>{locale === 'th' ? 'ช่วยให้ราคา Asia สดขึ้น' : 'Help keep Asia prices fresh'}</b><small className="mt-1 block text-xs text-muted-foreground">{locale === 'th' ? 'เปิด AODP Client ขณะเล่นและเข้าดูตลาดในเกม' : 'Run the AODP Client while browsing in-game markets.'}</small></span></a>
    </section>
      <section className="mx-auto mt-6 max-w-5xl" aria-labelledby="discover-title">
        <h2 id="discover-title" className="font-ledger text-2xl font-semibold">{locale === 'th' ? 'เครื่องมือและคู่มือสำหรับผู้เล่น Asia' : 'Asia market tools and guides'}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link className="ledger-panel p-5 hover:border-primary/40" href={`/${locale}/opportunities`}><b>{locale === 'th' ? 'หาโอกาสซื้อขายวันนี้' : 'Find today’s trade opportunities'}</b><p className="mt-2 text-sm text-muted-foreground">{locale === 'th' ? 'คัดเส้นทางจากราคา ความสด ปริมาณขาย และกำไรหลังภาษี' : 'Screen routes by price, freshness, volume, and after-tax profit.'}</p></Link>
          <Link className="ledger-panel p-5 hover:border-primary/40" href={`/${locale}/gold`}><b>{locale === 'th' ? 'ดูราคาทองและค่า Premium' : 'Track gold and Premium costs'}</b><p className="mt-2 text-sm text-muted-foreground">{locale === 'th' ? 'ดูราคาที่รายงานล่าสุดและแนวโน้มย้อนหลังของ Asia Server' : 'Review recent reports and historical Asia trends.'}</p></Link>
          {GUIDE_SLUGS.map(slug => <Link key={slug} className="ledger-panel p-5 hover:border-primary/40" href={`/${locale}/guides/${slug}`}><b>{guides[locale][slug].title}</b><p className="mt-2 text-sm text-muted-foreground">{guides[locale][slug].description}</p></Link>)}
        </div>
      </section>
    </div>
  </div>
}
