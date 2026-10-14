'use client'
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AdminUser, getCurrentAdmin, logoutAdmin, updateAdminProfile } from '@/lib/adminAuth'

interface AdminContextValue {
  darkMode: boolean
  toggleDarkMode: () => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  currentAdmin: AdminUser | null
  authLoading: boolean
  setCurrentAdmin: (u: AdminUser | null) => void
  logout: () => void
  updateProfile: (data: Partial<AdminUser>) => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedDark = localStorage.getItem('si_admin_dark')
    const dark = savedDark !== null ? savedDark === 'true' : true
    setDarkMode(dark)
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    const savedCollapsed = localStorage.getItem('si_admin_sidebar_collapsed')
    if (savedCollapsed) setSidebarCollapsed(savedCollapsed === 'true')

    const admin = getCurrentAdmin()
    setCurrentAdmin(admin)
    setMounted(true)
  }, [])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev
      localStorage.setItem('si_admin_dark', String(next))
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return next
    })
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('si_admin_sidebar_collapsed', String(next))
      return next
    })
  }, [])

  const logout = useCallback(() => {
    logoutAdmin()
    setCurrentAdmin(null)
  }, [])

  const updateProfile = useCallback((data: Partial<AdminUser>) => {
    const updated = updateAdminProfile(data)
    setCurrentAdmin(updated)
  }, [])

  return (
    <AdminContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        sidebarCollapsed,
        toggleSidebar,
        currentAdmin,
        authLoading: !mounted,
        setCurrentAdmin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider')
  return ctx
}
