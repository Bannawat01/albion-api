import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ItemSearch from '@/components/ItemSearch'
import { API_BASE_URL } from '@/api/config'
import { alternateLanguages, isLocale } from '@/lib/seo'

async function getItem(id: string) {
  try { const response = await fetch(`${API_BASE_URL}/api/item/${encodeURIComponent(id)}`, { next: { revalidate: 86400 } }); return response.ok ? await response.json() as { name: string } : null } catch { return null }
}
export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id: raw } = await params
  if (!isLocale(locale)) return {}
  const id = decodeURIComponent(raw).replace(/[^A-Za-z0-9_@]/g, '')
  const name = (await getItem(id))?.name || id.replaceAll('_', ' ')
  const title = locale === 'th' ? `ราคา ${name} ทุกเมือง – Albion Online Asia` : `${name} Prices in Every City – Albion Online Asia`
  const description = locale === 'th' ? `เปรียบเทียบราคา ${name} ทุกเมือง ดูความสดและเส้นทางซื้อขายหลังหักภาษี` : `Compare player-reported ${name} prices, freshness, history, and trade routes across Albion Asia.`
  return { title, description, alternates: { canonical: `/${locale}/item/${encodeURIComponent(id)}`, languages: alternateLanguages(`/item/${encodeURIComponent(id)}`) } }
}
export default async function LocalizedItemPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id: raw } = await params
  if (!isLocale(locale)) notFound()
  const id = decodeURIComponent(raw).replace(/[^A-Za-z0-9_@]/g, '')
  const name = (await getItem(id))?.name || id.replaceAll('_', ' ')
  return <main className="container mx-auto max-w-5xl px-4 py-8" lang={locale}><header className="mb-6"><p className="text-xs uppercase tracking-[.22em] text-primary">Albion Asia Price</p><h1 className="font-ledger mt-2 text-3xl font-bold text-gold-gradient">{locale === 'th' ? `ราคา ${name} ทุกเมือง` : `${name} prices in every city`}</h1><p className="mt-2 text-sm text-muted-foreground">{locale === 'th' ? 'ราคาล่าสุดที่ผู้เล่นรายงาน พร้อมเวลาอัปเดตและเส้นทางซื้อขายหลังภาษี' : 'Latest player-reported prices with timestamps and after-tax trade routes.'}</p></header><section className="ledger-panel p-4 sm:p-6"><ItemSearch initialQuery={id} locale={locale} /></section></main>
}
