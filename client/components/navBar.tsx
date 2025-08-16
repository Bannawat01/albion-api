"use client"
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

export default function NavBar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  return (
    <nav className="w-full flex items-center justify-between p-4 bg-slate-700">
      <div>
        <Link href="/" className="text-lg font-bold text-gray-800">
          <img src="/images/logo.png" alt="Albo Logo" width="32" height="32" className="h-8" />
        </Link>
      </div>
      <div className="flex-1 flex justify-left space-x-4 ml-8">
        <Link
          href="/gold"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-semibold shadow-md hover:from-yellow-500 hover:to-yellow-700 hover:text-white transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18M5 13h14M7 9h10M9 5h6" />
          </svg>
          Gold Market
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {!isLoading && isAuthenticated && (
          <>
            <span className="text-sm text-white hidden sm:inline-flex bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-600/60">
              {user?.email || user?.name || 'User'}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-400 to-pink-600 text-white font-semibold shadow-md hover:from-red-500 hover:to-pink-700 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5" />
              </svg>
              Logout
            </button>
          </>
        )}
        {!isLoading && !isAuthenticated && (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-purple-600 text-gray-900 font-semibold shadow-md hover:from-blue-600 hover:to-purple-900 hover:text-white transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
