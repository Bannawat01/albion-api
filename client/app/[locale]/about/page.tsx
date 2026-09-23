import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { alternateLanguages, GUIDE_SLUGS, isLocale } from '@/lib/seo'
import { guides, LAST_CHECKED } from '@/lib/guides'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return { title: locale === 'th' ? 'แหล่งข้อมูล วิธีคำนวณ และความเป็นส่วนตัว' : 'Data, Calculations, and Privacy', description: locale === 'th' ? 'วิธีที่ Albion Market Ledger เก็บราคา คำนวณเส้นทาง และดูแลข้อมูล analytics' : 'How Albion Market Ledger sources prices, calculates routes, and handles anonymous analytics.', alternates: { canonical: `/${locale}/about`, languages: alternateLanguages('/about') } }
}
export default async function LocalizedAbout({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const th = locale === 'th'
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL
  return <main className="container mx-auto max-w-4xl px-4 py-10" lang={locale}>
    <h1 className="font-ledger text-4xl font-bold text-gold-gradient">{th ? 'ข้อมูลและความน่าเชื่อถือ' : 'How This Ledger Works'}</h1><p className="mt-3 text-muted-foreground">Albion Market Ledger — Asia Price & Trade Finder</p>
    <section className="ledger-panel mt-7 p-6"><h2 className="font-ledger text-2xl font-semibold">{th ? 'ที่มาของข้อมูลราคา' : 'Data methodology'}</h2><p className="mt-3 leading-7 text-muted-foreground">{th ? 'ข้อมูลมาจาก Albion Online Data Project (AODP) เมื่อผู้ใช้ Client เปิดตลาดในเกม ระบบ cache ข้อมูลเพื่อลดภาระแหล่งข้อมูล Fresh คือไม่เกิน 30 นาที; Old คือเก่ากว่านั้นหรือไม่มี timestamp จึงไม่ควรเรียกว่า “ราคาสด”' : 'Prices come from the Albion Online Data Project when contributors running its client browse in-game markets. Responses are cached to protect the source. Fresh means no more than 30 minutes old; Old means older or missing a timestamp. This is not a live game feed.'}</p></section>
    <section className="ledger-panel mt-5 p-6"><h2 className="font-ledger text-2xl font-semibold">{th ? 'วิธีคำนวณ' : 'Calculation methodology'}</h2><p className="mt-3 leading-7 text-muted-foreground">{th ? 'Best Sell ใช้ราคาตั้งขายต่ำสุด และ Best Buy Order ใช้คำสั่งซื้อสูงสุด กำไรสุทธิคำนวณจากราคาขายหลังหักภาษีที่แสดง ลบราคาซื้อ ผลจริงอาจต่างเพราะราคา volume ค่าธรรมเนียม การเดินทาง และการขายไม่หมด' : 'Best Sell uses the lowest reported listing; Best Buy Order uses the highest reported order. Estimated net profit subtracts the displayed tax assumption and purchase cost. Actual results can differ due to price movement, volume, fees, transport, and unsold stock.'}</p><p className="mt-3 text-xs text-muted-foreground">{th ? 'ตรวจสูตรล่าสุด' : 'Formula last checked'}: {LAST_CHECKED}</p></section>
    <section className="ledger-panel mt-5 p-6"><h2 className="font-ledger text-2xl font-semibold">{th ? 'ความเป็นส่วนตัวและการติดต่อ' : 'Privacy and contact'}</h2><p className="mt-3 leading-7 text-muted-foreground">{th ? 'เก็บ analytics แบบไม่ระบุตัวตนเพื่อวัด page view, search, watchlist และ route usage โดยตั้งใจเก็บไม่เกิน 90 วัน รายการโปรดอยู่ในเบราว์เซอร์ของคุณ' : 'Anonymous analytics measure page views, searches, watchlist use, and route use, with a 90-day retention target. Watchlist data stays in your browser.'}</p><p className="mt-3 text-sm">{contact ? <a className="text-primary underline" href={`mailto:${contact}`}>{contact}</a> : <a className="text-primary underline" href="https://github.com/Bannawat01/albion-api/issues">{th ? 'แจ้งบั๊กหรือข้อมูลผิดผ่าน GitHub Issues' : 'Report bugs or bad data on GitHub Issues'}</a>}</p></section>
    <section className="mt-8"><h2 className="font-ledger text-2xl font-semibold">{th ? 'คู่มือ' : 'Guides'}</h2><ul className="mt-3 space-y-2">{GUIDE_SLUGS.map(slug => <li key={slug}><Link className="text-primary underline" href={`/${locale}/guides/${slug}`}>{guides[locale][slug].title}</Link></li>)}</ul></section>
    <p className="mt-10 text-xs text-muted-foreground">Albion Online is a trademark of Sandbox Interactive GmbH. This independent community project is not affiliated with or endorsed by Sandbox Interactive GmbH.</p>
  </main>
}
