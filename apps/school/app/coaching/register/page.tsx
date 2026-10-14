'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const steps = ['প্রতিষ্ঠানের তথ্য', 'প্রতিষ্ঠান সম্পর্কে', 'শিক্ষক যুক্ত করুন', 'পেমেন্ট সেটআপ']
const subjects = ['SSC/HSC', 'University', 'Programming', 'Design', 'Language', 'Professional', 'BCS', 'Medical']

export default function CoachingRegisterPage() {
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)

  // Step 1
  const [brandName, setBrandName] = useState('')
  const [type, setType] = useState('Coaching')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2
  const [description, setDescription] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [foundedYear, setFoundedYear] = useState('2020')
  const [website, setWebsite] = useState('')

  // Step 3
  const [inviteEmails, setInviteEmails] = useState([''])

  // Step 4
  const [payMethod, setPayMethod] = useState<'bkash' | 'nagad' | 'bank' | 'rocket'>('bank')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-[#1a1a2e] mb-3">আবেদন গ্রহণ করা হয়েছে!</h2>
            <p className="text-gray-500 mb-6">২৪ ঘণ্টার মধ্যে যাচাই করা হবে এবং আপনাকে ইমেইলে জানানো হবে।</p>
            <a href="/" className="inline-block bg-[#1CAB87] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#17976d] transition">হোমে যান</a>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">কোচিং সেন্টার নিবন্ধন</h1>
            <p className="text-gray-500">আপনার প্রতিষ্ঠান অনলাইনে নিয়ে আসুন</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8 gap-0">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    i + 1 < step ? 'bg-[#1CAB87] text-white' : i + 1 === step ? 'bg-[#1a1a2e] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 hidden md:block text-center w-20">{s}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-12 md:w-16 h-0.5 mx-1 ${i + 1 < step ? 'bg-[#1CAB87]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-black text-[#1a1a2e] mb-5">ধাপ {step}: {steps[step-1]}</h2>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">প্রতিষ্ঠানের নাম (Brand Name)</label>
                  <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="যেমন: উদয়ন একাডেমি" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">প্রতিষ্ঠানের ধরন</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition">
                    <option>School</option><option>Coaching</option><option>Academy</option><option>Institute</option>
                  </select>
                </div>
                {[
                  { label: 'ঠিকানা', value: address, setter: setAddress, type: 'text', placeholder: 'ধানমন্ডি, ঢাকা' },
                  { label: 'ফোন নম্বর', value: phone, setter: setPhone, type: 'tel', placeholder: '01XXXXXXXXX' },
                  { label: 'ইমেইল', value: email, setter: setEmail, type: 'email', placeholder: 'info@academy.com' },
                  { label: 'পাসওয়ার্ড', value: password, setter: setPassword, type: 'password', placeholder: 'শক্তিশালী পাসওয়ার্ড' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                    <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">বিবরণ</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="আপনার প্রতিষ্ঠান সম্পর্কে বিস্তারিত লিখুন..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">বিষয়সমূহ</label>
                  <div className="grid grid-cols-2 gap-2">
                    {subjects.map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition">
                        <input type="checkbox" checked={selectedSubjects.includes(s)} onChange={() => toggleSubject(s)} className="accent-[#1CAB87]" />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">প্রতিষ্ঠার বছর</label>
                  <select value={foundedYear} onChange={e => setFoundedYear(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition">
                    {Array.from({length: 46}, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">লোগো আপলোড</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm cursor-pointer hover:border-[#1CAB87] transition">🖼️ লোগো আপলোড করুন</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">ওয়েবসাইট URL (ঐচ্ছিক)</label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://youracademy.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                  📧 শিক্ষকদের ইমেইলে আমন্ত্রণ পাঠানো হবে। তারা লিংকে ক্লিক করে যোগ দিতে পারবেন।
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">শিক্ষকদের ইমেইল</label>
                  <div className="space-y-2">
                    {inviteEmails.map((email, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={e => {
                            const next = [...inviteEmails]
                            next[i] = e.target.value
                            setInviteEmails(next)
                          }}
                          placeholder="instructor@email.com"
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition"
                        />
                        {i > 0 && (
                          <button onClick={() => setInviteEmails(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 font-bold px-2">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setInviteEmails(prev => [...prev, ''])} className="mt-2 text-sm text-[#1CAB87] hover:underline">+ আরও ইমেইল যোগ করুন</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">উত্তোলন পদ্ধতি</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['bkash', 'nagad', 'bank', 'rocket'] as const).map(m => (
                      <label key={m} className={`flex items-center gap-2 cursor-pointer border rounded-xl px-4 py-3 transition ${payMethod === m ? 'border-[#1CAB87] bg-[#1CAB87]/5' : 'border-gray-200'}`}>
                        <input type="radio" checked={payMethod === m} onChange={() => setPayMethod(m)} className="accent-[#1CAB87]" />
                        <span className="text-sm font-semibold">{m === 'bkash' ? 'বিকাশ' : m === 'nagad' ? 'নগদ' : m === 'bank' ? 'ব্যাংক' : 'রকেট'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">একাউন্ট নম্বর</label>
                  <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="একাউন্ট নম্বর" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">একাউন্ট নাম</label>
                  <input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="প্রতিষ্ঠানের নাম অনুযায়ী" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 1 && <button onClick={() => setStep(s => s - 1)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition">← পিছনে</button>}
              {step < 4 ? (
                <button onClick={() => setStep(s => s + 1)} className="flex-1 bg-[#1CAB87] text-white font-bold py-3 rounded-xl hover:bg-[#17976d] transition">পরবর্তী →</button>
              ) : (
                <button onClick={() => setSuccess(true)} className="flex-1 bg-[#1CAB87] text-white font-bold py-3 rounded-xl hover:bg-[#17976d] transition">জমা দিন</button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
