"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const startGoogleLogin = async () => {
  try {
    const res = await fetch('https://localhost:8800/api/auth/google');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();

    if (data.success && data.url) {
      window.location.href = data.url;
    } else {
      console.error('OAuth error:', data.error);
      throw new Error(data.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Failed to start Google login:', error);
    // You could set an error state here if needed
  }
};

const LoginPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');
  const [isAutoRedirecting, setIsAutoRedirecting] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (error) {
      setIsAutoRedirecting(false);
      return;
    }

    // Auto-redirect to Google login if no error
    const timer = setTimeout(() => {
      startGoogleLogin();
    }, 1000);

    return () => clearTimeout(timer);
  }, [error]);

  // Countdown for retry after error
  useEffect(() => {
    if (error && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [error, countdown]);

  const handleRetry = () => {
    // Clear error from URL
    router.push('/login');
    // Start login process
    setTimeout(startGoogleLogin, 500);
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto">
        
        {/* Google Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-32 w-32 shadow-lg rounded-full bg-white flex items-center justify-center border-4 border-gray-100">
            <img 
              src="/images/google.webp" 
              alt="Google Logo" 
              className="h-20 w-20 object-contain" 
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            เข้าสู่ระบบ Albo Search
          </h1>
          <p className="text-gray-600">
            ใช้บัญชี Google ของคุณเพื่อเข้าสู่ระบบ
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    เกิดข้อผิดพลาด
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    {decodeURIComponent(error)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!error && isAutoRedirecting && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">กำลังเปลี่ยนเส้นทางไปยัง Google...</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {error ? (
            // Show retry and home buttons when there's an error
            <>
              <button
                type="button"
                onClick={handleRetry}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>ลองใหม่อีกครั้ง</span>
              </button>
              
              <button
                type="button"
                onClick={handleGoHome}
                className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:text-gray-800 transition-all duration-200"
              >
                กลับหน้าหลัก
              </button>
            </>
          ) : (
            // Show manual login button as fallback
            <button
              type="button"
              onClick={startGoogleLogin}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-500 text-gray-900 font-semibold shadow-md hover:from-yellow-500 hover:via-green-500 hover:to-blue-700 hover:text-white transition-all duration-200"
            >
              <img 
                src="/images/google.webp" 
                alt="Google" 
                className="h-5 w-5" 
              />
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            โดยการเข้าสู่ระบบ คุณยอมรับ{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              ข้อกำหนดการใช้งาน
            </a>{' '}
            และ{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              นโยบายความเป็นส่วนตัว
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;