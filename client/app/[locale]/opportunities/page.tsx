import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Opportunities from '@/components/Opportunities'
import { alternateLanguages, isLocale } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const title = locale === 'th' ? 'โอกาสซื้อขาย Albion Asia วันนี้' : 'Daily Albion Asia Trade Opportunities'
  const description = locale === 'th' ? 'ค้นหาเส้นทางซื้อขายจากสินค้า Albion ยอดนิยม พร้อมกำไรหลังภาษี ความสด และปริมาณขาย' : 'Screen popular Albion items for after-tax trade routes with freshness, volume, and confidence.'
  return { title, description, alternates: { canonical: `/${locale}/opportunities`, languages: alternateLanguages('/opportunities') } }
}
export default async function OpportunitiesPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <Opportunities locale={locale} /> }
