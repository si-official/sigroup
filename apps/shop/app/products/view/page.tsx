'use client'
import { useState, Suspense } from 'react'
import { notFound } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getProductBySlug } from '@/lib/products'
import { useCart } from '@/context/CartContext'

function ProductContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') ?? ''
  const product = getProductBySlug(slug)
  const { addToCart, items } = useCart()
  const [previewOpen, setPreviewOpen] = useState(false)

  if (!product) notFound()

  const inCart = items.some((i) => i.product.id === product.id)

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Link href="/" className="text-green-700 text-sm font-medium mb-6 inline-block hover:underline">← Back to Products</Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left — Image & Preview */}
          <div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl h-72 flex items-center justify-center mb-4 relative overflow-hidden">
              <span className="text-8xl">💾</span>
              {product.badge && (
                <span className="absolute top-4 left-4 bg-green-600 text-white text-sm px-3 py-1 rounded-full font-bold">
                  {product.badge}
                </span>
              )}
            </div>
            <button
              onClick={() => setPreviewOpen(true)}
              className="w-full border-2 border-green-700 text-green-700 py-3 rounded-2xl font-semibold hover:bg-green-50 transition"
            >
              👁 Preview Screenshots
            </button>

            <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">What&apos;s Included</h3>
              <ul className="space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-gray-600 text-sm">
                    <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — Info & Buy */}
          <div>
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">{product.category}</span>
            <h1 className="text-3xl font-black text-gray-900 mt-3 mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400">{'★'.repeat(Math.round(product.rating))}</span>
              <span className="text-gray-500 text-sm">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.longDescription}</p>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-black text-gray-900">৳{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-gray-400 line-through text-xl">৳{product.originalPrice.toLocaleString()}</span>
                )}
                {product.originalPrice && (
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">
                    Save ৳{(product.originalPrice - product.price).toLocaleString()}
                  </span>
                )}
              </div>

              <button
                onClick={() => addToCart(product)}
                disabled={inCart}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition mb-3 ${
                  inCart ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-700 text-white hover:bg-green-600'
                }`}
              >
                {inCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
              </button>

              {inCart && (
                <Link href="/cart" className="block w-full text-center py-3 border-2 border-green-700 text-green-700 rounded-2xl font-bold hover:bg-green-50 transition">
                  Go to Cart &amp; Checkout →
                </Link>
              )}
            </div>

            <div className="flex gap-3 text-sm text-gray-500">
              <span>🔒 Secure Payment</span>
              <span>•</span>
              <span>⚡ Instant Download</span>
              <span>•</span>
              <span>📧 Email Delivery</span>
            </div>
          </div>
        </div>
      </main>

      {previewOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setPreviewOpen(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Preview: {product.name}</h3>
              <button onClick={() => setPreviewOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-48 flex items-center justify-center text-gray-400">
                  Screenshot {i} — {product.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ProductContent />
    </Suspense>
  )
}
