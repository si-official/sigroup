'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { items, removeFromCart, total } = useCart()
  const [licenses, setLicenses] = useState<Record<string, 'Regular' | 'Extended'>>({})
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState(false)

  const getLicense = (id: string) => licenses[id] || 'Regular'
  const discount = promoApplied ? Math.round(total * 0.1) : 0
  const finalTotal = total - discount
  const platformFee = 0 // shown as 0 — already included in price

  const applyPromo = () => {
    if (promo.toUpperCase() === 'SISHOP10') {
      setPromoApplied(true)
      setPromoError(false)
    } else {
      setPromoError(true)
      setPromoApplied(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">
          Shopping Cart
          {items.length > 0 && <span className="text-gray-400 font-normal text-lg ml-2">({items.length} item{items.length !== 1 ? 's' : ''})</span>}
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-20 px-4">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Browse our marketplace to find amazing digital products</p>
            <Link href="/" className="bg-[#82b541] hover:bg-[#6fa033] text-white font-bold px-8 py-3 rounded-lg transition inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map(({ product }) => (
                <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/item/${product.slug}`} className="font-semibold text-gray-900 text-sm hover:text-[#82b541] transition line-clamp-2 leading-snug">
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-gray-400 capitalize">{product.category.replace('-', ' ')}</span>
                      {product.seller && (
                        <>
                          <span className="text-gray-200">•</span>
                          <Link href={`/author/${product.sellerId}`} className="text-xs text-[#82b541] hover:underline">{product.seller.shopName}</Link>
                        </>
                      )}
                    </div>

                    {/* License toggle */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 font-medium">License:</span>
                      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                        {(['Regular', 'Extended'] as const).map(lic => (
                          <button
                            key={lic}
                            onClick={() => setLicenses(prev => ({ ...prev, [product.id]: lic }))}
                            className={`px-2.5 py-1 font-semibold transition ${getLicense(product.id) === lic ? 'bg-[#1d2129] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            {lic}
                          </button>
                        ))}
                      </div>
                      {getLicense(product.id) === 'Extended' && (
                        <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">+50% for SaaS use</span>
                      )}
                    </div>
                  </div>

                  {/* Price + remove */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <div className="text-right">
                      {product.price === 0 ? (
                        <span className="text-[#82b541] font-black text-lg">FREE</span>
                      ) : (
                        <>
                          <span className="font-black text-lg text-gray-900">
                            ৳{(getLicense(product.id) === 'Extended' ? Math.round(product.price * 1.5) : product.price).toLocaleString()}
                          </span>
                          {getLicense(product.id) === 'Extended' && (
                            <p className="text-xs text-gray-400 line-through">৳{product.price.toLocaleString()}</p>
                          )}
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Promo code */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Promo Code</p>
                <div className="flex gap-2">
                  <input
                    value={promo}
                    onChange={e => { setPromo(e.target.value.toUpperCase()); setPromoError(false) }}
                    placeholder="Enter promo code (try SISHOP10)"
                    className={`flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition ${promoError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#82b541]'} ${promoApplied ? 'border-green-300 bg-green-50' : ''}`}
                    disabled={promoApplied}
                  />
                  {promoApplied ? (
                    <button
                      onClick={() => { setPromoApplied(false); setPromo('') }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-lg text-sm transition"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={applyPromo}
                      className="bg-[#1d2129] hover:bg-black text-white font-bold px-4 py-2.5 rounded-lg text-sm transition"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {promoApplied && <p className="text-xs text-green-600 font-semibold mt-1.5">✓ Promo applied — 10% discount!</p>}
                {promoError && <p className="text-xs text-red-500 mt-1.5">Invalid promo code</p>}
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-[100px]">
                <h3 className="font-black text-gray-900 text-lg mb-4">Order Summary</h3>

                <div className="space-y-2.5 mb-4">
                  {items.map(({ product }) => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate max-w-[170px]">{product.name}</span>
                      <span className="font-medium text-gray-900 flex-shrink-0 ml-2">
                        {product.price === 0 ? 'Free' : `৳${(getLicense(product.id) === 'Extended' ? Math.round(product.price * 1.5) : product.price).toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>৳{total.toLocaleString()}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Promo (SISHOP10)</span>
                      <span>-৳{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Platform Fee</span>
                    <span className="text-[#82b541] font-medium">Included</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>VAT</span>
                    <span>৳0</span>
                  </div>
                  <div className="flex justify-between font-black text-gray-900 text-lg border-t border-gray-100 pt-2">
                    <span>Total</span>
                    <span>৳{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-center bg-[#82b541] hover:bg-[#6fa033] text-white font-black py-4 rounded-lg mt-5 transition text-base"
                >
                  Proceed to Checkout →
                </Link>

                <Link href="/" className="block w-full text-center text-gray-400 hover:text-gray-600 text-sm mt-3 transition">
                  ← Continue Shopping
                </Link>

                {/* Security badges */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                    <span>🔒 Secure checkout</span>
                    <span>•</span>
                    <span>📥 Instant download</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
