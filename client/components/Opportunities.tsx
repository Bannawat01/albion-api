'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, ChevronDown, Clock3, RefreshCw, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { CITIES, ItemImage } from './ItemSearch'
import PrettySelect from './PrettySelect'
import { itemApi, type OpportunityFilters } from '@/api'
import { track } from '@/lib/analytics'
import { staleReasonLabel } from '@/lib/staleReasonLabel'

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
  const empty = query.data?.items.length === 0 ? emptyCopy(query.data.emptyReason, query.data.partial, th) : null

  return <main className="container mx-auto max-w-5xl px-4 py-6 sm:py-9" lang={locale}>
    <header className="mb-6"><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Asia Server · Player-reported data</p><h1 className="font-ledger mt-2 text-3xl font-bold text-gold-gradient sm:text-4xl">{th ? 'โอกาสซื้อขายวันนี้' : 'Daily Asia Opportunities'}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{th ? 'คัดจากสินค้า 50 รายการยอดนิยม เรียงความน่าเชื่อถือก่อนกำไรต่อชิ้น ราคาเป็นข้อมูลผู้เล่นรายงาน ภาษี 6.5% เป็นสมมติฐาน และไม่มีข้อมูลจำนวนออร์เดอร์ที่ขายอยู่จริง' : 'Screened from 50 popular items, prioritizing confidence over per-unit profit. Prices are player-reported, 6.5% tax is assumed, and live order depth is unknown.'}</p></header>
    <form onSubmit={apply} className="ledger-panel p-4 sm:p-5" aria-label={th ? 'ตัวกรองโอกาสซื้อขาย' : 'Opportunity filters'}>
      <div className="flex items-center gap-2 border-b border-primary/10 pb-3"><SlidersHorizontal className="h-4 w-4 text-primary" /><strong>{th ? 'เริ่มค้นหาแบบง่าย' : 'Quick search'}</strong><span className="ml-auto hidden text-[11px] text-muted-foreground sm:block">{th ? 'เลือกเพียง 2 อย่าง' : 'Only 2 choices'}</span></div>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <Field label={th ? '1. เงินทุนที่ต้องการใช้' : '1. Your budget'}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[50000, 100000, 500000].map(value => <button key={value} type="button" aria-pressed={draft.budget === value && !customBudget} onClick={() => { setCustomBudget(false); setDraft({ ...draft, budget: value }) }} className={`min-h-11 min-w-0 border px-2 text-sm font-semibold transition ${draft.budget === value && !customBudget ? 'border-primary bg-primary/20 text-primary' : 'border-border bg-background/40 text-muted-foreground hover:border-primary/40'}`}>{value / 1000}K</button>)}
            <button type="button" aria-pressed={customBudget} onClick={() => setCustomBudget(true)} className={`min-h-11 min-w-0 border px-2 text-xs font-semibold transition ${customBudget ? 'border-primary bg-primary/20 text-primary' : 'border-border bg-background/40 text-muted-foreground hover:border-primary/40'}`}>{th ? 'กำหนดเอง' : 'Custom'}</button>
          </div>
          {customBudget && <input autoFocus aria-label={th ? 'เงินลงทุนกำหนดเอง' : 'Custom budget'} className="trade-control mt-2" type="number" min="1" max="1000000000" value={draft.budget} onChange={event => setDraft({ ...draft, budget: Number(event.target.value) })} />}
        </Field>
        <Field label={th ? '2. ต้องการเริ่มซื้อจากเมืองไหน' : '2. Where do you want to buy?'}><PrettySelect label={th ? 'เมืองต้นทาง' : 'Origin'} value={draft.origin || ''} onChange={value => setDraft({ ...draft, origin: value || undefined })} options={[{ value: '', label: th ? 'ให้ระบบหาเมืองที่ถูกที่สุด' : 'Find the cheapest city' }, ...CITIES.filter(city => city !== 'Black Market').map(city => ({ value: city, label: city }))]} /></Field>
      </div>
      <details className="group mt-4 border-t border-primary/10 pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span>{th ? 'ตัวกรองขั้นสูง' : 'Advanced filters'}</span><ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /></summary>
        <div className="grid gap-4 pb-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={th ? 'กำไรรวมสมมติขั้นต่ำ' : 'Min theoretical total profit'}><input aria-label={th ? 'กำไรรวมสมมติขั้นต่ำ' : 'Minimum theoretical total profit'} className="trade-control" type="number" min="0" value={draft.minProfit} onChange={e => setDraft({ ...draft, minProfit: Number(e.target.value) })} /></Field>
          <Field label={th ? 'ขายต่อวันขั้นต่ำ' : 'Min daily volume'}><input aria-label={th ? 'ขายต่อวันขั้นต่ำ' : 'Minimum daily volume'} className="trade-control" type="number" min="0" value={draft.minVolume} onChange={e => setDraft({ ...draft, minVolume: Number(e.target.value) })} /></Field>
          <Field label={th ? 'อายุข้อมูลสูงสุด' : 'Max data age'}><PrettySelect label={th ? 'อายุข้อมูลสูงสุด' : 'Maximum data age'} value={String(draft.maxAgeMinutes)} onChange={value => setDraft({ ...draft, maxAgeMinutes: Number(value) })} options={[{ value: '30', label: th ? '30 นาที' : '30 minutes' }, { value: '120', label: th ? '2 ชั่วโมง' : '2 hours' }, { value: '360', label: th ? '6 ชั่วโมง' : '6 hours' }, { value: '1440', label: th ? '24 ชั่วโมง' : '24 hours' }]} /></Field>
          <Field label={th ? 'วิธีขาย' : 'Sell method'}><PrettySelect label={th ? 'วิธีขาย' : 'Sell method'} value={draft.strategy || 'list'} onChange={value => setDraft({ ...draft, strategy: value as 'list' | 'quick' })} options={[{ value: 'list', label: th ? 'ตั้งขาย' : 'List for sale' }, { value: 'quick', label: th ? 'ขายทันที' : 'Quick sell' }]} /></Field>
        </div>
      </details>
      <div className="mt-2 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-muted-foreground">{summary}<br />{th ? 'คำนวณหลังหักภาษีประมาณ 6.5%' : 'Estimated after 6.5% tax'}</p><button className="nav-link nav-link-primary min-h-12 w-full justify-center text-sm sm:w-auto sm:min-w-56" type="submit">{th ? 'ค้นหาโอกาสทำกำไร' : 'Find profitable trades'}</button></div>
    </form>
    {query.data?.partial && query.data.items.length > 0 && <div className="state-card mt-5 flex items-center gap-3 text-left"><AlertTriangle className="h-5 w-5 text-amber-300" /><p>{th ? 'ข้อมูลบางรายการโหลดไม่สำเร็จ ผลลัพธ์ที่เหลือยังใช้งานได้' : 'Some market history was unavailable; the remaining results are still shown.'}</p></div>}
    {query.isFetching && !query.data && <div className="state-card mt-5"><RefreshCw className="mx-auto h-6 w-6 animate-spin text-primary" /><p>{th ? 'กำลังตรวจราคาล่าสุด…' : 'Screening recent prices…'}</p></div>}
    {query.isError && <div className="state-card mt-5"><h2>{th ? 'โหลดโอกาสไม่สำเร็จ' : 'Could not load opportunities'}</h2><button onClick={() => query.refetch()} className="nav-link nav-link-primary mt-3">{th ? 'ลองใหม่' : 'Try again'}</button></div>}
    {!query.isFetching && !query.isError && empty && <div className="state-card mt-5"><TrendingUp className="mx-auto h-7 w-7 text-primary" /><h2>{empty.title}</h2><p>{empty.body}</p>{query.data && !query.data.partial && <p className="text-xs">{th ? `ตรวจ ${query.data.diagnostics.candidateItems} สินค้า · พบคู่เมืองที่มีราคาทันเวลา ${query.data.diagnostics.itemsWithFreshPair} รายการ` : `Checked ${query.data.diagnostics.candidateItems} items · ${query.data.diagnostics.itemsWithFreshPair} had timely prices in both cities`}</p>}{query.data?.partial ? <button type="button" onClick={() => void query.refetch()} className="nav-link nav-link-primary mt-4">{th ? 'ลองใหม่' : 'Try again'}</button> : filters.maxAgeMinutes !== 1440 ? <button type="button" onClick={includeOlderData} className="nav-link nav-link-primary mt-4">{th ? 'ลองดูข้อมูลไม่เกิน 24 ชั่วโมง' : 'Try data up to 24 hours old'}</button> : <button type="button" onClick={reset} className="nav-link mt-4">{th ? 'กลับไปใช้ค่าตั้งต้น' : 'Reset filters'}</button>}</div>}
    {!!query.data?.items.length && <p className="mt-5 text-sm text-muted-foreground">{th ? 'เรียงความน่าเชื่อถือก่อนส่วนต่างต่อชิ้น · ราคาและยอดขายเป็นรายงานจากผู้เล่น ไม่ใช่สต็อกที่ขายอยู่จริง' : 'Ranked by confidence before per-item spread · reported prices and sales are not live stock.'}</p>}
    {!!query.data?.items.length && <section className="mt-5 grid gap-4 lg:grid-cols-2" aria-live="polite">{query.data.items.map(item => {
      const tone = item.confidence === 'high' ? 'confidence-high' : item.confidence === 'medium' ? 'confidence-medium' : 'confidence-low'
      return <article key={`${item.itemId}-${item.sourceCity}-${item.targetCity}`} className="market-item opportunity-card">
        <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><ItemImage item={{ id: item.itemId, uniqueName: item.itemId, name: item.itemName }} priority={false} locale={locale} /><div className="min-w-0"><h2 className="text-lg font-semibold leading-snug">{item.itemName}</h2><p className="break-all font-mono text-xs text-muted-foreground">{item.itemId}</p></div></div><span className={`confidence-badge shrink-0 ${tone}`}>{th ? `ความน่าเชื่อถือ${item.confidence === 'high' ? 'สูง' : item.confidence === 'medium' ? 'ปานกลาง' : 'ต่ำ'}` : `${item.confidence} confidence`}</span></div>
        <p className="mt-3 border-l-2 border-primary/40 pl-3 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">{th ? 'เหตุผลที่จัดอันดับ: ' : 'Why this ranks here: '}</strong>{item.staleReasons.length ? item.staleReasons.map(reason => staleReasonLabel(reason, locale)).join(' · ') : item.dailyVolume == null ? (th ? 'ราคาทั้งสองฝั่งทันเวลา แต่ยังไม่มียอดขายย้อนหลัง' : 'Both prices are timely, but sales history is unavailable') : (th ? 'ราคาทั้งสองฝั่งทันเวลาและมีข้อมูลยอดขายย้อนหลัง' : 'Timely prices in both cities with reported sales history')}</p>
        {filters.maxAgeMinutes === 1440 && <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-300">{th ? 'ข้อมูลเก่า—ตรวจราคาในเกมก่อนเดินทาง' : 'Older data—verify in game before travelling'}</p>}
        <div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{th ? 'ส่วนต่างหลังภาษีต่อชิ้น (ยังไม่หักค่าเดินทาง)' : 'After-tax spread per item (before transport)'}</p><strong className={item.confidence === 'high' && filters.maxAgeMinutes !== 1440 ? 'text-2xl text-emerald-400' : 'text-2xl text-amber-300'}>+{Math.round(item.netProfit / item.quantity).toLocaleString()} <span className="text-sm">{th ? 'ซิลเวอร์/ชิ้น' : 'silver/item'}</span></strong></div><span className="text-sm font-semibold text-primary">{item.margin.toFixed(1)}%</span></div>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/10 bg-background/35 px-3 py-3 text-sm"><span>{th ? 'ซื้อที่' : 'Buy in'} <strong>{item.sourceCity}</strong></span><ArrowRight className="h-4 w-4 shrink-0 text-primary" /><span>{th ? 'ขายที่' : 'Sell in'} <strong>{item.targetCity}</strong></span></div>
        <dl className="opportunity-stats"><Stat label={th ? 'ราคาซื้อต่อชิ้น' : 'Buy/item'} value={item.buyPrice.toLocaleString()} /><Stat label={th ? 'ราคาขายต่อชิ้น' : 'Sell/item'} value={item.sellPrice.toLocaleString()} /><Stat label={th ? 'ขายย้อนหลัง/วัน' : 'Historical sales/day'} value={item.dailyVolume?.toLocaleString() ?? '—'} /><Stat label={th ? 'เมืองที่มีข้อมูล' : 'Coverage'} value={`${item.coverage}/8`} /></dl>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{th ? `ทุนที่กรอกซื้อได้สูงสุด ${item.quantity.toLocaleString()} ชิ้นตามราคาอ้างอิง แต่ไม่ทราบจำนวนที่มีขายจริง${item.dailyVolume == null ? ' และไม่มีข้อมูลยอดขายย้อนหลัง' : ''}` : `Your budget could cover up to ${item.quantity.toLocaleString()} items at the reported price, but actual stock is unknown${item.dailyVolume == null ? ' and historical sales are unavailable' : ''}.`}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{th ? 'ราคาซื้อ' : 'Buy price'} {formatAge(item.sourceUpdatedAt, locale)}</span><span>{th ? 'ราคาขาย' : 'Sell price'} {formatAge(item.targetUpdatedAt, locale)}</span></div>
        <Link href={`/${locale}/item/${encodeURIComponent(item.itemId)}`} onClick={() => track('opportunity_open')} className="nav-link mt-4 w-full justify-center border-primary/20">{th ? 'เปิดรายละเอียดสินค้า' : 'Open item details'}</Link>
      </article>
    })}</section>}
    {query.data && <p className="mt-5 text-center text-xs text-muted-foreground">{th ? 'คำนวณเมื่อ' : 'Calculated'} {formatTime(query.data.generatedAt, locale)} · {th ? 'ราคาตั้งขายไม่รับประกันว่าจะขายได้' : 'A listing price does not guarantee a sale.'}</p>}
  </main>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="min-w-0 space-y-1 text-xs text-muted-foreground"><span>{label}</span>{children}</div> }
function Stat({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div> }
function formatTime(value: string, locale: 'th' | 'en') { return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: locale === 'th' ? 'Asia/Bangkok' : undefined }).format(new Date(value)) }
function formatAge(value: string, locale: 'th' | 'en') { const utc = /(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value}Z`; const minutes = Math.max(0, Math.round((Date.now() - new Date(utc).getTime()) / 60_000)); return locale === 'th' ? `${minutes < 60 ? minutes : Math.round(minutes / 60)} ${minutes < 60 ? 'นาที' : 'ชม.'}ก่อน` : `${minutes < 60 ? minutes + 'm' : Math.round(minutes / 60) + 'h'} ago` }
function emptyCopy(reason: string | null, partial: boolean, th: boolean) {
  if (partial) return th ? { title: 'ข้อมูลตลาดโหลดมาไม่ครบ', body: 'ยังสรุปไม่ได้ว่าไม่มีโอกาส โปรดลองใหม่อีกครั้ง' } : { title: 'Market data loaded only partially', body: 'This is not a confirmed empty result. Please try again.' }
  if (reason === 'no_fresh_source' || reason === 'no_fresh_pair') return th ? { title: 'ข้อมูลราคา Asia ยังไม่สดพอ', body: 'ยังไม่มีราคาซื้อและขายที่อัปเดตในช่วงเวลาที่เลือก ลองดูข้อมูลไม่เกิน 24 ชั่วโมง และตรวจราคาในเกมก่อนซื้อ' } : { title: 'Asia prices are not fresh enough', body: 'No buy-and-sell price pair is recent enough for this range. Try up to 24 hours of data and verify in game.' }
  if (reason === 'over_budget') return th ? { title: 'เงินทุนยังไม่พอสำหรับรายการที่พบ', body: 'ลองเพิ่มเงินทุนหรือเปลี่ยนเมืองต้นทาง แล้วค้นหาอีกครั้ง' } : { title: 'The available items exceed your budget', body: 'Try a higher budget or another origin city.' }
  return th ? { title: 'ไม่มีรายการผ่านเงื่อนไข', body: 'ข้อมูลโหลดครบแล้ว แต่ยังไม่มีเส้นทางที่ผ่านเงื่อนไขกำไรหรือยอดขาย ลองปรับตัวกรองและตรวจราคาในเกม' } : { title: 'No trades match these filters', body: 'Market data loaded, but no route meets the profit or sales conditions. Adjust filters and verify in game.' }
}
