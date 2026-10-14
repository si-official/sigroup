'use client'
import { useState, useEffect } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { getSettings, saveSettings, SiteSettings } from '@/lib/siteSettings'
import { Save, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function HomepagePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSettings(getSettings()) }, [])

  function update(path: string, value: unknown) {
    setSettings(prev => {
      if (!prev) return prev
      const next = { ...prev, homepage: { ...prev.homepage, [path]: value } }
      return next
    })
  }

  function handleSave() {
    if (!settings) return
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!settings) return null
  const hp = settings.homepage

  const sections = [
    { key: 'showFlashSales', titleKey: 'flashSalesTitle', label: 'Flash Sales', icon: '⚡', color: 'red' },
    { key: 'showBannerAds', titleKey: null, label: 'Banner Ads (3-column)', icon: '🖼️', color: 'indigo' },
    { key: 'showFeatured', titleKey: 'featuredTitle', label: 'Featured Items', icon: '⭐', color: 'yellow' },
    { key: 'showTrending', titleKey: 'trendingTitle', label: 'Trending All Items', icon: '🔥', color: 'orange' },
    { key: 'showGraphics', titleKey: 'graphicsTitle', label: 'Graphics Items', icon: '🎨', color: 'pink' },
    { key: 'showSoftware', titleKey: 'softwareTitle', label: 'Software Items', icon: '💾', color: 'blue' },
    { key: 'showWebsite', titleKey: 'websiteTitle', label: 'Website Items', icon: '🌐', color: 'teal' },
    { key: 'showMobileApp', titleKey: 'mobileAppTitle', label: 'Mobile App Items', icon: '📱', color: 'purple' },
    { key: 'showSellerCta', titleKey: null, label: 'Seller CTA Banner', icon: '💰', color: 'green' },
    { key: 'showStats', titleKey: null, label: 'Stats Bar', icon: '📊', color: 'gray' },
  ]

  return (
    <ShopAdminLayout title="Homepage Control" breadcrumb={[{ label: 'Homepage Control' }]}>
      <div className="max-w-3xl space-y-6">

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
            <span className="text-xl">🏠</span> Hero Section
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Title</label>
              <input
                value={hp.heroTitle}
                onChange={e => update('heroTitle', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Subtitle</label>
              <textarea
                value={hp.heroSubtitle}
                onChange={e => update('heroSubtitle', e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section Visibility */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
            <span className="text-xl">📐</span> Sections — Show / Hide & Edit Title
          </h2>
          <div className="space-y-3">
            {sections.map(s => {
              const isOn = hp[s.key as keyof typeof hp] as boolean
              return (
                <div key={s.key} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isOn ? 'border-[#82b541]/30 bg-[#82b541]/5' : 'border-gray-100 bg-gray-50'}`}>
                  <span className="text-2xl w-8 text-center">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{s.label}</p>
                    {s.titleKey && (
                      <input
                        value={hp[s.titleKey as keyof typeof hp] as string}
                        onChange={e => update(s.titleKey!, e.target.value)}
                        className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#82b541] bg-white"
                        placeholder="Section title..."
                      />
                    )}
                  </div>
                  <button
                    onClick={() => update(s.key, !isOn)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isOn ? 'bg-[#82b541] text-white hover:bg-[#6fa033]' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                  >
                    {isOn ? <Eye size={13} /> : <EyeOff size={13} />}
                    {isOn ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition ${saved ? 'bg-green-500 text-white' : 'bg-[#82b541] hover:bg-[#6fa033] text-white'}`}
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </ShopAdminLayout>
  )
}
