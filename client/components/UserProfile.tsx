'use client'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from './ui/button'

export const UserProfile = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  if (isLoading) return null

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => login()}
        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-purple-600 text-gray-900 font-semibold shadow-md hover:from-blue-600 hover:to-purple-900 hover:text-white transition-all duration-200 "
      >
        Login
      </Button>
    )
  }
  
  return (
    <div className="flex items-center gap-3">
      <Image
        src={user?.picture || '/images/default-avatar.png'}
        alt={user?.name ?? 'user'}
        width={32}
        height={32}
        className="rounded-full"
      />
      <span className="text-white hidden sm:block">{user?.name}</span>
      <button onClick={logout} className="cursor-pointer px-3 py-1 bg-red-500 text-white rounded">
        ออกจากระบบ
      </button>
    </div>
  )
}
