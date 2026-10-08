import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowDown, ArrowUpRight, ShieldCheck } from 'lucide-react'
import ItemSearch from '@/components/ItemSearch'
import { alternateLanguages, COPY, GUIDE_SLUGS, isLocale, type Locale } from '@/lib/seo'
import { guides } from '@/lib/guides'

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string; q?: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const query = await searchParams
  const c = COPY[locale]
  return { title: c.title, description: c.description, robots: query.q?.trim() || Number(query.page) > 1 ? { index: false, follow: true } : undefined, alternates: { canonical: `/${locale}`, languages: alternateLanguages() }, openGraph: { title: c.title, description: c.description, url: `/${locale}`, locale: locale === 'th' ? 'th_TH' : 'en_US' } }
}

export default async function LocalizedHome({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string; q?: string }> }) {
  const { locale: value } = await params
  if (!isLocale(value)) notFound()
  const locale: Locale = value
  const c = COPY[locale]
  const query = await searchParams
  const initialPage = Math.max(1, Number.parseInt(query.page || '1') || 1)
  return <div className="min-h-screen animated-bg" lang={locale}>
    <section className="ledger-hero"><div className="container mx-auto max-w-5xl px-4 py-12 sm:py-20">
      <p className="section-kicker">{c.eyebrow}</p>
      <h1 className="font-ledger mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{c.title}</h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{c.lead}</p>
      <div className="mt-7 flex flex-wrap items-center gap-5"><a className="hero-action" href="#item-search-title">{locale === 'th' ? 'เริ่มเช็คราคา' : 'Check prices'} <ArrowDown className="h-4 w-4" /></a><span className="text-xs text-muted-foreground">{locale === 'th' ? 'ทุกเมือง · Asia Server · ข้อมูลจากผู้เล่น' : 'All cities · Asia Server · Player-reported'}</span></div>
    </div></section>
    <div className="container mx-auto px-4 py-7"><section className="ledger-panel mx-auto max-w-5xl p-4 sm:p-7" aria-labelledby="item-search-title">
      <div className="mb-5 border-b border-border pb-5"><p className="section-kicker">01 / {locale === 'th' ? 'หน้าตลาด' : 'Market desk'}</p><h2 id="item-search-title" className="font-ledger mt-2 text-2xl font-semibold">{c.search}</h2><p className="mt-1 text-sm text-muted-foreground">{c.note}</p></div>
      <ItemSearch locale={locale} initialQuery={query.q || ''} initialPage={initialPage} />
      <Link href={`/${locale}/contribute`} className="aodp-cta"><ShieldCheck className="h-5 w-5" /><span><b>{locale === 'th' ? 'ช่วยให้ราคา Asia สดขึ้น' : 'Help keep Asia prices fresh'}</b><small className="mt-1 block text-xs text-muted-foreground">{locale === 'th' ? 'เลือก client แล้วเปิดไว้ขณะดูตลาดในเกม' : 'Choose a client and run it while browsing in-game markets.'}</small></span></Link>
    </section>
      <section className="mx-auto mt-12 max-w-5xl" aria-labelledby="discover-title">
        <p className="section-kicker">02 / {locale === 'th' ? 'สำรวจต่อ' : 'Explore'}</p><h2 id="discover-title" className="font-ledger mt-2 text-2xl font-semibold">{locale === 'th' ? 'เครื่องมือและคู่มือสำหรับผู้เล่น Asia' : 'Asia market tools and guides'}</h2>
        <div className="discover-grid mt-5">
          <Link className="discover-link discover-tool" href={`/${locale}/opportunities`}><span className="section-kicker">{locale === 'th' ? 'เครื่องมือ / 01' : 'Tool / 01'}</span><b>{locale === 'th' ? 'หาโอกาสซื้อขายวันนี้' : 'Find today’s trade opportunities'}</b><p>{locale === 'th' ? 'คัดเส้นทางจากราคา ความสด ปริมาณขาย และกำไรหลังภาษี' : 'Screen routes by price, freshness, volume, and after-tax profit.'}</p><ArrowUpRight aria-hidden="true" /></Link>
          <Link className="discover-link discover-tool" href={`/${locale}/gold`}><span className="section-kicker">{locale === 'th' ? 'เครื่องมือ / 02' : 'Tool / 02'}</span><b>{locale === 'th' ? 'ดูราคาทองและค่า Premium' : 'Track gold and Premium costs'}</b><p>{locale === 'th' ? 'ดูราคาที่รายงานล่าสุดและแนวโน้มย้อนหลังของ Asia Server' : 'Review recent reports and historical Asia trends.'}</p><ArrowUpRight aria-hidden="true" /></Link>
          <Link className="discover-link discover-tool" href={`/${locale}/refining`}><span className="section-kicker">{locale === 'th' ? 'เครื่องมือ / 03' : 'Tool / 03'}</span><b>{locale === 'th' ? 'คิดต้นทุนรีไฟน์ T4' : 'Estimate T4 refining costs'}</b><p>{locale === 'th' ? 'กรอกราคาและค่าสถานีจากในเกม เพื่อดูต้นทุนหลังคืนวัตถุดิบ' : 'Enter in-game prices and station fees to estimate costs after resource returns.'}</p><ArrowUpRight aria-hidden="true" /></Link>
          {GUIDE_SLUGS.map((slug, index) => <Link key={slug} className="discover-link discover-guide" href={`/${locale}/guides/${slug}`}><span className="section-kicker">{locale === 'th' ? 'คู่มือ' : 'Guide'} / {String(index + 1).padStart(2, '0')}</span><b>{guides[locale][slug].title}</b><p>{guides[locale][slug].description}</p><ArrowUpRight aria-hidden="true" /></Link>)}
        </div>
      </section>
    </div>
  </div>
}
