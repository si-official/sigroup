export type Role = 'super_admin' | 'admin' | 'manager' | 'staff' | 'partner' | 'client'

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  department: string
  avatar?: string
  status: 'active' | 'inactive' | 'on_leave'
  salary: number
  joinDate: string
  permissions: string[]
}

export interface Department {
  id: string
  name: string
  head: string
  memberCount: number
  description: string
  budget: number
  status: 'active' | 'inactive'
}

export interface PaymentMethod {
  id: string
  type: 'bkash' | 'nagad' | 'rocket' | 'card' | 'bank'
  label: string
  number?: string
  merchantId?: string
  apiKey?: string
  enabled: boolean
  testMode: boolean
  logo: string
}

export interface SmsProvider {
  id: string
  name: string
  apiUrl: string
  apiKey: string
  senderId: string
  enabled: boolean
  balance?: string
  provider: 'ssl' | 'alpha' | 'ajura' | 'custom'
}

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: 'Shahidul Islam',
    email: 'shahid@sigroup.com.bd',
    phone: '01700000001',
    role: 'super_admin',
    department: 'Management',
    status: 'active',
    salary: 150000,
    joinDate: '2020-01-15',
    permissions: ['super_access', 'manage_users', 'manage_settings', 'manage_permissions'],
  },
  {
    id: 'e2',
    name: 'Fatema Khatun',
    email: 'fatema@sigroup.com.bd',
    phone: '01800000002',
    role: 'manager',
    department: 'Operations',
    status: 'active',
    salary: 65000,
    joinDate: '2021-03-10',
    permissions: ['manage_employees', 'manage_departments', 'view_reports'],
  },
  {
    id: 'e3',
    name: 'Rahim Uddin',
    email: 'rahim@sigroup.com.bd',
    phone: '01900000003',
    role: 'staff',
    department: 'Sales',
    status: 'active',
    salary: 35000,
    joinDate: '2022-06-01',
    permissions: ['manage_orders', 'view_reports'],
  },
  {
    id: 'e4',
    name: 'Sumaiya Begum',
    email: 'sumaiya@sigroup.com.bd',
    phone: '01700000004',
    role: 'staff',
    department: 'Support',
    status: 'on_leave',
    salary: 30000,
    joinDate: '2023-01-20',
    permissions: ['manage_orders'],
  },
  {
    id: 'e5',
    name: 'Karim Hossain',
    email: 'karim@sigroup.com.bd',
    phone: '01600000005',
    role: 'admin',
    department: 'Technology',
    status: 'active',
    salary: 85000,
    joinDate: '2021-08-15',
    permissions: ['manage_users', 'manage_products', 'manage_courses', 'manage_sms', 'manage_payments'],
  },
]

export const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'd1',
    name: 'Management',
    head: 'Shahidul Islam',
    memberCount: 3,
    description: 'Top-level management and executive decisions for SI Group',
    budget: 500000,
    status: 'active',
  },
  {
    id: 'd2',
    name: 'Operations',
    head: 'Fatema Khatun',
    memberCount: 8,
    description: 'Day-to-day operations, logistics, and coordination',
    budget: 250000,
    status: 'active',
  },
  {
    id: 'd3',
    name: 'Sales',
    head: 'Rahim Uddin',
    memberCount: 12,
    description: 'Sales, marketing, and business development across all platforms',
    budget: 180000,
    status: 'active',
  },
  {
    id: 'd4',
    name: 'Technology',
    head: 'Karim Hossain',
    memberCount: 6,
    description: 'Software development, IT infrastructure, and tech support',
    budget: 350000,
    status: 'active',
  },
]

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm1',
    type: 'bkash',
    label: 'bKash',
    number: '01700000000',
    merchantId: 'BKS1234567',
    apiKey: '',
    enabled: true,
    testMode: true,
    logo: '🟣',
  },
  {
    id: 'pm2',
    type: 'nagad',
    label: 'Nagad',
    number: '01800000000',
    merchantId: 'NGD7654321',
    apiKey: '',
    enabled: true,
    testMode: true,
    logo: '🟠',
  },
  {
    id: 'pm3',
    type: 'card',
    label: 'Credit / Debit Card',
    merchantId: 'SSL_MERCHANT_01',
    apiKey: '',
    enabled: false,
    testMode: true,
    logo: '💳',
  },
  {
    id: 'pm4',
    type: 'bank',
    label: 'Bank Transfer',
    number: 'Dutch-Bangla Bank — 1234567890',
    enabled: true,
    testMode: false,
    logo: '🏦',
  },
]

export const DEFAULT_SMS_PROVIDERS: SmsProvider[] = [
  {
    id: 'sms1',
    name: 'SSL Wireless',
    apiUrl: 'https://sms.sslwireless.com/api/v3/send-sms',
    apiKey: '',
    senderId: 'SIGROUP',
    enabled: false,
    balance: '0 SMS',
    provider: 'ssl',
  },
  {
    id: 'sms2',
    name: 'Alpha Net',
    apiUrl: 'https://api.alpha.net.bd/smsapi',
    apiKey: '',
    senderId: 'SIGRP',
    enabled: false,
    balance: '0 SMS',
    provider: 'alpha',
  },
]

export const ALL_PERMISSIONS = [
  'manage_users',
  'manage_products',
  'manage_orders',
  'manage_courses',
  'manage_employees',
  'manage_departments',
  'manage_payments',
  'manage_sms',
  'view_reports',
  'manage_settings',
  'manage_permissions',
  'super_access',
]

export const ROLE_COLORS: Record<Role, string> = {
  super_admin: 'bg-red-900/60 text-red-300 border border-red-800',
  admin: 'bg-orange-900/60 text-orange-300 border border-orange-800',
  manager: 'bg-blue-900/60 text-blue-300 border border-blue-800',
  staff: 'bg-gray-700/60 text-gray-300 border border-gray-600',
  partner: 'bg-yellow-900/60 text-yellow-300 border border-yellow-800',
  client: 'bg-purple-900/60 text-purple-300 border border-purple-800',
}
