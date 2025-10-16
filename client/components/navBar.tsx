'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { UserProfile } from "@/components/UserProfile"

export default function NavBar() {
  const { isAuthenticated, isLoading } = useAuth()
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <nav className="w-full flex items-center justify-between p-4 bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-lg">
      {/* Logo */}
      <div>
        <Link href="/" className="text-lg font-bold text-foreground">
          <img
            src={theme === 'dark' ? "/images/logo.png" : "/images/logo-black.png"}
            alt="Albo Logo"
            width="50"
            height="50"
            className="h-8"
          />
        </Link>
      </div>

      {/* Center navigation */}
      <div className="flex-1 flex justify-left space-x-4 ml-8">
        <Link
          href="/gold"
          className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r
                     from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-semibold
                     shadow-md hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105 overflow-hidden border border-yellow-300/30">
          <span className="relative z-10 flex items-center gap-2">
            <span className="text-lg">💰</span>
            Gold Market
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
        </Link>

        {!isLoading && isAuthenticated && (
          <Link
            href="/ai"
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r
                       from-purple-400 via-purple-500 to-purple-600 text-white font-semibold
                       shadow-md hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 overflow-hidden border border-purple-300/30">
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-lg">🤖</span>
              AI Tool
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          </Link>
        )}

        <Link
          href="/about"
          className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r
                     from-blue-400 via-blue-500 to-blue-600 text-white font-semibold
                     shadow-md hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 overflow-hidden">
          <span className="relative z-10">About</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>

        <Link
          href="/donate"
          className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r
                     from-pink-400 via-pink-500 to-pink-600 text-white font-semibold
                     shadow-md hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 overflow-hidden">
          <span className="relative z-10">❤️ Donate</span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>

      {/* Theme Toggle & Profile/Login */}
      <div className="flex items-center gap-4">
        <button

          onClick={toggleTheme}
          className="cursor-pointer p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-foreground"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <UserProfile />
      </div>
    </nav>
  )
}
