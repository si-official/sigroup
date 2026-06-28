'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { items, removeFromCart, total } = useCart()

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
            <Link href="/" className="bg-green-700 text-white px-8 py-3 rounded-2xl font-bold hover:bg-green-600 transition">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product }) => (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">💾</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    <p className="text-gray-500 text-sm">{product.category}</p>
                    <p className="text-green-700 font-bold mt-1">৳{product.price.toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeFromCart(product.id)} className="text-red-400 hover:text-red-600 text-sm font-medium transition">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              {items.map(({ product }) => (
                <div key={product.id} className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="truncate max-w-[160px]">{product.name}</span>
                  <span>৳{product.price.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-black text-gray-900 text-lg">
                <span>Total</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
              <Link href="/checkout" className="block w-full text-center bg-green-700 text-white py-4 rounded-2xl font-bold mt-6 hover:bg-green-600 transition">
                Proceed to Checkout →
              </Link>
              <Link href="/" className="block w-full text-center text-gray-500 text-sm mt-3 hover:text-gray-700">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
