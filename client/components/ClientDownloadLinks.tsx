'use client'

import { ExternalLink } from 'lucide-react'
import { track } from '@/lib/analytics'

export default function ClientDownloadLinks({ locale }: { locale: 'th' | 'en' }) {
  const th = locale === 'th'
  return <div className="grid gap-4 lg:grid-cols-2">
    <article className="market-item">
      <p className="section-kicker">{th ? 'ตัวเลือกมาตรฐาน' : 'Standard option'}</p>
      <h2 className="font-ledger mt-2 text-2xl font-semibold">AODP Official Client</h2>
      <p className="mt-3 leading-7 text-muted-foreground">{th ? 'Client ทางการของ Albion Online Data Project สำหรับส่ง market order และราคาทองที่คุณเปิดดูในเกมเข้าสู่ฐานข้อมูลสาธารณะ' : 'The official Albion Online Data Project client uploads the market orders and Gold prices you view in game to the public dataset.'}</p>
      <a className="nav-link nav-link-primary mt-5" href="https://pow.albion-online-data.com/client" target="_blank" rel="noopener noreferrer" onClick={() => track('client_official_click')}>{th ? 'ไปหน้าดาวน์โหลดทางการ' : 'Open official download page'} <ExternalLink className="h-4 w-4" /></a>
    </article>
    <article className="market-item">
      <p className="section-kicker">{th ? 'ตัวเลือก UI ใช้ง่าย' : 'Graphical alternative'}</p>
      <h2 className="font-ledger mt-2 text-2xl font-semibold">AlbionDataAvalonia</h2>
      <p className="mt-3 leading-7 text-muted-foreground">{th ? 'โปรแกรม third-party แบบ beta มีหน้าตั้งค่าและเครื่องมือเสริม รองรับ Windows, Linux และ macOS โดยข้อมูลตลาดสาธารณะส่วนใหญ่ส่งเข้า AODP' : 'A third-party beta with a graphical interface and extra tools for Windows, Linux, and macOS. Most public market observations are uploaded to AODP.'}</p>
      <a className="nav-link nav-link-primary mt-5" href="https://github.com/JPCodeCraft/AlbionDataAvalonia/releases" target="_blank" rel="noopener noreferrer" onClick={() => track('client_afm_click')}>{th ? 'ดู Releases บน GitHub' : 'View GitHub releases'} <ExternalLink className="h-4 w-4" /></a>
    </article>
  </div>
}
