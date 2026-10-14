'use client'
import { useState } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { PERMISSIONS, ROLE_PERMISSIONS, ROLE_LABELS, Role } from '@/lib/auth'
import { Save, CheckCircle } from 'lucide-react'

const ROLES: Role[] = ['super_admin', 'admin', 'vendor', 'customer']
const PERM_KEYS = Object.keys(PERMISSIONS)

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState<Record<Role, string[]>>(() => ({
    super_admin: [...ROLE_PERMISSIONS.super_admin],
    admin: [...ROLE_PERMISSIONS.admin],
    vendor: [...ROLE_PERMISSIONS.vendor],
    customer: [...ROLE_PERMISSIONS.customer],
  }))
  const [saved, setSaved] = useState(false)

  function toggle(role: Role, perm: string) {
    if (role === 'super_admin') return // super_admin always has all
    setMatrix(m => {
      const has = m[role].includes(perm)
      return { ...m, [role]: has ? m[role].filter(p => p !== perm) : [...m[role], perm] }
    })
  }

  function handleSave() {
    localStorage.setItem('si_shop_role_permissions', JSON.stringify(matrix))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const roleColors: Record<Role, string> = {
    super_admin: 'bg-red-100 text-red-700 border-red-200',
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    vendor: 'bg-blue-100 text-blue-700 border-blue-200',
    customer: 'bg-green-100 text-green-700 border-green-200',
  }

  return (
    <ShopAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Permissions Matrix</h2>
          <p className="text-sm text-gray-500">{PERM_KEYS.length} permissions across {ROLES.length} roles</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#82b541] hover:bg-[#6ea032] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Role badges */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {ROLES.map(role => (
          <div key={role} className={`border rounded-xl p-3 text-center ${roleColors[role]}`}>
            <div className="font-semibold text-sm">{ROLE_LABELS[role]}</div>
            <div className="text-xs opacity-75 mt-0.5">
              {matrix[role].length} permissions
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase w-1/3">Permission</th>
                {ROLES.map(role => (
                  <th key={role} className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    {ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERM_KEYS.map(perm => {
                const p = PERMISSIONS[perm]
                return (
                  <tr key={perm} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-800">{p.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.description}</div>
                    </td>
                    {ROLES.map(role => {
                      const has = matrix[role].includes(perm)
                      const isSuperAdmin = role === 'super_admin'
                      return (
                        <td key={role} className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => toggle(role, perm)}
                            disabled={isSuperAdmin}
                            className={`w-6 h-6 rounded-md border-2 mx-auto flex items-center justify-center transition-all ${
                              has
                                ? isSuperAdmin
                                  ? 'bg-red-500 border-red-500 cursor-default'
                                  : 'bg-[#82b541] border-[#82b541] hover:bg-[#6ea032]'
                                : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                            }`}
                          >
                            {has && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">
            Super Admin has all permissions by default and cannot be modified.
            Click a checkbox to toggle a permission. Changes are saved per session.
          </p>
        </div>
      </div>
    </ShopAdminLayout>
  )
}
