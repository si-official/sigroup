'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const steps = ['ব্যক্তিগত তথ্য', 'বিশেষজ্ঞতা', 'কোর্স পরিকল্পনা', 'পেমেন্ট তথ্য']

export default function InstructorRegisterPage() {
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)

  // Step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [nid, setNid] = useState('')

  // Step 2
  const [expertiseTags, setExpertiseTags] = useState<string[]>([])
  const [expertiseInput, setExpertiseInput] = useState('')
  const [education, setEducation] = useState('')
  const [experience, setExperience] = useState('1')
  const [bio, setBio] = useState('')
  const [hasCoaching, setHasCoaching] = useState(false)
  const [coachingName, setCoachingName] = useState('')

  // Step 3
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [monthlyCount, setMonthlyCount] = useState('1')
  const [youtubeLink, setYoutubeLink] = useState('')

  // Step 4
  const [payMethod, setPayMethod] = useState<'bkash' | 'nagad' | 'bank' | 'rocket'>('bkash')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')

  const addTag = () => {
    if (expertiseInput.trim() && !expertiseTags.includes(expertiseInput.trim())) {
      setExpertiseTags([...expertiseTags, expertiseInput.trim()])
      setExpertiseInput('')
    }
  }

  const subjectOptions = ['SSC/HSC', 'University', 'Programming', 'Design', 'Language', 'Professional']
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
            <a href="/" className="inline-block bg-[#1CAB87] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#17976d] transition">
              হোমে যান
            </a>
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
            <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">শিক্ষক হিসেবে নিবন্ধন করুন</h1>
            <p className="text-gray-500">আপনার জ্ঞান শেয়ার করুন, আয় করুন</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8 gap-0">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex flex-col items-center`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    i + 1 < step ? 'bg-[#1CAB87] text-white' :
                    i + 1 === step ? 'bg-[#1a1a2e] text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 hidden md:block">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 md:w-20 h-0.5 mx-1 ${i + 1 < step ? 'bg-[#1CAB87]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-black text-[#1a1a2e] mb-5">ধাপ {step}: {steps[step-1]}</h2>

            {step === 1 && (
              <div className="space-y-4">
                {[
                  { label: 'পূর্ণ নাম', value: name, setter: setName, type: 'text', placeholder: 'আপনার পূর্ণ নাম' },
                  { label: 'ইমেইল', value: email, setter: setEmail, type: 'email', placeholder: 'example@email.com' },
                  { label: 'ফোন নম্বর', value: phone, setter: setPhone, type: 'tel', placeholder: '01XXXXXXXXX' },
                  { label: 'পাসওয়ার্ড', value: password, setter: setPassword, type: 'password', placeholder: 'শক্তিশালী পাসওয়ার্ড' },
                  { label: 'NID নম্বর', value: nid, setter: setNid, type: 'text', placeholder: '১৭ সংখ্যার NID' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                    <input type={field.type} value={field.value} onChange={e => field.setter(e.target.value)} placeholder={field.placeholder}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">প্রোফাইল ফটো</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm hover:border-[#1CAB87] transition cursor-pointer">
                    📷 ছবি আপলোড করুন
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">বিশেষজ্ঞতার বিষয় (ট্যাগ)</label>
                  <div className="flex gap-2 mb-2">
                    <input value={expertiseInput} onChange={e => setExpertiseInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="যেমন: গণিত, Python..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1CAB87] transition" />
                    <button type="button" onClick={addTag} className="bg-[#1CAB87] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#17976d] transition">যোগ করুন</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {expertiseTags.map(tag => (
                      <span key={tag} className="bg-[#1CAB87]/10 text-[#1CAB87] text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        {tag}
                        <button onClick={() => setExpertiseTags(expertiseTags.filter(t => t !== tag))} className="font-bold hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">শিক্ষাগত যোগ্যতা</label>
                  <input value={education} onChange={e => setEducation(e.target.value)} placeholder="যেমন: BSc in CSE, BUET" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">অভিজ্ঞতা (বছর)</label>
                  <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition">
                    {[1,2,3,4,5,6,7,8,9,10].map(y => <option key={y} value={y}>{y} বছর{y === 10 ? '+' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">জীবনী / বায়ো</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="আপনার সম্পর্কে সংক্ষিপ্ত পরিচয় লিখুন..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">কোনো কোচিং সেন্টারের সাথে যুক্ত?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={hasCoaching} onChange={() => setHasCoaching(true)} className="accent-[#1CAB87]" />
                      <span className="text-sm">হ্যাঁ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={!hasCoaching} onChange={() => setHasCoaching(false)} className="accent-[#1CAB87]" />
                      <span className="text-sm">না</span>
                    </label>
                  </div>
                  {hasCoaching && (
                    <input value={coachingName} onChange={e => setCoachingName(e.target.value)} placeholder="কোচিং সেন্টারের নাম" className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">কোন বিষয়ে কোর্স তৈরি করতে চান?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {subjectOptions.map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition">
                        <input type="checkbox" checked={selectedSubjects.includes(s)} onChange={() => toggleSubject(s)} className="accent-[#1CAB87]" />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">প্রতি মাসে কতটি কোর্স আপলোড করবেন?</label>
                  <select value={monthlyCount} onChange={e => setMonthlyCount(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition">
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}টি</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">YouTube চ্যানেল লিংক (ঐচ্ছিক)</label>
                  <input value={youtubeLink} onChange={e => setYoutubeLink(e.target.value)} placeholder="https://youtube.com/@yourchannel" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">উত্তোলন পদ্ধতি</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['bkash', 'nagad', 'bank', 'rocket'] as const).map(method => (
                      <label key={method} className={`flex items-center gap-2 cursor-pointer border rounded-xl px-4 py-3 transition ${payMethod === method ? 'border-[#1CAB87] bg-[#1CAB87]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" checked={payMethod === method} onChange={() => setPayMethod(method)} className="accent-[#1CAB87]" />
                        <span className="text-sm capitalize font-semibold">{method === 'bkash' ? 'বিকাশ' : method === 'nagad' ? 'নগদ' : method === 'bank' ? 'ব্যাংক' : 'রকেট'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">একাউন্ট নম্বর</label>
                  <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="01XXXXXXXXX" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">একাউন্ট নাম</label>
                  <input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="আপনার নাম অনুযায়ী" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
                  ← পিছনে
                </button>
              )}
              {step < 4 ? (
                <button onClick={() => setStep(s => s + 1)} className="flex-1 bg-[#1CAB87] text-white font-bold py-3 rounded-xl hover:bg-[#17976d] transition">
                  পরবর্তী →
                </button>
              ) : (
                <button onClick={() => setSuccess(true)} className="flex-1 bg-[#1CAB87] text-white font-bold py-3 rounded-xl hover:bg-[#17976d] transition">
                  জমা দিন
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
