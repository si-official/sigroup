import Link from 'next/link'
import Navbar from '@/components/Navbar'
export default function Fail() {
  return (<><Navbar /><div className="max-w-lg mx-auto text-center py-20 px-6"><div className="text-6xl mb-4">❌</div><h1 className="text-2xl font-black text-gray-900 mb-3">Payment Failed</h1><p className="text-gray-500 mb-6">No charge was made.</p><Link href="/" className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition">Browse Courses</Link></div></>)
}
