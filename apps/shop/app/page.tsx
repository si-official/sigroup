'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import { products, categories } from '@/lib/products'

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-3xl p-10 mb-10 text-white">
          <h1 className="text-4xl font-black mb-2">SI Software Store</h1>
          <p className="text-green-200 text-lg mb-6">Premium software for Bangladeshi businesses</p>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-white/20 border border-white/30 text-white placeholder-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition ${
                activeCategory === cat ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
              }`}>
              {cat}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
    </>
  )
}
