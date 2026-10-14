'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/lib/types'
import { loginUser, getCurrentUser, logoutUser, saveCurrentUser } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAdmin: () => boolean
  isInstructor: () => boolean
  isCoaching: () => boolean
  isStudent: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = getCurrentUser()
    setUser(u)
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const found = loginUser(email, password)
    if (!found) return { success: false, error: 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে' }
    if (found.status === 'suspended') return { success: false, error: 'আপনার অ্যাকাউন্ট সাসপেন্ড করা হয়েছে' }
    setUser(found)
    saveCurrentUser(found)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    logoutUser()
  }

  const isAdmin = () => user?.role === 'super_admin' || user?.role === 'admin'
  const isInstructor = () => user?.role === 'instructor'
  const isCoaching = () => user?.role === 'coaching_center'
  const isStudent = () => user?.role === 'student'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isInstructor, isCoaching, isStudent }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
