'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, getCurrentUser, loginUser, logoutUser, DEFAULT_USERS } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const existing = localStorage.getItem('si_shop_users')
    if (!existing) localStorage.setItem('si_shop_users', JSON.stringify(DEFAULT_USERS))
    setUser(getCurrentUser())
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string): boolean => {
    const u = loginUser(email, password)
    if (u) { setUser(u); return true }
    return false
  }

  const logout = () => { logoutUser(); setUser(null) }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
