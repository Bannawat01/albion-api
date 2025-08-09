"use client"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect } from "react"

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleGoogleLogin = () => {
    login()
  }

  // ตรวจสอบ error parameters
  const error = searchParams.get('error')
  const getErrorMessage = () => {
    switch (error) {
      case 'user_cancelled':
        return 'คุณได้ยกเลิกการเข้าสู่ระบบ'
      case 'auth_failed':
        return 'การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง'
      case 'oauth_error':
        return 'เกิดข้อผิดพลาดจาก Google OAuth'
      case 'invalid_callback':
        return 'ข้อมูล callback ไม่ถูกต้อง'
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">กำลังโหลด...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }


  const errorMessage = getErrorMessage()

  return (
    <div className="flex flex-col items-center justify-center min-h-20 bg-gradient-to-br from-slate-900 to-slate-700 p-6 rounded-3xl shadow-xl w-full max-w-sm mx-auto mt-20">

      {/* แสดง Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg w-full text-center">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 h-32 w-32 shadow-lg rounded-full bg-white flex items-center justify-center">
        <img
          src="/images/google.webp"
          alt="Google Logo"
          width="128"
          height="128"
          className="h-full w-full object-contain"
        />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-500 text-gray-900 font-semibold shadow-md hover:from-yellow-500 hover:via-green-500 hover:to-blue-700 hover:text-white transition-all duration-200"
      >
        <span>เข้าสู่ระบบด้วย Google</span>
      </button>
    </div>
  )
}

export default LoginPage