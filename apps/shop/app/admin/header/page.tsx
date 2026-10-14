'use client'
import { useState, useEffect } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { getSettings, saveSettings, SiteSettings } from '@/lib/siteSettings'
import { Save, CheckCircle } from 'lucide-react'

export default function HeaderPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSettings(getSettings()) }, [])

  function update(key: string, value: unknown) {
    setSettings(prev => prev ? { ...prev, header: { ...prev.header, [key]: value } } : prev)
  }

  function handleSave() {
    if (!settings) return
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!settings) return null
  const h = settings.header

  return (
    <ShopAdminLayout title="Header Settings" breadcrumb={[{ label: 'Header Settings' }]}>
      <div className="max-w-3xl space-y-6">

        {/* Live Preview */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <div className="px-3 py-2 flex items-center gap-3" style={{ backgroundColor: h.bgColor }}>
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">SI</span>
            </div>
            <div>
              <p className="font-black text-white text-sm">{h.logoText}</p>
              <p className="text-[9px] text-gray-400 tracking-wide">{h.logoTagline}</p>
            </div>
            <div className="flex-1 hidden md:flex h-8 bg-white/10 rounded-lg mx-4" />
            {h.showSellButton && (
              <span className="text-white text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: h.accentColor }}>
                {h.sellButtonText}
              </span>
            )}
          </div>
          {h.announcementBar && (
            <div className="px-4 py-2 text-white text-xs text-center font-medium" style={{ backgroundColor: h.announcementBg }}>
              {h.announcementText}
            </div>
          )}
          <div className="px-3 py-1 bg-gray-100 text-[10px] text-gray-500 text-center">← Live Preview →</div>
        </div>

        {/* Logo */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2"><span>🏷️</span> Logo & Brand</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Logo Text</label>
              <input value={h.logoText} onChange={e => update('logoText', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Logo Tagline</label>
              <input value={h.logoTagline} onChange={e => update('logoTagline', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2"><span>🎨</span> Colors</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Header Background</label>
              <div className="flex items-center gap-3">
                <input type="color" value={h.bgColor} onChange={e => update('bgColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input value={h.bgColor} onChange={e => update('bgColor', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#82b541]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Accent Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={h.accentColor} onChange={e => update('accentColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input value={h.accentColor} onChange={e => update('accentColor', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#82b541]" />
              </div>
            </div>
          </div>
        </div>

        {/* Sell Button */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2"><span>🛍️</span> Sell Button</h2>
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Show "Sell" Button</span>
            <button onClick={() => update('showSellButton', !h.showSellButton)}
              className={`w-12 h-6 rounded-full transition-colors relative ${h.showSellButton ? 'bg-[#82b541]' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${h.showSellButton ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Button Text</label>
            <input value={h.sellButtonText} onChange={e => update('sellButtonText', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2"><span>📢</span> Announcement Bar</h2>
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Show Announcement Bar</span>
            <button onClick={() => update('announcementBar', !h.announcementBar)}
              className={`w-12 h-6 rounded-full transition-colors relative ${h.announcementBar ? 'bg-[#82b541]' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${h.announcementBar ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Announcement Text</label>
            <input value={h.announcementText} onChange={e => update('announcementText', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Bar Background Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={h.announcementBg} onChange={e => update('announcementBg', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <input value={h.announcementBg} onChange={e => update('announcementBg', e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#82b541]" />
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
