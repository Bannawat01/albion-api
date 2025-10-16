'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { SafeUser } from '@server/types/UserType'

type Ctx = {
  user: SafeUser | null
  isLoading: boolean
  login: (redirect?: string) => void
  logout: () => void
  checkAuthStatus: () => Promise<void>
  isAuthenticated: boolean
}

type AuthSingleton = {
  hasChecked: boolean
  inflight: Promise<void> | null
  lastAt: number
  user: SafeUser | null
  isLoading: boolean
}
const GLOBAL_KEY = '__albo_auth_singleton__'
const g: { val: AuthSingleton } = (globalThis as any)[GLOBAL_KEY] ??= {
  val: { hasChecked: false, inflight: null, lastAt: 0, user: null, isLoading: true }
}

const AuthContext = createContext<Ctx | undefined>(undefined)
const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://albion-backend-4exf.onrender.com'
const MIN_INTERVAL_MS = 8000

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth-token')
}

// helpers สำหรับคุกกี้สถานะ (ใช้กับ middleware)
const setCookie = (name: string, value: string, maxAgeSec: number) => {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSec}; samesite=lax`
}
const delCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
}

async function _doCheck(setLocal: (u: SafeUser | null, loading: boolean) => void) {
  const now = Date.now()
  if (g.val.inflight) return g.val.inflight
  if (now - g.val.lastAt < MIN_INTERVAL_MS) return

  g.val.lastAt = now
  g.val.isLoading = true
  setLocal(g.val.user, true)

  const p = (async () => {
    try {
      const token = getToken()
      if (!token) { g.val.user = null; return }
      const res = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) { g.val.user = null; return }
      const data = await res.json()
      g.val.user = data as SafeUser
    } catch {
      g.val.user = null
    } finally {
      g.val.isLoading = false
      setLocal(g.val.user, false)
      g.val.inflight = null
    }
  })()

  g.val.inflight = p
  return p
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(g.val.user)
  const [isLoading, setIsLoading] = useState<boolean>(g.val.isLoading)
  const setLocal = (u: SafeUser | null, l: boolean) => { setUser(u); setIsLoading(l) }

  useEffect(() => {
    if (!g.val.hasChecked) {
      g.val.hasChecked = true
      void _doCheck(setLocal)
    } else {
      setLocal(g.val.user, g.val.isLoading)
    }
  }, [])

  const checkAuthStatus = async () => { await _doCheck(setLocal) }

  const login = async (redirect?: string) => {
    const r = await fetch(`${API}/api/auth/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`)
    const d = await r.json()
    if (d?.url) window.location.href = d.url
  }

  const logout = async () => {
    try {
      // ให้ฝั่ง server ลบคุกกี้ httpOnly + logged_in
      await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch {}
    // กันเหนียว ลบฝั่ง client ด้วย
    delCookie('logged_in')

    localStorage.removeItem('auth-token')
    g.val.user = null
    setLocal(null, false)
  }

  // หลัง login (user ถูกเซ็ต) → ตั้งคุกกี้สถานะให้ middleware เห็น
  useEffect(() => {
    if (user) {
      setCookie('logged_in', '1', 7 * 24 * 60 * 60) // 7 วัน
    } else {
      delCookie('logged_in')
    }
  }, [user])

  // กลับไปหน้า redirect ที่เก็บไว้ (ถ้ามี)
  useEffect(() => {
    if (user) {
      const to = localStorage.getItem('postLoginRedirect')
      if (to) {
        localStorage.removeItem('postLoginRedirect')
        window.location.replace(to)
      }
    }
  }, [user])

  const value = useMemo<Ctx>(() => ({
    user, isLoading, login, logout, checkAuthStatus, isAuthenticated: !!user
  }), [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}