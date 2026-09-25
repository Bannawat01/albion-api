'use client'

import { useEffect, useState } from 'react'
import type { GoldPrice } from '@server/interface/goldInterface'
import { itemApi } from '@/api/item'
import GoldLineChart from './GoldLineChart'

export default function GoldChartPage({ locale = 'en' }: { locale?: 'th' | 'en' }) {
  const th = locale === 'th'
  const number = new Intl.NumberFormat(th ? 'th-TH' : 'en-US')
  const date = new Intl.DateTimeFormat(th ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', timeZone: th ? 'Asia/Bangkok' : undefined })
  const [days, setDays] = useState(30)
  const [goldData, setGoldData] = useState<GoldPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void itemApi.getGoldPrice()
      .then((result) => {
        if (!result.success || !result.data?.length) throw new Error(result.message || (th ? 'ไม่พบข้อมูลราคาทอง' : 'No gold data'))
        setGoldData(result.data)
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : (th ? 'โหลดราคาทองไม่ได้' : 'Unable to load gold prices')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <MarketState title={th ? 'กำลังโหลดราคาทอง...' : 'Loading the gold ledger...'} locale={locale} />
  if (error) return <MarketState title={th ? 'ราคาทองยังไม่พร้อมใช้งาน' : 'Gold prices are unavailable'} detail={error} retry locale={locale} />

  const cutoff = Date.now() - days * 86400000
  const visibleData = goldData.filter(item => new Date(item.timestamp).getTime() >= cutoff)
  const data = visibleData.length ? visibleData : goldData
  const prices = data.map((item) => item.price)
  const latest = prices[prices.length - 1]
  const chartData = {
    labels: data.map((item) => date.format(new Date(item.timestamp))),
    datasets: [{
      label: th ? 'ราคาทอง' : 'Gold price',
      data: prices,
      borderColor: '#d8b45a',
      backgroundColor: 'rgba(216, 180, 90, 0.12)',
      pointBackgroundColor: '#ecd28f',
      fill: true,
      tension: 0.35,
    }],
  }
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#e8dfc8' } } },
    scales: {
      x: { ticks: { color: '#a9a18f', maxTicksLimit: 8 }, grid: { color: 'rgba(216,180,90,.08)' } },
      y: { ticks: { color: '#a9a18f' }, grid: { color: 'rgba(216,180,90,.08)' } },
    },
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Asia Server</p>
        <h1 className="font-ledger mt-2 text-4xl font-bold text-gold-gradient">{th ? 'ตลาดทอง Albion' : 'Albion Gold Market'}</h1>
        <p className="mt-2 text-muted-foreground">{th ? 'ราคาทองล่าสุดที่ผู้เล่นรายงาน ไม่ใช่ราคาสดจากเกม' : 'Recent community-reported gold prices, not a live game feed.'}</p>
      </header>
      <section className="ledger-panel p-5 sm:p-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm text-muted-foreground">{th ? 'ราคาล่าสุด' : 'Latest price'}</p><p className="text-3xl font-bold text-primary">{number.format(latest)}</p><p className="mt-1 text-xs text-muted-foreground">{th ? 'อัปเดต' : 'Updated'} {date.format(new Date(data.at(-1)!.timestamp))}</p></div>
          <div className="flex gap-6 text-sm">
            <Stat label={th ? 'สูงสุด' : 'High'} value={Math.max(...prices)} format={number} />
            <Stat label={th ? 'ต่ำสุด' : 'Low'} value={Math.min(...prices)} format={number} />
            <Stat label={th ? 'จำนวนข้อมูล' : 'Samples'} value={prices.length} format={number} />
          </div>
        </div>
        <div className="mb-5 flex gap-2" aria-label={th ? 'ช่วงเวลาของกราฟ' : 'Chart range'}>{[7, 30, 90].map(value => <button key={value} type="button" onClick={() => setDays(value)} aria-pressed={days === value} className={days === value ? 'nav-link is-active' : 'nav-link'}>{value} {th ? 'วัน' : 'days'}</button>)}</div>
        <div className="h-[320px] sm:h-[420px]"><GoldLineChart data={chartData} options={chartOptions} /></div>
      </section>
    </main>
  )
}

function Stat({ label, value, format }: { label: string; value: number; format: Intl.NumberFormat }) {
  return <div><p className="text-muted-foreground">{label}</p><p className="font-semibold text-foreground">{format.format(value)}</p></div>
}

function MarketState({ title, detail, retry = false, locale }: { title: string; detail?: string; retry?: boolean; locale: 'th' | 'en' }) {
  return (
    <main className="login-shell">
      <section className="login-card">
        <h1 className="text-xl font-semibold">{title}</h1>
        {detail && <p className="mt-2 text-sm text-muted-foreground">{detail}</p>}
        {retry && <button className="mt-5 nav-link nav-link-primary" onClick={() => location.reload()}>{locale === 'th' ? 'ลองใหม่' : 'Try again'}</button>}
      </section>
    </main>
  )
}
