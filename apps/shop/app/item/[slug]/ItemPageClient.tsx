'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getProduct, getSeller, getRelatedProducts } from '@/lib/data'
import { useCart } from '@/context/CartContext'
import { ItemCard } from '@/app/page'

const mockReviews = [
  { id: 'r1', user: 'Alam Khan', avatar: 'A', rating: 5, date: '2025-06-28', comment: 'Excellent product! Well documented, clean code. Worked perfectly on first try. The seller responded quickly to all my questions. Highly recommend!' },
  { id: 'r2', user: 'Ritu Sharma', avatar: 'R', rating: 5, date: '2025-06-20', comment: 'Best purchase this year. Setup was easy and the features are exactly as described. Support was quick and helpful.' },
  { id: 'r3', user: 'Faruk Ahmed', avatar: 'F', rating: 4, date: '2025-06-10', comment: 'Good product overall. Minor issue with configuration but seller fixed it within 2 hours. Would buy again.' },
  { id: 'r4', user: 'Sadia Islam', avatar: 'S', rating: 5, date: '2025-05-30', comment: 'Amazing quality. Clean code, great documentation. Already deployed it for my client and they love it!' },
]

function Stars({ rating, interactive = false, size = 'sm' }: { rating: number; interactive?: boolean; size?: 'sm'|'lg' }) {
  const sz = size === 'lg' ? 'text-2xl' : 'text-sm'
  return (
    <div className={`flex items-center gap-0.5 ${sz}`}>
      {[1,2,3,4,5].map(i=><span key={i} className={i<=Math.round(rating)?'text-yellow-400':'text-gray-300'}>★</span>)}
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [value])
  return (
    <button onClick={copy} className={`text-[10px] font-bold px-2 py-0.5 rounded transition flex-shrink-0 ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function fileIcon(type: string) {
  const icons: Record<string, string> = { zip: '🗜️', pdf: '📄', psd: '🖼️', ai: '✏️', figma: '🎨', apk: '📱', other: '📁' }
  return icons[type] || '📁'
}

function hostingLabel(hosting: string) {
  if (hosting === 'drive') return <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">🔵 Google Drive</span>
  if (hosting === 'dropbox') return <span className="text-[10px] text-blue-500 font-semibold">📦 Dropbox</span>
  return <span className="text-[10px] text-gray-500 font-semibold">⬇ Direct</span>
}

export default function ItemPage() {
  const { slug } = useParams<{ slug: string }>()
  const product = getProduct(slug)
  const { addToCart } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview'|'reviews'|'comments'|'changelog'>('overview')
  const [license, setLicense] = useState<'Regular'|'Extended'>('Regular')
  const [owned, setOwned] = useState(false)

  if (!product) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Item not found</h1>
        <Link href="/" className="text-blue-600 hover:underline">← Browse all items</Link>
      </div>
    </div>
  )

  const seller = getSeller(product.sellerId)
  const related = getRelatedProducts(product)
  const extendedPrice = Math.round(product.price * 3.5)
  const finalPrice = license === 'Regular' ? product.price : extendedPrice
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  const ratingBreakdown = [
    { stars: 5, pct: 78 }, { stars: 4, pct: 15 }, { stars: 3, pct: 5 }, { stars: 2, pct: 1 }, { stars: 1, pct: 1 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href={`/?cat=${product.category}`} className="hover:text-blue-600 capitalize">{product.category.replace('-',' ')}</Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: screenshots + description */}
          <div className="lg:col-span-2">
            {/* Screenshots */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
              <div className="relative bg-gray-900 aspect-video overflow-hidden">
                <img src={product.previewImages[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                {product.demoUrl && product.demoUrl !== '#' && (
                  <a href={product.demoUrl} target="_blank" rel="noreferrer"
                    className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg text-sm">
                    Live Preview ↗
                  </a>
                )}
              </div>
              {product.previewImages.length > 1 && (
                <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-200 overflow-x-auto">
                  {product.previewImages.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${activeImage===i?'border-blue-500':'border-gray-200 hover:border-gray-400'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item title & meta */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Stars rating={product.rating} />
                  <span className="font-bold text-gray-900">{product.rating}</span>
                  <span>({product.reviews} reviews)</span>
                </div>
                <span className="text-gray-300">|</span>
                <span>{product.sales.toLocaleString()} sales</span>
                {seller && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span>by <Link href={`/author/${product.sellerId}`} className="text-blue-600 hover:underline font-semibold">{seller.shopName}</Link></span>
                  </>
                )}
                {product.badge && (
                  <span className={`${badgeColors[product.badge]||'bg-gray-600'} text-white text-[10px] font-black px-2 py-0.5 rounded uppercase`}>{product.badge}</span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                {(['overview','reviews','comments','changelog'] as const).map(tab=>(
                  <button key={tab} onClick={()=>setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-sm font-semibold capitalize transition ${activeTab===tab?'text-blue-600 border-b-2 border-blue-600 bg-blue-50':'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                    {tab}{tab==='reviews'&&` (${product.reviews})`}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab==='overview'&&(
                  <div>
                    <h3 className="font-black text-gray-900 text-lg mb-4">Item Description</h3>
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                      {product.longDescription.replace(/\*\*/g,'')}
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-4">Key Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                      {product.features.map(f=>(
                        <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-500 font-bold flex-shrink-0">✓</span>{f}
                        </div>
                      ))}
                    </div>
                    {product.compatible && (
                      <>
                        <h3 className="font-black text-gray-900 text-lg mb-3">Compatible With</h3>
                        <div className="flex flex-wrap gap-2">
                          {product.compatible.map(c=>(
                            <span key={c} className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">{c}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab==='reviews'&&(
                  <div>
                    <div className="flex gap-8 mb-8 pb-6 border-b border-gray-100">
                      <div className="text-center">
                        <p className="text-6xl font-black text-gray-900">{product.rating}</p>
                        <Stars rating={product.rating} size="lg" />
                        <p className="text-gray-500 text-sm mt-1">{product.reviews} reviews</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {ratingBreakdown.map(r=>(
                          <div key={r.stars} className="flex items-center gap-2 text-sm">
                            <span className="text-yellow-400 font-bold w-4">{r.stars}★</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div className="bg-yellow-400 h-2 rounded-full" style={{width:`${r.pct}%`}}/>
                            </div>
                            <span className="text-gray-500 w-8">{r.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-5">
                      {mockReviews.map(r=>(
                        <div key={r.id} className="flex gap-4 pb-5 border-b border-gray-50 last:border-0">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black flex-shrink-0">{r.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 text-sm">{r.user}</span>
                              <Stars rating={r.rating} />
                              <span className="text-gray-400 text-xs ml-auto">{r.date}</span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-3">Leave a Review</h4>
                      <div className="flex items-center gap-1 mb-3">
                        {[1,2,3,4,5].map(i=><button key={i} className="text-2xl text-yellow-400 hover:scale-110 transition">★</button>)}
                      </div>
                      <textarea rows={3} placeholder="Share your experience with this item..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none mb-3" />
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">Submit Review</button>
                    </div>
                  </div>
                )}

                {activeTab==='comments'&&(
                  <div>
                    <p className="text-gray-500 mb-4 text-sm">Have a question about this item? Ask the author.</p>
                    <div className="space-y-4">
                      {[
                        { user:'Buyer123', text:'Does this support multi-currency?', reply:'Yes, it supports BDT, USD, EUR, and any currency you configure.', date:'2025-06-25' },
                        { user:'DevPro', text:'Is the source code included?', reply:'Yes! Full source code + documentation + 6 months support.', date:'2025-06-18' },
                      ].map((c,i)=>(
                        <div key={i} className="border border-gray-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-bold">{c.user[0]}</div>
                            <span className="font-semibold text-gray-900 text-sm">{c.user}</span>
                            <span className="text-gray-400 text-xs ml-auto">{c.date}</span>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">{c.text}</p>
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 ml-4">
                            <p className="text-xs text-blue-600 font-bold mb-1">Author reply:</p>
                            <p className="text-gray-700 text-sm">{c.reply}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <textarea rows={3} placeholder="Ask the author a question..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none mb-3" />
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">Post Comment</button>
                    </div>
                  </div>
                )}

                {activeTab==='changelog'&&(
                  <div className="space-y-4">
                    {[
                      { version: product.version||'1.0.0', date: product.lastUpdated, changes: ['Fixed payment callback issue', 'Added dark mode support', 'Performance improvements', 'Updated dependencies'] },
                      { version: '1.0.0', date: '2024-01-15', changes: ['Initial release'] },
                    ].map((v,i)=>(
                      <div key={i} className="border-l-2 border-blue-200 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-black text-blue-600">v{v.version}</span>
                          <span className="text-gray-400 text-xs">{v.date}</span>
                          {i===0&&<span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Latest</span>}
                        </div>
                        <ul className="space-y-1">{v.changes.map(c=><li key={c} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>{c}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Related items */}
            {related.length>0&&(
              <div className="mt-8">
                <h3 className="text-xl font-black text-gray-900 mb-4">Related Items</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {related.slice(0,4).map(p=><ItemCard key={p.id} product={p}/>)}
                </div>
              </div>
            )}
          </div>

          {/* Right: purchase card + item info */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              {/* Purchase card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                {/* License selector */}
                {product.price>0&&(
                  <div className="mb-4">
                    <p className="text-sm font-bold text-gray-700 mb-2">License</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Regular','Extended'] as const).map(l=>(
                        <button key={l} onClick={()=>setLicense(l)}
                          className={`py-3 px-3 rounded-xl border-2 text-sm font-bold transition ${license===l?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          <div>{l}</div>
                          <div className="font-black text-lg mt-0.5">{l==='Regular'?`৳${product.price.toLocaleString()}`:`৳${extendedPrice.toLocaleString()}`}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{license==='Regular'?'For a single end product used by you or your client.':'For unlimited end products sold to multiple clients.'}</p>
                  </div>
                )}

                {product.price===0?(
                  <button onClick={()=>addToCart(product)} className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl transition shadow-sm text-lg mb-3">
                    ⬇ Download Free
                  </button>
                ):(
                  <>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-black text-gray-900">৳{finalPrice.toLocaleString()}</span>
                      {product.originalPrice&&license==='Regular'&&<span className="text-gray-400 text-base line-through">৳{product.originalPrice.toLocaleString()}</span>}
                      {discount>0&&license==='Regular'&&<span className="bg-green-100 text-green-700 text-xs font-black px-2 py-0.5 rounded-full">{discount}% OFF</span>}
                    </div>
                    <button onClick={()=>addToCart(product)} className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl transition shadow-sm text-lg mb-2">
                      Add to Cart
                    </button>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl transition text-base mb-3">
                      Buy Now — ৳{finalPrice.toLocaleString()}
                    </button>
                  </>
                )}

                <div className="text-center">
                  <button className="text-gray-400 hover:text-red-500 text-sm transition">♡ Add to Wishlist</button>
                </div>
              </div>

              {/* Item details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h4 className="font-bold text-gray-900 mb-4">Item Details</h4>
                <div className="space-y-3 text-sm">
                  {[
                    { label:'Category', value:product.category.replace('-',' '), caps:true },
                    { label:'Version', value:product.version||'1.0.0' },
                    { label:'Last Updated', value:product.lastUpdated },
                    { label:'Total Sales', value:`${product.sales.toLocaleString()} purchases` },
                    { label:'Rating', value:`${product.rating} / 5 (${product.reviews} reviews)` },
                  ].map(d=>(
                    <div key={d.label} className="flex justify-between gap-2">
                      <span className="text-gray-500">{d.label}</span>
                      <span className={`font-semibold text-gray-900 text-right ${d.caps?'capitalize':''}`}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h4 className="font-bold text-gray-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map(t=>(
                    <Link key={t} href={`/search?q=${t}`} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full transition capitalize">{t}</Link>
                  ))}
                </div>
              </div>

              {/* Author card */}
              {seller&&(
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h4 className="font-bold text-gray-900 mb-4">About the Author</h4>
                  <Link href={`/author/${product.sellerId}`} className="flex items-center gap-3 mb-3 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                      {seller.avatar||seller.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition">{seller.shopName}</p>
                      <p className="text-xs text-gray-500">{seller.totalProducts} items • {seller.totalSales.toLocaleString()} sales</p>
                      {seller.verified&&<span className="text-[10px] text-blue-600 font-bold">✓ Verified Author</span>}
                    </div>
                  </Link>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{seller.bio}</p>
                  <div className="flex items-center gap-1 mb-4">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="font-bold text-sm">{seller.rating}</span>
                    <span className="text-gray-400 text-xs">Author rating</span>
                  </div>
                  <Link href={`/author/${product.sellerId}`} className="w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition">
                    View Profile & All Items
                  </Link>
                </div>
              )}

              {/* Demo Links card */}
              {product.demoLinks && product.demoLinks.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h4 className="font-bold text-gray-900 mb-3">🔗 Live Preview Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.demoLinks.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noreferrer"
                        className="text-sm font-semibold border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition">
                        {link.label} →
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Demo Credentials card */}
              {product.demoCredentials && product.demoCredentials.length > 0 && (
                <div className="bg-gray-900 rounded-2xl border border-gray-700 p-5">
                  <h4 className="font-bold text-white mb-1">🔐 Demo Credentials</h4>
                  <p className="text-yellow-400 text-xs font-semibold mb-4">⚠️ Demo data resets every 24 hours</p>
                  <div className="space-y-4">
                    {product.demoCredentials.map((cred, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-3 text-xs space-y-2">
                        <p className="text-blue-400 font-black text-sm">[{cred.role}]</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-400">URL:</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-gray-200 truncate max-w-[120px]">{cred.url}</span>
                            <CopyButton value={cred.url} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-400">Username:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-200">{cred.username}</span>
                            <CopyButton value={cred.username} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-400">Password:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-200 font-mono">{cred.password}</span>
                            <CopyButton value={cred.password} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files Included card */}
              {product.hostedFiles && product.hostedFiles.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h4 className="font-bold text-gray-900 mb-3">📦 Files Included</h4>
                  <div className="space-y-2 mb-3">
                    {product.hostedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-lg">{fileIcon(file.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-xs truncate">{file.name}</p>
                          <p className="text-gray-400 text-[10px]">{file.size}</p>
                        </div>
                        {hostingLabel(file.hosting)}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2 mb-3">
                    <span>Total</span>
                    <span className="font-bold text-gray-900">
                      {(() => {
                        const total = product.hostedFiles!.reduce((sum, f) => {
                          return sum + parseFloat(f.size.replace(' MB',''))
                        }, 0)
                        return `${total.toFixed(1)} MB`
                      })()}
                    </span>
                  </div>
                  {owned ? (
                    <button className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-2.5 rounded-xl text-sm transition">
                      ↓ Download All Files
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">Purchase to unlock downloads</p>
                      <button onClick={() => setOwned(true)} className="text-xs text-blue-500 hover:underline font-semibold">[Demo: Simulate Purchase]</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const badgeColors: Record<string,string> = {
  'Best Seller':'bg-orange-500','Hot':'bg-red-600','New':'bg-emerald-600','Featured':'bg-purple-600','Free':'bg-blue-600',
}
