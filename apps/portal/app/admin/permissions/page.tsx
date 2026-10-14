'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Role, ALL_PERMISSIONS, ROLE_COLORS } from '@/lib/adminData'

const STORAGE_KEY = 'si_admin_permissions'

const roles: Role[] = ['super_admin', 'admin', 'manager', 'staff', 'partner', 'client']

const roleDescriptions: Record<Role, string> = {
  super_admin: 'Full unrestricted access to all system features and settings.',
  admin: 'Administrative access excluding super admin specific settings.',
  manager: 'Can manage day-to-day operations, employees, and reports.',
  staff: 'Basic access to assigned tasks and order management.',
  partner: 'External partner access to partnership-related features.',
  client: 'Read-only access to their own data and invoices.',
}

const defaultPermissions: Record<Role, string[]> = {
  super_admin: [...ALL_PERMISSIONS],
  admin: ['manage_users', 'manage_products', 'manage_orders', 'manage_courses', 'manage_employees', 'manage_departments', 'manage_payments', 'manage_sms', 'view_reports', 'manage_settings'],
  manager: ['manage_employees', 'manage_departments', 'view_reports', 'manage_orders'],
  staff: ['manage_orders', 'view_reports'],
  partner: ['view_reports'],
  client: [],
}

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState<Record<Role, string[]>>(defaultPermissions)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setMatrix(JSON.parse(stored))
  }, [])

  const toggle = (role: Role, perm: string) => {
    if (role === 'super_admin') return // super admin always has all
    setMatrix((prev) => {
      const current = prev[role] || []
      const updated = current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm]
      return { ...prev, [role]: updated }
    })
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const permLabel = (p: string) => p.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <AdminLayout title="Permissions" breadcrumb={[{ label: 'Permissions' }]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">🔐 Roles & Permissions</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configure what each role can access</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-5 py-2 rounded-xl font-bold text-sm transition ${saved ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
        >
          {saved ? '✓ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      {/* Role descriptions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {roles.map((role) => (
          <div key={role} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_COLORS[role]}`}>
              {role.replace('_', ' ')}
            </span>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2 leading-relaxed">{roleDescriptions[role]}</p>
            <p className="text-purple-600 dark:text-purple-400 text-xs font-bold mt-1">{matrix[role]?.length || 0} permissions</p>
          </div>
        ))}
      </div>

      {/* Permission matrix */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-52">Permission</th>
              {roles.map((role) => (
                <th key={role} className="px-3 py-3 text-center text-xs font-bold uppercase">
                  <span className={`px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                    {role.replace('_', ' ')}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {ALL_PERMISSIONS.map((perm) => (
              <tr key={perm} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium text-xs">{permLabel(perm)}</td>
                {roles.map((role) => {
                  const has = matrix[role]?.includes(perm)
                  const isSuper = role === 'super_admin'
                  return (
                    <td key={role} className="px-3 py-3 text-center">
                      <button
                        onClick={() => toggle(role, perm)}
                        disabled={isSuper}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition ${
                          has
                            ? isSuper
                              ? 'bg-red-600 border-red-500 cursor-not-allowed'
                              : 'bg-purple-600 border-purple-500 hover:bg-purple-500'
                            : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-purple-400'
                        }`}
                        title={isSuper ? 'Super admin always has all permissions' : has ? 'Remove permission' : 'Grant permission'}
                      >
                        {has && <span className="text-white text-xs font-black">✓</span>}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-gray-500 text-xs mt-3">* Super Admin always has all permissions and cannot be modified.</p>
    </AdminLayout>
  )
}
