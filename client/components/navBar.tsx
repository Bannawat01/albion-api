'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CircleHelp, Coins, List, Star, TrendingUp } from 'lucide-react'
const links = [
  { path: '', en: 'Items', th: 'สินค้า', mobileEn: 'Items', mobileTh: 'สินค้า', icon: List },
  { path: '/opportunities', en: 'Opportunities', th: 'โอกาสวันนี้', mobileEn: 'Deals', mobileTh: 'โอกาส', icon: TrendingUp },
  { path: '/watchlist', en: 'Watchlist', th: 'รายการโปรด', mobileEn: 'Saved', mobileTh: 'โปรด', icon: Star },
  { path: '/gold', en: 'Gold', th: 'ตลาดทอง', mobileEn: 'Gold', mobileTh: 'ทอง', icon: Coins },
  { path: '/about', en: 'About', th: 'เกี่ยวกับเรา', mobileEn: 'About', mobileTh: 'ข้อมูล', icon: CircleHelp },
]

export default function NavBar() {
  useEffect(() => document.documentElement.classList.add('dark'), [])
  const pathname = usePathname()
  const locale = pathname.startsWith('/en') ? 'en' : 'th'
  const localizedPath = pathname.replace(/^\/(th|en)(?=\/|$)/, '')

  return (
    <>
      <header className="ledger-nav">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group shrink-0" aria-label="Albion Market Ledger home">
          <img src="/images/market-ledger-logo.png" alt="" width="44" height="44" className="h-10 w-10 object-contain transition-transform group-hover:scale-105" />
          <span className="font-ledger hidden sm:block text-lg font-semibold text-gold">Market Ledger</span>
        </Link>
        <span className="server-seal"><span /> Asia</span>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map(({ path, en, th, icon: Icon }) => {
            const href = `/${locale}${path}`
            return <Link key={path} href={href} className={'nav-link ' + (pathname === href ? 'is-active' : '')} aria-current={pathname === href ? 'page' : undefined}>
              <Icon className="h-4 w-4" /> {locale === 'th' ? th : en}
            </Link>
          })}
        </nav>
        <Link href={`/${locale === 'th' ? 'en' : 'th'}${localizedPath}`} className="language-toggle" aria-label="Switch language">{locale === 'th' ? 'EN' : 'ไทย'}</Link>
      </header>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {links.map(({ path, mobileEn, mobileTh, icon: Icon }) => {
          const href = `/${locale}${path}`
          return <Link key={path} href={href} className={pathname === href ? 'is-active' : ''} aria-current={pathname === href ? 'page' : undefined}>
            <Icon className="h-5 w-5" /><span>{locale === 'th' ? mobileTh : mobileEn}</span>
          </Link>
        })}
      </nav>
    </>
  )
}
