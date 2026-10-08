import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RefiningCalculator from '@/components/RefiningCalculator'
import { alternateLanguages, isLocale } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return { title: locale === 'th' ? 'เครื่องคิดต้นทุนรีไฟน์ T4 Albion Asia' : 'Albion Asia T4 Refining Cost Calculator', description: locale === 'th' ? 'คำนวณต้นทุนรีไฟน์ T4 จากราคาวัตถุดิบ ค่าธรรมเนียมสถานี และอัตราคืนวัตถุดิบที่กรอกจากเกม' : 'Estimate T4 refining costs using in-game material prices, station fees and resource return rate.', alternates: { canonical: `/${locale}/refining`, languages: alternateLanguages('/refining') } }
}

export default async function RefiningPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const th = locale === 'th'
  return <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-12" lang={locale}>
    <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Albion Asia · T4</p>
    <h1 className="font-ledger mt-2 text-3xl font-bold text-gold-gradient sm:text-4xl">{th ? 'เครื่องคิดต้นทุนรีไฟน์ T4' : 'T4 Refining Cost Calculator'}</h1>
    <p className="mb-6 mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{th ? 'ลองคำนวณหนึ่งเมืองต่อครั้ง โดยกรอกราคาที่เห็นในเกมและค่าธรรมเนียมสถานีจริง เว็บไม่มีข้อมูลค่าธรรมเนียมสถานีหรือจำนวนออร์เดอร์สดของแต่ละเมือง' : 'Estimate one city at a time using prices and station fees you see in game. This site does not have live city station fees or order depth.'}</p>
    <RefiningCalculator locale={locale} />
    <p className="mt-5 text-xs leading-6 text-muted-foreground">{th ? 'สูตรอ้างอิงจาก' : 'Recipe based on the'} <a className="text-primary underline" href="https://albiononline.com/news/guide-refining" target="_blank" rel="noopener noreferrer">{th ? 'คู่มือรีไฟน์ทางการของ Albion Online' : 'official Albion Online refining guide'}</a>{th ? ' ส่วนโบนัสเมืองและ Focus อาจเปลี่ยนอัตราคืนวัตถุดิบ กรุณาใช้ค่าที่เกมแสดง ณ เวลาคำนวณ' : '. City bonuses and Focus can change resource returns; use the rate currently shown in game.'}</p>
  </main>
}
