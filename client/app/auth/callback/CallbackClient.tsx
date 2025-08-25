'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'

export default function CallbackClient({ code, state }: { code: string; state: string }) {
  const router = useRouter()
  const { checkAuthStatus } = useAuth()

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await fetch(
          `https://localhost:8800/api/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        )
        const data = await resp.json()

        if (data.success && data.token) {
          localStorage.setItem('auth-token', data.token)
          await checkAuthStatus()
          router.push('/')
        } else {
          router.push('/login?error=auth_failed')
        }
      } catch (err) {
        console.error('Callback error:', err)
        router.push('/login?error=auth_failed')
      }
    }
    run()
  }, [code, state, router, checkAuthStatus])

  return <div>กำลังดำเนินการเข้าสู่ระบบ...</div>
}