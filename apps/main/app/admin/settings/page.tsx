'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getSiteSettings, saveSiteSettings, SiteSetting } from '@/lib/siteData'

const tabs = ['General', 'Social Media', 'Appearance', 'Maintenance'] as const
type Tab = typeof tabs[number]

export default function SettingsPage() {
  const [data, setData] = useState<SiteSetting | null>(null)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<Tab>('General')

  useEffect(() => { setData(getSiteSettings()) }, [])
  if (!data) return <AdminLayout><div className="text-gray-400">Loading...</div></AdminLayout>

  function handleSave() {
    if (!data) return
    saveSiteSettings(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
  const labelClass = "block text-xs font-medium text-gray-400 mb-1.5"

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage site configuration</p>
          </div>
          <button onClick={handleSave} className={`text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          {tab === 'General' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Site Name</label>
                <input value={data.siteName} onChange={e => setData({...data, siteName: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tagline</label>
                <input value={data.tagline} onChange={e => setData({...data, tagline: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Logo URL</label>
                <input value={data.logoUrl} onChange={e => setData({...data, logoUrl: e.target.value})} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label className={labelClass}>Contact Email</label>
                <input type="email" value={data.email} onChange={e => setData({...data, email: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input value={data.address} onChange={e => setData({...data, address: e.target.value})} className={inputClass} />
              </div>
            </div>
          )}

          {tab === 'Social Media' && (
            <div className="space-y-4">
              {[
                { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/...' },
                { key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/...' },
                { key: 'whatsapp', label: 'WhatsApp Number', placeholder: '+8801XXXXXXXXX' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input
                    value={data[key as keyof SiteSetting] as string}
                    onChange={e => setData({...data, [key]: e.target.value})}
                    className={inputClass}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          )}

          {tab === 'Appearance' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Primary Color</label>
                <div className="flex gap-3 items-center">
                  <input type="color" value={data.primaryColor} onChange={e => setData({...data, primaryColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
                  <input value={data.primaryColor} onChange={e => setData({...data, primaryColor: e.target.value})} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Font</label>
                <select value={data.font} onChange={e => setData({...data, font: e.target.value})} className={inputClass}>
                  {['Inter', 'Roboto', 'Poppins', 'Open Sans', 'Lato', 'Montserrat'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
          )}

          {tab === 'Maintenance' && (
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-xl border ${data.maintenanceMode ? 'border-yellow-700 bg-yellow-900/20' : 'border-gray-700 bg-gray-800'}`}>
                <div>
                  <p className="font-medium text-sm">Maintenance Mode</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {data.maintenanceMode ? '⚠️ Site is currently in maintenance mode' : 'Site is live and accessible to visitors'}
                  </p>
                </div>
                <button
                  onClick={() => setData({...data, maintenanceMode: !data.maintenanceMode})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${data.maintenanceMode ? 'bg-yellow-500' : 'bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${data.maintenanceMode ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              {data.maintenanceMode && (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm">⚠️ Maintenance mode is ON. Visitors will see a maintenance page. Remember to turn it off when done.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
