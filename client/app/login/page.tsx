"use client"
import React, { useState } from "react"

const startGoogleLogin = async () => {
  const res = await fetch('https://localhost:8800/api/auth/google') // เปลี่ยนเป็น URL ของ backend จริง
  const data = await res.json()

  if (data.success && data.url) {
    window.location.href = data.url // redirect ไปยัง Google OAuth
  } else {
    console.error('OAuth error:', data.error)
  }
}
const LoginPage: React.FC = () => {
  const handleGoogleLogin = () => {
    startGoogleLogin()
  }

  return (

    <div className="flex flex-col items-center justify-center min-h-20 bg-gradient-to-br from-slate-900 to-slate-700 p-6 rounded-3xl shadow-xl w-full max-w-sm mx-auto mt-20">

      <div className="mb-8 h-32 w-32 shadow-lg rounded-full bg-white flex items-center justify-center">
        <img src="/images/google.webp" alt="Google Logo" className="h-full w-full object-contain" />
      </div>

      <button
        type="button"
        onClick={startGoogleLogin}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-500 text-gray-900 font-semibold shadow-md hover:from-yellow-500 hover:via-green-500 hover:to-blue-700 hover:text-white transition-all duration-200"
      >

        <span>เข้าสู่ระบบด้วย Google</span>
      </button>
    </div>
  )
}

export default LoginPage