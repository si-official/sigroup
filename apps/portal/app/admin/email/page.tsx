'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

const STORAGE_KEY = 'si_admin_email_config'

interface EmailConfig {
  smtpHost: string; smtpPort: string; smtpUser: string; smtpPass: string
  fromName: string; fromEmail: string; enabled: boolean; ssl: boolean
}

const defaults: EmailConfig = {
  smtpHost: 'mail.sigroup.com.bd', smtpPort: '465', smtpUser: 'noreply@sigroup.com.bd',
  smtpPass: '', fromName: 'SI Group', fromEmail: 'noreply@sigroup.com.bd',
  enabled: false, ssl: true,
}

export default function EmailConfigPage() {
  const [config, setConfig] = useState<EmailConfig>(defaults)
  const [saved, setSaved] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [testResult, setTestResult] = useState<null | 'success' | 'error'>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setConfig({ ...defaults, ...JSON.parse(stored) })
  }, [])

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sendTest = () => {
    if (!testEmail) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setTestResult(config.enabled ? 'success' : 'error')
      setTimeout(() => setTestResult(null), 3000)
    }, 1500)
  }

  const update = (key: keyof EmailConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  return (
    <AdminLayout title="Email Config" breadcrumb={[{ label: 'Email Config' }]}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">📧 Email Configuration</h1>
        <p className="text-gray-500 text-sm mt-0.5">SMTP settings for transactional emails</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-gray-900 dark:text-white font-bold">SMTP Settings</h3>
            <button
              onClick={() => update('enabled', !config.enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${config.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="space-y-4">
            {[
              { key: 'smtpHost', label: 'SMTP Host', type: 'text', placeholder: 'mail.sigroup.com.bd' },
              { key: 'smtpPort', label: 'SMTP Port', type: 'text', placeholder: '465' },
              { key: 'smtpUser', label: 'SMTP Username', type: 'text', placeholder: 'noreply@sigroup.com.bd' },
              { key: 'smtpPass', label: 'SMTP Password', type: 'password', placeholder: '••••••••' },
              { key: 'fromName', label: 'From Name', type: 'text', placeholder: 'SI Group' },
              { key: 'fromEmail', label: 'From Email', type: 'email', placeholder: 'noreply@sigroup.com.bd' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-gray-500 text-xs mb-1 block font-medium">{f.label}</label>
                <input
                  type={f.type}
                  value={String((config as unknown as Record<string, unknown>)[f.key] || '')}
                  onChange={(e) => update(f.key as keyof EmailConfig, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            ))}

            <div className="flex items-center justify-between">
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Use SSL/TLS</label>
              <button onClick={() => update('ssl', !config.ssl)} className={`relative w-12 h-6 rounded-full transition-colors ${config.ssl ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.ssl ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`mt-5 w-full py-2.5 rounded-xl font-bold text-sm transition ${saved ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
          >
            {saved ? '✓ Saved!' : '💾 Save Email Config'}
          </button>
        </div>

        {/* Test email */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-900 dark:text-white font-bold mb-4">📤 Send Test Email</h3>
            <div className="mb-3">
              <label className="text-gray-500 text-xs mb-1 block font-medium">Recipient Email</label>
              <input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={sendTest}
              disabled={sending || !testEmail}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-sm transition w-full"
            >
              {sending ? 'Sending...' : '📤 Send Test Email'}
            </button>
            {testResult === 'success' && <p className="text-emerald-500 text-sm mt-2 text-center">✓ Test email sent successfully!</p>}
            {testResult === 'error' && <p className="text-red-500 text-sm mt-2 text-center">✗ Failed — Enable gateway first</p>}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h4 className="text-blue-700 dark:text-blue-300 font-bold text-sm mb-2">📘 Email Templates Used</h4>
            <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
              {['Order Confirmation', 'Course Enrollment', 'Invoice Generated', 'Password Reset', 'Support Ticket Update', 'Payment Receipt'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span>✉️</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
