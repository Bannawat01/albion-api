'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkAuthStatus } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('auth-token', token)
      // โหลด user ใหม่
      checkAuthStatus().then(() => {
        router.replace('/') // กลับไปหน้าแรก หรือจะ redirect ไปหน้าที่คุณต้องการก็ได้
      })
    } else {
      router.replace('/login?error=missing_token')
    }
  }, [searchParams, router, checkAuthStatus])

  return <p className="p-4">กำลังเข้าสู่ระบบ...</p>
}
