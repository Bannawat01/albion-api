'use client'

import React, { useState, useEffect } from 'react'
import ItemSearch from '@/components/ItemSearch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  // ตัวอย่าง mock loading state (เปลี่ยน logic นี้ตามจริงได้)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <LoadingSpinner size={60} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-700/20 animate-gradient-move" />
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:60px_60px] mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-[0_2px_24px_rgba(255,255,255,0.15)]">
              Albion Online
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-300 to-slate-100 animate-text-gradient">
                Item Database
              </span>
            </h1>
            <p className="text-2xl text-slate-200 mb-8 leading-relaxed font-medium drop-shadow">
              ค้นหาและดูข้อมูลไอเทมในเกม Albion Online พร้อมข้อมูลราคาและสถิติแบบเรียลไทม์
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-base text-slate-200">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-slate-400/30 shadow-lg hover:scale-105 transition">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Market Data
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-slate-400/30 shadow-lg hover:scale-105 transition">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                Real-time Updates
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-slate-400/30 shadow-lg hover:scale-105 transition">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                All Servers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Search Section */}
          <Card className="mb-8 shadow-2xl border-0 bg-white/10 backdrop-blur-xl hover:shadow-slate-400/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-2 text-white drop-shadow">
                <span className="text-3xl animate-bounce">🔍</span>
                Item Search
              </CardTitle>
              <CardDescription className="text-slate-200">
                Search through thousands of Albion Online items with real-time data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ItemSearch />
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {[
              {
                icon: '🗡️',
                title: 'All Items',
                subtitle: 'Complete database',
                desc: 'Access information for every item in Albion Online, from weapons to consumables.',
                glow: 'shadow-slate-400/40'
              },
              {
                icon: '📊',
                title: 'Live Prices',
                subtitle: 'Market tracking',
                desc: 'Real-time market prices from all major cities in Albion Online.',
                glow: 'shadow-slate-400/40'
              },
              {
                icon: '⚡',
                title: 'Fast Search',
                subtitle: 'Instant results',
                desc: 'Lightning-fast search with autocomplete and filtering options.',
                glow: 'shadow-slate-400/40'
              }
            ].map((f, i) => (
              <Card
                key={i}
                className={`group hover:shadow-2xl transition-all duration-300 border-0 bg-white/10 backdrop-blur-xl hover:scale-105 ${f.glow}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br from-slate-400 via-slate-300 to-slate-100 rounded-xl flex items-center justify-center mr-4 shadow-xl group-hover:scale-110 transition-transform text-3xl`}>
                      <span className="animate-wiggle">{f.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-white">{f.title}</h3>
                      <p className="text-slate-300 text-sm font-medium">{f.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-base text-slate-200">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usage Guide */}
          <Card className="bg-gradient-to-br from-white/10 via-slate-800/30 to-slate-700/50 border-0 shadow-2xl backdrop-blur-xl">
            <CardHeader >
              <CardTitle className="flex items-center gap-2 text-white text-2xl">
                <span className="text-2xl animate-bounce">🎯</span>
                How to Use ItemSearch
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  [
                    {
                      step: 1,
                      title: 'Search Items',
                      desc: 'Type item names like "sword", "armor", or "potion" in the search box'
                    },
                    {
                      step: 2,
                      title: 'View Details',
                      desc: 'See item images, IDs, and unique names in the results'
                    }
                  ],
                  [
                    {
                      step: 3,
                      title: 'Filter Results',
                      desc: 'Use advanced filters to narrow down your search results'
                    },
                    {
                      step: 4,
                      title: 'Get Prices',
                      desc: 'Access real-time market data for each item across all cities'
                    }
                  ]
                ].map((col, i) => (
                  <div className="space-y-6" key={i}>
                    {col.map((s) => (
                      <div className="flex items-start gap-4" key={s.step}>
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-400 via-slate-300 to-slate-100 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg animate-pop">
                          {s.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{s.title}</h4>
                          <p className="text-slate-200 text-base">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes gradient-move {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-move {
          animation: gradient-move 12s ease-in-out infinite;
          background-size: 200% 200%;
        }
        @keyframes text-gradient {
          0%,100% { filter: hue-rotate(0deg);}
          50% { filter: hue-rotate(40deg);}
        }
        .animate-text-gradient {
          animation: text-gradient 3s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-6deg);}
          50% { transform: rotate(6deg);}
        }
        .animate-wiggle {
          animation: wiggle 1.2s ease-in-out infinite;
        }
        @keyframes pop {
          0% { transform: scale(0.8);}
          60% { transform: scale(1.15);}
          100% { transform: scale(1);}
        }
        .animate-pop {
          animation: pop 0.6s cubic-bezier(.68,-0.55,.27,1.55) both;
        }
      `}</style>
    </div>
  )
}