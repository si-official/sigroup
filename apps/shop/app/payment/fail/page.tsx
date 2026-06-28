import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function PaymentFail() {
  return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto text-center py-20 px-6">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Payment Failed</h1>
        <p className="text-gray-500 mb-8">Your payment could not be processed. No charge was made.</p>
        <Link href="/cart" className="block w-full bg-green-700 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition mb-4">
          Try Again
        </Link>
        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Back to Shop</Link>
      </div>
    </>
  )
}
