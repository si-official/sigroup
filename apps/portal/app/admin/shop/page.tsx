'use client'
import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

const initProducts = [
  { id: 1, name: 'Wireless Mechanical Keyboard', category: 'Electronics', price: 4299, stock: 45, sold: 218, status: 'active', image: '⌨️' },
  { id: 2, name: 'USB-C 4-Port Hub', category: 'Accessories', price: 1299, stock: 120, sold: 156, status: 'active', image: '🔌' },
  { id: 3, name: '4K Webcam Ultra HD', category: 'Electronics', price: 6800, stock: 18, sold: 94, status: 'active', image: '📷' },
  { id: 4, name: 'Noise Cancel Earbuds', category: 'Audio', price: 2599, stock: 0, sold: 403, status: 'out_of_stock', image: '🎧' },
  { id: 5, name: 'Premium Laptop Stand Pro', category: 'Accessories', price: 3499, stock: 67, sold: 320, status: 'active', image: '💻' },
  { id: 6, name: 'RGB Gaming Mouse', category: 'Electronics', price: 1899, stock: 30, sold: 180, status: 'draft', image: '🖱️' },
]

const statusColors: Record<string, string> = {
  active: 'bg-emerald-900/60 text-emerald-400 border-emerald-800',
  out_of_stock: 'bg-red-900/60 text-red-400 border-red-800',
  draft: 'bg-gray-800 text-gray-400 border-gray-700',
}

export default function ShopAdmin() {
  const [products, setProducts] = useState(initProducts)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '', image: '📦' })

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  )

  const addProduct = () => {
    if (!form.name || !form.price) return
    const newP = {
      id: products.length + 1, name: form.name, category: form.category || 'General',
      price: Number(form.price), stock: Number(form.stock), sold: 0, status: 'active', image: form.image,
    }
    setProducts([newP, ...products])
    setForm({ name: '', category: '', price: '', stock: '', image: '📦' })
    setShowAdd(false)
  }

  const toggleStatus = (id: number) => {
    setProducts(products.map((p) => p.id === id
      ? { ...p, status: p.status === 'active' ? 'draft' : 'active' }
      : p
    ))
  }

  return (
    <AdminLayout title="SI Shop" breadcrumb={[{ label: 'SI Shop' }]}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">🛍️ SI Shop Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage products, orders, inventory</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition"
          >
            + Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: products.length, icon: '📦' },
            { label: 'Active', value: products.filter(p => p.status === 'active').length, icon: '✅' },
            { label: 'Out of Stock', value: products.filter(p => p.status === 'out_of_stock').length, icon: '⚠️' },
            { label: 'Total Sold', value: products.reduce((a, p) => a + p.sold, 0), icon: '📊' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-2xl font-black text-white mt-2">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm w-80 focus:outline-none focus:border-orange-500 placeholder-gray-600"
          />
        </div>

        {/* Add product modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-white font-black text-xl mb-6">Add New Product</h2>
              <div className="space-y-4">
                {[
                  { label: 'Product Name *', key: 'name', placeholder: 'e.g. Wireless Keyboard' },
                  { label: 'Category', key: 'category', placeholder: 'e.g. Electronics' },
                  { label: 'Price (৳)', key: 'price', placeholder: 'e.g. 2500' },
                  { label: 'Stock Quantity', key: 'stock', placeholder: 'e.g. 50' },
                  { label: 'Icon (emoji)', key: 'image', placeholder: '📦' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-gray-400 text-xs mb-1.5 block">{f.label}</label>
                    <input
                      value={(form as Record<string, string>)[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 placeholder-gray-600"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={addProduct} className="flex-1 bg-orange-500 hover:bg-orange-400 text-white py-3 rounded-xl font-bold transition">Add Product</button>
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-bold transition">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-800 bg-gray-950/50">
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Stock</th>
                <th className="px-6 py-4 text-left">Sold</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.image}</span>
                      <span className="text-white font-semibold text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{p.category}</td>
                  <td className="px-6 py-4 text-white font-bold">৳{p.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={p.stock === 0 ? 'text-red-400 font-bold' : 'text-gray-300'}>{p.stock}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{p.sold}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusColors[p.status]}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(p.id)} className="text-orange-400 hover:text-orange-300 text-xs font-bold mr-3">
                      {p.status === 'active' ? 'Hide' : 'Activate'}
                    </button>
                    <button className="text-red-500 hover:text-red-400 text-xs font-bold" onClick={() => setProducts(products.filter(x => x.id !== p.id))}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center text-gray-600 py-12">No products found</div>}
        </div>
    </AdminLayout>
  )
}
