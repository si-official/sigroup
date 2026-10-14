'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

const STORAGE_KEY = 'si_admin_settings'

interface Settings {
  siteName: string; siteUrl: string; timezone: string; language: string; maintenanceMode: boolean
  primaryColor: string; fontFamily: string; sidebarStyle: string
  sessionTimeout: number; twoFAEnabled: boolean; ipWhitelist: string; passwordMinLength: number
  emailNotifications: boolean; smsAlerts: boolean; slackWebhook: string
}

const defaults: Settings = {
  siteName: 'SI Group Admin', siteUrl: 'https://portal.sigroup.com.bd', timezone: 'Asia/Dhaka', language: 'en', maintenanceMode: false,
  primaryColor: '#7c3aed', fontFamily: 'Inter', sidebarStyle: 'dark',
  sessionTimeout: 60, twoFAEnabled: false, ipWhitelist: '', passwordMinLength: 8,
  emailNotifications: true, smsAlerts: false, slackWebhook: '',
}

const TABS = ['General', 'Appearance', 'Security', 'Notifications', 'Backup']

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults)
  const [activeTab, setActiveTab] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setSettings({ ...defaults, ...JSON.parse(stored) })
  }, [])

  const update = (key: keyof Settings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  )

  const FieldRow = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-gray-900 dark:text-white font-semibold text-sm">{label}</p>
        {desc && <p className="text-gray-500 text-xs mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0 ml-6">{children}</div>
    </div>
  )

  const Input = ({ value, onChange, placeholder, type = 'text' }: { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-64 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
    />
  )

  const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-48 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )

  return (
    <AdminLayout title="Settings" breadcrumb={[{ label: 'Settings' }]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">⚙️ System Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configure your admin panel preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-5 py-2 rounded-xl font-bold text-sm transition ${saved ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
        >
          {saved ? '✓ Saved!' : '💾 Save All Settings'}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit flex-wrap">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === i ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        {/* General */}
        {activeTab === 0 && (
          <div>
            <FieldRow label="Site Name" desc="Display name of the admin panel">
              <Input value={settings.siteName} onChange={(v) => update('siteName', v)} />
            </FieldRow>
            <FieldRow label="Site URL" desc="The public URL of the portal">
              <Input value={settings.siteUrl} onChange={(v) => update('siteUrl', v)} placeholder="https://" />
            </FieldRow>
            <FieldRow label="Timezone" desc="Default timezone for all dates">
              <Select value={settings.timezone} onChange={(v) => update('timezone', v)} options={[
                { value: 'Asia/Dhaka', label: 'Asia/Dhaka (GMT+6)' },
                { value: 'UTC', label: 'UTC (GMT+0)' },
                { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
              ]} />
            </FieldRow>
            <FieldRow label="Language" desc="Interface language">
              <Select value={settings.language} onChange={(v) => update('language', v)} options={[
                { value: 'en', label: 'English' },
                { value: 'bn', label: 'বাংলা (Bangla)' },
              ]} />
            </FieldRow>
            <FieldRow label="Maintenance Mode" desc="Show maintenance page to visitors">
              <Toggle value={settings.maintenanceMode} onChange={() => update('maintenanceMode', !settings.maintenanceMode)} />
            </FieldRow>
          </div>
        )}

        {/* Appearance */}
        {activeTab === 1 && (
          <div>
            <FieldRow label="Primary Color" desc="Accent color used throughout the panel">
              <div className="flex items-center gap-2">
                <input type="color" value={settings.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                <span className="text-gray-500 text-sm font-mono">{settings.primaryColor}</span>
              </div>
            </FieldRow>
            <FieldRow label="Font Family" desc="Interface font">
              <Select value={settings.fontFamily} onChange={(v) => update('fontFamily', v)} options={[
                { value: 'Inter', label: 'Inter (Default)' },
                { value: 'Poppins', label: 'Poppins' },
                { value: 'Roboto', label: 'Roboto' },
              ]} />
            </FieldRow>
            <FieldRow label="Sidebar Style" desc="Color scheme for the sidebar">
              <Select value={settings.sidebarStyle} onChange={(v) => update('sidebarStyle', v)} options={[
                { value: 'dark', label: 'Dark (Default)' },
                { value: 'light', label: 'Light' },
                { value: 'purple', label: 'Purple' },
              ]} />
            </FieldRow>
          </div>
        )}

        {/* Security */}
        {activeTab === 2 && (
          <div>
            <FieldRow label="Session Timeout" desc="Auto logout after N minutes of inactivity">
              <div className="flex items-center gap-2">
                <Input type="number" value={settings.sessionTimeout} onChange={(v) => update('sessionTimeout', Number(v))} />
                <span className="text-gray-500 text-sm">minutes</span>
              </div>
            </FieldRow>
            <FieldRow label="Two-Factor Authentication" desc="Require 2FA for all admin logins">
              <Toggle value={settings.twoFAEnabled} onChange={() => update('twoFAEnabled', !settings.twoFAEnabled)} />
            </FieldRow>
            <FieldRow label="IP Whitelist" desc="Comma-separated IP addresses (leave blank for all)">
              <Input value={settings.ipWhitelist} onChange={(v) => update('ipWhitelist', v)} placeholder="192.168.1.1, 10.0.0.1" />
            </FieldRow>
            <FieldRow label="Min Password Length" desc="Minimum characters for passwords">
              <Input type="number" value={settings.passwordMinLength} onChange={(v) => update('passwordMinLength', Number(v))} />
            </FieldRow>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 3 && (
          <div>
            <FieldRow label="Email Notifications" desc="Receive important alerts via email">
              <Toggle value={settings.emailNotifications} onChange={() => update('emailNotifications', !settings.emailNotifications)} />
            </FieldRow>
            <FieldRow label="SMS Alerts" desc="Critical alerts sent via SMS">
              <Toggle value={settings.smsAlerts} onChange={() => update('smsAlerts', !settings.smsAlerts)} />
            </FieldRow>
            <FieldRow label="Slack Webhook URL" desc="Send notifications to a Slack channel">
              <Input value={settings.slackWebhook} onChange={(v) => update('slackWebhook', v)} placeholder="https://hooks.slack.com/..." />
            </FieldRow>
          </div>
        )}

        {/* Backup */}
        {activeTab === 4 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-blue-700 dark:text-blue-300 font-semibold text-sm mb-1">💾 Data Export</p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mb-3">Export all admin panel data as JSON.</p>
              <button
                onClick={() => {
                  const data = { employees: localStorage.getItem('si_admin_employees'), departments: localStorage.getItem('si_admin_departments'), settings: localStorage.getItem(STORAGE_KEY) }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href = url; a.download = `si_admin_backup_${Date.now()}.json`; a.click()
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
              >
                📥 Export Backup
              </button>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-700 dark:text-red-300 font-semibold text-sm mb-1">🗑️ Clear All Data</p>
              <p className="text-red-600 dark:text-red-400 text-xs mb-3">Reset all localStorage data to defaults. Cannot be undone.</p>
              <button
                onClick={() => {
                  if (confirm('Are you sure? This will clear all admin data.')) {
                    ['si_admin_employees', 'si_admin_departments', 'si_admin_permissions', 'si_admin_settings', 'si_admin_payment_methods', 'si_admin_sms_providers'].forEach((k) => localStorage.removeItem(k))
                    setSettings(defaults)
                  }
                }}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
