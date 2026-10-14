'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getSeoSettings, saveSeoSettings, SeoSetting } from '@/lib/siteData'

export default function SeoPage() {
  const [data, setData] = useState<SeoSetting | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setData(getSeoSettings()) }, [])
  if (!data) return <AdminLayout><div className="text-gray-400">Loading...</div></AdminLayout>

  function handleSave() {
    if (!data) return
    saveSeoSettings(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
  const labelClass = "block text-xs font-medium text-gray-400 mb-1.5"

  const titleLen = data.metaTitle.length
  const descLen = data.metaDescription.length

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">SEO Settings</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage search engine optimization</p>
          </div>
          <button onClick={handleSave} className={`text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        {/* Preview */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <p className="text-xs font-medium text-gray-500 mb-3">GOOGLE PREVIEW</p>
          <div className="bg-white rounded-lg p-4">
            <p className="text-blue-600 text-sm font-medium truncate">{data.metaTitle || 'Page Title'}</p>
            <p className="text-green-700 text-xs mt-0.5">sigroup.com.bd</p>
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">{data.metaDescription || 'Meta description will appear here...'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Meta Tags</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass.replace('mb-1.5', '')}>Meta Title</label>
                  <span className={`text-xs ${titleLen > 60 ? 'text-red-400' : 'text-gray-500'}`}>{titleLen}/60</span>
                </div>
                <input value={data.metaTitle} onChange={e => setData({...data, metaTitle: e.target.value})} className={inputClass} placeholder="Page title for search engines" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass.replace('mb-1.5', '')}>Meta Description</label>
                  <span className={`text-xs ${descLen > 160 ? 'text-red-400' : 'text-gray-500'}`}>{descLen}/160</span>
                </div>
                <textarea rows={3} value={data.metaDescription} onChange={e => setData({...data, metaDescription: e.target.value})} className={`${inputClass} resize-none`} placeholder="Short description for search results" />
              </div>
              <div>
                <label className={labelClass}>Keywords</label>
                <input value={data.keywords} onChange={e => setData({...data, keywords: e.target.value})} className={inputClass} placeholder="keyword1, keyword2, keyword3" />
              </div>
              <div>
                <label className={labelClass}>OG Image URL</label>
                <input value={data.ogImage} onChange={e => setData({...data, ogImage: e.target.value})} className={inputClass} placeholder="https://... (1200x630 recommended)" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Analytics & Tracking</h2>
            <div>
              <label className={labelClass}>Google Analytics ID</label>
              <input value={data.gaId} onChange={e => setData({...data, gaId: e.target.value})} className={inputClass} placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Robots.txt</h2>
            <textarea rows={6} value={data.robots} onChange={e => setData({...data, robots: e.target.value})} className={`${inputClass} resize-none font-mono text-xs`} />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
