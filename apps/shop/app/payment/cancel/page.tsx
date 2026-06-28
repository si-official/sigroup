import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function PaymentCancel() {
  return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto text-center py-20 px-6">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Payment Cancelled</h1>
        <p className="text-gray-500 mb-8">You cancelled the payment. Your cart is still saved.</p>
        <Link href="/cart" className="block w-full bg-green-700 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition">
          Return to Cart
        </Link>
      </div>
    </>
  )
}
