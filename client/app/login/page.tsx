'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getLoginErrorMessage } from '@/lib/errorMessage'

function LoginContent() {
  const { login, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const [localError, setLocalError] = useState('')
  const redirect = searchParams.get('redirect') || '/'
  const errorMessage = localError || getLoginErrorMessage(searchParams.get('error'))

  const handleLogin = async () => {
    setLocalError('')
    try {
      await login(redirect)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Unable to start Google sign-in')
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <img src="/images/market-ledger-logo.png" alt="Albion Market Ledger" width="128" height="128" className="mb-5 h-28 w-28 object-contain drop-shadow-xl" />
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Royal Market Access</p>
        <h1 className="font-ledger text-3xl font-semibold text-foreground">Sign in to your ledger</h1>
        <p className="text-sm text-muted-foreground text-center mt-2 mb-6">
          Use one Google account across the Albion Market Ledger.
        </p>
        {errorMessage && <p role="alert" className="w-full mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</p>}
        <button type="button" onClick={handleLogin} disabled={isLoading} className="google-sign-in">
          <img src="/images/google.webp" alt="" width="24" height="24" className="h-6 w-6" />
          {isLoading ? 'Checking session...' : 'Continue with Google'}
        </button>
        <p className="mt-5 text-xs text-muted-foreground">Protected with OAuth 2.0, PKCE, and single sign-on.</p>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading...</p>}><LoginContent /></Suspense>
}
