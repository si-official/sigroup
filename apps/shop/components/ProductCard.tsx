'use client'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { useCart } from '@/context/CartContext'

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, items } = useCart()
  const inCart = items.some((i) => i.product.id === product.id)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <Link href={`/products/view?slug=${product.slug}`}>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-48 flex items-center justify-center relative overflow-hidden">
          <span className="text-6xl">💾</span>
          {product.badge && (
            <span className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">
              {product.badge}
            </span>
          )}
          {product.originalPrice && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">{product.category}</span>
        <Link href={`/products/view?slug=${product.slug}`}>
          <h3 className="font-bold text-gray-900 mt-2 mb-1 hover:text-green-700 transition line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center gap-1 mb-4">
          <span className="text-yellow-400 text-sm">{'★'.repeat(Math.round(product.rating))}</span>
          <span className="text-gray-400 text-xs">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">৳{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-gray-400 text-sm line-through ml-2">৳{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            disabled={inCart}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              inCart
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-700 text-white hover:bg-green-600'
            }`}
          >
            {inCart ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
