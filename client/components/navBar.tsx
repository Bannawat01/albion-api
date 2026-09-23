'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CircleHelp, Coins, List, Star } from 'lucide-react'
import { UserProfile } from '@/components/UserProfile'
import { useLanguage } from '@/hooks/useLanguage'

const links = [
  { href: '/', label: 'Items', icon: List },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
  { href: '/gold', label: 'Gold', icon: Coins },
  { href: '/about', label: 'About', icon: CircleHelp },
]

export default function NavBar() {
  useEffect(() => document.documentElement.classList.add('dark'), [])
  const pathname = usePathname()
  const { th, toggle } = useLanguage()

  return (
    <>
      <header className="ledger-nav">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Albion Market Ledger home">
          <img src="/images/market-ledger-logo.png" alt="" width="44" height="44" className="h-10 w-10 object-contain transition-transform group-hover:scale-105" />
          <span className="font-ledger hidden sm:block text-lg font-semibold text-gold">Market Ledger</span>
        </Link>
        <span className="server-seal"><span /> Asia</span>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={'nav-link ' + (pathname === href ? 'is-active' : '')} aria-current={pathname === href ? 'page' : undefined}>
              <Icon className="h-4 w-4" /> {th ? ({ Items: 'สินค้า', Watchlist: 'รายการโปรด', Gold: 'ตลาดทอง', About: 'เกี่ยวกับเรา' }[label] || label) : label}
            </Link>
          ))}
        </nav>
        <button type="button" onClick={toggle} className="language-toggle" aria-label="Switch language">{th ? 'EN' : 'ไทย'}</button>
        <div className="shrink-0 md:ml-2"><UserProfile /></div>
      </header>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={pathname === href ? 'is-active' : ''} aria-current={pathname === href ? 'page' : undefined}>
            <Icon className="h-5 w-5" /><span>{th ? ({ Items: 'สินค้า', Watchlist: 'โปรด', Gold: 'ทอง', About: 'ข้อมูล' }[label] || label) : label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
