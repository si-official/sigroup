// E-commerce business — different/special layout (featured hero + 4 items)
const featured = {
  badge: 'New Arrival',
  title: 'Premium Laptop Stand Pro',
  desc: 'Ergonomic aluminum stand with cable management. Fits 10-17" laptops.',
  price: '৳3,499',
  oldPrice: '৳4,999',
  rating: 4.8,
  reviews: 320,
  image: '💻',
  tag: '30% OFF',
}

const products = [
  { id: 1, name: 'Wireless Mechanical Keyboard', price: '৳4,299', oldPrice: '৳5,500', rating: 4.7, reviews: 218, badge: 'Best Seller', image: '⌨️', category: 'Electronics' },
  { id: 2, name: 'USB-C 4-Port Hub', price: '৳1,299', oldPrice: '৳1,800', rating: 4.5, reviews: 156, badge: 'Hot Deal', image: '🔌', category: 'Accessories' },
  { id: 3, name: '4K Webcam Ultra HD', price: '৳6,800', oldPrice: '৳8,500', rating: 4.9, reviews: 94, badge: 'Premium', image: '📷', category: 'Electronics' },
  { id: 4, name: 'Noise Cancel Earbuds', price: '৳2,599', oldPrice: '৳3,200', rating: 4.6, reviews: 403, badge: 'Top Rated', image: '🎧', category: 'Audio' },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((n) => (
        <svg key={n} className={`w-3 h-3 ${n <= Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'} fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      <span className="text-gray-400 text-xs ml-1">({rating})</span>
    </div>
  )
}

export default function ShopSection() {
  return (
    <section id="shop" className="py-28 bg-gradient-to-b from-orange-50 to-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🛍️</span>
              <span className="text-orange-600 font-bold text-xs uppercase tracking-[0.2em] bg-orange-100 px-4 py-2 rounded-full">SI Shop</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-950 leading-tight">
              Bangladesh&apos;s Best<br />
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Online Store</span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg">Top-quality tech products, gadgets and accessories — delivered anywhere in Bangladesh in 24–48 hours.</p>
          </div>
          <a
            href="https://shop.sigroup.com.bd"
            className="flex-shrink-0 group flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-full font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-500/30"
          >
            Visit SI Shop
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
        </div>

        {/* Layout: Featured hero + 2×2 grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Featured product — large card */}
          <a
            href="https://shop.sigroup.com.bd"
            className="lg:col-span-2 group relative bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl p-8 text-white overflow-hidden hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[360px]"
          >
            <div>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">{featured.badge}</span>
              <div className="text-8xl mt-6 mb-4 text-center animate-float">{featured.image}</div>
            </div>
            <div>
              <p className="font-black text-xl mb-2">{featured.title}</p>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">{featured.desc}</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black">{featured.price}</span>
                <span className="text-white/50 line-through text-sm">{featured.oldPrice}</span>
                <span className="ml-auto bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">{featured.tag}</span>
              </div>
              <div className="mt-4 bg-white text-orange-600 font-bold text-sm py-3 rounded-2xl text-center group-hover:bg-orange-50 transition">
                Shop Now →
              </div>
            </div>
            {/* Decorative circle */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
          </a>

          {/* 2×2 product grid */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-4">
            {products.map((p) => (
              <a
                key={p.id}
                href="https://shop.sigroup.com.bd"
                className="group bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-xl hover:shadow-gray-200/80 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">{p.badge}</span>
                  <span className="text-gray-300 text-xs">{p.category}</span>
                </div>

                {/* Emoji icon */}
                <div className="text-5xl text-center my-4 group-hover:scale-110 transition-transform">{p.image}</div>

                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2">{p.name}</h3>
                <Stars rating={p.rating} />
                <p className="text-gray-400 text-xs mt-1 mb-4">({p.reviews} reviews)</p>

                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <p className="font-black text-gray-900 text-lg">{p.price}</p>
                    <p className="text-gray-400 text-xs line-through">{p.oldPrice}</p>
                  </div>
                  <div className="w-9 h-9 bg-orange-500 group-hover:bg-orange-600 rounded-xl flex items-center justify-center text-white transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
