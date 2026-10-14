import { Role } from './adminData'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  phone?: string
  department?: string
  bio?: string
  lastLogin: string
}

const ADMIN_USERS: AdminUser[] = [
  {
    id: 'a1',
    name: 'SI Admin',
    email: 'sioffice2021@gmail.com',
    role: 'super_admin',
    phone: '01700000000',
    department: 'Management',
    bio: 'Super Administrator of SI Group',
    lastLogin: '2026-07-04T10:00:00Z',
  },
  {
    id: 'a2',
    name: 'Demo Manager',
    email: 'manager@demo.com',
    role: 'manager',
    phone: '01800000000',
    department: 'Operations',
    bio: 'Operations Manager',
    lastLogin: '2026-07-03T09:00:00Z',
  },
]

const PASSWORDS: Record<string, string> = {
  'sioffice2021@gmail.com': 'Ikshahid9',
  'manager@demo.com': 'Manager@123',
}

const STORAGE_KEY = 'si_admin_user'

export function loginAdmin(email: string, password: string): AdminUser {
  const correctPassword = PASSWORDS[email]
  if (!correctPassword || correctPassword !== password) {
    throw new Error('Invalid email or password')
  }
  const user = ADMIN_USERS.find((u) => u.email === email)
  if (!user) throw new Error('User not found')
  const loggedIn = { ...user, lastLogin: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn))
  return loggedIn
}

export function getCurrentAdmin(): AdminUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AdminUser
  } catch {
    return null
  }
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function updateAdminProfile(data: Partial<AdminUser>): AdminUser {
  const current = getCurrentAdmin()
  if (!current) throw new Error('Not logged in')
  const updated = { ...current, ...data }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}
