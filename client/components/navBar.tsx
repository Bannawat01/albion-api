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
    <nav className="w-full flex items-center justify-between p-4 bg-card border-b border-border">
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
                     shadow-md hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105 overflow-hidden">
          <span className="relative z-10">Gold Market</span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>

        {!isLoading && isAuthenticated && (
          <Link
            href="/ai"
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r
                       from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-semibold
                       shadow-md hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105 overflow-hidden">
            <span className="relative z-10">Ai Tool</span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        )}
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
