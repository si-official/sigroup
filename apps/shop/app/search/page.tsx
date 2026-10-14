'use client'
import { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getProductsWithSellers, categories } from '@/lib/data'
import { useCart } from '@/context/CartContext'

function Stars({ rating }: { rating: number }) {
  return <div className="flex gap-0.5 text-xs">{[1,2,3,4,5].map(i=><span key={i} className={i<=Math.round(rating)?'text-yellow-400':'text-gray-200'}>★</span>)}</div>
}

const badgeColors: Record<string,string> = {
  'Best Seller':'bg-orange-500','Hot':'bg-red-600','New':'bg-emerald-600','Featured':'bg-purple-600','Free':'bg-blue-600',
}

function SearchPageInner() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const { addToCart } = useCart()
  const allProducts = getProductsWithSellers()

  const [query, setQuery] = useState(q)
  const [sortBy, setSortBy] = useState<'relevant'|'popular'|'newest'|'price-low'|'price-high'|'rating'>('relevant')
  const [selectedCat, setSelectedCat] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number,number]>([0, 15000])
  const [minRating, setMinRating] = useState(0)

  useEffect(() => { setQuery(q) }, [q])

  const results = useMemo(() => {
    let items = allProducts
    if (query.trim()) {
      const lq = query.toLowerCase()
      items = items.filter(p =>
        p.name.toLowerCase().includes(lq) ||
        p.description.toLowerCase().includes(lq) ||
        p.tags.some(t => t.toLowerCase().includes(lq)) ||
        p.category.toLowerCase().includes(lq) ||
        p.seller?.shopName.toLowerCase().includes(lq)
      )
    }
    if (selectedCat) items = items.filter(p => p.category === selectedCat)
    items = items.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (minRating > 0) items = items.filter(p => p.rating >= minRating)
    switch (sortBy) {
      case 'newest': return [...items].sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      case 'price-low': return [...items].sort((a,b) => a.price - b.price)
      case 'price-high': return [...items].sort((a,b) => b.price - a.price)
      case 'rating': return [...items].sort((a,b) => b.rating - a.rating)
      case 'popular': return [...items].sort((a,b) => b.sales - a.sales)
      default: return items
    }
  }, [query, sortBy, selectedCat, priceRange, minRating])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-400 transition">
              <span className="text-gray-400 text-lg">🔍</span>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search software, apps, templates..."
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none" />
            </div>
            {q && <p className="text-sm text-gray-500 whitespace-nowrap">Results for <span className="font-semibold text-gray-900">"{q}"</span></p>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-7">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
              <h3 className="font-black text-gray-900 mb-3">Category</h3>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cat" checked={!selectedCat} onChange={() => setSelectedCat('')} className="accent-blue-600" />
                  <span className={`text-sm ${!selectedCat?'font-semibold text-blue-600':'text-gray-600'}`}>All Categories</span>
                </label>
                {categories.map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" checked={selectedCat===c.id} onChange={() => setSelectedCat(c.id)} className="accent-blue-600" />
                    <span className={`text-sm ${selectedCat===c.id?'font-semibold text-blue-600':'text-gray-600'}`}>{c.icon} {c.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
              <h3 className="font-black text-gray-900 mb-3">Price</h3>
              <div className="space-y-2">
                {[
                  { label: 'Any Price', range: [0,15000] as [number,number] },
                  { label: 'Free', range: [0,0] as [number,number] },
                  { label: 'Under ৳1,000', range: [1,1000] as [number,number] },
                  { label: '৳1,000 – ৳5,000', range: [1000,5000] as [number,number] },
                  { label: 'Over ৳5,000', range: [5000,15000] as [number,number] },
                ].map(opt => (
                  <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="price" checked={priceRange[0]===opt.range[0]&&priceRange[1]===opt.range[1]} onChange={() => setPriceRange(opt.range)} className="accent-blue-600" />
                    <span className={`text-sm ${priceRange[0]===opt.range[0]&&priceRange[1]===opt.range[1]?'font-semibold text-blue-600':'text-gray-600'}`}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-black text-gray-900 mb-3">Rating</h3>
              <div className="space-y-2">
                {[0,4,4.5].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rating" checked={minRating===r} onChange={() => setMinRating(r)} className="accent-blue-600" />
                    <span className={`text-sm flex items-center gap-1 ${minRating===r?'font-semibold text-blue-600':'text-gray-600'}`}>
                      {r===0?'Any Rating':<><span className="text-yellow-400">{'★'.repeat(Math.floor(r))}</span>{r}+</>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 bg-white rounded-2xl border border-gray-200 px-4 py-3">
              <span className="text-sm text-gray-500">{results.length} items found{q ? ` for "${q}"` : ''}</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 bg-white">
                <option value="relevant">Most Relevant</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-xl font-black text-gray-900 mb-2">No results found</p>
                <p className="text-gray-500 text-sm mb-6">Try searching with different keywords or browse categories</p>
                <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition text-sm">Browse All Items</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-sm transition flex">
                    <Link href={`/item/${p.slug}`} className="block flex-shrink-0 w-40 h-28 relative">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      {p.badge && <span className={`absolute top-1.5 left-1.5 ${badgeColors[p.badge]||'bg-gray-600'} text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase`}>{p.badge}</span>}
                    </Link>
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Link href={`/category/${p.category}`} className="text-xs text-blue-600 hover:underline capitalize">{p.category.replace('-',' ')}</Link>
                          {p.seller && <><span className="text-gray-300">·</span><Link href={`/author/${p.sellerId}`} className="text-xs text-gray-500 hover:text-blue-600">{p.seller.shopName}</Link></>}
                        </div>
                        <Link href={`/item/${p.slug}`}><h3 className="font-bold text-gray-900 text-sm hover:text-blue-600 transition line-clamp-2 leading-snug">{p.name}</h3></Link>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Stars rating={p.rating} />
                          <span className="text-xs text-gray-400">({p.reviews}) · {p.sales} sales</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-gray-900">{p.price===0?<span className="text-green-600">FREE</span>:`৳${p.price.toLocaleString()}`}</span>
                          <button onClick={() => addToCart(p)} className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">+ Cart</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <SearchPageInner />
    </Suspense>
  )
}
