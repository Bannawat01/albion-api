'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function CallbackClient({ code, state }: { code: string; state: string }) {
  const router = useRouter()
  const search = useSearchParams()
  const { checkAuthStatus } = useAuth()

  useEffect(() => {
    const token = search.get('token')  // backend จะส่งมา query
    if (!token) {
      router.replace('/login?error=missing_token')
      return
    }

    localStorage.setItem('auth-token', token)

    ;(async () => {
      await checkAuthStatus()
      router.replace('/')
    })()
  }, [search, router, checkAuthStatus])

  return null
}
