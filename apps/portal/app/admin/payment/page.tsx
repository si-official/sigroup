'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { PaymentMethod, DEFAULT_PAYMENT_METHODS } from '@/lib/adminData'

const STORAGE_KEY = 'si_admin_payment_methods'

const typeColors: Record<string, string> = {
  bkash: 'bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800',
  nagad: 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800',
  rocket: 'bg-violet-100 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800',
  card: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
  bank: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
}

export default function PaymentPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setMethods(stored ? JSON.parse(stored) : DEFAULT_PAYMENT_METHODS)
  }, [])

  const updateMethod = (id: string, data: Partial<PaymentMethod>) => {
    setMethods((prev) => prev.map((m) => m.id === id ? { ...m, ...data } : m))
    setSaved(null)
  }

  const saveMethod = (id: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(methods))
    setSaved(id)
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <AdminLayout title="Payment Methods" breadcrumb={[{ label: 'Payment Methods' }]}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">💳 Payment Method Integration</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configure payment gateways for all SI Group platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {methods.map((method) => (
          <div key={method.id} className={`bg-white dark:bg-gray-900 border rounded-xl p-5 ${typeColors[method.type] || 'border-gray-200 dark:border-gray-800'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{method.logo}</span>
                <div>
                  <p className="text-gray-900 dark:text-white font-black">{method.label}</p>
                  <p className="text-gray-500 text-xs capitalize">{method.type} gateway</p>
                </div>
              </div>
              {/* Enable toggle */}
              <button
                onClick={() => updateMethod(method.id, { enabled: !method.enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${method.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${method.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {!method.enabled && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 text-center">
                Gateway disabled — toggle to enable
              </div>
            )}

            {/* Fields */}
            <div className="space-y-3">
              {method.number !== undefined && (
                <div>
                  <label className="text-gray-500 text-xs mb-1 block font-medium">
                    {method.type === 'bank' ? 'Account Number / IBAN' : 'Merchant Number'}
                  </label>
                  <input
                    value={method.number || ''}
                    onChange={(e) => updateMethod(method.id, { number: e.target.value })}
                    placeholder="01700000000"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
              {method.merchantId !== undefined && (
                <div>
                  <label className="text-gray-500 text-xs mb-1 block font-medium">Merchant ID</label>
                  <input
                    value={method.merchantId || ''}
                    onChange={(e) => updateMethod(method.id, { merchantId: e.target.value })}
                    placeholder="MERCHANT_ID"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
              {method.apiKey !== undefined && (
                <div>
                  <label className="text-gray-500 text-xs mb-1 block font-medium">API Key / Secret</label>
                  <input
                    type="password"
                    value={method.apiKey || ''}
                    onChange={(e) => updateMethod(method.id, { apiKey: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Test mode + Save */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                <button
                  onClick={() => updateMethod(method.id, { testMode: !method.testMode })}
                  className={`relative w-8 h-4 rounded-full transition-colors ${method.testMode ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${method.testMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                {method.testMode ? '🧪 Test Mode' : '🟢 Live Mode'}
              </label>
              <button
                onClick={() => saveMethod(method.id)}
                className={`text-xs px-4 py-2 rounded-lg font-bold transition ${saved === method.id ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
              >
                {saved === method.id ? '✓ Saved' : 'Save Config'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          <strong>⚠️ Security Notice:</strong> API keys are stored locally. In production, use server-side environment variables and never expose keys in client-side code.
        </p>
      </div>
    </AdminLayout>
  )
}
