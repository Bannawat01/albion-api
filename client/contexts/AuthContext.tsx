'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import type { SafeUser } from '@server/types/UserType'

interface AuthContextType {
    user: SafeUser | null
    isLoading: boolean
    login: () => void
    logout: () => void
    checkAuthStatus: () => Promise<void>
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<SafeUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // ตรวจสอบ authentication status เมื่อ component mount
    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('auth-token')
            if (!token) {
                setIsLoading(false)
                return
            }

            const response = await fetch('https://localhost:8800/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                localStorage.removeItem('auth-token')
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('auth-token')
        } finally {
            setIsLoading(false)
        }
    }

    const login = async () => {
        try {
            const response = await fetch('https://localhost:8800/api/auth/google')
            const data = await response.json()

            if (data.success && data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error('Login failed:', error)
        }
    }

    const logout = async () => {
        try {
            await fetch('https://localhost:8800/api/auth/logout', {
                method: 'POST'
            })
            localStorage.removeItem('auth-token')
            setUser(null)
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const value = {
        user,
        isLoading,
        login,
        logout,
        checkAuthStatus,
        isAuthenticated: !!user
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}