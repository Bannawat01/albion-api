import { redirect } from 'next/navigation'
import CallbackClient from './CallbackClient'


export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const code = typeof sp.code === 'string' ? sp.code : undefined
  const state = typeof sp.state === 'string' ? sp.state : undefined

  if (!code || !state) {
    redirect('/login?error=invalid_callback')
  }

  return <CallbackClient code={code} state={state} />
}
'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const search = useSearchParams()
  const { checkAuthStatus } = useAuth()

  useEffect(() => {
    const token = search.get('token')  // backend จะส่งมาทาง query
    if (!token) {
      router.replace('/login?error=missing_token')
      return
    }
    localStorage.setItem('auth-token', token)
    // อัปเดตสถานะ user แล้วพากลับหน้าแรก
    ;(async () => {
      await checkAuthStatus()
      router.replace('/')
    })()
  }, [search, router, checkAuthStatus])

  return null
}
