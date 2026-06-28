'use client'
import { useState, useEffect, useCallback } from 'react'
import { api, User } from './portalApi'

const T_KEY = 'si_token'
const U_KEY = 'si_user'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem(T_KEY)
    const u = localStorage.getItem(U_KEY)
    if (t && u) { setToken(t); setUser(JSON.parse(u)) }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password)
    localStorage.setItem(T_KEY, data.access_token)
    localStorage.setItem(U_KEY, JSON.stringify(data.user))
    setToken(data.access_token); setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    if (token) await api.logout(token).catch(() => {})
    localStorage.removeItem(T_KEY); localStorage.removeItem(U_KEY)
    setToken(null); setUser(null)
  }, [token])

  return { user, token, loading, login, logout, isLoggedIn: !!user }
}
