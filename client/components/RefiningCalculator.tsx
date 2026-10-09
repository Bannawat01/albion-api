'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { itemApi } from '@/api'
import { estimateRefining, REFINING_RECIPE, REFINING_RESOURCES, refiningItemIds, returnRatePreset, type RefiningResource } from '@/lib/refining'
import { summarizeByCity } from '@/lib/priceSummary'

const ROYAL_CITIES = ['Bridgewatch', 'Martlock', 'Lymhurst', 'Fort Sterling', 'Thetford'] as const
const TIERS = [4, 5, 6, 7, 8] as const
const LABELS: Record<RefiningResource, { en: string; raw: string; th: string; rawTh: string }> = {
  METALBAR: { en: 'Metal Bar', raw: 'Ore', th: 'แท่งโลหะ', rawTh: 'แร่' },
  PLANKS: { en: 'Planks', raw: 'Logs', th: 'ไม้แปรรูป', rawTh: 'ท่อนไม้' },
  CLOTH: { en: 'Cloth', raw: 'Fiber', th: 'ผ้า', rawTh: 'เส้นใย' },
  LEATHER: { en: 'Leather', raw: 'Hide', th: 'หนัง', rawTh: 'หนังดิบ' },
  STONEBLOCK: { en: 'Stone Block', raw: 'Rock', th: 'บล็อกหิน', rawTh: 'หิน' },
}

export default function RefiningCalculator({ locale }: { locale: 'th' | 'en' }) {
  const th = locale === 'th'
  const [tier, setTier] = useState<number>(4)
  const [resourceId, setResourceId] = useState<RefiningResource>('METALBAR')
  const [city, setCity] = useState('')
  const [focus, setFocus] = useState(false)
  const [rawPrice, setRawPrice] = useState('')
  const [lowerTierPrice, setLowerTierPrice] = useState('')
  const [outputPrice, setOutputPrice] = useState('')
  const [stationFee, setStationFee] = useState('0')
  const [returnRateOverride, setReturnRateOverride] = useState<string | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [live, setLive] = useState<{ state: 'idle' | 'loading' | 'done' | 'error'; missing?: string[] }>({ state: 'idle' })
  const recipe = REFINING_RECIPE[tier]
  const label = LABELS[resourceId]
  const cityBonus = !!city && REFINING_RESOURCES[resourceId].city === city
  const presetRate = returnRatePreset(cityBonus, focus)
  const returnRate = returnRateOverride ?? String(presetRate)
  const result = rawPrice && lowerTierPrice && outputPrice && stationFee && returnRate && quantity
    ? estimateRefining({ tier, rawPrice: Number(rawPrice), lowerTierPrice: Number(lowerTierPrice), outputPrice: Number(outputPrice), stationFee: Number(stationFee), returnRate: Number(returnRate), quantity: Number(quantity), salesTax: 6.5 })
    : null
  const silver = (value: number) => Math.round(value).toLocaleString(th ? 'th-TH' : 'en-US')

  async function fillLivePrices() {
    if (!city) return
    setLive({ state: 'loading' })
    try {
      const ids = refiningItemIds(tier, resourceId)
      const response = await itemApi.getItemsPricesBatch([ids.raw, ids.lower, ids.output], city)
      const lowest = (id: string) => summarizeByCity(response?.data?.[id] ?? []).find(entry => entry.city === city)?.sellMin ?? null
      const found = { raw: lowest(ids.raw), lower: lowest(ids.lower), output: lowest(ids.output) }
      if (found.raw) setRawPrice(String(found.raw))
      if (found.lower) setLowerTierPrice(String(found.lower))
      if (found.output) setOutputPrice(String(found.output))
      setLive({ state: 'done', missing: (Object.entries(found) as [keyof typeof found, number | null][]).filter(([, value]) => !value).map(([key]) => ids[key]) })
    } catch { setLive({ state: 'error' }) }
  }

  return <div className="ledger-panel p-4 sm:p-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="space-y-1 text-sm text-muted-foreground"><span>{th ? 'Tier ที่จะรีไฟน์' : 'Tier to refine'}</span><select className="trade-control" value={tier} onChange={event => setTier(Number(event.target.value))}>{TIERS.map(value => <option key={value} value={value}>T{value}</option>)}</select></label>
      <label className="space-y-1 text-sm text-muted-foreground"><span>{th ? 'สินค้าที่จะรีไฟน์' : 'Refined item'}</span><select className="trade-control" value={resourceId} onChange={event => setResourceId(event.target.value as RefiningResource)}>{(Object.keys(LABELS) as RefiningResource[]).map(id => <option key={id} value={id}>T{tier} {th ? LABELS[id].th : LABELS[id].en}</option>)}</select></label>
      <label className="space-y-1 text-sm text-muted-foreground"><span>{th ? 'เมืองที่รีไฟน์' : 'Refining city'}</span><select className="trade-control" value={city} onChange={event => { setCity(event.target.value); setLive({ state: 'idle' }); setReturnRateOverride(null) }}><option value="">{th ? 'ไม่ระบุ (กรอกเอง)' : 'Not set (manual)'}</option>{ROYAL_CITIES.map(name => <option key={name} value={name}>{name}</option>)}</select></label>
      <label className="flex items-end gap-2 pb-2 text-sm text-muted-foreground"><input type="checkbox" className="h-4 w-4" checked={focus} onChange={event => { setFocus(event.target.checked); setReturnRateOverride(null) }} /><span>{th ? 'ใช้ Focus' : 'Use Focus'}</span></label>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button type="button" className="nav-link nav-link-primary" disabled={!city || live.state === 'loading'} onClick={fillLivePrices}><RefreshCw className={`h-4 w-4 ${live.state === 'loading' ? 'animate-spin' : ''}`} /> {th ? 'ดึงราคาล่าสุดของเมืองนี้' : 'Fill latest city prices'}</button>
      <span className="text-xs text-muted-foreground" aria-live="polite">
        {!city && (th ? 'เลือกเมืองก่อนเพื่อดึงราคา (ใช้ราคาตั้งขายต่ำสุดที่ผู้เล่นรายงาน แก้ไขได้)' : 'Pick a city to fill prices (lowest reported listing; editable).')}
        {live.state === 'done' && (live.missing?.length ? (th ? `ไม่มีราคาของ ${live.missing.join(', ')} ในเมืองนี้ กรุณากรอกเอง` : `No price reported for ${live.missing.join(', ')} here; enter it manually.`) : (th ? 'เติมราคาแล้ว ตรวจเวลาอัปเดตในเกมก่อนตัดสินใจ' : 'Prices filled. Verify in game before committing.'))}
        {live.state === 'error' && (th ? 'โหลดราคาไม่สำเร็จ ลองใหม่หรือกรอกเอง' : 'Could not load prices; try again or enter manually.')}
      </span>
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NumberField label={th ? `ราคา T${tier} ${label.rawTh} ต่อชิ้น (ใช้ ${recipe.raw} ชิ้น)` : `T${tier} ${label.raw} price each (uses ${recipe.raw})`} value={rawPrice} onChange={setRawPrice} />
      <NumberField label={th ? `ราคา T${tier - 1} ${label.th} ต่อชิ้น (ใช้ ${recipe.lower} ชิ้น)` : `T${tier - 1} ${label.en} price each (uses ${recipe.lower})`} value={lowerTierPrice} onChange={setLowerTierPrice} />
      <NumberField label={th ? `ราคาขาย T${tier} ${label.th} ต่อชิ้น` : `T${tier} ${label.en} sell price each`} value={outputPrice} onChange={setOutputPrice} />
      <NumberField label={th ? 'ค่าใช้สถานีต่อชิ้น (ดูในเกม)' : 'Station fee per item (from game)'} value={stationFee} onChange={setStationFee} />
      <NumberField label={th ? `อัตราคืนวัตถุดิบ % (ค่าแนะนำ ${presetRate}%)` : `Resource return rate % (preset ${presetRate}%)`} value={returnRate} onChange={setReturnRateOverride} max={99.99} />
      <NumberField label={th ? 'จำนวนที่จะรีไฟน์' : 'Items to refine'} value={quantity} onChange={setQuantity} min={1} step={1} />
    </div>
    <p className="mt-4 text-xs leading-6 text-muted-foreground">{th
      ? `สูตร T${tier}: วัตถุดิบดิบ ${recipe.raw} ชิ้น + วัตถุดิบแปรรูป T${tier - 1} ${recipe.lower} ชิ้น ต่อผลผลิต 1 ชิ้น ค่าแนะนำคืนวัตถุดิบ: ปกติ 15.2% · เมืองโบนัส 36.7% · ใช้ Focus 43.5% · เมืองโบนัส+Focus 53.9% ${cityBonus ? `(${city} มีโบนัสสำหรับสินค้านี้)` : city ? `(โบนัสสินค้านี้อยู่ที่ ${REFINING_RESOURCES[resourceId].city})` : ''} ค่าธรรมเนียมสถานีต้องกรอกเองจากเกม และอัตราคืนเป็นค่าเฉลี่ย ไม่ใช่จำนวนที่รับคืนแน่นอน`
      : `T${tier} recipe: ${recipe.raw} raw resources + ${recipe.lower} T${tier - 1} refined resource per output. Return presets: base 15.2% · city bonus 36.7% · Focus 43.5% · city bonus + Focus 53.9%. ${cityBonus ? `${city} has the bonus for this item. ` : city ? `This item's bonus city is ${REFINING_RESOURCES[resourceId].city}. ` : ''}Enter station fees from the game; returns are an average estimate, not a guaranteed item count.`}</p>
    {result ? <div className="mt-5 grid gap-3 border-t border-primary/15 pt-5 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
      <Metric label={th ? 'เงินที่ต้องเตรียมก่อนคืนวัตถุดิบ' : 'Upfront materials + fees'} value={silver(result.upfront)} />
      <Metric label={th ? 'ต้นทุนเฉลี่ยหลังคืนวัตถุดิบ' : 'Expected cost after returns'} value={silver(result.expectedCost)} />
      <Metric label={th ? 'รายรับหลังภาษีสมมติ 6.5%' : 'Revenue after assumed 6.5% tax'} value={silver(result.saleAfterTax)} />
      <Metric label={th ? 'กำไร/ขาดทุนประมาณ' : 'Estimated profit/loss'} value={`${result.profit >= 0 ? '+' : ''}${silver(result.profit)}`} />
    </div> : <p className="mt-5 border-t border-primary/15 pt-4 text-sm text-muted-foreground" aria-live="polite">{th ? 'กรอกราคาวัตถุดิบและราคาขายให้ครบ เพื่อดูต้นทุนและผลลัพธ์' : 'Enter all material and sale prices to see the estimate.'}</p>}
    <p className="mt-4 text-xs leading-6 text-amber-300">{th ? 'ไม่รวมค่าขนส่ง ค่า Focus และภาษีหรือค่าธรรมเนียมอื่น ราคาตั้งขายไม่รับประกันว่าจะขายได้ โปรดตรวจในเกมก่อนรีไฟน์' : 'Excludes transport, Focus cost and any other taxes or fees. A listing price does not guarantee a sale; check in game first.'}</p>
  </div>
}

function NumberField({ label, value, onChange, min = 0, max, step = 'any' }: { label: string; value: string; onChange: (value: string) => void; min?: number; max?: number; step?: number | string }) {
  return <label className="space-y-1 text-sm text-muted-foreground"><span>{label}</span><input className="trade-control" type="number" inputMode="decimal" min={min} max={max} step={step} value={value} onChange={event => onChange(event.target.value)} /></label>
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="min-w-0 border-l-2 border-primary/50 bg-background/40 px-3 py-3"><p className="text-xs text-muted-foreground">{label}</p><strong className="mt-1 block break-all text-lg text-primary">{value} <small className="text-xs font-normal">silver</small></strong></div> }
