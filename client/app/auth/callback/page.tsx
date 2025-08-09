// app/auth/callback/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { checkAuthStatus } = useAuth()

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code')
            const state = searchParams.get('state')

            if (code && state) {
                try {
                    const response = await fetch(`https://localhost:8800/api/auth/google/callback?code=${code}&state=${state}`)
                    const data = await response.json()

                    if (data.success && data.token) {
                        localStorage.setItem('auth-token', data.token)
                        await checkAuthStatus()
                        router.push('/')
                    } else {
                        router.push('/login?error=auth_failed')
                    }
                } catch (error) {
                    console.error('Callback error:', error)
                    router.push('/login?error=auth_failed')
                }
            } else {
                router.push('/login?error=invalid_callback')
            }
        }

        handleCallback()
    }, [searchParams, router, checkAuthStatus])

    return <div>กำลังดำเนินการเข้าสู่ระบบ...</div>
}