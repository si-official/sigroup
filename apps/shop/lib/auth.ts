export type Role = 'super_admin' | 'admin' | 'vendor' | 'customer'

export interface Permission {
  id: string
  label: string
  description: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  avatar?: string
  shopName?: string
  verified?: boolean
  createdAt: string
  status: 'active' | 'suspended'
}

export const PERMISSIONS: Record<string, Permission> = {
  manage_all:        { id: 'manage_all',        label: 'Manage All',          description: 'Full system access' },
  manage_users:      { id: 'manage_users',       label: 'Manage Users',        description: 'Create, edit, suspend users' },
  manage_products:   { id: 'manage_products',    label: 'Manage Products',     description: 'Approve, reject, delete any product' },
  manage_sellers:    { id: 'manage_sellers',     label: 'Manage Sellers',      description: 'Verify, suspend sellers' },
  manage_customers:  { id: 'manage_customers',   label: 'Manage Customers',    description: 'View and manage customer accounts' },
  manage_orders:     { id: 'manage_orders',      label: 'Manage Orders',       description: 'View and update all orders' },
  manage_categories: { id: 'manage_categories',  label: 'Manage Categories',   description: 'Add, edit, delete categories' },
  manage_settings:   { id: 'manage_settings',    label: 'Manage Settings',     description: 'Change site settings, commission rate' },
  manage_roles:      { id: 'manage_roles',       label: 'Manage Roles',        description: 'Assign and edit roles/permissions' },
  manage_revenue:    { id: 'manage_revenue',     label: 'View Revenue',        description: 'View financial reports' },
  own_products:      { id: 'own_products',       label: 'Own Products',        description: 'Manage own products only' },
  own_orders:        { id: 'own_orders',         label: 'Own Orders',          description: 'View own sales orders' },
  own_earnings:      { id: 'own_earnings',       label: 'Own Earnings',        description: 'View own earnings/payout' },
  purchase:          { id: 'purchase',           label: 'Purchase',            description: 'Buy products' },
  download:          { id: 'download',           label: 'Download',            description: 'Download purchased items' },
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  super_admin: Object.keys(PERMISSIONS),
  admin:       ['manage_products','manage_sellers','manage_customers','manage_orders','manage_categories','manage_revenue'],
  vendor:      ['own_products','own_orders','own_earnings'],
  customer:    ['purchase','download'],
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin:       'Admin',
  vendor:      'Vendor',
  customer:    'Customer',
}

export const ROLE_COLORS: Record<Role, string> = {
  super_admin: 'bg-red-100 text-red-700',
  admin:       'bg-purple-100 text-purple-700',
  vendor:      'bg-blue-100 text-blue-700',
  customer:    'bg-green-100 text-green-700',
}

export const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    name: 'SI Group Admin',
    email: 'sioffice2021@gmail.com',
    password: 'Ikshahid9',
    role: 'super_admin',
    avatar: 'S',
    verified: true,
    createdAt: '2024-01-01',
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Demo Vendor',
    email: 'vendor@demo.com',
    password: 'Vendor@123',
    role: 'vendor',
    shopName: 'Demo Shop BD',
    avatar: 'D',
    verified: true,
    createdAt: '2024-03-15',
    status: 'active',
  },
  {
    id: 'u3',
    name: 'Demo Customer',
    email: 'customer@demo.com',
    password: 'Customer@123',
    role: 'customer',
    avatar: 'C',
    verified: true,
    createdAt: '2024-04-10',
    status: 'active',
  },
]

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getUsers(): User[] {
  if (typeof window === 'undefined') return DEFAULT_USERS
  try {
    const stored = localStorage.getItem('si_shop_users')
    if (stored) return JSON.parse(stored)
  } catch {}
  localStorage.setItem('si_shop_users', JSON.stringify(DEFAULT_USERS))
  return DEFAULT_USERS
}

export function saveUsers(users: User[]): void {
  localStorage.setItem('si_shop_users', JSON.stringify(users))
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('si_shop_current_user')
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

export function loginUser(email: string, password: string): User | null {
  const users = getUsers()
  const user = users.find(u => u.email === email && u.password === password && u.status === 'active')
  if (user) {
    localStorage.setItem('si_shop_current_user', JSON.stringify(user))
    return user
  }
  return null
}

export function logoutUser(): void {
  localStorage.removeItem('si_shop_current_user')
}
