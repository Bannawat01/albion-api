'use client'

import React from 'react'
import ItemSearch from '@/components/ItemSearch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sword, BarChart3, Zap } from 'lucide-react'

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 animated-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        <div className="relative">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                Albion Online
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse">
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Search Section */}
          <Card className="mb-8 shadow-xl border-0 glass-card">
            <CardHeader className="glass-card rounded-t-lg border-b border-slate-600/30 p-6">
              <CardTitle className="text-2xl flex items-center gap-3 text-white font-bold mb-2">
                <span className="text-3xl animate-pulse text-cyan-400">🔍</span>
                Item Search
              </CardTitle>
              <CardDescription className="text-slate-200 text-base leading-relaxed">
                Search through thousands of Albion Online items with real-time data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ItemSearch />
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 glass-card md:hover:scale-105 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-amber-500/25 transition-shadow">
                    <Sword className="w-6 h-6 text-white" />
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

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 glass-card md:hover:scale-105 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-amber-500/25 transition-shadow">
                    <BarChart3 className="w-6 h-6 text-white" />
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

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 glass-card md:hover:scale-105 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-amber-500/25 transition-shadow">
                    <Zap className="w-6 h-6 text-white" />
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
          <Card className="glass-card shadow-xl animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="text-2xl">🎯</span>
                How to Use ItemSearch
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
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
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
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
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
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
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
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