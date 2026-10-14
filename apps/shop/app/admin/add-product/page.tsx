'use client'
import { useState } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { Plus, Trash2, ExternalLink, Save } from 'lucide-react'

interface DemoLink { label: string; url: string }
interface DemoCredential { role: string; url: string; username: string; password: string }
interface HostedFile { name: string; size: string; type: string; hosting: string; url: string }

const categories = ['software', 'mobile-app', 'template', 'plugin', 'script', 'ui-kit']
const badges = ['', 'Best Seller', 'New', 'Featured', 'Hot', 'Free']

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: '', description: '', longDescription: '',
    price: '', originalPrice: '', category: 'software', subcategory: '',
    image: '', badge: '', version: '', license: 'Regular',
    tags: '', features: '',
  })
  const [demoLinks, setDemoLinks] = useState<DemoLink[]>([{ label: '', url: '' }])
  const [demoCredentials, setDemoCreds] = useState<DemoCredential[]>([{ role: '', url: '', username: '', password: '' }])
  const [hostedFiles, setHostedFiles] = useState<HostedFile[]>([{ name: '', size: '', type: 'zip', hosting: 'direct', url: '' }])
  const [saved, setSaved] = useState(false)

  const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  function update(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function addDemoLink() { setDemoLinks(l => [...l, { label: '', url: '' }]) }
  function removeDemoLink(i: number) { setDemoLinks(l => l.filter((_, j) => j !== i)) }
  function updateDemoLink(i: number, key: keyof DemoLink, val: string) {
    setDemoLinks(l => l.map((item, j) => j === i ? { ...item, [key]: val } : item))
  }

  function addCred() { setDemoCreds(c => [...c, { role: '', url: '', username: '', password: '' }]) }
  function removeCred(i: number) { setDemoCreds(c => c.filter((_, j) => j !== i)) }
  function updateCred(i: number, key: keyof DemoCredential, val: string) {
    setDemoCreds(c => c.map((item, j) => j === i ? { ...item, [key]: val } : item))
  }

  function addFile() { setHostedFiles(f => [...f, { name: '', size: '', type: 'zip', hosting: 'direct', url: '' }]) }
  function removeFile(i: number) { setHostedFiles(f => f.filter((_, j) => j !== i)) }
  function updateFile(i: number, key: keyof HostedFile, val: string) {
    setHostedFiles(f => f.map((item, j) => j === i ? { ...item, [key]: val } : item))
  }

  function handleSave() {
    if (!form.name.trim()) return alert('Product name is required')
    const product = {
      ...form,
      slug,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
      demoLinks,
      demoCredentials,
      hostedFiles,
    }
    const existing = JSON.parse(localStorage.getItem('si_shop_admin_products') || '[]')
    existing.push({ ...product, id: 'custom_' + Date.now(), sellerId: 's1', rating: 0, reviews: 0, sales: 0, status: 'pending' })
    localStorage.setItem('si_shop_admin_products', JSON.stringify(existing))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#82b541] focus:ring-1 focus:ring-[#82b541]/20 transition-colors"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"
  const sectionClass = "bg-white rounded-xl border border-gray-200 p-6 mb-5"

  return (
    <ShopAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Add New Product</h2>
          <p className="text-sm text-gray-500">Fill in all details to publish a product</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#82b541] hover:bg-[#6ea032] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Product'}
        </button>
      </div>

      <div className="max-w-3xl space-y-5">
        {/* Basic Info */}
        <div className={sectionClass}>
          <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Product Name *</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} placeholder="e.g. Restaurant POS System" />
              {form.name && (
                <p className="mt-1.5 text-xs text-gray-400">
                  Slug: <span className="font-mono text-[#82b541]">{slug}</span>
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Short Description</label>
              <input type="text" value={form.description} onChange={e => update('description', e.target.value)} className={inputClass} placeholder="One-line product description" />
            </div>
            <div>
              <label className={labelClass}>Long Description (Markdown supported)</label>
              <textarea value={form.longDescription} onChange={e => update('longDescription', e.target.value)} rows={6} className={inputClass + ' resize-none'} placeholder="Full product description with **bold**, bullet lists, etc." />
            </div>
            <div>
              <label className={labelClass}>Main Image URL</label>
              <input type="url" value={form.image} onChange={e => update('image', e.target.value)} className={inputClass} placeholder="https://images.unsplash.com/..." />
              {form.image && <img src={form.image} alt="preview" className="mt-2 h-20 w-32 object-cover rounded-lg border border-gray-200" />}
            </div>
          </div>
        </div>

        {/* Pricing & Category */}
        <div className={sectionClass}>
          <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">Pricing & Categorization</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price (৳)</label>
              <input type="number" value={form.price} onChange={e => update('price', e.target.value)} className={inputClass} placeholder="0 for free" min="0" />
            </div>
            <div>
              <label className={labelClass}>Original Price (৳)</label>
              <input type="number" value={form.originalPrice} onChange={e => update('originalPrice', e.target.value)} className={inputClass} placeholder="Before discount" min="0" />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select value={form.category} onChange={e => update('category', e.target.value)} className={inputClass + ' bg-white'}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Subcategory</label>
              <input type="text" value={form.subcategory} onChange={e => update('subcategory', e.target.value)} className={inputClass} placeholder="e.g. business, payment" />
            </div>
            <div>
              <label className={labelClass}>Badge</label>
              <select value={form.badge} onChange={e => update('badge', e.target.value)} className={inputClass + ' bg-white'}>
                {badges.map(b => <option key={b} value={b}>{b || '(none)'}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Version</label>
              <input type="text" value={form.version} onChange={e => update('version', e.target.value)} className={inputClass} placeholder="1.0.0" />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={e => update('tags', e.target.value)} className={inputClass} placeholder="laravel, pos, restaurant, php" />
          </div>
          <div className="mt-4">
            <label className={labelClass}>Features (one per line)</label>
            <textarea value={form.features} onChange={e => update('features', e.target.value)} rows={4} className={inputClass + ' resize-none'} placeholder="Laravel 11&#10;React 18&#10;Dark mode&#10;Mobile responsive" />
          </div>
        </div>

        {/* Demo Links */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Demo Links</h3>
            <button onClick={addDemoLink} className="flex items-center gap-1.5 text-sm text-[#82b541] hover:text-[#6ea032]">
              <Plus size={14} /> Add Link
            </button>
          </div>
          <div className="space-y-3">
            {demoLinks.map((link, i) => (
              <div key={i} className="flex gap-3 items-start">
                <input type="text" value={link.label} onChange={e => updateDemoLink(i, 'label', e.target.value)} className={inputClass} placeholder="Label (e.g. Admin Panel)" />
                <div className="relative flex-1">
                  <ExternalLink size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="url" value={link.url} onChange={e => updateDemoLink(i, 'url', e.target.value)} className={inputClass + ' pl-8'} placeholder="https://..." />
                </div>
                {demoLinks.length > 1 && (
                  <button onClick={() => removeDemoLink(i)} className="p-2 text-red-400 hover:text-red-600 mt-0.5">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Demo Credentials */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Demo Credentials</h3>
            <button onClick={addCred} className="flex items-center gap-1.5 text-sm text-[#82b541] hover:text-[#6ea032]">
              <Plus size={14} /> Add Credential
            </button>
          </div>
          <div className="space-y-4">
            {demoCredentials.map((cred, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 relative">
                {demoCredentials.length > 1 && (
                  <button onClick={() => removeCred(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Role</label>
                    <input type="text" value={cred.role} onChange={e => updateCred(i, 'role', e.target.value)} className={inputClass} placeholder="Admin" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Demo URL</label>
                    <input type="url" value={cred.url} onChange={e => updateCred(i, 'url', e.target.value)} className={inputClass} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Username</label>
                    <input type="text" value={cred.username} onChange={e => updateCred(i, 'username', e.target.value)} className={inputClass} placeholder="admin@demo.com" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Password</label>
                    <input type="text" value={cred.password} onChange={e => updateCred(i, 'password', e.target.value)} className={inputClass} placeholder="Admin@123" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hosted Files */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">File Hosting</h3>
            <button onClick={addFile} className="flex items-center gap-1.5 text-sm text-[#82b541] hover:text-[#6ea032]">
              <Plus size={14} /> Add File
            </button>
          </div>
          <div className="space-y-4">
            {hostedFiles.map((file, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 relative">
                {hostedFiles.length > 1 && (
                  <button onClick={() => removeFile(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">File Name</label>
                    <input type="text" value={file.name} onChange={e => updateFile(i, 'name', e.target.value)} className={inputClass} placeholder="product-v1.0.zip" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Size</label>
                    <input type="text" value={file.size} onChange={e => updateFile(i, 'size', e.target.value)} className={inputClass} placeholder="24.5 MB" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select value={file.type} onChange={e => updateFile(i, 'type', e.target.value)} className={inputClass + ' bg-white'}>
                      {['zip', 'pdf', 'psd', 'ai', 'figma', 'apk', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hosting</label>
                    <select value={file.hosting} onChange={e => updateFile(i, 'hosting', e.target.value)} className={inputClass + ' bg-white'}>
                      <option value="direct">Direct</option>
                      <option value="drive">Google Drive</option>
                      <option value="dropbox">Dropbox</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Download URL</label>
                    <input type="url" value={file.url} onChange={e => updateFile(i, 'url', e.target.value)} className={inputClass} placeholder="https://..." />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#82b541] hover:bg-[#6ea032] text-white px-8 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Save size={16} />
            {saved ? '✓ Saved!' : 'Save Product'}
          </button>
        </div>
      </div>
    </ShopAdminLayout>
  )
}
