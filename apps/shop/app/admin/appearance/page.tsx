'use client'
import { useState, useEffect } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { getSettings, saveSettings, defaultSettings, SiteSettings } from '@/lib/siteSettings'
import { Save, CheckCircle, RotateCcw } from 'lucide-react'

const presets = [
  { name: 'SI Green (Default)', primary: '#82b541', accent: '#6fa033', headerBg: '#1d2129', bodyBg: '#f5f5f0' },
  { name: 'Ocean Blue', primary: '#2563eb', accent: '#1d4ed8', headerBg: '#0f172a', bodyBg: '#f0f4ff' },
  { name: 'Royal Purple', primary: '#7c3aed', accent: '#6d28d9', headerBg: '#1e1b4b', bodyBg: '#f5f3ff' },
  { name: 'Sunset Red', primary: '#dc2626', accent: '#b91c1c', headerBg: '#1c0a0a', bodyBg: '#fff5f5' },
  { name: 'Teal Dark', primary: '#0d9488', accent: '#0f766e', headerBg: '#042f2e', bodyBg: '#f0fdfa' },
  { name: 'Amber Gold', primary: '#d97706', accent: '#b45309', headerBg: '#1c1007', bodyBg: '#fffbeb' },
]

export default function AppearancePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSettings(getSettings()) }, [])

  function update(key: string, value: string) {
    setSettings(prev => prev ? { ...prev, design: { ...prev.design, [key]: value } } : prev)
  }

  function applyPreset(p: typeof presets[0]) {
    setSettings(prev => prev ? {
      ...prev,
      design: { ...prev.design, primaryColor: p.primary, accentColor: p.accent, headerBg: p.headerBg, bodyBg: p.bodyBg },
      header: { ...prev.header, bgColor: p.headerBg, accentColor: p.primary },
    } : prev)
  }

  function handleReset() {
    setSettings(prev => prev ? { ...prev, design: defaultSettings.design } : prev)
  }

  function handleSave() {
    if (!settings) return
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!settings) return null
  const d = settings.design

  return (
    <ShopAdminLayout title="Appearance & Theme" breadcrumb={[{ label: 'Appearance' }]}>
      <div className="max-w-3xl space-y-6">

        {/* Color Presets */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><span>🎨</span> Color Presets</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {presets.map(p => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition text-left"
              >
                <div className="flex gap-1 flex-shrink-0">
                  <div className="w-5 h-8 rounded-l-lg" style={{ backgroundColor: p.headerBg }} />
                  <div className="w-5 h-8 rounded-r-lg" style={{ backgroundColor: p.primary }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 leading-tight">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2"><span>🖌️</span> Custom Colors</h2>
            <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition">
              <RotateCcw size={13} /> Reset to default
            </button>
          </div>

          {[
            { key: 'primaryColor', label: 'Primary / Button Color', desc: 'Used on buttons, active states' },
            { key: 'accentColor', label: 'Accent / Hover Color', desc: 'Hover and secondary accents' },
            { key: 'headerBg', label: 'Header Background', desc: 'Top navigation background' },
            { key: 'headerSubBg', label: 'Sub-header Background', desc: 'Category strip background' },
            { key: 'bodyBg', label: 'Page Background', desc: 'Main page body color' },
          ].map(item => (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={d[item.key as keyof typeof d]}
                    onChange={e => update(item.key, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    value={d[item.key as keyof typeof d]}
                    onChange={e => update(item.key, e.target.value)}
                    className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#82b541]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><span>👁️</span> Live Preview</h2>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: d.headerBg }}>
              <div className="w-7 h-7 bg-red-600 rounded" />
              <div className="h-3 w-20 bg-white/20 rounded" />
              <div className="flex-1 h-7 bg-white/10 rounded mx-4" />
              <div className="h-7 w-20 rounded text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: d.primaryColor }}>
                Button
              </div>
            </div>
            <div className="p-6" style={{ backgroundColor: d.bodyBg }}>
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="h-12 rounded mb-2" style={{ backgroundColor: i === 1 ? d.primaryColor + '22' : '#f3f4f6' }} />
                    <div className="h-2 bg-gray-200 rounded mb-1" />
                    <div className="h-2 bg-gray-100 rounded w-2/3" />
                    <div className="mt-2 h-6 rounded text-[9px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: d.primaryColor }}>
                      Buy Now
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition ${saved ? 'bg-green-500 text-white' : 'bg-[#82b541] hover:bg-[#6fa033] text-white'}`}>
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </ShopAdminLayout>
  )
}
