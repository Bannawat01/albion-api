'use client'

import { useEffect, useState } from 'react'
import type { GoldPrice } from '@server/interface/goldInterface'
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { itemApi } from '@/api/item'
import GoldLineChart from './GoldLineChart'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function GoldChartPage() {
  const [goldData, setGoldData] = useState<GoldPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void itemApi.getGoldPrice()
      .then((result) => {
        if (!result.success || !result.data?.length) throw new Error(result.message || 'No gold data')
        setGoldData(result.data)
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load gold prices'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <MarketState title="Loading the gold ledger..." />
  if (error) return <MarketState title="Gold prices are unavailable" detail={error} retry />

  const prices = goldData.map((item) => item.price)
  const latest = prices[prices.length - 1]
  const chartData = {
    labels: goldData.map((item) => new Date(item.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit' })),
    datasets: [{
      label: 'Gold price',
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
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Royal Exchange</p>
        <h1 className="font-ledger mt-2 text-4xl font-bold text-gold-gradient">Albion Gold Market</h1>
        <p className="mt-2 text-muted-foreground">Recent community-reported gold prices.</p>
      </header>
      <section className="ledger-panel p-5 sm:p-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm text-muted-foreground">Latest price</p><p className="text-3xl font-bold text-primary">{latest.toLocaleString()}</p></div>
          <div className="flex gap-6 text-sm">
            <Stat label="High" value={Math.max(...prices)} />
            <Stat label="Low" value={Math.min(...prices)} />
            <Stat label="Samples" value={prices.length} />
          </div>
        </div>
        <div className="h-[320px] sm:h-[420px]"><GoldLineChart data={chartData} options={chartOptions} /></div>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div><p className="text-muted-foreground">{label}</p><p className="font-semibold text-foreground">{value.toLocaleString()}</p></div>
}

function MarketState({ title, detail, retry = false }: { title: string; detail?: string; retry?: boolean }) {
  return (
    <main className="login-shell">
      <section className="login-card">
        <h1 className="text-xl font-semibold">{title}</h1>
        {detail && <p className="mt-2 text-sm text-muted-foreground">{detail}</p>}
        {retry && <button className="mt-5 nav-link nav-link-primary" onClick={() => location.reload()}>Try again</button>}
      </section>
    </main>
  )
}
