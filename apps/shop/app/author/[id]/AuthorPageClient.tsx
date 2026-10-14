'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getSeller, getSellerProducts } from '@/lib/data'
import { ItemCard } from '@/app/page'

export default function AuthorPageClient() {
  const { id } = useParams<{ id: string }>()
  const seller = getSeller(id)
  const products = getSellerProducts(id)
  const [activeTab, setActiveTab] = useState<'items'|'reviews'>('items')

  if (!seller) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Author not found</h1>
        <Link href="/" className="text-blue-600 hover:underline">← Browse items</Link>
      </div>
    </div>
  )

  const mockReviews = [
    { user: 'Alam K.', rating: 5, comment: 'Excellent seller, fast support and clean code!', item: products[0]?.name || 'Product', date: '2025-06-30' },
    { user: 'Ritu S.', rating: 5, comment: 'Best developer on SI Shop. Always responsive.', item: products[1]?.name || 'Product', date: '2025-06-18' },
    { user: 'Faruk A.', rating: 4, comment: 'Good quality items, documentation could be better.', item: products[0]?.name || 'Product', date: '2025-06-05' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Author Banner */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl flex-shrink-0">
              {seller.avatar || seller.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-3xl font-black">{seller.shopName}</h1>
                {seller.verified && <span className="bg-blue-500 text-white text-xs font-black px-3 py-1 rounded-full">✓ Verified Author</span>}
              </div>
              <p className="text-white/60 text-sm mb-3">by {seller.name} · Member since {seller.joinedDate}</p>
              <p className="text-white/80 text-sm max-w-xl leading-relaxed mb-4">{seller.bio}</p>
              <div className="flex flex-wrap gap-2">
                {seller.categories.map(c => (
                  <span key={c} className="bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full">{c}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col gap-4 sm:gap-3 text-center sm:text-right">
              {[
                { label: 'Items', value: seller.totalProducts },
                { label: 'Sales', value: seller.totalSales.toLocaleString() },
                { label: 'Rating', value: `${seller.rating} ★` },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-2xl px-5 py-3 min-w-[80px]">
                  <p className="font-black text-2xl leading-none">{s.value}</p>
                  <p className="text-white/60 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          {([
            { key: 'items', label: `Items (${products.length})` },
            { key: 'reviews', label: `Reviews (${mockReviews.length})` },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`py-4 px-6 text-sm font-bold border-b-2 transition ${activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'items' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">All Items by {seller.shopName}</h2>
              <span className="text-gray-500 text-sm">{products.length} items</span>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">📦</p>
                <p className="text-lg font-semibold">No items yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map(p => <ItemCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-3xl">
            <h2 className="text-xl font-black text-gray-900 mb-6">Author Reviews</h2>
            <div className="flex items-center gap-6 bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="text-center">
                <p className="text-5xl font-black text-gray-900">{seller.rating}</p>
                <div className="flex justify-center gap-0.5 my-1">
                  {[1,2,3,4,5].map(i=><span key={i} className={i<=Math.round(seller.rating)?'text-yellow-400':'text-gray-200'}>★</span>)}
                </div>
                <p className="text-gray-500 text-sm">Author rating</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5,4,3,2,1].map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-400 font-bold w-4">{s}★</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{width: s===5?'80%':s===4?'15%':s===3?'4%':'1%'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {mockReviews.map((r,i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">{r.user[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{r.user}</span>
                        <div className="flex gap-0.5 text-xs">
                          {[1,2,3,4,5].map(s=><span key={s} className={s<=r.rating?'text-yellow-400':'text-gray-200'}>★</span>)}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">on <span className="text-gray-600">{r.item}</span> · {r.date}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
