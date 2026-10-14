'use client'

export interface ShopAdmin {
  email: string
  name: string
  role: 'super_admin'
  avatar: string
  loginTime: string
}

const ADMIN_EMAIL = 'sioffice2021@gmail.com'
const ADMIN_PASSWORD = 'Ikshahid9'
const STORAGE_KEY = 'si_shop_admin_session'

export function shopAdminLogin(email: string, password: string): ShopAdmin {
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    throw new Error('Invalid credentials')
  }
  const admin: ShopAdmin = {
    email: ADMIN_EMAIL,
    name: 'SI Group Admin',
    role: 'super_admin',
    avatar: 'S',
    loginTime: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(admin))
  return admin
}

export function getShopAdmin(): ShopAdmin | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

export function shopAdminLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
