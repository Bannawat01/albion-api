'use client'

import React, { useEffect, useState } from 'react'
import ItemSearch from '@/components/ItemSearch'
import { BarChart3, Search, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { track } from '@/lib/analytics'

export default function HomePage() {
  const { th } = useLanguage()
  const [initialQuery, setInitialQuery] = useState('')
  useEffect(() => setInitialQuery(new URLSearchParams(location.search).get('q') || ''), [])

  return (
    <div className="min-h-screen animated-bg">
      <section className="ledger-hero">
        <div className="container mx-auto flex max-w-5xl items-center gap-5 px-4 py-8 sm:py-10">
          <img src="/images/market-ledger-logo.png" alt="" width="96" height="96" className="hidden h-20 w-20 object-contain drop-shadow-2xl sm:block" />
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {th ? 'ตลาด Asia สำหรับผู้เล่นไทย' : 'Asia market ledger'}</div>
            <h1 className="font-ledger text-3xl font-bold tracking-tight sm:text-5xl"><span className="text-foreground">{th ? 'ซื้อขายด้วย' : 'Trade with '}</span><span className="text-gold-gradient">{th ? 'ข้อมูลที่ดีกว่า' : 'better prices'}</span></h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{th ? 'ค้นหาราคา เปรียบเทียบทุกเมือง และหาเส้นทางทำกำไรบน Asia Server' : 'Search Albion items, compare every city, and plan your next profitable route.'}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="hero-proof"><Search /> {th ? 'ค้นหาเร็ว' : 'Fast item search'}</span>
              <span className="hero-proof"><BarChart3 /> {th ? 'ราคาทุกเมือง' : 'All-city prices'}</span>
              <span className="hero-proof"><ShieldCheck /> {th ? 'ข้อมูลจากผู้เล่น' : 'Community data'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container relative z-10 mx-auto px-4 py-6 lg:py-8">
        <div className="max-w-5xl mx-auto">
          <section className="ledger-panel p-4 sm:p-6" aria-labelledby="item-search-title">
            <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
              <span className="ledger-icon"><Search className="h-4 w-4" /></span>
              <div><h2 id="item-search-title" className="font-ledger text-xl font-semibold">{th ? 'ค้นหาตลาด' : 'Market Search'}</h2><p className="text-xs text-muted-foreground">{th ? 'ราคามาจากผู้เล่นและอาจต่างจากราคาในเกม โปรดดูเวลาที่อัปเดต' : 'Community prices can differ from the live in-game market.'}</p></div>
            </div>
            <ItemSearch initialQuery={initialQuery} />
            <a href="https://pow.east.albion-online-data.com/" target="_blank" rel="noopener noreferrer" onClick={() => track('aodp_click')} className="aodp-cta">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span className="flex min-w-0 flex-col">
                <b>{th ? 'ช่วยให้ราคา Asia สดขึ้น' : 'Help keep Asia prices fresh'}</b>
                <small className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">{th ? 'เปิด AODP Client ขณะเล่น และเข้าดูตลาดในเกม' : 'Run the AODP Client while playing and browsing markets.'}</small>
              </span>
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
