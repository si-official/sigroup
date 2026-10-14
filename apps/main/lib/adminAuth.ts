'use client'

export interface AdminUser {
  email: string
  name: string
  role: 'super_admin' | 'editor'
}

const ADMIN_USERS = [
  { email: 'sioffice2021@gmail.com', password: 'Ikshahid9', name: 'SI Admin', role: 'super_admin' as const },
  { email: 'editor@demo.com', password: 'Editor@123', name: 'Demo Editor', role: 'editor' as const },
]

const AUTH_KEY = 'si_admin_user'

export function adminLogin(email: string, password: string): AdminUser {
  const user = ADMIN_USERS.find(u => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid email or password')
  const { password: _, ...userData } = user
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData))
  }
  return userData
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(AUTH_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function adminLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY)
  }
}
