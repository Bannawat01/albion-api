import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ItemSearch from '@/components/ItemSearch'
import { API_BASE_URL } from '@/api/config'
import { alternateLanguages, breadcrumbJsonLd, isLocale, itemGroup, jsonLdScript, POPULAR_ITEM_NAMES, type Locale } from '@/lib/seo'
import { bestCities, formatUtc, summarizeByCity } from '@/lib/priceSummary'

async function getItem(id: string) {
  if (POPULAR_ITEM_NAMES[id]) return { name: POPULAR_ITEM_NAMES[id] }
  try { const response = await fetch(`${API_BASE_URL}/api/item/${encodeURIComponent(id)}`, { next: { revalidate: 86400 } }); return response.ok ? await response.json() as { name: string } : null } catch { return null }
}
// Server-rendered so crawlers (and AI answer engines) see real prices in the first HTML response.
async function getPrices(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/item/price?id=${encodeURIComponent(id)}`, { next: { revalidate: 300 } })
    if (!response.ok) return []
    const json = await response.json() as { data?: unknown[] }
    return Array.isArray(json.data) ? json.data : []
  } catch { return [] }
}
const GROUP_LABEL = {
  th: { bag: 'กระเป๋า', cape: 'ผ้าคลุม', mount: 'สัตว์ขี่', potion: 'น้ำยา', weapon: 'อาวุธ', armor: 'ชุดเกราะ', material: 'วัตถุดิบ' },
  en: { bag: 'bag', cape: 'cape', mount: 'mount', potion: 'potion', weapon: 'weapon', armor: 'armor piece', material: 'material' },
} as const
function itemContext(id: string, name: string, locale: Locale, known: boolean) {
  const tier = id.match(/^T(\d+)_/)?.[1]
  if (!known && !tier) return locale === 'th'
    ? `เปรียบเทียบราคา ${name} ที่ผู้เล่นรายงานในแต่ละเมือง ดูเวลาของราคาตั้งขายและคำสั่งซื้อก่อนซื้อขาย`
    : `Compare player-reported ${name} prices by city. Check listing and buy order timestamps before trading.`
  const group = GROUP_LABEL[locale][itemGroup(id)]
  return locale === 'th'
    ? `${name} เป็น${group} Tier ${tier} ที่ผู้เล่นมักเทียบราคาก่อนซื้อหรือขาย ดูราคาตั้งขายต่ำสุดและคำสั่งซื้อสูงสุดแยกตามเมือง พร้อมเวลาอัปเดตของแต่ละฝั่ง`
    : `Compare ${name}, a Tier ${tier} ${group}, across Asia city markets. Check separate listing and buy order update times before trading.`
}
export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id: raw } = await params
  if (!isLocale(locale)) return {}
  const id = decodeURIComponent(raw).replace(/[^A-Za-z0-9_@]/g, '')
  const name = (await getItem(id))?.name || id.replaceAll('_', ' ')
  const title = locale === 'th' ? `ราคา ${name} ทุกเมือง – Albion Online Asia` : `${name} Prices in Every City – Albion Online Asia`
  const description = locale === 'th' ? `เช็คราคา ${name} บน Albion Online Asia ทุกเมือง ดูเวลาอัปเดตและเส้นทางซื้อขาย` : `Compare ${name} prices, update times, and trade routes across Albion Online Asia.`
  return { title, description, alternates: { canonical: `/${locale}/item/${encodeURIComponent(id)}`, languages: alternateLanguages(`/item/${encodeURIComponent(id)}`) } }
}
export default async function LocalizedItemPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id: raw } = await params
  if (!isLocale(locale)) notFound()
  const id = decodeURIComponent(raw).replace(/[^A-Za-z0-9_@]/g, '')
  const [item, rows] = await Promise.all([getItem(id), getPrices(id)])
  const name = item?.name || id.replaceAll('_', ' ')
  const th = locale === 'th'
  const summary = summarizeByCity(rows)
  const { cheapest, topBuyer } = bestCities(summary)
  const silver = (value: number) => value.toLocaleString(th ? 'th-TH' : 'en-US')
  const tldr = cheapest || topBuyer
    ? th
      ? `สรุปด่วน: ${name} ราคาตั้งขายต่ำสุดที่รายงานล่าสุด${cheapest ? ` ${silver(cheapest.sellMin!)} Silver ที่ ${cheapest.city}` : 'ยังไม่มีข้อมูล'}${topBuyer ? ` และคำสั่งซื้อสูงสุด ${silver(topBuyer.buyMax!)} Silver ที่ ${topBuyer.city}` : ''} (ข้อมูลผู้เล่นจาก AODP ไม่ใช่ราคาสดในเกม)`
      : `Quick answer: the lowest reported listing for ${name} is${cheapest ? ` ${silver(cheapest.sellMin!)} Silver in ${cheapest.city}` : ' not available'}${topBuyer ? `, and the highest buy order is ${silver(topBuyer.buyMax!)} Silver in ${topBuyer.city}` : ''} (player-reported AODP data, not live in-game prices).`
    : null
  const crumbs = breadcrumbJsonLd([
    { name: 'Albion Market Ledger', path: `/${locale}` },
    { name: th ? 'ราคาสินค้า' : 'Item prices', path: `/${locale}` },
    { name, path: `/${locale}/item/${encodeURIComponent(id)}` },
  ])
  return <main className="container mx-auto max-w-5xl px-4 py-8" lang={locale}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(crumbs) }} />
    <header className="mb-6"><p className="text-xs uppercase tracking-[.22em] text-primary">Albion Online Asia Market</p><h1 className="font-ledger mt-2 text-3xl font-bold text-gold-gradient">{th ? `ราคา ${name} ทุกเมือง` : `${name} prices in every city`}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{itemContext(id, name, locale, !!POPULAR_ITEM_NAMES[id])}</p>{tldr && <p className="mt-3 border-l-2 border-primary/40 pl-3 text-sm leading-6">{tldr}</p>}</header>
    {summary.length > 0 && <section className="ledger-panel mb-6 overflow-x-auto p-4 sm:p-6" aria-label={th ? 'ตารางราคาแต่ละเมือง' : 'Price table by city'}>
      <table className="w-full min-w-[34rem] text-left text-sm"><caption className="mb-3 text-left text-xs text-muted-foreground">{th ? 'ราคาที่ผู้เล่นรายงานล่าสุด (Silver) ตรวจเวลาอัปเดตก่อนซื้อขายเสมอ' : 'Latest player-reported prices (Silver). Always check the update time before trading.'}</caption>
        <thead className="text-xs text-muted-foreground"><tr><th className="py-2 pr-3 font-medium">{th ? 'เมือง' : 'City'}</th><th className="py-2 pr-3 font-medium">{th ? 'ราคาตั้งขายต่ำสุด' : 'Lowest sell'}</th><th className="py-2 pr-3 font-medium">{th ? 'อัปเดต' : 'Updated'}</th><th className="py-2 pr-3 font-medium">{th ? 'คำสั่งซื้อสูงสุด' : 'Highest buy order'}</th><th className="py-2 font-medium">{th ? 'อัปเดต' : 'Updated'}</th></tr></thead>
        <tbody>{summary.map(entry => <tr key={entry.city} className="border-t border-border"><th scope="row" className="py-2 pr-3 font-medium">{entry.city}</th><td className="py-2 pr-3">{entry.sellMin ? silver(entry.sellMin) : '—'}</td><td className="py-2 pr-3 text-xs text-muted-foreground">{formatUtc(entry.sellUpdatedAt)}</td><td className="py-2 pr-3">{entry.buyMax ? silver(entry.buyMax) : '—'}</td><td className="py-2 text-xs text-muted-foreground">{formatUtc(entry.buyUpdatedAt)}</td></tr>)}</tbody>
      </table>
    </section>}
    <section className="ledger-panel p-4 sm:p-6"><ItemSearch initialQuery={id} locale={locale} /></section>
    <nav className="mt-6 flex flex-wrap gap-3" aria-label={th ? 'อ่านเพิ่มเติมและค้นหาสินค้า' : 'More guides and item search'}><Link className="nav-link" href={`/${locale}?q=${encodeURIComponent(name)}`}>{th ? 'ค้นหาราคาสินค้าอื่น' : 'Search more item prices'}</Link><Link className="nav-link" href={`/${locale}/guides/market-price-freshness`}>{th ? 'วิธีอ่านราคาและเวลาอัปเดต' : 'How to read prices and timestamps'}</Link><Link className="nav-link" href={`/${locale}/guides/trade-route-profit-tax`}>{th ? 'วิธีคำนวณกำไรเส้นทาง' : 'Calculate trade route profit'}</Link></nav>
  </main>
}
