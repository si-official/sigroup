'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getProductsWithSellers, categories } from '@/lib/data'
import { useCart } from '@/context/CartContext'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-xs">
      {[1,2,3,4,5].map(i=><span key={i} className={i<=Math.round(rating)?'text-yellow-400':'text-gray-200'}>★</span>)}
    </div>
  )
}

const badgeColors: Record<string,string> = {
  'Best Seller':'bg-orange-500','Hot':'bg-red-600','New':'bg-emerald-600','Featured':'bg-purple-600','Free':'bg-blue-600',
}

const categoryMap: Record<string, string> = {
  'software': 'software', 'mobile-app': 'mobile-app', 'template': 'template',
  'plugin': 'plugin', 'ui-kit': 'ui-kit', 'script': 'script', 'theme': 'theme', 'javascript': 'javascript',
}

export default function CategoryPageClient() {
  const { cat } = useParams<{ cat: string }>()
  const { addToCart } = useCart()
  const allProducts = getProductsWithSellers()

  const categoryInfo = categories.find(c => c.id === cat)
  const [sortBy, setSortBy] = useState<'popular'|'newest'|'price-low'|'price-high'|'rating'>('popular')
  const [priceRange, setPriceRange] = useState<[number,number]>([0, 15000])
  const [minRating, setMinRating] = useState(0)
  const [view, setView] = useState<'grid'|'list'>('grid')

  const filtered = useMemo(() => {
    let items = cat === 'all' ? allProducts : allProducts.filter(p => p.category === cat)
    items = items.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (minRating > 0) items = items.filter(p => p.rating >= minRating)
    switch (sortBy) {
      case 'newest': return [...items].sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      case 'price-low': return [...items].sort((a,b) => a.price - b.price)
      case 'price-high': return [...items].sort((a,b) => b.price - a.price)
      case 'rating': return [...items].sort((a,b) => b.rating - a.rating)
      default: return [...items].sort((a,b) => b.sales - a.sales)
    }
  }, [cat, sortBy, priceRange, minRating])

  const label = categoryInfo?.label || (cat === 'all' ? 'All Items' : cat.replace('-',' '))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Category header */}
      <div className={`${categoryInfo?.color || 'bg-gray-700'} text-white py-10`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white capitalize">{label}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{categoryInfo?.icon || '📦'}</span>
            <div>
              <h1 className="text-3xl font-black capitalize">{label}</h1>
              <p className="text-white/70 mt-1">{categoryInfo?.desc || `Browse ${label} items`} · <span className="text-white font-semibold">{filtered.length} items</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-7">
          {/* Sidebar filters */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
              <h3 className="font-black text-gray-900 mb-4">Price Range</h3>
              <div className="space-y-3">
                {[
                  { label: 'All Prices', range: [0, 15000] as [number,number] },
                  { label: 'Free', range: [0, 0] as [number,number] },
                  { label: 'Under ৳1,000', range: [1, 1000] as [number,number] },
                  { label: '৳1,000 – ৳5,000', range: [1000, 5000] as [number,number] },
                  { label: '৳5,000 – ৳10,000', range: [5000, 10000] as [number,number] },
                  { label: 'Over ৳10,000', range: [10000, 15000] as [number,number] },
                ].map(opt => (
                  <label key={opt.label} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" name="price" checked={priceRange[0]===opt.range[0]&&priceRange[1]===opt.range[1]}
                      onChange={() => setPriceRange(opt.range)} className="accent-blue-600" />
                    <span className={`text-sm group-hover:text-blue-600 transition ${priceRange[0]===opt.range[0]&&priceRange[1]===opt.range[1]?'font-semibold text-blue-600':'text-gray-600'}`}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
              <h3 className="font-black text-gray-900 mb-4">Minimum Rating</h3>
              <div className="space-y-2">
                {[0,4,4.5,5].map(r => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" name="rating" checked={minRating===r} onChange={() => setMinRating(r)} className="accent-blue-600" />
                    <span className={`text-sm flex items-center gap-1 group-hover:text-blue-600 transition ${minRating===r?'font-semibold text-blue-600':'text-gray-600'}`}>
                      {r === 0 ? 'Any Rating' : <><span className="text-yellow-400">{'★'.repeat(Math.floor(r))}</span> {r}+</>}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-black text-gray-900 mb-4">Categories</h3>
              <div className="space-y-1">
                <Link href="/category/all" className={`block text-sm px-3 py-2 rounded-xl transition ${cat==='all'?'bg-blue-50 text-blue-700 font-semibold':'text-gray-600 hover:bg-gray-50'}`}>All Items</Link>
                {categories.map(c => (
                  <Link key={c.id} href={`/category/${c.id}`}
                    className={`flex items-center justify-between text-sm px-3 py-2 rounded-xl transition ${cat===c.id?'bg-blue-50 text-blue-700 font-semibold':'text-gray-600 hover:bg-gray-50'}`}>
                    <span>{c.icon} {c.label}</span>
                    <span className="text-xs text-gray-400">{c.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort + view bar */}
            <div className="flex items-center gap-3 mb-6 bg-white rounded-2xl border border-gray-200 px-4 py-3">
              <span className="text-sm text-gray-500 flex-1">{filtered.length} results</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 bg-white">
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setView('grid')} className={`px-3 py-2 text-sm transition ${view==='grid'?'bg-blue-600 text-white':'text-gray-500 hover:bg-gray-50'}`}>⊞</button>
                <button onClick={() => setView('list')} className={`px-3 py-2 text-sm transition ${view==='list'?'bg-blue-600 text-white':'text-gray-500 hover:bg-gray-50'}`}>☰</button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-black text-gray-900 mb-2">No items found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition group">
                    <Link href={`/item/${p.slug}`} className="block relative" style={{paddingBottom:'56.25%'}}>
                      <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                      {p.badge && <span className={`absolute top-2 left-2 ${badgeColors[p.badge]||'bg-gray-600'} text-white text-[10px] font-black px-2 py-0.5 rounded uppercase`}>{p.badge}</span>}
                    </Link>
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Link href={`/category/${p.category}`} className="text-xs text-blue-600 hover:underline capitalize">{p.category.replace('-',' ')}</Link>
                        {p.seller && <><span className="text-gray-300 text-xs">·</span><Link href={`/author/${p.sellerId}`} className="text-xs text-gray-500 hover:text-blue-600 truncate">{p.seller.shopName}</Link></>}
                      </div>
                      <Link href={`/item/${p.slug}`}><h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 hover:text-blue-600 transition">{p.name}</h3></Link>
                      <div className="flex items-center gap-1 mb-3">
                        <Stars rating={p.rating} />
                        <span className="text-xs text-gray-500">({p.reviews})</span>
                        <span className="text-xs text-gray-400 ml-auto">{p.sales} sales</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                          {p.price === 0 ? <span className="font-black text-green-600 text-base">FREE</span> : <><span className="font-black text-gray-900 text-base">৳{p.price.toLocaleString()}</span>{p.originalPrice&&<span className="text-xs text-gray-400 line-through">৳{p.originalPrice.toLocaleString()}</span>}</>}
                        </div>
                        <button onClick={() => addToCart(p)} className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-3 py-2 rounded-xl transition">+ Cart</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-sm transition flex">
                    <Link href={`/item/${p.slug}`} className="block flex-shrink-0 w-40 h-28 relative">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      {p.badge && <span className={`absolute top-1.5 left-1.5 ${badgeColors[p.badge]||'bg-gray-600'} text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase`}>{p.badge}</span>}
                    </Link>
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs text-blue-600 capitalize">{p.category.replace('-',' ')}</span>
                          {p.seller && <><span className="text-gray-300">·</span><span className="text-xs text-gray-500 truncate">{p.seller.shopName}</span></>}
                        </div>
                        <Link href={`/item/${p.slug}`}><h3 className="font-bold text-gray-900 text-sm leading-snug hover:text-blue-600 transition line-clamp-2">{p.name}</h3></Link>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Stars rating={p.rating} />
                          <span className="text-xs text-gray-400">({p.reviews}) · {p.sales} sales</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-gray-900">{p.price===0?'FREE':`৳${p.price.toLocaleString()}`}</span>
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
