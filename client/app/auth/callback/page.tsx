'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function CallbackPage() {
  const router = useRouter()
  const { checkAuthStatus } = useAuth()

  useEffect(() => {
    const token = new URLSearchParams(location.hash.slice(1)).get('token')
    history.replaceState(null, '', location.pathname)
    if (!token) {
      router.replace('/login?error=missing_token')
      return
    }

    localStorage.setItem('auth-token', token)
    void checkAuthStatus().then((authenticated) => {
      if (!authenticated) {
        router.replace('/login?error=invalid_token')
        return
      }
      const stored = localStorage.getItem('postLoginRedirect')
      localStorage.removeItem('postLoginRedirect')
      router.replace(stored?.startsWith('/') && !stored.startsWith('//') ? stored : '/')
    })
  }, [router, checkAuthStatus])

  return <p className="p-8 text-center text-muted-foreground">Completing secure Google sign-in...</p>
}
