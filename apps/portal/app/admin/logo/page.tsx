'use client'
import { useState, useRef } from 'react'
import AdminLayout from '@/components/AdminLayout'

export default function LogoAdmin() {
  const [logoUrl, setLogoUrl] = useState('/si-group-icon.png')
  const [fullLogoUrl, setFullLogoUrl] = useState('/si-group-logo.png')
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'icon' | 'full'>('icon')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    localStorage.setItem('si_logo_icon', logoUrl)
    localStorage.setItem('si_logo_full', fullLogoUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload-logo', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        if (tab === 'icon') setLogoUrl(data.url)
        else setFullLogoUrl(data.url)
      }
    } catch {
      // fallback: show object URL preview
      const url = URL.createObjectURL(file)
      if (tab === 'icon') setLogoUrl(url)
      else setFullLogoUrl(url)
    }
  }

  return (
    <AdminLayout title="Logo Manager" breadcrumb={[{ label: 'Logo Manager' }]}>
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Logo Management</h1>
          <p className="text-gray-500 text-sm mt-1">Update the SI Group logo displayed on the website.</p>
        </div>
        {saved && <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">✅ Saved!</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['icon', 'full'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition ${tab === t ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t === 'icon' ? '🔵 Icon (Circle)' : '🖼️ Full Logo'}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        {/* Preview */}
        <div className="bg-gray-950 p-10 flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-3">
            <img
              src={tab === 'icon' ? logoUrl : fullLogoUrl}
              alt="Logo preview"
              className="h-20 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/si-group-icon.png' }}
            />
            {tab === 'icon' && (
              <span className="text-white font-black text-3xl" style={{ fontFamily: 'Arial Black, Arial' }}>GROUP</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold text-sm mb-2">
              {tab === 'icon' ? 'Icon URL (or upload below)' : 'Full Logo URL (or upload below)'}
            </label>
            <input
              type="text"
              value={tab === 'icon' ? logoUrl : fullLogoUrl}
              onChange={(e) => tab === 'icon' ? setLogoUrl(e.target.value) : setFullLogoUrl(e.target.value)}
              placeholder="https://... or /logo.png"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-3">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 border-2 border-dashed border-gray-200 hover:border-red-400 text-gray-500 hover:text-red-600 text-sm font-semibold py-3 rounded-xl transition"
            >
              📁 Upload Image File
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 rounded-xl transition"
            >
              Save Changes
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-800 font-semibold text-sm mb-1">📌 How to permanently replace the logo</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              Save your logo PNG as <code className="bg-amber-100 px-1 rounded">si-group-icon.png</code> (icon only) or
              <code className="bg-amber-100 px-1 rounded ml-1">si-group-logo.png</code> (full logo with text) and place it in the
              <code className="bg-amber-100 px-1 rounded ml-1">apps/main/public/</code> folder.
              Current file: <strong>/Applications/XAMPP/xamppfiles/htdocs/sigroup/apps/main/public/</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  )
}
