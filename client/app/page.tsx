'use client'

import React from 'react'
import ItemSearch from '@/components/ItemSearch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        {/* grid and overlays */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        {/* decorative orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
                Albion Online
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600">
                  Item Database
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                ค้นหาและดูข้อมูลไอเทมในเกม Albion Online พร้อมข้อมูลราคาและสถิติแบบเรียลไทม์
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live Market Data
                </span>
                <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  Real-time Updates
                </span>
                <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  All Servers
                </span>
              </div>

              {/* hero ctas */}
              <div className="mt-10 flex items-center justify-center gap-4">
                <a
                  href="#search"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-yellow-400 transition-colors"
                >
                  เริ่มค้นหา
                  <span className="text-xl">↘</span>
                </a>
                <Link
                  href="/gold"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-amber-300 ring-1 ring-amber-400/30 hover:ring-amber-300/60 bg-slate-900/40 backdrop-blur-md"
                >
                  Gold Price
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Search Section */}
          <Card id="search" className="relative mb-8 shadow-2xl border-0 bg-slate-800/50 backdrop-blur-sm ring-1 ring-white/5">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-xl">
              <CardTitle className="text-2xl flex items-center gap-2 text-white">
                <span className="text-2xl">🔍</span>
                Item Search
              </CardTitle>
              <CardDescription className="text-slate-300">
                Search through thousands of Albion Online items with real-time data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ItemSearch />
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-slate-800/50 backdrop-blur-sm hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-amber-500/25 transition-shadow ring-1 ring-amber-300/30">
                    <span className="text-2xl">🗡️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">All Items</h3>
                    <p className="text-slate-400 text-sm font-medium">Complete database</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Access information for every item in Albion Online, from weapons to consumables.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-slate-800/50 backdrop-blur-sm hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-amber-500/25 transition-shadow ring-1 ring-amber-300/30">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">Live Prices</h3>
                    <p className="text-slate-400 text-sm font-medium">Market tracking</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Real-time market prices from all major cities in Albion Online.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-slate-800/50 backdrop-blur-sm hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-amber-500/25 transition-shadow ring-1 ring-amber-300/30">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">Fast Search</h3>
                    <p className="text-slate-400 text-sm font-medium">Instant results</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Lightning-fast search with autocomplete and filtering options.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Guide */}
          <Card className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-700/50 border-0 shadow-2xl backdrop-blur-sm ring-1 ring-white/5">
            <CardHeader className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="text-2xl">🎯</span>
                How to Use ItemSearch
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-1 ring-amber-300/40">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Search Items</h4>
                      <p className="text-slate-300 text-sm">
                        Type item names like "sword", "armor", or "potion" in the search box
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-1 ring-amber-300/40">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">View Details</h4>
                      <p className="text-slate-300 text-sm">
                        See item images, IDs, and unique names in the results
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-1 ring-amber-300/40">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Filter Results</h4>
                      <p className="text-slate-300 text-sm">
                        Use advanced filters to narrow down your search results
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-1 ring-amber-300/40">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Get Prices</h4>
                      <p className="text-slate-300 text-sm">
                        Access real-time market data for each item across all cities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}