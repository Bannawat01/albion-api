// components/UserProfile.tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'

export const UserProfile = () => {
    const { user, logout, isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex items-center gap-4">
            <img
                src={user?.picture}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
            />
            <span>{user?.name}</span>
            <button
                onClick={logout}
                className="px-3 py-1 bg-red-500 text-white rounded"
            >
                ออกจากระบบ
            </button>
        </div>
    )
}