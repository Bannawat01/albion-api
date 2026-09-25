import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ItemSearch from '@/components/ItemSearch'
import { API_BASE_URL } from '@/api/config'
import { alternateLanguages, isLocale, POPULAR_ITEM_NAMES } from '@/lib/seo'

async function getItem(id: string) {
  if (POPULAR_ITEM_NAMES[id]) return { name: POPULAR_ITEM_NAMES[id] }
  try { const response = await fetch(`${API_BASE_URL}/api/item/${encodeURIComponent(id)}`, { next: { revalidate: 86400 } }); return response.ok ? await response.json() as { name: string } : null } catch { return null }
}
function itemContext(id: string, name: string, locale: 'th' | 'en') {
  if (!POPULAR_ITEM_NAMES[id]) return locale === 'th'
    ? `เปรียบเทียบราคา ${name} ที่ผู้เล่นรายงานในแต่ละเมือง ดูเวลาของราคาตั้งขายและคำสั่งซื้อก่อนซื้อขาย`
    : `Compare player-reported ${name} prices by city. Check listing and buy order timestamps before trading.`
  const tier = id.match(/^T(\d+)_/)?.[1]
  const group = id.includes('_BAG') ? 'bag' : id.includes('_CAPE') ? 'cape' : 'material'
  if (locale === 'th') return group === 'bag'
    ? `${name} เป็นกระเป๋า Tier ${tier} ที่ผู้เล่นมักเทียบราคาก่อนซื้อหรือขาย ดูราคาตั้งขายต่ำสุดและคำสั่งซื้อสูงสุดแยกตามเมือง พร้อมเวลาอัปเดตของแต่ละฝั่ง`
    : group === 'cape' ? `${name} เป็นผ้าคลุม Tier ${tier} ที่อาจมีราคาต่างกันตามเมือง ตรวจทั้งราคาตั้งขาย คำสั่งซื้อ และอายุข้อมูลก่อนวางแผนขนส่ง`
      : `${name} เป็นวัตถุดิบแปรรูป Tier ${tier} เปรียบเทียบราคาแต่ละเมืองและตรวจปริมาณขายย้อนหลัง ก่อนซื้อจำนวนมากหรือย้ายเมืองไปขาย`
  return group === 'bag'
    ? `Compare ${name}, a Tier ${tier} bag, across Asia city markets. Check separate listing and buy order update times before trading.`
    : group === 'cape' ? `Compare ${name}, a Tier ${tier} cape, across Asia markets. Review listing and buy order timestamps before planning a trade.`
      : `Compare ${name}, a Tier ${tier} refined material, by city. Check reported sales volume and update times before buying in bulk.`
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
  const name = (await getItem(id))?.name || id.replaceAll('_', ' ')
  const th = locale === 'th'
  return <main className="container mx-auto max-w-5xl px-4 py-8" lang={locale}>
    <header className="mb-6"><p className="text-xs uppercase tracking-[.22em] text-primary">Albion Online Asia Market</p><h1 className="font-ledger mt-2 text-3xl font-bold text-gold-gradient">{th ? `ราคา ${name} ทุกเมือง` : `${name} prices in every city`}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{itemContext(id, name, locale)}</p></header>
    <section className="ledger-panel p-4 sm:p-6"><ItemSearch initialQuery={id} locale={locale} /></section>
    <nav className="mt-6 flex flex-wrap gap-3" aria-label={th ? 'อ่านเพิ่มเติมและค้นหาสินค้า' : 'More guides and item search'}><Link className="nav-link" href={`/${locale}?q=${encodeURIComponent(name)}`}>{th ? 'ค้นหาราคาสินค้าอื่น' : 'Search more item prices'}</Link><Link className="nav-link" href={`/${locale}/guides/market-price-freshness`}>{th ? 'วิธีอ่านราคาและเวลาอัปเดต' : 'How to read prices and timestamps'}</Link><Link className="nav-link" href={`/${locale}/guides/trade-route-profit-tax`}>{th ? 'วิธีคำนวณกำไรเส้นทาง' : 'Calculate trade route profit'}</Link></nav>
  </main>
}
