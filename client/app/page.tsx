'use client'

import React from 'react'
import ItemSearch from '@/components/ItemSearch'
import { BarChart3, Search, ShieldCheck } from 'lucide-react'

export default function HomePage() {

  return (
    <div className="min-h-screen animated-bg">
      <section className="ledger-hero">
        <div className="container mx-auto flex max-w-5xl items-center gap-5 px-4 py-8 sm:py-10">
          <img src="/images/market-ledger-logo.png" alt="" width="96" height="96" className="hidden h-20 w-20 object-contain drop-shadow-2xl sm:block" />
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Asia market ledger</div>
            <h1 className="font-ledger text-3xl font-bold tracking-tight sm:text-5xl"><span className="text-foreground">Trade with </span><span className="text-gold-gradient">better prices</span></h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">Search Albion items, compare every city, and plan your next profitable route.</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="hero-proof"><Search /> Fast item search</span>
              <span className="hero-proof"><BarChart3 /> All-city prices</span>
              <span className="hero-proof"><ShieldCheck /> Community data</span>
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
              <div><h2 id="item-search-title" className="font-ledger text-xl font-semibold">Market Search</h2><p className="text-xs text-muted-foreground">Community prices can differ from the live in-game market.</p></div>
            </div>
            <ItemSearch />
          </section>
        </div>
      </div>
    </div>
  )
}
