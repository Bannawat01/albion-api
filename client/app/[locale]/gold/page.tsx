import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import GoldChartPage from '@/app/gold/page'
import { alternateLanguages, isLocale } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const title = locale === 'th' ? 'ราคาทอง Albion Online Asia และแนวโน้มล่าสุด' : 'Albion Online Asia Gold Price and Latest Trend'
  return { title, description: locale === 'th' ? 'ดูราคาทอง Albion Online Asia ล่าสุด เทียบรายงานราว 24 ชั่วโมงก่อน และคิด Silver สำหรับจำนวน Gold ที่ต้องการ' : 'Check Albion Online Asia Gold prices, compare with reports near 24 hours ago, and estimate Silver for a Gold amount.', alternates: { canonical: `/${locale}/gold`, languages: alternateLanguages('/gold') } }
}
export default async function GoldPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const th = locale === 'th'
  return <div lang={locale}>
    <header className="container mx-auto max-w-6xl px-4 pt-10">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">Asia Server</p>
      <h1 className="font-ledger mt-2 text-4xl font-bold text-gold-gradient">{th ? 'ราคาทอง Albion Online Asia' : 'Albion Online Asia Gold Prices'}</h1>
      <p className="mt-2 text-muted-foreground">{th ? 'ดูราคาทองที่ชุมชนรายงาน เทียบกับราว 24 ชั่วโมงก่อน และลองคิด Silver ที่ต้องเตรียมก่อนเช็กราคาในเกม' : 'Review community-reported Gold prices, compare with roughly 24 hours earlier, and estimate Silver before checking in game.'}</p>
    </header>
    <GoldChartPage locale={locale} />
    <section className="container mx-auto max-w-6xl px-4 pb-10" aria-labelledby="gold-explainer">
      <div className="ledger-panel p-5 sm:p-7">
        <h2 id="gold-explainer" className="font-ledger text-2xl font-semibold">{th ? 'วิธีดูราคาทอง Albion Online Asia' : 'How to read Albion Online Asia gold prices'}</h2>
        <p className="mt-3 leading-7 text-muted-foreground">{th ? 'เลือกกราฟ 24 ชั่วโมง 7 วัน หรือข้อมูลทั้งหมดที่โหลดมา แล้วอ่านช่วงวันที่ที่มีรายงานจริงพร้อมค่าสูงต่ำและจำนวนรายงาน หากไม่มีข้อมูลในช่วงที่เลือก เว็บจะแจ้งตามจริง' : 'Choose 24 hours, 7 days, or all loaded reports. Check the actual observed dates, high and low, and report count. An empty range is shown as empty.'}</p>
        <p className="mt-2 leading-7 text-muted-foreground">{th ? 'เครื่องคิดนำจำนวน Gold คูณราคาล่าสุดที่รายงานเพื่อประมาณ Silver เท่านั้น ไม่รวมค่าธรรมเนียมหรือคำนวณค่า Premium และราคาอาจเปลี่ยนก่อนคุณซื้อจริง' : 'The calculator multiplies your Gold amount by the latest reported price to estimate Silver. It excludes fees and does not calculate Premium cost; the price may change before you buy.'}</p>
        <Link className="nav-link mt-4 inline-flex" href={`/${locale}/guides/gold-premium-asia`}>{th ? 'อ่านคู่มือราคาทองและ Premium' : 'Read the gold and Premium guide'}</Link>
      </div>
    </section>
  </div>
}
