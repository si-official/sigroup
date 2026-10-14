'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

const defaultImages = {
  'Hero Background': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
  'About Team Photo': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80',
  'Contact Background': 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80',
  'Course: Digital Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
  'Course: MS Office': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
  'Course: Graphics Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
  'Course: Web Development': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&q=80',
  'Course: WordPress': 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&q=80',
  'Course: Python/Coding': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80',
  'Course: Video Editing': 'https://images.unsplash.com/photo-1536240478700-b869ad10e2b1?w=400&q=80',
  'Course: Mobile App': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
  'Course: Freelancing': 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=400&q=80',
  'Course: UI/UX Design': 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&q=80',
  'Course: Cybersecurity': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
  'Course: E-commerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
}

const STORAGE_KEY = 'si_site_images'

export default function ImagesAdmin() {
  const [images, setImages] = useState<Record<string, string>>(defaultImages)
  const [editing, setEditing] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setImages({ ...defaultImages, ...JSON.parse(stored) }) } catch {}
    }
  }, [])

  const handleEdit = (key: string) => {
    setEditing(key)
    setEditUrl(images[key])
  }

  const handleSave = (key: string) => {
    const updated = { ...images, [key]: editUrl }
    setImages(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setEditing(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = (key: string) => {
    const updated = { ...images, [key]: defaultImages[key as keyof typeof defaultImages] }
    setImages(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <AdminLayout title="Image Manager" breadcrumb={[{ label: 'Image Manager' }]}>
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Image Management</h1>
          <p className="text-gray-500 text-sm mt-1">Update website images by pasting a new URL. Changes are saved instantly.</p>
        </div>
        {saved && (
          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">✅ Saved!</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Object.entries(images).map(([key, url]) => (
          <div key={key} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Preview */}
            <div className="relative h-40 bg-gray-100">
              <img
                src={url}
                alt={key}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Not+Found' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-2 left-3 text-white font-bold text-sm">{key}</p>
            </div>

            {/* Controls */}
            <div className="p-4">
              {editing === key ? (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="Paste image URL (Unsplash, etc.)"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(key)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 rounded-xl transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(key)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold py-2 rounded-xl transition"
                  >
                    ✏️ Change Image
                  </button>
                  <button
                    onClick={() => handleReset(key)}
                    className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-medium py-2 rounded-xl transition"
                    title="Reset to default"
                  >
                    ↩
                  </button>
                </div>
              )}
              <p className="text-gray-400 text-[10px] mt-2 truncate">{url}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
        <p className="text-blue-800 font-bold text-sm mb-1">📌 How to use free Unsplash images</p>
        <p className="text-blue-600 text-xs leading-relaxed">
          Go to <strong>unsplash.com</strong> → find a photo → right-click → Copy Image Address. Paste the URL here.
          You can also use: <code className="bg-blue-100 px-1 rounded">https://images.unsplash.com/photo-PHOTOID?w=1920&q=80</code>
        </p>
      </div>
    </div>
    </AdminLayout>
  )
}
