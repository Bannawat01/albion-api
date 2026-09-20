'use client'

import React from 'react'
import ItemSearch from '@/components/ItemSearch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sword, BarChart3, Zap, Search } from 'lucide-react'

export default function HomePage() {

  return (
    <div className="min-h-screen animated-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-primary/15">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:52px_52px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="relative">
          <div className="container mx-auto px-4 py-14 lg:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <img src="/images/market-ledger-logo.png" alt="" width="112" height="112" className="mx-auto mb-4 h-24 w-24 object-contain drop-shadow-2xl" />
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Albion market data
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="text-foreground">Albion </span>
                <span className="text-gold-gradient">Market Ledger</span>
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
                Search every item and compare real-time prices across the royal cities and the Black Market.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5 text-xs">
                <span className="flex items-center gap-2 bg-card/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-border text-muted-foreground">
                  <Sword className="w-3.5 h-3.5 text-primary" /> Full item database
                </span>
                <span className="flex items-center gap-2 bg-card/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-border text-muted-foreground">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> All-city prices
                </span>
                <span className="flex items-center gap-2 bg-card/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-border text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-primary" /> Fast search
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Search Section */}
          <Card className="overflow-hidden border-primary/20 shadow-2xl shadow-black/30">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-xl flex items-center gap-2.5 text-foreground font-bold">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 text-primary"><Search className="h-4 w-4" /></span>
                Item Search
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Type an item name — prices load automatically for every city.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ItemSearch />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
