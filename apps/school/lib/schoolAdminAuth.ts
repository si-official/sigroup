export interface SchoolAdmin {
  email: string
  name: string
  role: 'super_admin'
}

const ADMIN_KEY = 'si_school_admin'

export function schoolAdminLogin(email: string, password: string): SchoolAdmin {
  if (email === 'sioffice2021@gmail.com' && password === 'Ikshahid9') {
    const admin: SchoolAdmin = { email, name: 'SI Admin', role: 'super_admin' }
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
    return admin
  }
  throw new Error('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে')
}

export function getSchoolAdmin(): SchoolAdmin | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(ADMIN_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function schoolAdminLogout(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(ADMIN_KEY)
}
