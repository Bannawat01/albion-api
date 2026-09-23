import type { Metadata } from 'next'
import ItemSearch from '@/components/ItemSearch'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = decodeURIComponent((await params).id).replace(/[^A-Za-z0-9_@]/g, '')
  return {
    title: `${id} ราคา Asia | Albion Market Ledger`,
    description: `เช็กราคา ${id} ทุกเมือง ประวัติราคา และเส้นทางกำไรบน Albion Online Asia Server`,
    alternates: { canonical: `/item/${encodeURIComponent(id)}` },
  }
}

export default async function ItemPricePage({ params }: { params: Promise<{ id: string }> }) {
  const id = decodeURIComponent((await params).id).replace(/[^A-Za-z0-9_@]/g, '')
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">Albion Asia Price</p>
        <h1 className="font-ledger mt-2 text-3xl font-bold text-gold-gradient">ราคา {id}</h1>
        <p className="mt-2 text-sm text-muted-foreground">เปรียบเทียบราคาทุกเมือง พร้อมเวลาที่อัปเดตและเส้นทางซื้อขาย</p>
      </header>
      <section className="ledger-panel p-4 sm:p-6"><ItemSearch initialQuery={id} /></section>
    </main>
  )
}
