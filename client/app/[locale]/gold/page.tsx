import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import GoldChartPage from '@/app/gold/page'
import { alternateLanguages, isLocale } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const title = locale === 'th' ? 'ราคาทอง Albion Online Asia และแนวโน้มล่าสุด' : 'Albion Online Asia Gold Price and Latest Trend'
  return { title, description: locale === 'th' ? 'ดูราคาทองล่าสุดที่ชุมชนรายงาน ช่วงราคา และแนวโน้มบน Asia Server' : 'Review recent community-reported gold prices, range, and trend on the Asia Server.', alternates: { canonical: `/${locale}/gold`, languages: alternateLanguages('/gold') } }
}
export default async function GoldPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const th = locale === 'th'
  return <div lang={locale}>
    <header className="container mx-auto max-w-6xl px-4 pt-10">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">Asia Server</p>
      <h1 className="font-ledger mt-2 text-4xl font-bold text-gold-gradient">{th ? 'ราคาทอง Albion Online Asia' : 'Albion Online Asia Gold Prices'}</h1>
      <p className="mt-2 text-muted-foreground">{th ? 'ดูราคาทองที่ชุมชนรายงานล่าสุดและแนวโน้มย้อนหลัง พร้อมตรวจเวลาอัปเดตก่อนตัดสินใจ' : 'Review recent community-reported gold prices and historical trends, with their update times.'}</p>
    </header>
    <GoldChartPage locale={locale} />
    <section className="container mx-auto max-w-6xl px-4 pb-10" aria-labelledby="gold-explainer">
      <div className="ledger-panel p-5 sm:p-7">
        <h2 id="gold-explainer" className="font-ledger text-2xl font-semibold">{th ? 'วิธีดูราคาทอง Albion Online Asia' : 'How to read Albion Online Asia gold prices'}</h2>
        <p className="mt-3 leading-7 text-muted-foreground">{th ? 'กราฟแสดงราคาทองที่แหล่งข้อมูลชุมชนรายงาน เลือกช่วง 7, 30 หรือ 90 วันเพื่อดูแนวโน้ม พร้อมตรวจจำนวนตัวอย่างและเวลาอัปเดตล่าสุด ถ้าช่วงที่เลือกไม่มีข้อมูล เว็บจะแจ้งตามจริง' : 'The chart shows community-reported gold prices. Choose a 7, 30, or 90-day range, then check the sample count and last update time. An empty range is shown as empty.'}</p>
        <p className="mt-2 leading-7 text-muted-foreground">{th ? 'ราคาทองมีผลต่อ Silver ที่ต้องใช้ซื้อ Premium แต่หน้านี้ไม่ได้คำนวณค่า Premium และราคาอาจเปลี่ยนก่อนคุณซื้อจริง' : 'Gold prices affect the silver needed for Premium, but this page does not calculate Premium cost. The market can move before you buy.'}</p>
        <Link className="nav-link mt-4 inline-flex" href={`/${locale}/guides/gold-premium-asia`}>{th ? 'อ่านคู่มือราคาทองและ Premium' : 'Read the gold and Premium guide'}</Link>
      </div>
    </section>
  </div>
}
