'use client'

import { useState } from 'react'

const services = [
  'Web Development',
  'Mobile App',
  'UI/UX Design',
  'Digital Marketing',
  'IT Infrastructure',
  'Partnership Program',
  'Other',
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('https://api.sigroup.com.bd/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', phone: '', service: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-5"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-transparent to-gray-950 z-0 pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-red-400 font-semibold text-sm uppercase tracking-widest">Get In Touch</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            Let's Build Something Great
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Free consultation. No commitment. Tell us about your project and we'll get back to you within 2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-2xl font-black text-white mb-6">Contact Information</h3>
              <div className="space-y-5">
                {[
                  { icon: '📍', label: 'Chattogram Branch', val: 'Bohoderhat Deginto Tower, Chattogram, Bangladesh' },
                  { icon: '📍', label: 'Lohagara Branch', val: 'Haji Sulaiman Tower, 2nd Floor, Padua, Lohagara, Chittagong' },
                  { icon: '📞', label: 'Phone', val: '09649444447-8 | 01973563201-4' },
                  { icon: '✉️', label: 'Email', val: 'info@sigroup.com.bd' },
                  { icon: '✉️', label: 'Email', val: 'sioffice2021@gmail.com' },
                  { icon: '⏰', label: 'Support Hours', val: 'Sat – Thu: 9AM – 9PM' },
                ].map((i, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5">{i.icon}</span>
                    <div>
                      <p className="text-red-400 text-xs uppercase tracking-wide font-semibold">{i.label}</p>
                      <p className="text-white font-medium">{i.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-2xl p-6 text-white">
              <p className="font-black text-xl mb-2">Partnership Program</p>
              <p className="text-red-400 text-sm leading-relaxed mb-4">
                Earn up to 25% commission by referring clients. Join 100+ partners already earning with SI Group.
              </p>
              <a href="#partnership" className="bg-white text-red-400 hover:bg-red-600 px-5 py-2.5 rounded-full font-bold text-sm transition inline-block">
                Become a Partner →
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2">Full Name *</label>
                  <input
                    type="text" name="name" required value={form.name} onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2">Email Address *</label>
                  <input
                    type="email" name="email" required value={form.email} onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2">Phone Number</label>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2">Service Needed</label>
                  <select
                    name="service" value={form.service} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-600 transition"
                  >
                    <option value="">Select a service</option>
                    {services.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold text-sm mb-2">Project Details *</label>
                <textarea
                  name="message" required rows={5} value={form.message} onChange={handleChange}
                  placeholder="Tell us about your project, timeline, and budget..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-600 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending' || status === 'sent'}
                className="w-full bg-red-600 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition shadow-lg shadow-red-600/20"
              >
                {status === 'sending' ? 'Sending...' : status === 'sent' ? '✅ Message Sent!' : 'Send Message →'}
              </button>

              {status === 'error' && (
                <p className="text-red-500 text-sm text-center">
                  Something went wrong. Please email us at hello@sigroup.com.bd
                </p>
              )}

              {status === 'sent' && (
                <p className="text-green-600 text-sm text-center font-medium">
                  Thank you! We'll get back to you within 2 hours.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
