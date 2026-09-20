'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { SafeUser } from '@server/types/UserType'
import { API_BASE_URL } from '@/api/config'

const TOKEN_KEY = 'auth-token'
const STATUS_COOKIE = 'logged_in'

type AuthContextValue = {
  user: SafeUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (redirect?: string) => Promise<void>
  logout: () => Promise<void>
  checkAuthStatus: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const setStatusCookie = (loggedIn: boolean) => {
  document.cookie = loggedIn
    ? STATUS_COOKIE + '=1; path=/; max-age=604800; samesite=lax'
    : STATUS_COOKIE + '=; path=/; max-age=0; samesite=lax'
}

const safeRedirect = (value?: string) =>
  value?.startsWith('/') && !value.startsWith('//') ? value : '/'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setUser(null)
      setStatusCookie(false)
      return false
    }

    setIsLoading(true)
    try {
      const response = await fetch(API_BASE_URL + '/api/auth/me', {
        headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Session expired')
      setUser(await response.json())
      setStatusCookie(true)
      return true
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
      setStatusCookie(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (redirect?: string) => {
    localStorage.setItem('postLoginRedirect', safeRedirect(redirect))
    const response = await fetch(API_BASE_URL + '/api/auth/google')
    if (!response.ok) throw new Error('Unable to start Google sign-in')
    const data = await response.json()
    if (!data?.url) throw new Error('Google sign-in URL was not returned')
    window.location.assign(data.url)
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(API_BASE_URL + '/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('postLoginRedirect')
      setUser(null)
      setStatusCookie(false)
    }
  }, [])

  useEffect(() => {
    void checkAuthStatus()
  }, [checkAuthStatus])

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    checkAuthStatus,
  }), [user, isLoading, login, logout, checkAuthStatus])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
