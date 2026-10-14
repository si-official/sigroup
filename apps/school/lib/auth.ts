import { User, UserRole, Instructor, CoachingCenter, Student } from './types'
import { instructors, coachingCenters } from './data'

export const DEFAULT_USERS: User[] = [
  {
    id: 'super-admin-1',
    name: 'SI Admin',
    email: 'sioffice2021@gmail.com',
    password: 'Ikshahid9',
    role: 'super_admin',
    createdAt: '2022-01-01',
    status: 'active',
  },
  {
    id: 'demo-instructor',
    name: 'Demo Instructor',
    email: 'instructor@demo.com',
    password: 'Inst@123',
    role: 'instructor',
    createdAt: '2023-01-01',
    status: 'active',
  },
  {
    id: 'demo-coaching',
    name: 'Demo Academy',
    email: 'coaching@demo.com',
    password: 'Coach@123',
    role: 'coaching_center',
    createdAt: '2023-01-01',
    status: 'active',
  },
  {
    id: 'demo-student',
    name: 'Demo Student',
    email: 'student@demo.com',
    password: 'Student@123',
    role: 'student',
    createdAt: '2023-01-01',
    status: 'active',
  },
]

const ALL_USERS = [
  ...DEFAULT_USERS,
  ...instructors,
  ...coachingCenters,
]

export function loginUser(email: string, password: string): User | null {
  const found = ALL_USERS.find(u => u.email === email && u.password === password)
  return found || null
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('school_current_user')
  return stored ? JSON.parse(stored) : null
}

export function logoutUser() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('school_current_user')
}

export function saveCurrentUser(user: User) {
  if (typeof window === 'undefined') return
  localStorage.setItem('school_current_user', JSON.stringify(user))
}
