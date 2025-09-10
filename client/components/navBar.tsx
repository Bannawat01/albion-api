'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <nav className="w-full flex items-center justify-between p-4 bg-slate-700">
      <div>
        <Link href="/" className="text-lg font-bold text-gray-800">
          <Image
            src="/images/logo.png"
            alt="Albo Logo"
            width={120}
            height={32}
            priority
            fetchPriority="high"
            className="h-8 w-auto"
          />
        </Link>
      </div>

      <div className="flex-1 flex justify-left space-x-4 ml-8">
        <Link
          href="/gold"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-semibold shadow-md hover:from-yellow-500 hover:to-yellow-700 hover:text-white transition-all duration-200"
        >
          {/* ไอคอนคงที่ ไม่เปลี่ยนขณะ hydrate */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18M5 13h14M7 9h10M9 5h6" />
          </svg>
          Gold Market
        </Link>
      </div>

      <div>
        {mounted ? (
          isAuthenticated ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-700 text-gray-900 font-semibold shadow-md hover:text-white transition-all duration-200"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-purple-600 text-gray-900 font-semibold shadow-md hover:from-blue-600 hover:to-purple-900 hover:text-white transition-all duration-200"
            >
              Login
            </Link>
          )
        ) : (
          /* Placeholder คงรูป เพื่อให้ SSR/CSR เหมือนกัน */
          <div style={{ width: 88, height: 36 }} />
        )}
      </div>
    </nav>
  )
}
