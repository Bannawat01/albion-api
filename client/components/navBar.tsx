'use client'

import { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { UserProfile } from "@/components/UserProfile"

export default function NavBar() {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Force dark theme
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <nav className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-lg shadow-black/20">
      {/* Logo */}
      <div className="shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/images/logo.png"
            alt="Albo Logo"
            width="50"
            height="50"
            className="h-8 w-auto transition-transform duration-200 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Center navigation */}
      <div className="flex-1 flex justify-start items-center gap-1.5 sm:gap-2 ml-2 sm:ml-6 overflow-x-auto">
        {/* Gold Market – the primary, gold-accented action */}
        <Link
          href="/gold"
          className="group inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
                     bg-primary/15 text-primary font-semibold border border-primary/30
                     hover:bg-primary/25 hover:border-primary/50 transition-colors duration-200 whitespace-nowrap">
          <span className="text-base">💰</span>
          <span>Gold Market</span>
        </Link>

        {!isLoading && isAuthenticated && (
          <Link
            href="/ai"
            className="group inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
                       text-emerald-300 font-semibold border border-emerald-500/25
                       hover:bg-emerald-500/15 hover:border-emerald-400/45 transition-colors duration-200 whitespace-nowrap">
            <span className="text-base">🤖</span>
            <span>AI Tool</span>
          </Link>
        )}

        <Link
          href="/about"
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
                     text-muted-foreground font-medium border border-transparent
                     hover:text-foreground hover:bg-secondary hover:border-border transition-colors duration-200 whitespace-nowrap">
          About
        </Link>

        <Link
          href="/donate"
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
                     text-muted-foreground font-medium border border-transparent
                     hover:text-rose-300 hover:bg-secondary hover:border-border transition-colors duration-200 whitespace-nowrap">
          <span className="text-rose-400">❤️</span> <span className="hidden sm:inline">Donate</span>
        </Link>
      </div>

      {/* Profile/Login */}
      <div className="flex items-center gap-4 shrink-0">
        <UserProfile />
      </div>
    </nav>
  )
}
