import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Opportunities from '@/components/Opportunities'
import { alternateLanguages, isLocale } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const title = locale === 'th' ? 'โอกาสซื้อขาย Albion Asia วันนี้' : 'Daily Albion Asia Trade Opportunities'
  const description = locale === 'th' ? 'ค้นหาเส้นทางซื้อขายจากสินค้า Albion ยอดนิยม พร้อมกำไรหลังภาษี ความสด และปริมาณขาย' : 'Screen popular Albion items for after-tax trade routes with freshness, volume, and confidence.'
  return { title, description, alternates: { canonical: `/${locale}/opportunities`, languages: alternateLanguages('/opportunities') } }
}
export default async function OpportunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const th = locale === 'th'
  return <div lang={locale}>
    <Opportunities locale={locale} />
    <section className="container mx-auto max-w-5xl px-4 pb-10" aria-labelledby="opportunities-explainer">
      <div className="ledger-panel p-5 sm:p-7">
        <h2 id="opportunities-explainer" className="font-ledger text-2xl font-semibold">{th ? 'หาเส้นทางซื้อขาย Albion Asia อย่างไร' : 'How to find Albion Asia trade routes'}</h2>
        <p className="mt-3 leading-7 text-muted-foreground">{th ? 'เลือกเงินทุนและเมืองต้นทาง แล้วกดค้นหา ระบบเปรียบเทียบราคาซื้อกับราคาขายของสินค้าที่คัดไว้ 50 รายการ พร้อมประมาณกำไรหลังหักภาษี 6.5% ตัวกรองขั้นสูงใช้กำหนดอายุข้อมูล ปริมาณขายขั้นต่ำ และวิธีขาย' : 'Choose a budget and origin city to screen 50 selected items. Estimated profit subtracts a 6.5% tax assumption. Advanced filters control data age, minimum reported sales volume, and selling method.'}</p>
        <p className="mt-2 leading-7 text-muted-foreground">{th ? 'หากไม่มีผลในช่วง 2 ชั่วโมง อาจเป็นเพราะข้อมูล Asia ยังไม่สด คุณเลือกดูข้อมูลได้ถึง 24 ชั่วโมง แต่ต้องตรวจราคาทั้งสองเมืองในเกมก่อนเดินทาง ราคาตั้งขายไม่รับประกันว่าจะขายได้' : 'If no route appears within two hours, Asia reports may be too old. You can widen the window to 24 hours, but verify both city prices in game before travelling. A listing does not guarantee a sale.'}</p>
        <div className="mt-4 flex flex-wrap gap-3"><Link className="nav-link" href={`/${locale}/guides/trade-route-profit-tax`}>{th ? 'อ่านวิธีคำนวณกำไร' : 'Read the trade route guide'}</Link><Link className="nav-link" href={`/${locale}`}>{th ? 'ค้นหาราคาสินค้าทุกเมือง' : 'Search city prices'}</Link></div>
      </div>
    </section>
  </div>
}
