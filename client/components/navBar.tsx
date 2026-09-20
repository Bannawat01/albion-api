'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { UserProfile } from '@/components/UserProfile'

export default function NavBar() {
  useEffect(() => document.documentElement.classList.add('dark'), [])

  return (
    <nav className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-card/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg shadow-black/30">
      <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="Albion Market Ledger home">
        <img src="/images/market-ledger-logo.png" alt="" width="56" height="56" className="h-11 w-11 object-contain transition-transform group-hover:scale-105" />
        <span className="hidden md:block font-semibold tracking-wide text-gold">Market Ledger</span>
      </Link>
      <div className="flex-1 flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-6 overflow-x-auto">
        <Link href="/" className="nav-link">Items</Link>
        <Link href="/gold" className="nav-link nav-link-primary">Gold Market</Link>
        <Link href="/about" className="nav-link">About</Link>
      </div>
      <div className="shrink-0"><UserProfile /></div>
    </nav>
  )
}
