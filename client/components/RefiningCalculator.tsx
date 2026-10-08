'use client'

import { useState } from 'react'
import { estimateT4Refining } from '@/lib/refining'

// shortcut: T4 uses manual city prices and fees; expand tiers when a verified station-fee source exists.
const resources = [
  { id: 'METALBAR', en: 'Steel Bar', raw: 'Iron Ore', lower: 'Bronze Bar', th: 'แท่งเหล็ก' },
  { id: 'PLANKS', en: 'Pine Planks', raw: 'Pine Logs', lower: 'Chestnut Planks', th: 'ไม้แปรรูป' },
  { id: 'CLOTH', en: 'Fine Cloth', raw: 'Flax', lower: 'Neat Cloth', th: 'ผ้า' },
  { id: 'LEATHER', en: 'Worked Leather', raw: 'Medium Hide', lower: 'Stiff Leather', th: 'หนัง' },
  { id: 'STONEBLOCK', en: 'Travertine Block', raw: 'Travertine', lower: 'Sandstone Block', th: 'บล็อกหิน' },
] as const

export default function RefiningCalculator({ locale }: { locale: 'th' | 'en' }) {
  const th = locale === 'th'
  const [resourceId, setResourceId] = useState<(typeof resources)[number]['id']>('METALBAR')
  const [rawPrice, setRawPrice] = useState('')
  const [lowerTierPrice, setLowerTierPrice] = useState('')
  const [outputPrice, setOutputPrice] = useState('')
  const [stationFee, setStationFee] = useState('0')
  const [returnRate, setReturnRate] = useState('0')
  const [quantity, setQuantity] = useState('1')
  const resource = resources.find(item => item.id === resourceId)!
  const result = rawPrice && lowerTierPrice && outputPrice && stationFee && returnRate && quantity
    ? estimateT4Refining({ rawPrice: Number(rawPrice), lowerTierPrice: Number(lowerTierPrice), outputPrice: Number(outputPrice), stationFee: Number(stationFee), returnRate: Number(returnRate), quantity: Number(quantity), salesTax: 6.5 })
    : null
  const silver = (value: number) => Math.round(value).toLocaleString(th ? 'th-TH' : 'en-US')

  return <div className="ledger-panel p-4 sm:p-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="space-y-1 text-sm text-muted-foreground"><span>{th ? 'สินค้าที่จะรีไฟน์' : 'Refined item'}</span><select className="trade-control" value={resourceId} onChange={event => setResourceId(event.target.value as typeof resourceId)}>{resources.map(item => <option key={item.id} value={item.id}>T4 {item.en}</option>)}</select></label>
      <NumberField label={th ? `ราคา T4 ${resource.raw} ต่อชิ้น` : `T4 ${resource.raw} price each`} value={rawPrice} onChange={setRawPrice} />
      <NumberField label={th ? `ราคา T3 ${resource.lower} ต่อชิ้น` : `T3 ${resource.lower} price each`} value={lowerTierPrice} onChange={setLowerTierPrice} />
      <NumberField label={th ? `ราคาขาย T4 ${resource.en} ต่อชิ้น` : `T4 ${resource.en} sell price each`} value={outputPrice} onChange={setOutputPrice} />
      <NumberField label={th ? 'ค่าใช้สถานีต่อชิ้น (ดูในเกม)' : 'Station fee per item (from game)'} value={stationFee} onChange={setStationFee} />
      <NumberField label={th ? 'อัตราคืนวัตถุดิบ % (ดูในเกม)' : 'Resource return rate % (from game)'} value={returnRate} onChange={setReturnRate} max={99.99} />
      <NumberField label={th ? 'จำนวนที่จะรีไฟน์' : 'Items to refine'} value={quantity} onChange={setQuantity} min={1} step={1} />
    </div>
    <p className="mt-4 text-xs leading-6 text-muted-foreground">{th ? 'สูตร T4: วัตถุดิบดิบ 2 ชิ้น + วัตถุดิบแปรรูป T3 1 ชิ้น ต่อผลผลิต 1 ชิ้น ราคาและค่าธรรมเนียมแต่ละเมืองต้องกรอกเองจากหน้าจอในเกม อัตราคืนวัตถุดิบคำนวณเป็นค่าเฉลี่ย ไม่ใช่จำนวนที่รับคืนแน่นอน' : 'T4 recipe: 2 raw resources + 1 T3 refined resource per output. Enter city prices and station fees from the game. Returns are an average estimate, not a guaranteed item count.'}</p>
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
