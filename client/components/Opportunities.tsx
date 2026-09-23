'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, RefreshCw, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { CITIES } from './ItemSearch'
import { itemApi, type OpportunityFilters } from '@/api'
import { track } from '@/lib/analytics'

export default function Opportunities({ locale }: { locale: 'th' | 'en' }) {
  const th = locale === 'th'
  const [draft, setDraft] = useState<OpportunityFilters>({ budget: 100000, minProfit: 1000, minVolume: 1, maxAgeMinutes: 30, strategy: 'quick', limit: 10 })
  const [filters, setFilters] = useState(draft)
  const query = useQuery({ queryKey: ['opportunities', filters], queryFn: ({ signal }) => itemApi.getOpportunities(filters, signal), staleTime: 5 * 60 * 1000 })
  useEffect(() => { track('opportunities_view') }, [])
  const apply = (event: React.FormEvent) => { event.preventDefault(); setFilters({ ...draft }); track('opportunity_filter') }

  return <main className="container mx-auto max-w-6xl px-4 py-7 sm:py-10" lang={locale}>
    <header className="mb-6"><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Asia Server · Player-reported data</p><h1 className="font-ledger mt-2 text-3xl font-bold text-gold-gradient sm:text-4xl">{th ? 'โอกาสซื้อขายวันนี้' : 'Daily Asia Opportunities'}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{th ? 'คัดจากสินค้า 50 รายการยอดนิยม โดยดูราคา ความสด ปริมาณขาย และกำไรหลังภาษี 6.5% โปรดตรวจราคาในเกมก่อนซื้อเสมอ' : 'Screened from 50 popular items using price freshness, sales volume, and profit after 6.5% tax. Always verify in game before buying.'}</p></header>
    <form onSubmit={apply} className="opportunity-filters" aria-label={th ? 'ตัวกรองโอกาสซื้อขาย' : 'Opportunity filters'}>
      <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-6"><SlidersHorizontal className="h-4 w-4 text-primary" /><strong className="text-sm">{th ? 'ตัวกรอง' : 'Filters'}</strong></div>
      <Field label={th ? 'เมืองต้นทาง' : 'Origin'}><select value={draft.origin || ''} onChange={e => setDraft({ ...draft, origin: e.target.value || undefined })} className="trade-control"><option value="">{th ? 'เมืองที่ถูกที่สุด' : 'Cheapest city'}</option>{CITIES.filter(city => city !== 'Black Market').map(city => <option key={city}>{city}</option>)}</select></Field>
      <Field label={th ? 'เงินลงทุน' : 'Budget'}><input className="trade-control" type="number" min="0" max="1000000000" value={draft.budget} onChange={e => setDraft({ ...draft, budget: Number(e.target.value) })} /></Field>
      <Field label={th ? 'กำไรขั้นต่ำ' : 'Min profit'}><input className="trade-control" type="number" min="0" value={draft.minProfit} onChange={e => setDraft({ ...draft, minProfit: Number(e.target.value) })} /></Field>
      <Field label={th ? 'ขายต่อวันขั้นต่ำ' : 'Min daily volume'}><input className="trade-control" type="number" min="0" value={draft.minVolume} onChange={e => setDraft({ ...draft, minVolume: Number(e.target.value) })} /></Field>
      <Field label={th ? 'อายุข้อมูลสูงสุด' : 'Max data age'}><select className="trade-control" value={draft.maxAgeMinutes} onChange={e => setDraft({ ...draft, maxAgeMinutes: Number(e.target.value) })}><option value="30">30 min</option><option value="120">2 hours</option><option value="360">6 hours</option><option value="1440">24 hours</option></select></Field>
      <Field label={th ? 'วิธีขาย' : 'Sell method'}><select className="trade-control" value={draft.strategy} onChange={e => setDraft({ ...draft, strategy: e.target.value as 'list' | 'quick' })}><option value="quick">{th ? 'ขายทันที' : 'Quick sell'}</option><option value="list">{th ? 'ตั้งขาย' : 'List for sale'}</option></select></Field>
      <button className="nav-link nav-link-primary min-h-11 justify-center sm:col-span-2 lg:col-span-6" type="submit">{th ? 'ค้นหาโอกาส' : 'Find opportunities'}</button>
    </form>
    {query.data?.partial && <div className="state-card mt-5 flex items-center gap-3 text-left"><AlertTriangle className="h-5 w-5 text-amber-300" /><p>{th ? 'ข้อมูลบางรายการโหลดไม่สำเร็จ ผลลัพธ์ที่เหลือยังใช้งานได้' : 'Some market history was unavailable; the remaining results are still shown.'}</p></div>}
    {query.isFetching && !query.data && <div className="state-card mt-5"><RefreshCw className="mx-auto h-6 w-6 animate-spin text-primary" /><p>{th ? 'กำลังตรวจราคาล่าสุด…' : 'Screening recent prices…'}</p></div>}
    {query.isError && <div className="state-card mt-5"><h2>{th ? 'โหลดโอกาสไม่สำเร็จ' : 'Could not load opportunities'}</h2><button onClick={() => query.refetch()} className="nav-link nav-link-primary mt-3">{th ? 'ลองใหม่' : 'Try again'}</button></div>}
    {!query.isFetching && !query.isError && query.data?.items.length === 0 && <div className="state-card mt-5"><TrendingUp className="mx-auto h-7 w-7 text-primary" /><h2>{th ? 'ยังไม่พบรายการตามเงื่อนไข' : 'No matches for these filters'}</h2><p>{th ? 'ลองเพิ่มอายุข้อมูล ลดกำไรขั้นต่ำ หรือเลือกเมืองที่ถูกที่สุด' : 'Try a longer data age, lower minimum profit, or the cheapest origin.'}</p></div>}
    {!!query.data?.items.length && <section className="mt-5 grid gap-4 lg:grid-cols-2" aria-live="polite">{query.data.items.map(item => {
      const tone = item.confidence === 'high' ? 'confidence-high' : item.confidence === 'medium' ? 'confidence-medium' : 'confidence-low'
      return <article key={`${item.itemId}-${item.sourceCity}-${item.targetCity}`} className="market-item opportunity-card">
        <div className="flex items-start justify-between gap-3"><div><Link href={`/${locale}/item/${encodeURIComponent(item.itemId)}`} onClick={() => track('opportunity_open')} className="text-lg font-semibold hover:text-primary">{item.itemName}</Link><p className="font-mono text-xs text-muted-foreground">{item.itemId}</p></div><span className={`confidence-badge ${tone}`}>{item.confidence} confidence</span></div>
        <div className="mt-4 flex items-center gap-2 text-sm"><strong>{item.sourceCity}</strong><ArrowRight className="h-4 w-4 text-primary" /><strong>{item.targetCity}</strong><strong className={item.confidence === 'high' ? 'ml-auto text-emerald-400' : 'ml-auto text-amber-300'}>+{Math.round(item.netProfit).toLocaleString()} silver</strong></div>
        <dl className="opportunity-stats"><Stat label={th ? 'ลงทุน' : 'Investment'} value={item.investment.toLocaleString()} /><Stat label={th ? 'กำไร' : 'Margin'} value={`${item.margin.toFixed(1)}%`} /><Stat label={th ? 'ขาย/วัน' : 'Sold/day'} value={item.dailyVolume?.toLocaleString() ?? '—'} /><Stat label={th ? 'เมืองที่มีข้อมูล' : 'Coverage'} value={`${item.coverage}/8`} /></dl>
        <p className="mt-3 text-xs text-muted-foreground">{th ? 'ซื้อ' : 'Buy'} {item.quantity.toLocaleString()} × {item.buyPrice.toLocaleString()} · {th ? 'ขาย' : 'Sell'} {item.sellPrice.toLocaleString()} · {th ? 'ภาษีประมาณ' : 'Est. tax'} {Math.round(item.tax).toLocaleString()}</p>
        {item.staleReasons.length > 0 && <p className="mt-2 text-xs text-amber-300">{item.staleReasons.join(' · ')}</p>}
      </article>
    })}</section>}
    {query.data && <p className="mt-5 text-center text-xs text-muted-foreground">{th ? 'คำนวณเมื่อ' : 'Calculated'} {formatTime(query.data.generatedAt, locale)} · {th ? 'ราคาตั้งขายไม่รับประกันว่าจะขายได้' : 'A listing price does not guarantee a sale.'}</p>}
  </main>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-1 text-xs text-muted-foreground"><span>{label}</span>{children}</label> }
function Stat({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div> }
function formatTime(value: string, locale: 'th' | 'en') { return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: locale === 'th' ? 'Asia/Bangkok' : undefined }).format(new Date(value)) }
