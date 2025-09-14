'use client'

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { UserProfile } from "@/components/UserProfile"

export default function NavBar() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <nav className="w-full flex items-center justify-between p-4 bg-slate-700">
      {/* Logo */}
      <div>
        <Link href="/" className="text-lg font-bold text-gray-800">
          <img src="/images/logo.png" alt="Albo Logo" width="50" height="50" className="h-8" />
        </Link>
      </div>

      {/* Center navigation */}
      <div className="flex-1 flex justify-left space-x-4 ml-8">
        <Link
          href="/gold"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r
                     from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-semibold
                     shadow-md hover:from-yellow-500 hover:to-yellow-700 hover:text-white
                     transition-all duration-200">
          Gold Market
        </Link>

        {!isLoading && isAuthenticated && (
          <Link 
            href="/ai"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r
                       from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-semibold
                       shadow-md hover:from-yellow-500 hover:to-yellow-700 hover:text-white
                       transition-all duration-200">
            Ai Tool
          </Link>
        )}
      </div>

      {/* Profile/Login */}
      <div>
        <UserProfile />
      </div>
    </nav>
  )
}
