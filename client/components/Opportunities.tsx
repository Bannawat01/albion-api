'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, ChevronDown, Clock3, RefreshCw, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { CITIES } from './ItemSearch'
import PrettySelect from './PrettySelect'
import { itemApi, type OpportunityFilters } from '@/api'
import { track } from '@/lib/analytics'

export default function Opportunities({ locale }: { locale: 'th' | 'en' }) {
  const th = locale === 'th'
  const defaults: OpportunityFilters = { budget: 100000, minProfit: 0, minVolume: 0, maxAgeMinutes: 120, strategy: 'list', limit: 10 }
  const [draft, setDraft] = useState<OpportunityFilters>(defaults)
  const [filters, setFilters] = useState(draft)
  const [customBudget, setCustomBudget] = useState(false)
  const query = useQuery({ queryKey: ['opportunities', filters], queryFn: ({ signal }) => itemApi.getOpportunities(filters, signal), staleTime: 5 * 60 * 1000 })
  useEffect(() => { track('opportunities_view') }, [])
  const apply = (event: React.FormEvent) => { event.preventDefault(); setFilters({ ...draft }); track('opportunity_filter') }

  const reset = () => { setCustomBudget(false); setDraft(defaults); setFilters(defaults) }
  const includeOlderData = () => { const next = { ...draft, maxAgeMinutes: 1440 }; setDraft(next); setFilters(next); track('opportunity_filter') }
  const summary = th
    ? `ลงทุนไม่เกิน ${(draft.budget || 0).toLocaleString()} • ${draft.origin || 'ทุกเมือง'} • ${draft.strategy === 'quick' ? 'ขายทันที' : 'ตั้งขาย'} • ข้อมูลไม่เกิน ${draft.maxAgeMinutes === 1440 ? '24 ชม.' : draft.maxAgeMinutes === 360 ? '6 ชม.' : draft.maxAgeMinutes === 30 ? '30 นาที' : '2 ชม.'}`
    : `Up to ${(draft.budget || 0).toLocaleString()} • ${draft.origin || 'all cities'} • ${draft.strategy === 'quick' ? 'quick sell' : 'list for sale'} • data within ${draft.maxAgeMinutes === 1440 ? '24h' : draft.maxAgeMinutes === 360 ? '6h' : draft.maxAgeMinutes === 30 ? '30m' : '2h'}`

  return <main className="container mx-auto max-w-5xl px-4 py-6 sm:py-9" lang={locale}>
    <header className="mb-6"><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Asia Server · Player-reported data</p><h1 className="font-ledger mt-2 text-3xl font-bold text-gold-gradient sm:text-4xl">{th ? 'โอกาสซื้อขายวันนี้' : 'Daily Asia Opportunities'}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{th ? 'คัดจากสินค้า 50 รายการยอดนิยม โดยดูราคา ความสด ปริมาณขาย และกำไรหลังภาษี 6.5% โปรดตรวจราคาในเกมก่อนซื้อเสมอ' : 'Screened from 50 popular items using price freshness, sales volume, and profit after 6.5% tax. Always verify in game before buying.'}</p></header>
    <form onSubmit={apply} className="rounded-2xl border border-primary/20 bg-card/90 p-4 shadow-xl shadow-black/15 sm:p-5" aria-label={th ? 'ตัวกรองโอกาสซื้อขาย' : 'Opportunity filters'}>
      <div className="flex items-center gap-2 border-b border-primary/10 pb-3"><SlidersHorizontal className="h-4 w-4 text-primary" /><strong>{th ? 'เริ่มค้นหาแบบง่าย' : 'Quick search'}</strong><span className="ml-auto hidden text-[11px] text-muted-foreground sm:block">{th ? 'เลือกเพียง 2 อย่าง' : 'Only 2 choices'}</span></div>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <Field label={th ? '1. เงินทุนที่ต้องการใช้' : '1. Your budget'}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[50000, 100000, 500000].map(value => <button key={value} type="button" aria-pressed={draft.budget === value && !customBudget} onClick={() => { setCustomBudget(false); setDraft({ ...draft, budget: value }) }} className={`min-h-11 min-w-0 rounded-lg border px-2 text-sm font-semibold transition ${draft.budget === value && !customBudget ? 'border-primary bg-primary/20 text-primary' : 'border-border bg-background/40 text-muted-foreground hover:border-primary/40'}`}>{value / 1000}K</button>)}
            <button type="button" aria-pressed={customBudget} onClick={() => setCustomBudget(true)} className={`min-h-11 min-w-0 rounded-lg border px-2 text-xs font-semibold transition ${customBudget ? 'border-primary bg-primary/20 text-primary' : 'border-border bg-background/40 text-muted-foreground hover:border-primary/40'}`}>{th ? 'กำหนดเอง' : 'Custom'}</button>
          </div>
          {customBudget && <input autoFocus aria-label={th ? 'เงินลงทุนกำหนดเอง' : 'Custom budget'} className="trade-control mt-2" type="number" min="1" max="1000000000" value={draft.budget} onChange={event => setDraft({ ...draft, budget: Number(event.target.value) })} />}
        </Field>
        <Field label={th ? '2. ต้องการเริ่มซื้อจากเมืองไหน' : '2. Where do you want to buy?'}><PrettySelect label={th ? 'เมืองต้นทาง' : 'Origin'} value={draft.origin || ''} onChange={value => setDraft({ ...draft, origin: value || undefined })} options={[{ value: '', label: th ? 'ให้ระบบหาเมืองที่ถูกที่สุด' : 'Find the cheapest city' }, ...CITIES.filter(city => city !== 'Black Market').map(city => ({ value: city, label: city }))]} /></Field>
      </div>
      <details className="group mt-4 border-t border-primary/10 pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />{th ? 'ตัวกรองขั้นสูง' : 'Advanced filters'}<span className="ml-auto hidden text-[11px] font-normal sm:block">{th ? 'สำหรับผู้เล่นที่ต้องการปรับละเอียด' : 'Optional'}</span></summary>
        <div className="grid gap-4 pb-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={th ? 'กำไรขั้นต่ำ' : 'Min profit'}><input aria-label={th ? 'กำไรขั้นต่ำ' : 'Minimum profit'} className="trade-control" type="number" min="0" value={draft.minProfit} onChange={e => setDraft({ ...draft, minProfit: Number(e.target.value) })} /></Field>
          <Field label={th ? 'ขายต่อวันขั้นต่ำ' : 'Min daily volume'}><input aria-label={th ? 'ขายต่อวันขั้นต่ำ' : 'Minimum daily volume'} className="trade-control" type="number" min="0" value={draft.minVolume} onChange={e => setDraft({ ...draft, minVolume: Number(e.target.value) })} /></Field>
          <Field label={th ? 'อายุข้อมูลสูงสุด' : 'Max data age'}><PrettySelect label={th ? 'อายุข้อมูลสูงสุด' : 'Maximum data age'} value={String(draft.maxAgeMinutes)} onChange={value => setDraft({ ...draft, maxAgeMinutes: Number(value) })} options={[{ value: '30', label: th ? '30 นาที' : '30 minutes' }, { value: '120', label: th ? '2 ชั่วโมง' : '2 hours' }, { value: '360', label: th ? '6 ชั่วโมง' : '6 hours' }, { value: '1440', label: th ? '24 ชั่วโมง' : '24 hours' }]} /></Field>
          <Field label={th ? 'วิธีขาย' : 'Sell method'}><PrettySelect label={th ? 'วิธีขาย' : 'Sell method'} value={draft.strategy || 'list'} onChange={value => setDraft({ ...draft, strategy: value as 'list' | 'quick' })} options={[{ value: 'list', label: th ? 'ตั้งขาย' : 'List for sale' }, { value: 'quick', label: th ? 'ขายทันที' : 'Quick sell' }]} /></Field>
        </div>
      </details>
      <div className="mt-2 flex flex-col gap-3 rounded-xl border border-primary/10 bg-background/30 p-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-muted-foreground">{summary}<br />{th ? 'คำนวณหลังหักภาษีประมาณ 6.5%' : 'Estimated after 6.5% tax'}</p><button className="nav-link nav-link-primary min-h-12 w-full justify-center text-sm sm:w-auto sm:min-w-56" type="submit">{th ? 'ค้นหาโอกาสทำกำไร' : 'Find profitable trades'}</button></div>
    </form>
    {query.data?.partial && <div className="state-card mt-5 flex items-center gap-3 text-left"><AlertTriangle className="h-5 w-5 text-amber-300" /><p>{th ? 'ข้อมูลบางรายการโหลดไม่สำเร็จ ผลลัพธ์ที่เหลือยังใช้งานได้' : 'Some market history was unavailable; the remaining results are still shown.'}</p></div>}
    {query.isFetching && !query.data && <div className="state-card mt-5"><RefreshCw className="mx-auto h-6 w-6 animate-spin text-primary" /><p>{th ? 'กำลังตรวจราคาล่าสุด…' : 'Screening recent prices…'}</p></div>}
    {query.isError && <div className="state-card mt-5"><h2>{th ? 'โหลดโอกาสไม่สำเร็จ' : 'Could not load opportunities'}</h2><button onClick={() => query.refetch()} className="nav-link nav-link-primary mt-3">{th ? 'ลองใหม่' : 'Try again'}</button></div>}
    {!query.isFetching && !query.isError && query.data?.items.length === 0 && <div className="state-card mt-5"><TrendingUp className="mx-auto h-7 w-7 text-primary" /><h2>{query.data.partial ? (th ? 'ข้อมูลตลาดโหลดมาไม่ครบ' : 'Market data loaded only partially') : (th ? 'ยังไม่พบโอกาสจากข้อมูลช่วงนี้' : 'No opportunities in this time range')}</h2><p>{query.data.partial ? (th ? 'ยังสรุปไม่ได้ว่าไม่มีโอกาส โปรดลองโหลดใหม่อีกครั้ง' : 'This is not a confirmed empty result. Please try loading again.') : (th ? 'คุณไม่ได้กรอกผิด แต่อาจยังไม่มีผู้เล่นส่งราคา Asia ที่สดพอ ลองดูข้อมูลเก่าขึ้นและตรวจราคาในเกมอีกครั้ง' : 'Your filters are valid, but recent Asia data may be limited. Try older data and verify prices in game.')}</p>{query.data.partial ? <button type="button" onClick={() => void query.refetch()} className="nav-link nav-link-primary mt-4">{th ? 'ลองใหม่' : 'Try again'}</button> : filters.maxAgeMinutes !== 1440 ? <button type="button" onClick={includeOlderData} className="nav-link nav-link-primary mt-4">{th ? 'ลองดูข้อมูลไม่เกิน 24 ชั่วโมง' : 'Try data up to 24 hours old'}</button> : <button type="button" onClick={reset} className="nav-link mt-4">{th ? 'กลับไปใช้ค่าตั้งต้น' : 'Reset filters'}</button>}</div>}
    {!!query.data?.items.length && <section className="mt-5 grid gap-4 lg:grid-cols-2" aria-live="polite">{query.data.items.map(item => {
      const tone = item.confidence === 'high' ? 'confidence-high' : item.confidence === 'medium' ? 'confidence-medium' : 'confidence-low'
      return <article key={`${item.itemId}-${item.sourceCity}-${item.targetCity}`} className="market-item opportunity-card">
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{item.itemName}</h2><p className="font-mono text-xs text-muted-foreground">{item.itemId}</p></div><span className={`confidence-badge ${tone}`}>{th ? `ความน่าเชื่อถือ${item.confidence === 'high' ? 'สูง' : item.confidence === 'medium' ? 'ปานกลาง' : 'ต่ำ'}` : `${item.confidence} confidence`}</span></div>
        {filters.maxAgeMinutes === 1440 && <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-300">{th ? 'ข้อมูลเก่า—ตรวจราคาในเกมก่อนเดินทาง' : 'Older data—verify in game before travelling'}</p>}
        <div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{th ? 'กำไรสุทธิประมาณ' : 'Estimated net profit'}</p><strong className={item.confidence === 'high' && filters.maxAgeMinutes !== 1440 ? 'text-2xl text-emerald-400' : 'text-2xl text-amber-300'}>+{Math.round(item.netProfit).toLocaleString()} <span className="text-sm">{th ? 'ซิลเวอร์' : 'silver'}</span></strong></div><span className="text-sm font-semibold text-primary">{item.margin.toFixed(1)}%</span></div>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/10 bg-background/35 px-3 py-3 text-sm"><span>{th ? 'ซื้อที่' : 'Buy in'} <strong>{item.sourceCity}</strong></span><ArrowRight className="h-4 w-4 shrink-0 text-primary" /><span>{th ? 'ขายที่' : 'Sell in'} <strong>{item.targetCity}</strong></span></div>
        <dl className="opportunity-stats"><Stat label={th ? 'เงินลงทุน' : 'Investment'} value={item.investment.toLocaleString()} /><Stat label={th ? 'จำนวน' : 'Quantity'} value={`${item.quantity.toLocaleString()} ${th ? 'ชิ้น' : 'items'}`} /><Stat label={th ? 'ขาย/วัน' : 'Sold/day'} value={item.dailyVolume?.toLocaleString() ?? '—'} /><Stat label={th ? 'เมืองที่มีข้อมูล' : 'Coverage'} value={`${item.coverage}/8`} /></dl>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{th ? 'ราคาซื้อ' : 'Buy price'} {formatAge(item.sourceUpdatedAt, locale)}</span><span>{th ? 'ราคาขาย' : 'Sell price'} {formatAge(item.targetUpdatedAt, locale)}</span></div>
        {item.staleReasons.length > 0 && <p className="mt-2 text-xs text-amber-300">{item.staleReasons.join(' · ')}</p>}
        <Link href={`/${locale}/item/${encodeURIComponent(item.itemId)}`} onClick={() => track('opportunity_open')} className="nav-link mt-4 w-full justify-center border-primary/20">{th ? 'เปิดรายละเอียดสินค้า' : 'Open item details'}</Link>
      </article>
    })}</section>}
    {query.data && <p className="mt-5 text-center text-xs text-muted-foreground">{th ? 'คำนวณเมื่อ' : 'Calculated'} {formatTime(query.data.generatedAt, locale)} · {th ? 'ราคาตั้งขายไม่รับประกันว่าจะขายได้' : 'A listing price does not guarantee a sale.'}</p>}
  </main>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="min-w-0 space-y-1 text-xs text-muted-foreground"><span>{label}</span>{children}</div> }
function Stat({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div> }
function formatTime(value: string, locale: 'th' | 'en') { return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: locale === 'th' ? 'Asia/Bangkok' : undefined }).format(new Date(value)) }
function formatAge(value: string, locale: 'th' | 'en') { const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000)); return locale === 'th' ? `${minutes < 60 ? minutes : Math.round(minutes / 60)} ${minutes < 60 ? 'นาที' : 'ชม.'}ก่อน` : `${minutes < 60 ? minutes + 'm' : Math.round(minutes / 60) + 'h'} ago` }
