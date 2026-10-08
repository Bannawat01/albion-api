import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertTriangle, Database, Download, Store } from 'lucide-react'
import ClientDownloadLinks from '@/components/ClientDownloadLinks'
import { alternateLanguages, isLocale } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const th = locale === 'th'
  return {
    title: th ? 'ช่วยให้ราคา Albion Online Asia สดขึ้น' : 'Help Keep Albion Online Asia Prices Fresh',
    description: th ? 'เลือก AODP client เปิดขณะเล่น และช่วยส่งราคาตลาดที่คุณดูในเกมเข้าสู่ฐานข้อมูลสาธารณะสำหรับผู้เล่น Asia' : 'Choose an AODP client and help upload the markets you view in game to the public Asia price dataset.',
    alternates: { canonical: `/${locale}/contribute`, languages: alternateLanguages('/contribute') },
  }
}

export default async function ContributePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const th = locale === 'th'
  const steps = th ? [
    ['1', 'ติดตั้งจากแหล่งทางการ', 'เลือก client ด้านบนและดาวน์โหลดจากเว็บไซต์ต้นทางเท่านั้น เว็บนี้ไม่เก็บหรือแจกไฟล์ติดตั้ง'],
    ['2', 'เปิด client และเลือก Asia', 'ตั้งค่าเซิร์ฟเวอร์เป็น Asia หรือ East แล้วเปิดโปรแกรมไว้ขณะเล่น Albion Online'],
    ['3', 'เปิดตลาดในเกม', 'เข้าแต่ละเมืองและเปิดดูหน้าตลาด ข้อมูลสาธารณะที่ client อ่านได้จะถูกส่งเข้า AODP'],
  ] : [
    ['1', 'Install from the source', 'Choose a client below and download only from its source website. This site does not host installers.'],
    ['2', 'Run it for Asia', 'Select the Asia or East server and keep the client running while you play Albion Online.'],
    ['3', 'Browse in-game markets', 'Open the market in each city. Public observations read by the client are uploaded to AODP.'],
  ]

  return <main className="container mx-auto max-w-5xl px-4 py-10" lang={locale}>
    <header className="max-w-3xl">
      <p className="section-kicker">Asia Server · Community Data</p>
      <h1 className="font-ledger mt-3 text-4xl font-bold text-gold-gradient sm:text-5xl">{th ? 'ช่วยให้ราคา Asia สดขึ้น' : 'Help Keep Asia Prices Fresh'}</h1>
      <p className="mt-4 leading-7 text-muted-foreground">{th ? 'ราคาบนเว็บมาจากผู้เล่นที่เปิด client ขณะดูตลาดในเกม ยิ่งมีผู้ช่วยจากหลายเมืองมากขึ้น เวลารายงานและความครอบคลุมของราคาก็มีโอกาสดีขึ้น' : 'Prices on this site come from players running a data client while browsing markets in game. More contributors across cities can improve report freshness and coverage.'}</p>
    </header>

    <section className="ledger-panel mt-8 border-amber-400/25 p-5 sm:p-6" aria-labelledby="before-installing">
      <div className="flex gap-3"><AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-300" /><div><h2 id="before-installing" className="font-ledger text-xl font-semibold">{th ? 'อ่านก่อนติดตั้ง' : 'Before installing'}</h2><p className="mt-2 leading-7 text-muted-foreground">{th ? 'ทั้งสองโปรแกรมตรวจสอบ network traffic แบบ passive เพื่ออ่านข้อมูลจากเกม อย่าเปิดพร้อมกัน เพราะอาจส่งข้อมูลซ้ำ AlbionDataAvalonia เป็น third-party beta และไม่ได้พัฒนา รับรอง หรือสนับสนุนโดยเว็บนี้' : 'Both clients passively inspect network traffic to read game data. Do not run them together because observations may be uploaded twice. AlbionDataAvalonia is a third-party beta and is not developed, endorsed, or supported by this site.'}</p><p className="mt-2 leading-7 text-muted-foreground">{th ? 'Private Mode ของ AlbionDataAvalonia อาจเก็บ market order บางประเภทไว้กับบริการของโปรแกรมแทน AODP; ประวัติราคาและราคาทองยังอาจเป็นข้อมูลสาธารณะตามการตั้งค่าของโปรแกรม โปรดอ่านคำอธิบายบนหน้าโครงการก่อนใช้' : 'AlbionDataAvalonia Private Mode may keep some market orders with its own service instead of AODP; history and Gold observations may remain public depending on its settings. Read the project documentation before use.'}</p></div></div>
    </section>

    <section className="mt-6" aria-labelledby="client-options">
      <h2 id="client-options" className="sr-only">{th ? 'เลือก Client' : 'Choose a client'}</h2>
      <ClientDownloadLinks locale={locale} />
    </section>

    <section className="mt-10" aria-labelledby="steps-title">
      <h2 id="steps-title" className="font-ledger text-2xl font-semibold">{th ? 'เริ่มช่วยใน 3 ขั้นตอน' : 'Contribute in three steps'}</h2>
      <ol className="mt-5 grid gap-4 md:grid-cols-3">{steps.map(([number, title, body], index) => {
        const Icon = [Download, Database, Store][index]
        return <li key={number} className="ledger-panel p-5"><div className="flex items-center justify-between"><span className="section-kicker">{number} / 03</span><Icon className="h-5 w-5 text-primary" /></div><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></li>
      })}</ol>
    </section>

    <section className="ledger-panel mt-10 p-5 sm:p-6" aria-labelledby="privacy-title">
      <h2 id="privacy-title" className="font-ledger text-2xl font-semibold">{th ? 'ข้อมูลใดมาถึงเว็บนี้' : 'What reaches this site'}</h2>
      <p className="mt-3 leading-7 text-muted-foreground">{th ? 'Albion Market Ledger ไม่รับ packet, account token, ประวัติส่วนตัว หรือฐานข้อมูลในเครื่องจาก client เหล่านี้ เว็บอ่านเฉพาะข้อมูลตลาดสาธารณะที่ AODP API เผยแพร่ และไม่สามารถระบุได้ว่าราคาแต่ละแถวมาจากผู้ใช้หรือ client คนใด' : 'Albion Market Ledger does not receive packets, account tokens, private history, or local client databases. It reads only public market data published by the AODP API and cannot identify which user or client supplied an individual price row.'}</p>
      <Link className="nav-link mt-4" href={`/${locale}/about`}>{th ? 'อ่านที่มาข้อมูลและความเป็นส่วนตัว' : 'Read about data and privacy'}</Link>
    </section>
  </main>
}
