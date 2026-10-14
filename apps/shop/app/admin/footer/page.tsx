'use client'
import { useState, useEffect } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { getSettings, saveSettings, SiteSettings } from '@/lib/siteSettings'
import { Save, CheckCircle, Plus, Trash2 } from 'lucide-react'

export default function FooterPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSettings(getSettings()) }, [])

  function update(key: string, value: unknown) {
    setSettings(prev => prev ? { ...prev, footer: { ...prev.footer, [key]: value } } : prev)
  }

  function updateLink(col: 'col1Links' | 'col2Links' | 'col3Links', idx: number, field: 'label' | 'href', val: string) {
    setSettings(prev => {
      if (!prev) return prev
      const links = [...prev.footer[col]]
      links[idx] = { ...links[idx], [field]: val }
      return { ...prev, footer: { ...prev.footer, [col]: links } }
    })
  }

  function addLink(col: 'col1Links' | 'col2Links' | 'col3Links') {
    setSettings(prev => {
      if (!prev) return prev
      return { ...prev, footer: { ...prev.footer, [col]: [...prev.footer[col], { label: 'New Link', href: '#' }] } }
    })
  }

  function removeLink(col: 'col1Links' | 'col2Links' | 'col3Links', idx: number) {
    setSettings(prev => {
      if (!prev) return prev
      return { ...prev, footer: { ...prev.footer, [col]: prev.footer[col].filter((_, i) => i !== idx) } }
    })
  }

  function handleSave() {
    if (!settings) return
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!settings) return null
  const f = settings.footer

  const cols = [
    { key: 'col1Links' as const, titleKey: 'col1Title', label: 'Column 1' },
    { key: 'col2Links' as const, titleKey: 'col2Title', label: 'Column 2' },
    { key: 'col3Links' as const, titleKey: 'col3Title', label: 'Column 3' },
  ]

  return (
    <ShopAdminLayout title="Footer Settings" breadcrumb={[{ label: 'Footer Settings' }]}>
      <div className="max-w-3xl space-y-6">

        {/* Brand */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2"><span>🏷️</span> Brand</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Company Name</label>
              <input value={f.companyName} onChange={e => update('companyName', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Copyright Text</label>
              <input value={f.copyright} onChange={e => update('copyright', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tagline</label>
            <textarea value={f.tagline} onChange={e => update('tagline', e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541] resize-none" />
          </div>
        </div>

        {/* Link Columns */}
        {cols.map(col => (
          <div key={col.key} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-base">🔗 {col.label}</h2>
              <button onClick={() => addLink(col.key)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#82b541] hover:text-[#6fa033] transition">
                <Plus size={14} /> Add Link
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Column Title</label>
              <input value={f[col.titleKey as keyof typeof f] as string} onChange={e => update(col.titleKey, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541] mb-3" />
            </div>
            <div className="space-y-2">
              {(f[col.key] as { label: string; href: string }[]).map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input value={link.label} onChange={e => updateLink(col.key, idx, 'label', e.target.value)}
                    placeholder="Link label"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#82b541]" />
                  <input value={link.href} onChange={e => updateLink(col.key, idx, 'href', e.target.value)}
                    placeholder="URL"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#82b541] font-mono" />
                  <button onClick={() => removeLink(col.key, idx)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Social Links */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2"><span>📱</span> Social Links</h2>
            <button onClick={() => update('showSocial', !f.showSocial)}
              className={`w-12 h-6 rounded-full transition-colors relative ${f.showSocial ? 'bg-[#82b541]' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${f.showSocial ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'facebook', label: '🔵 Facebook URL' },
              { key: 'instagram', label: '🟣 Instagram URL' },
              { key: 'youtube', label: '🔴 YouTube URL' },
              { key: 'whatsapp', label: '🟢 WhatsApp URL' },
            ].map(s => (
              <div key={s.key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{s.label}</label>
                <input value={f[s.key as keyof typeof f] as string} onChange={e => update(s.key, e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
              </div>
            ))}
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
