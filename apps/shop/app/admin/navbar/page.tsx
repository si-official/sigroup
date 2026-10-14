'use client'
import { useState, useEffect } from 'react'
import ShopAdminSidebar from '@/components/ShopAdminSidebar'
import { getSettings, saveSettings, defaultSettings, SiteSettings } from '@/lib/siteSettings'

export default function AdminNavbarPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  function save() {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function updateNavbar(key: keyof SiteSettings['navbar'], val: unknown) {
    setSettings(s => ({ ...s, navbar: { ...s.navbar, [key]: val } }))
  }

  function updatePill(id: string, key: string, val: unknown) {
    setSettings(s => ({
      ...s,
      navbar: {
        ...s.navbar,
        pillButtons: s.navbar.pillButtons.map(b => b.id === id ? { ...b, [key]: val } : b),
      },
    }))
  }

  const colorOptions = [
    { label: 'Red (Flash Sale)', value: 'bg-red-600' },
    { label: 'Green (Accent)', value: 'bg-[#82b541]' },
    { label: 'Dark (Subtle)', value: 'bg-white/10' },
    { label: 'Blue', value: 'bg-blue-600/70' },
    { label: 'Orange', value: 'bg-orange-500' },
    { label: 'Purple', value: 'bg-purple-600' },
  ]

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      <ShopAdminSidebar />
      <main className="ml-[260px] flex-1 p-6">
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Navbar Control</h1>
              <p className="text-gray-500 text-sm mt-1">Pill buttons, category strip, scroll search bar</p>
            </div>
            <button
              onClick={save}
              className={`px-6 py-2.5 rounded-lg font-bold text-white text-sm transition ${saved ? 'bg-green-600' : 'bg-[#82b541] hover:bg-[#6fa033]'}`}
            >
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Toggle Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <h2 className="font-bold text-gray-800 mb-4">General Settings</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="font-medium text-gray-800 text-sm">Category Strip</p>
                  <p className="text-xs text-gray-500">All Items, Software, Mobile Apps... row below navbar</p>
                </div>
                <button
                  onClick={() => updateNavbar('showCategoryStrip', !settings.navbar.showCategoryStrip)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${settings.navbar.showCategoryStrip ? 'bg-[#82b541]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.navbar.showCategoryStrip ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-800 text-sm">Scroll Search Bar</p>
                  <p className="text-xs text-gray-500">Search bar appears when user scrolls down</p>
                </div>
                <button
                  onClick={() => updateNavbar('showScrollSearch', !settings.navbar.showScrollSearch)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${settings.navbar.showScrollSearch ? 'bg-[#82b541]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.navbar.showScrollSearch ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
            </div>
          </div>

          {/* Pill Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 mb-4">Pill Buttons</h2>
            <div className="space-y-4">
              {settings.navbar.pillButtons.map(btn => (
                <div key={btn.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`${btn.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>{btn.label}</span>
                    <button
                      onClick={() => updatePill(btn.id, 'show', !btn.show)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${btn.show ? 'bg-[#82b541]' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${btn.show ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 font-medium block mb-1">Label</label>
                      <input
                        value={btn.label}
                        onChange={e => updatePill(btn.id, 'label', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#82b541]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium block mb-1">Link (href)</label>
                      <input
                        value={btn.href}
                        onChange={e => updatePill(btn.id, 'href', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#82b541]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 font-medium block mb-1">Color</label>
                      <select
                        value={btn.color}
                        onChange={e => updatePill(btn.id, 'color', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#82b541]"
                      >
                        {colorOptions.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
