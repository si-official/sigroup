'use client'
import { useState, useEffect, useCallback } from 'react'
import { portalAuth } from './portalApi'
import type { PortalUser } from '../types/auth'

const TOKEN_KEY = 'si_portal_token'
const USER_KEY = 'si_portal_user'

export function usePortalAuth() {
  const [user, setUser] = useState<PortalUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await portalAuth.login(email, password)
    localStorage.setItem(TOKEN_KEY, data.access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.access_token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    if (token) await portalAuth.logout(token).catch(() => {})
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [token])

  return { user, token, loading, login, logout, isLoggedIn: !!user }
}
