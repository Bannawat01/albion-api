import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GoldChartPage from '@/app/gold/page'
import { alternateLanguages, isLocale } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const title = locale === 'th' ? 'ราคาทอง Albion Online Asia และแนวโน้มล่าสุด' : 'Albion Online Asia Gold Price and Latest Trend'
  return { title, description: locale === 'th' ? 'ดูราคาทองล่าสุดที่ชุมชนรายงาน ช่วงราคา และแนวโน้มบน Asia Server' : 'Review recent community-reported gold prices, range, and trend on the Asia Server.', alternates: { canonical: `/${locale}/gold`, languages: alternateLanguages('/gold') } }
}
export default async function GoldPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <div lang={locale}><GoldChartPage /></div> }
