'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getProductsWithSellers, categories } from '@/lib/data'
import { useCart } from '@/context/CartContext'
import { Product } from '@/lib/types'
import { getSettings, defaultSettings, SiteSettings } from '@/lib/siteSettings'

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-orange-500',
  'Hot': 'bg-red-600',
  'New': 'bg-emerald-600',
  'Featured': 'bg-purple-600',
  'Free': 'bg-blue-600',
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-xs">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  )
}

export function ItemCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 group flex flex-col">
      <div className="relative overflow-hidden bg-gray-100" style={{ paddingBottom: '56.25%' }}>
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <span className={`absolute top-2 left-2 ${badgeColors[product.badge] || 'bg-gray-700'} text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide`}>
            {product.badge}
          </span>
        )}
        {product.demoUrl && product.demoUrl !== '#' && (
          <a
            href={product.demoUrl}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
          >
            Live Preview ↗
          </a>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded capitalize">
            {product.category.replace('-', ' ')}
          </span>
          {product.seller && (
            <Link
              href={`/author/${product.sellerId}`}
              onClick={e => e.stopPropagation()}
              className="text-[10px] text-[#82b541] hover:underline truncate"
            >
              by {product.seller.shopName}
            </Link>
          )}
        </div>
        <Link href={`/item/${product.slug}`} className="block flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-[#82b541] transition line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Stars rating={product.rating} />
          <span className="text-xs text-gray-500">({product.reviews})</span>
          <span className="text-xs text-gray-400 ml-auto">{product.sales.toLocaleString()} sales</span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
          <div className="flex items-baseline gap-1.5">
            {product.price === 0
              ? <span className="text-[#82b541] font-black text-base">FREE</span>
              : <>
                  <span className="text-gray-900 font-black text-base">৳{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-gray-400 text-xs line-through">৳{product.originalPrice.toLocaleString()}</span>
                  )}
                </>
            }
          </div>
          <button
            onClick={() => addToCart(product)}
            className="bg-[#82b541] hover:bg-[#6fa033] text-white text-xs font-bold px-3 py-1.5 rounded transition active:scale-95"
          >
            {product.price === 0 ? 'Download' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, icon, href }: { title: string; icon: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      <Link href={href} className="text-[#82b541] text-sm font-semibold hover:underline flex items-center gap-1">
        View all <span>→</span>
      </Link>
    </div>
  )
}

function ItemGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.slice(0, 10).map(p => <ItemCard key={p.id} product={p} />)}
    </div>
  )
}

function FlashSalesTimer() {
  const [time, setTime] = useState({ h: 5, m: 47, s: 23 })

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) { h = 23; m = 59; s = 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-2">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="bg-white text-red-600 font-black text-xl w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">
            {v}
          </span>
          {i < 2 && <span className="text-white font-black text-xl">:</span>}
        </span>
      ))}
    </div>
  )
}

export default function ShopHome() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [cfg, setCfg] = useState<{ hp: SiteSettings['homepage']; footer: SiteSettings['footer']; design: SiteSettings['design'] }>({
    hp: defaultSettings.homepage,
    footer: defaultSettings.footer,
    design: defaultSettings.design,
  })

  useEffect(() => {
    const s = getSettings()
    setCfg({ hp: s.homepage, footer: s.footer, design: s.design })
    const handler = () => {
      const s2 = getSettings()
      setCfg({ hp: s2.homepage, footer: s2.footer, design: s2.design })
    }
    window.addEventListener('si_settings_updated', handler)
    return () => window.removeEventListener('si_settings_updated', handler)
  }, [])

  const all = getProductsWithSellers()

  const featuredItems = all.filter(p => p.badge === 'Best Seller' || p.badge === 'Featured' || p.rating >= 4.7)
  const trendingItems = all.filter(p => p.badge === 'Hot' || p.sales > 100).concat(all).slice(0, 10)
  const graphicsItems = all.filter(p => p.category === 'graphic-design')
  const softwareItems = all.filter(p => p.category === 'software')
  const websiteItems = all.filter(p => ['template', 'script', 'theme', 'javascript', 'plugin', 'ui-kit'].includes(p.category))
  const mobileAppItems = all.filter(p => p.category === 'mobile-app')
  const flashSaleItems = all.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 10)

  const filtered = all.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.tags?.some(t => t.includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const { hp, footer, design } = cfg
  const showSections = activeCategory === 'all' && !search

  return (
    <div className="min-h-screen" style={{ backgroundColor: design.bodyBg }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0d1117 0%, #161b22 60%, #1a2332 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

            {/* LEFT — Text + Search */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 bg-[#82b541]/15 border border-[#82b541]/30 text-[#82b541] text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-[#82b541] rounded-full animate-pulse" />
                Bangladesh's #1 Digital Marketplace
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
                Buy <span className="text-[#82b541]">&amp;</span> Sell Digital Products
              </h1>
              <p className="text-gray-400 text-sm mb-5 max-w-md">{hp.heroSubtitle}</p>

              <div className="flex rounded-lg overflow-hidden border border-white/10 max-w-md mb-4">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setSearch(e.currentTarget.value)}
                  placeholder="Search software, apps, templates..."
                  className="flex-1 px-4 py-2.5 bg-white/5 text-white placeholder-gray-500 focus:outline-none text-sm border-r border-white/10"
                />
                <button
                  onClick={() => search.trim() && setSearch(search)}
                  className="font-bold px-5 py-2.5 text-white text-sm hover:opacity-90"
                  style={{ backgroundColor: '#82b541' }}
                >
                  Search
                </button>
              </div>

              <div className="flex gap-6">
                {[['500+', 'Products'], ['120+', 'Sellers'], ['10K+', 'Buyers']].map(([v, l]) => (
                  <div key={l}>
                    <p className="text-base font-black" style={{ color: '#82b541' }}>{v}</p>
                    <p className="text-gray-500 text-xs">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Stacked product image collage */}
            <div className="hidden lg:block relative w-[320px] h-[220px] shrink-0">
              {/* Back image */}
              <div className="absolute top-0 right-0 w-[220px] h-[140px] rounded-xl overflow-hidden shadow-2xl border border-white/10 rotate-3">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80" alt="" className="w-full h-full object-cover brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
              </div>
              {/* Middle image */}
              <div className="absolute bottom-6 left-0 w-[190px] h-[120px] rounded-xl overflow-hidden shadow-2xl border border-white/10 -rotate-2">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" alt="" className="w-full h-full object-cover brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
                <div className="absolute bottom-2 left-2 bg-[#82b541] text-white text-[9px] font-bold px-2 py-0.5 rounded">Analytics</div>
              </div>
              {/* Front image */}
              <div className="absolute bottom-0 right-4 w-[175px] h-[110px] rounded-xl overflow-hidden shadow-2xl border border-white/20 rotate-1">
                <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80" alt="" className="w-full h-full object-cover brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
                <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">Mobile App</div>
              </div>
            </div>

          </div>
        </div>
      </section>


      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ===== FLASH SALES ===== */}
        {showSections && hp.showFlashSales && (
          <section className="mb-10">
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl overflow-hidden">
              {/* Flash Sales Header */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <h2 className="text-white font-black text-2xl leading-none">{hp.flashSalesTitle}</h2>
                      <p className="text-red-200 text-xs mt-0.5">Ends in:</p>
                    </div>
                  </div>
                  <FlashSalesTimer />
                </div>
                <Link href="/search?sort=flash-sale" className="hidden sm:flex items-center gap-1.5 bg-white text-red-600 font-black text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition">
                  View All <span>→</span>
                </Link>
              </div>
              {/* Flash Sale Items */}
              <div className="bg-[#f5f5f0] px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-4">
                  {(flashSaleItems.length >= 5 ? flashSaleItems : all).slice(0, 5).map(p => (
                    <div key={p.id} className="bg-white rounded-lg overflow-hidden border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all group flex flex-col">
                      <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {p.originalPrice && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                            -{Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col">
                        <Link href={`/item/${p.slug}`}>
                          <h3 className="font-semibold text-gray-900 text-xs leading-snug line-clamp-2 mb-1.5 group-hover:text-red-600 transition">{p.name}</h3>
                        </Link>
                        <div className="mt-auto flex items-center justify-between">
                          <div>
                            <p className="text-red-600 font-black text-sm">৳{p.price.toLocaleString()}</p>
                            {p.originalPrice && <p className="text-gray-400 text-[10px] line-through">৳{p.originalPrice.toLocaleString()}</p>}
                          </div>
                          <Stars rating={p.rating} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== WIDE BANNER (3×1080) ===== */}
        {showSections && hp.showBannerAds && (
          <section className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  bg: 'from-purple-900 to-indigo-900',
                  badge: '🔥 Top Selling',
                  title: 'Premium Software & ERP Systems',
                  sub: 'Restaurant POS, School ERP, Hospital Management & more',
                  cta: 'Browse Software',
                  href: '/category/software',
                  accent: 'bg-purple-500',
                },
                {
                  bg: 'from-[#1d2129] to-[#2d333f]',
                  badge: '📱 New Arrivals',
                  title: 'Flutter & React Native Apps',
                  sub: 'Complete source code with admin panel & payment integrations',
                  cta: 'Browse Apps',
                  href: '/category/mobile-app',
                  accent: 'bg-[#82b541]',
                },
                {
                  bg: 'from-pink-900 to-rose-900',
                  badge: '🎨 Design Pack',
                  title: 'Graphic Design Templates',
                  sub: 'Social media, logos, banners, flyers — editable Canva & AI files',
                  cta: 'Browse Designs',
                  href: '/category/graphic-design',
                  accent: 'bg-pink-500',
                },
              ].map((b, i) => (
                <div key={i} className={`bg-gradient-to-br ${b.bg} rounded-2xl p-6 flex flex-col justify-between min-h-[200px] relative overflow-hidden group cursor-pointer`}>
                  <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
                  <div className="relative">
                    <span className={`inline-block ${b.accent} text-white text-[10px] font-black px-2.5 py-1 rounded-full mb-3`}>{b.badge}</span>
                    <h3 className="text-white font-black text-lg leading-snug mb-2">{b.title}</h3>
                    <p className="text-white/60 text-xs leading-relaxed">{b.sub}</p>
                  </div>
                  <Link
                    href={b.href}
                    className="relative mt-4 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition group-hover:bg-white/25 border border-white/20"
                  >
                    {b.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== FEATURED ITEMS ===== */}
        {showSections && hp.showFeatured && (
          <section className="mb-10">
            <SectionHeader title={hp.featuredTitle} icon="⭐" href="/search?sort=featured" />
            <ItemGrid products={featuredItems} />
          </section>
        )}

        {/* ===== TRENDING ALL ITEMS ===== */}
        {showSections && hp.showTrending && (
          <section className="mb-10">
            <SectionHeader title={hp.trendingTitle} icon="🔥" href="/search?sort=trending" />
            <ItemGrid products={trendingItems} />
          </section>
        )}

        {/* ===== GRAPHICS ITEMS ===== */}
        {showSections && hp.showGraphics && (
          <section className="mb-10">
            <div className="bg-pink-50 border border-pink-100 rounded-2xl p-5">
              <SectionHeader title={hp.graphicsTitle} icon="🎨" href="/category/graphic-design" />
              {graphicsItems.length > 0
                ? <ItemGrid products={graphicsItems} />
                : <ItemGrid products={all.slice(0, 10)} />
              }
            </div>
          </section>
        )}

        {/* ===== SOFTWARE ITEMS ===== */}
        {showSections && hp.showSoftware && (
          <section className="mb-10">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <SectionHeader title={hp.softwareTitle} icon="💾" href="/category/software" />
              {softwareItems.length > 0
                ? <ItemGrid products={softwareItems} />
                : <ItemGrid products={all.slice(0, 10)} />
              }
            </div>
          </section>
        )}

        {/* ===== SECOND BANNER (mid-page) ===== */}
        {showSections && hp.showSellerCta && (
          <section className="mb-10">
            <div className="bg-gradient-to-r from-[#82b541] to-[#5a8a2a] rounded-2xl px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-white/80 text-sm font-semibold mb-1">🚀 Become a Seller</p>
                <h3 className="text-white font-black text-2xl">Sell Your Digital Products</h3>
                <p className="text-white/70 text-sm mt-1">Keep 85% of every sale. Weekly payouts via bKash & Nagad.</p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Link href="/seller/register" className="bg-white text-[#82b541] font-black px-6 py-3 rounded-xl hover:bg-gray-100 transition text-sm whitespace-nowrap">
                  Start Selling →
                </Link>
                <Link href="/seller/dashboard" className="border border-white/40 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition text-sm whitespace-nowrap">
                  My Dashboard
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ===== WEBSITE ITEMS ===== */}
        {showSections && hp.showWebsite && (
          <section className="mb-10">
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
              <SectionHeader title={hp.websiteTitle} icon="🌐" href="/category/template" />
              {websiteItems.length > 0
                ? <ItemGrid products={websiteItems} />
                : <ItemGrid products={all.slice(0, 10)} />
              }
            </div>
          </section>
        )}

        {/* ===== MOBILE APP ITEMS ===== */}
        {showSections && hp.showMobileApp && (
          <section className="mb-10">
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
              <SectionHeader title={hp.mobileAppTitle} icon="📱" href="/category/mobile-app" />
              {mobileAppItems.length > 0
                ? <ItemGrid products={mobileAppItems} />
                : <ItemGrid products={all.slice(0, 10)} />
              }
            </div>
          </section>
        )}

        {/* Filtered results */}
        {!showSections && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-gray-900">
                {search ? `Results for "${search}"` : categories.find(c => c.id === activeCategory)?.label || 'All Items'}
                <span className="text-gray-400 font-normal text-base ml-2">({filtered.length} items)</span>
              </h2>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none bg-white">
                <option>Sort: Relevance</option>
                <option>Newest</option>
                <option>Best Rated</option>
                <option>Most Sales</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-semibold text-xl text-gray-700">No items found</p>
                <button onClick={() => { setSearch(''); setActiveCategory('all') }} className="mt-4 text-[#82b541] font-semibold hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(p => <ItemCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        )}

        {/* Stats bar */}
        {showSections && hp.showStats && (
          <section className="mt-4 bg-[#1d2129] rounded-xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { v: '500+', l: 'Digital Items' },
                { v: '120+', l: 'Verified Authors' },
                { v: '10,000+', l: 'Happy Buyers' },
                { v: '৳1Cr+', l: 'Total Sales' },
              ].map(s => (
                <div key={s.l}>
                  <p className="text-3xl font-black mb-1 text-[#82b541]">{s.v}</p>
                  <p className="text-gray-400 text-sm">{s.l}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#3d4451] py-10 mt-8" style={{ backgroundColor: design.headerBg }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xs">SI</span>
                </div>
                <span className="text-white font-black">{footer.companyName}</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{footer.tagline}</p>
              {footer.showSocial && (
                <div className="flex gap-2 mt-3">
                  {footer.facebook && <a href={footer.facebook} target="_blank" rel="noreferrer" className="w-7 h-7 bg-[#1877F2] rounded flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition">f</a>}
                  {footer.instagram && <a href={footer.instagram} target="_blank" rel="noreferrer" className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition">ig</a>}
                  {footer.youtube && <a href={footer.youtube} target="_blank" rel="noreferrer" className="w-7 h-7 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition">▶</a>}
                  {footer.whatsapp && <a href={footer.whatsapp} target="_blank" rel="noreferrer" className="w-7 h-7 bg-[#25D366] rounded flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition">W</a>}
                </div>
              )}
            </div>
            {[
              { title: footer.col1Title, links: footer.col1Links },
              { title: footer.col2Title, links: footer.col2Links },
              { title: footer.col3Title, links: footer.col3Links },
            ].map(col => (
              <div key={col.title}>
                <p className="text-white font-bold text-sm mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l, i) => (
                    <li key={i}><a href={l.href} className="text-gray-500 hover:text-gray-300 text-xs transition">{l.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#3d4451] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <p>{footer.copyright}</p>
            <div className="flex gap-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <a key={l} href="#" className="hover:text-gray-400 transition">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
