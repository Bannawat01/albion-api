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
        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-colors duration-200"
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
      <span className="text-foreground hidden sm:block">{user?.name}</span>
      <button onClick={logout} className="cursor-pointer px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors">
        Logout
      </button>
    </div>
  )
}
