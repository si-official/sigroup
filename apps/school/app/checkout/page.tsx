'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { courses, getInstructor } from '@/lib/data'

type PayMethod = 'bkash' | 'nagad' | 'card' | 'bank'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('course') || ''
  const course = courses.find(c => c.slug === slug)

  const [payMethod, setPayMethod] = useState<PayMethod>('bkash')
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountError, setDiscountError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [txid, setTxid] = useState('')

  const instructor = course ? getInstructor(course.instructorId) : null
  const basePrice = course?.price || 0
  const discountAmount = discountApplied ? Math.round(basePrice * 0.2) : 0
  const total = basePrice - discountAmount

  const applyDiscount = () => {
    setDiscountError('')
    if (discountCode.toUpperCase() === 'SISCHOOL20') {
      setDiscountApplied(true)
    } else {
      setDiscountError('কোডটি সঠিক নয়')
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    setSuccess(true)
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <p className="text-xl font-bold text-gray-700 mb-3">কোর্সটি পাওয়া যায়নি</p>
          <Link href="/courses" className="text-[#1CAB87] hover:underline">সব কোর্স দেখুন</Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">ভর্তি সফল হয়েছে!</h2>
          <p className="text-gray-500 mb-6">আপনি সফলভাবে কোর্সে ভর্তি হয়েছেন।</p>
          <Link href={`/courses/${course.slug}`} className="inline-block bg-[#1CAB87] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#17976d] transition">
            কোর্সে যান →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-[#1a1a2e] mb-6">চেকআউট</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left — Payment */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
            <h2 className="font-bold text-[#1a1a2e] mb-4">পেমেন্ট পদ্ধতি বেছে নিন</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
              {([
                { key: 'bkash' as const, label: 'বিকাশ', activeClass: 'border-pink-400 bg-pink-50 text-pink-600' },
                { key: 'nagad' as const, label: 'নগদ', activeClass: 'border-orange-400 bg-orange-50 text-orange-600' },
                { key: 'card' as const, label: 'কার্ড', activeClass: 'border-blue-400 bg-blue-50 text-blue-600' },
                { key: 'bank' as const, label: 'ব্যাংক', activeClass: 'border-gray-400 bg-gray-50 text-gray-700' },
              ]).map(m => (
                <button key={m.key} onClick={() => setPayMethod(m.key)}
                  className={`border-2 rounded-xl py-3 font-bold text-sm transition ${payMethod === m.key ? m.activeClass : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                  {m.label}
                </button>
              ))}
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              {(payMethod === 'bkash' || payMethod === 'nagad') && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-700 mb-1 text-sm">{payMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} নম্বরে পাঠান:</p>
                  <p className="text-xl font-black text-[#1CAB87] mb-1">01XXXXXXXXX</p>
                  <p className="text-xs text-gray-400 mb-4">এই নম্বরে ৳{total.toLocaleString()} পাঠিয়ে TxID দিন</p>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Transaction ID (TxID)</label>
                    <input value={txid} onChange={e => setTxid(e.target.value)} required placeholder="Transaction ID লিখুন" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                  </div>
                </div>
              )}

              {payMethod === 'card' && (
                <div className="space-y-3">
                  {[
                    { label: 'কার্ডহোল্ডারের নাম', value: cardName, setter: setCardName, placeholder: 'আপনার নাম', type: 'text' },
                    { label: 'কার্ড নম্বর', value: cardNumber, setter: setCardNumber, placeholder: '1234 5678 9012 3456', type: 'text' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                      <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} required placeholder={f.placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">মেয়াদ</label>
                      <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} required placeholder="MM/YY" maxLength={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVV</label>
                      <input value={cardCvv} onChange={e => setCardCvv(e.target.value)} required placeholder="123" maxLength={4} type="password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === 'bank' && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800 mb-2">ব্যাংক ট্রান্সফার তথ্য:</p>
                  <p>ব্যাংক: Dutch Bangla Bank Ltd.</p>
                  <p>একাউন্ট নম্বর: 1234567890</p>
                  <p className="mt-2 text-[#1CAB87] font-semibold">পরিমাণ: ৳{total.toLocaleString()}</p>
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reference Number</label>
                    <input required placeholder="ট্রান্সফারের রেফারেন্স নম্বর" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-[#1CAB87] text-white font-bold py-4 rounded-xl hover:bg-[#17976d] transition disabled:opacity-60 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    প্রক্রিয়া করা হচ্ছে...
                  </>
                ) : `এখনই পেমেন্ট করুন ৳${total.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>

        {/* Right — Summary */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-20">
            <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
              <img src={course.thumbnail} alt={course.title} className="w-20 h-14 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1a1a2e] text-sm leading-snug line-clamp-2 mb-1">{course.title}</h3>
                <p className="text-xs text-gray-400">{instructor?.name || 'SI School'}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <input value={discountCode} onChange={e => { setDiscountCode(e.target.value); setDiscountError(''); if (!e.target.value) setDiscountApplied(false) }}
                  placeholder="ডিসকাউন্ট কোড (SISCHOOL20)" className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1CAB87] transition" />
                <button onClick={applyDiscount} className="bg-[#1CAB87]/10 text-[#1CAB87] font-bold px-3 py-2.5 rounded-xl text-sm hover:bg-[#1CAB87]/20 transition">প্রয়োগ</button>
              </div>
              {discountApplied && <p className="text-green-600 text-xs mt-1">✅ ২০% ছাড় প্রয়োগ হয়েছে!</p>}
              {discountError && <p className="text-red-500 text-xs mt-1">{discountError}</p>}
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">মূল মূল্য</span>
                <span className="text-gray-700">৳{basePrice.toLocaleString()}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-green-600">
                  <span>ডিসকাউন্ট (২০%)</span>
                  <span>- ৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base border-t border-gray-100 pt-2">
                <span className="text-[#1a1a2e]">মোট</span>
                <span className="text-[#1CAB87]">৳{total.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">🔒 নিরাপদ পেমেন্ট গেটওয়ে দ্বারা সুরক্ষিত</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <Suspense fallback={
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-500">লোড হচ্ছে...</p>
            </div>
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
