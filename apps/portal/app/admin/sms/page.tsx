'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { SmsProvider, DEFAULT_SMS_PROVIDERS } from '@/lib/adminData'

const STORAGE_KEY = 'si_admin_sms_providers'

interface SmsLog {
  id: string; recipient: string; message: string; status: 'sent' | 'failed' | 'pending'; time: string; provider: string
}

const mockLogs: SmsLog[] = [
  { id: 'l1', recipient: '01700000001', message: 'Your OTP is 123456. Valid for 5 minutes.', status: 'sent', time: '2026-07-04 10:30', provider: 'SSL Wireless' },
  { id: 'l2', recipient: '01800000002', message: 'Your order #1042 has been confirmed!', status: 'sent', time: '2026-07-04 09:15', provider: 'Alpha Net' },
  { id: 'l3', recipient: '01900000003', message: 'Payment received ৳4,299. Thank you!', status: 'failed', time: '2026-07-03 18:00', provider: 'SSL Wireless' },
  { id: 'l4', recipient: '01600000004', message: 'Course enrollment confirmed. Start now!', status: 'sent', time: '2026-07-03 15:30', provider: 'SSL Wireless' },
  { id: 'l5', recipient: '01700000005', message: 'Support ticket #88 has been updated.', status: 'pending', time: '2026-07-03 14:00', provider: 'Alpha Net' },
]

export default function SmsPage() {
  const [providers, setProviders] = useState<SmsProvider[]>([])
  const [logs, setLogs] = useState<SmsLog[]>(mockLogs)
  const [saved, setSaved] = useState<string | null>(null)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setProviders(stored ? JSON.parse(stored) : DEFAULT_SMS_PROVIDERS)
  }, [])

  const updateProvider = (id: string, data: Partial<SmsProvider>) => {
    setProviders((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p))
  }

  const saveProvider = (id: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(providers))
    setSaved(id)
    setTimeout(() => setSaved(null), 2000)
  }

  const sendTest = () => {
    if (!testPhone || !testMessage) return
    setSending(true)
    setTimeout(() => {
      const activeProvider = providers.find((p) => p.enabled)
      const newLog: SmsLog = {
        id: `l${Date.now()}`,
        recipient: testPhone,
        message: testMessage,
        status: activeProvider ? 'sent' : 'failed',
        time: new Date().toLocaleString(),
        provider: activeProvider?.name || 'None',
      }
      setLogs([newLog, ...logs])
      setSending(false)
      setTestPhone('')
      setTestMessage('')
    }, 1200)
  }

  return (
    <AdminLayout title="SMS Gateway" breadcrumb={[{ label: 'SMS Gateway' }]}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">📱 SMS Gateway Integration</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configure SMS providers for OTP, notifications, and alerts</p>
      </div>

      {/* Provider cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {providers.map((prov) => (
          <div key={prov.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-900 dark:text-white font-black">{prov.name}</p>
                <p className="text-gray-500 text-xs">Balance: <span className="text-purple-600 dark:text-purple-400 font-semibold">{prov.balance || '—'}</span></p>
              </div>
              <button
                onClick={() => updateProvider(prov.id, { enabled: !prov.enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${prov.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prov.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: 'apiUrl', label: 'API URL', type: 'text', placeholder: 'https://api.provider.com/sms' },
                { key: 'apiKey', label: 'API Key', type: 'password', placeholder: '••••••••' },
                { key: 'senderId', label: 'Sender ID', type: 'text', placeholder: 'SIGROUP' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-gray-500 text-xs mb-1 block font-medium">{f.label}</label>
                  <input
                    type={f.type}
                    value={String((prov as unknown as Record<string, unknown>)[f.key] || '')}
                    onChange={(e) => updateProvider(prov.id, { [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => saveProvider(prov.id)}
                className={`flex-1 text-sm py-2 rounded-lg font-bold transition ${saved === prov.id ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
              >
                {saved === prov.id ? '✓ Saved' : 'Save Config'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Send test SMS */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6">
        <h3 className="text-gray-900 dark:text-white font-bold mb-4">📤 Send Test SMS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-gray-500 text-xs mb-1 block font-medium">Phone Number</label>
            <input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="01700000000"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block font-medium">Message</label>
            <input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test message from SI Group"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        <button
          onClick={sendTest}
          disabled={sending || !testPhone || !testMessage}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold text-sm transition"
        >
          {sending ? 'Sending...' : '📤 Send Test SMS'}
        </button>
      </div>

      {/* SMS Logs */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-gray-900 dark:text-white font-bold">SMS Logs</h3>
          <span className="text-gray-500 text-xs">{logs.length} entries</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Recipient</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Message</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Provider</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono text-xs">{log.recipient}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs max-w-xs truncate">{log.message}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{log.provider}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    log.status === 'sent' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' :
                    log.status === 'failed' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400' :
                    'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                  }`}>{log.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
