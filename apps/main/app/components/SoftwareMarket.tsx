'use client'
import { useState } from 'react'

const softwares = [
  {
    id: 1,
    name: 'Adobe Photoshop Alternative',
    category: 'Graphics Design',
    shortDesc: 'Professional image editing, photo retouching & graphic creation tool.',
    fullDesc: 'Complete graphics design suite with layers, filters, smart tools, typography and export for web & print. Used by 10,000+ BD designers.',
    price: '৳2,999',
    oldPrice: '৳5,000',
    rating: 4.8,
    reviews: 324,
    sold: 1240,
    icon: '🎨',
    color: 'from-pink-500 to-rose-600',
    badge: 'Best Seller',
    tags: ['Graphics', 'Design', 'Editing'],
    reviewList: [
      { name: 'Rahim U.', rating: 5, comment: 'Excellent software! Works perfectly for logo and banner design.' },
      { name: 'Sara I.', rating: 5, comment: 'Very smooth, easy to use. Worth every taka!' },
      { name: 'Karim A.', rating: 4, comment: 'Great tool, good value for money.' },
    ],
  },
  {
    id: 2,
    name: 'Video Editor Pro BD',
    category: 'Graphics Design',
    shortDesc: 'Timeline-based video editor with effects, transitions and 4K export.',
    fullDesc: 'Professional video editing with multi-track timeline, motion graphics, color grading, audio mixing and social media export presets.',
    price: '৳3,499',
    oldPrice: '৳6,000',
    rating: 4.7,
    reviews: 218,
    sold: 890,
    icon: '🎬',
    color: 'from-red-700 to-red-950',
    badge: 'Popular',
    tags: ['Video', 'Editing', 'Media'],
    reviewList: [
      { name: 'Nadia H.', rating: 5, comment: 'Best video editor for the price. Loving it!' },
      { name: 'Ali K.', rating: 4, comment: 'Very good, just needed more transitions.' },
      { name: 'Mitu R.', rating: 5, comment: 'Used it for YouTube content — amazing results.' },
    ],
  },
  {
    id: 3,
    name: 'Complete E-Commerce System',
    category: 'E-Commerce',
    shortDesc: 'Multi-vendor marketplace with payment gateway, inventory & analytics.',
    fullDesc: 'Full-featured e-commerce platform: product catalog, cart, SSLCommerz/bKash payment, vendor management, order tracking and admin dashboard.',
    price: '৳12,000',
    oldPrice: '৳20,000',
    rating: 4.9,
    reviews: 156,
    sold: 340,
    icon: '🛒',
    color: 'from-orange-500 to-amber-600',
    badge: '⭐ Top Rated',
    tags: ['E-Commerce', 'Shop', 'Payment'],
    reviewList: [
      { name: 'Farhan M.', rating: 5, comment: 'Launched my shop in 2 days with this. Incredible!' },
      { name: 'Rekha B.', rating: 5, comment: 'SSLCommerz integration worked perfectly.' },
      { name: 'Tanvir H.', rating: 4, comment: 'Very complete package. Support team is responsive.' },
    ],
  },
  {
    id: 4,
    name: 'Mobile App Builder',
    category: 'Mobile App',
    shortDesc: 'Build Android & iOS apps without coding — drag and drop builder.',
    fullDesc: 'No-code mobile app builder with 100+ templates, push notifications, in-app purchases, Firebase integration and one-click APK/IPA export.',
    price: '৳8,500',
    oldPrice: '৳15,000',
    rating: 4.6,
    reviews: 94,
    sold: 210,
    icon: '📱',
    color: 'from-red-600 to-red-900',
    badge: 'New',
    tags: ['Mobile', 'Android', 'iOS'],
    reviewList: [
      { name: 'Shanto K.', rating: 5, comment: 'Made my food delivery app in 3 days. Mind-blowing!' },
      { name: 'Piash D.', rating: 4, comment: 'Templates are beautiful. Easy to customize.' },
      { name: 'Mim A.', rating: 5, comment: 'Published on Play Store within a week.' },
    ],
  },
  {
    id: 5,
    name: 'Restaurant POS System',
    category: 'Business Software',
    shortDesc: 'Table orders, kitchen display, billing & daily sales reports.',
    fullDesc: 'Complete restaurant management: table booking, waiter app, kitchen display system, inventory, employee management, and automated billing with print.',
    price: '৳8,500',
    oldPrice: '৳14,000',
    rating: 4.7,
    reviews: 210,
    sold: 580,
    icon: '🍽️',
    color: 'from-emerald-500 to-teal-600',
    badge: 'Hot Deal',
    tags: ['Restaurant', 'POS', 'Billing'],
    reviewList: [
      { name: 'Kabir H.', rating: 5, comment: 'Our restaurant runs 10x smoother now.' },
      { name: 'Mina R.', rating: 4, comment: 'Kitchen display is a game changer!' },
      { name: 'Rony C.', rating: 5, comment: 'Worth every penny. Customer service is top notch.' },
    ],
  },
  {
    id: 6,
    name: 'ISP Billing & Management',
    category: 'ISP / Network',
    shortDesc: 'Subscriber management, bandwidth control, invoicing & reports.',
    fullDesc: 'Complete ISP management platform: subscriber onboarding, package management, Mikrotik integration, automated billing, SMS alerts and real-time bandwidth monitoring.',
    price: '৳15,000',
    oldPrice: '৳25,000',
    rating: 4.9,
    reviews: 340,
    sold: 1200,
    icon: '📡',
    color: 'from-cyan-500 to-red-800',
    badge: 'Best Seller',
    tags: ['ISP', 'Network', 'Billing'],
    reviewList: [
      { name: 'Hasan M.', rating: 5, comment: 'Managing 5000 subscribers effortlessly now.' },
      { name: 'Jalal A.', rating: 5, comment: 'Best ISP software in Bangladesh, no question.' },
      { name: 'Tuhin S.', rating: 4, comment: 'Mikrotik sync is excellent.' },
    ],
  },
  {
    id: 7,
    name: 'HR & Payroll Manager',
    category: 'Business Software',
    shortDesc: 'Employee management, attendance, payroll, leave & performance.',
    fullDesc: 'Full HR suite: employee onboarding, biometric attendance, payroll calculation, leave management, appraisal system and compliance reports.',
    price: '৳12,000',
    oldPrice: '৳20,000',
    rating: 4.6,
    reviews: 78,
    sold: 190,
    icon: '👔',
    color: 'from-red-800 to-rose-800',
    badge: 'Trusted',
    tags: ['HR', 'Payroll', 'Business'],
    reviewList: [
      { name: 'Sadia K.', rating: 5, comment: 'Payroll processing went from 3 days to 30 minutes.' },
      { name: 'Rubel I.', rating: 4, comment: 'Clean UI, easy to train staff on.' },
      { name: 'Anika P.', rating: 5, comment: 'Love the leave tracker feature!' },
    ],
  },
  {
    id: 8,
    name: 'Logo & Brand Kit Maker',
    category: 'Graphics Design',
    shortDesc: 'AI-assisted logo generator with full brand identity export.',
    fullDesc: 'Generate professional logos, business cards, letterheads, social media kits and brand guidelines. Export in SVG, PNG, PDF — all editable.',
    price: '৳1,999',
    oldPrice: '৳4,000',
    rating: 4.5,
    reviews: 430,
    sold: 2100,
    icon: '✏️',
    color: 'from-fuchsia-500 to-pink-600',
    badge: 'Top Value',
    tags: ['Logo', 'Branding', 'Design'],
    reviewList: [
      { name: 'Tanha M.', rating: 5, comment: 'Made 10 logos for clients using this. Saved hours!' },
      { name: 'Sumon R.', rating: 4, comment: 'AI suggestions are really smart.' },
      { name: 'Liza B.', rating: 5, comment: 'Best value for money software I ever bought.' },
    ],
  },
  {
    id: 9,
    name: 'School Management System',
    category: 'Education',
    shortDesc: 'Students, teachers, exams, fees, results & parent portal.',
    fullDesc: 'Complete school ERP: student enrollment, class management, exam & result processing, fee collection, SMS alerts to parents and teacher attendance.',
    price: '৳18,000',
    oldPrice: '৳30,000',
    rating: 4.8,
    reviews: 112,
    sold: 280,
    icon: '🏫',
    color: 'from-teal-500 to-emerald-600',
    badge: 'Enterprise',
    tags: ['School', 'Education', 'ERP'],
    reviewList: [
      { name: 'Principal A.', rating: 5, comment: 'Transformed our school operations completely.' },
      { name: 'Nasrin T.', rating: 5, comment: 'Parents love the SMS result system.' },
      { name: 'Reza H.', rating: 4, comment: 'Very comprehensive. Setup took 1 day.' },
    ],
  },
  {
    id: 10,
    name: 'Hospital Management Pro',
    category: 'Healthcare',
    shortDesc: 'Patient records, appointments, billing, pharmacy & lab.',
    fullDesc: 'Full hospital ERP: OPD/IPD management, doctor scheduling, patient history, prescription writing, lab & pharmacy integration, billing and insurance claims.',
    price: '৳22,000',
    oldPrice: '৳40,000',
    rating: 4.8,
    reviews: 95,
    sold: 145,
    icon: '🏥',
    color: 'from-red-500 to-rose-600',
    badge: 'Premium',
    tags: ['Hospital', 'Healthcare', 'ERP'],
    reviewList: [
      { name: 'Dr. Islam', rating: 5, comment: 'Best investment our hospital ever made.' },
      { name: 'Nurse Mim', rating: 5, comment: 'Patient flow improved drastically.' },
      { name: 'Raju A.', rating: 4, comment: 'Lab integration works seamlessly.' },
    ],
  },
]

const badgeColor: Record<string, string> = {
  'Best Seller': 'bg-red-600 text-white',
  Popular: 'bg-orange-500 text-white',
  '⭐ Top Rated': 'bg-amber-500 text-white',
  New: 'bg-red-700 text-white',
  'Hot Deal': 'bg-rose-500 text-white',
  Trusted: 'bg-teal-600 text-white',
  'Top Value': 'bg-pink-600 text-white',
  Enterprise: 'bg-gray-700 text-white',
  Premium: 'bg-red-600 text-white',
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const s = size === 'md' ? 'w-4 h-4' : 'w-3 h-3'
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <svg key={n} className={`${s} ${n <= Math.floor(rating) ? 'text-amber-400' : n - rating < 1 && n - rating > 0 ? 'text-amber-300' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

type Software = typeof softwares[0]

function ReviewModal({ sw, onClose }: { sw: Software; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-br ${sw.color} p-7 text-white relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-sm transition">✕</button>
          <div className="text-5xl mb-3">{sw.icon}</div>
          <h3 className="text-xl font-black mb-1">{sw.name}</h3>
          <p className="text-white/80 text-sm">{sw.category}</p>
          <div className="flex items-center gap-2 mt-2">
            <Stars rating={sw.rating} size="md" />
            <span className="text-white font-bold text-sm">{sw.rating}</span>
            <span className="text-white/60 text-sm">({sw.reviews} reviews) · {sw.sold} sold</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-7">
          <p className="text-gray-600 text-sm leading-relaxed mb-5">{sw.fullDesc}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {sw.tags.map((t) => (
              <span key={t} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">{t}</span>
            ))}
          </div>

          {/* Reviews */}
          <h4 className="font-black text-gray-900 mb-3 text-sm">Customer Reviews</h4>
          <div className="space-y-3 mb-6">
            {sw.reviewList.map((r, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{r.name[0]}</div>
                  <span className="text-gray-800 text-xs font-bold">{r.name}</span>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-5 border-t border-gray-100">
            <div>
              <p className="text-gray-400 text-xs line-through">{sw.oldPrice}</p>
              <p className="text-3xl font-black text-gray-950">{sw.price}</p>
              <p className="text-emerald-600 text-xs font-bold">
                Save {Math.round((1 - parseInt(sw.price.replace(/[^\d]/g,'')) / parseInt(sw.oldPrice.replace(/[^\d]/g,''))) * 100)}% today
              </p>
            </div>
            <a
              href="https://shop.sigroup.com.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-red-600 to-red-900 hover:from-red-600 hover:to-red-900 text-white px-7 py-3.5 rounded-2xl font-black text-sm transition shadow-lg shadow-red-600/20 hover:-translate-y-0.5"
            >
              Buy Now →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SoftwareMarket() {
  const [selected, setSelected] = useState<Software | null>(null)

  return (
    <section id="software-market" className="py-28 bg-gray-950 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
      />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💾</span>
              <span className="text-red-400 font-bold text-xs uppercase tracking-[0.2em] bg-red-600/15 border border-red-700/30 px-4 py-2 rounded-full">
                Software Buy-Sell Marketplace
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Ready-Made Software
              <span className="block bg-gradient-to-r from-red-600 to-rose-800 bg-clip-text text-transparent">
                For Every Business
              </span>
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl leading-relaxed">
              Click any software to see full details, customer reviews and buy instantly from our marketplace.
            </p>
          </div>
          <a
            href="https://shop.sigroup.com.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 group flex items-center gap-2 bg-red-600 hover:bg-red-600 text-white px-7 py-3.5 rounded-full font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-red-600/20"
          >
            Visit Marketplace
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
        </div>

        {/* 2 rows of 5 — total 10 software */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {softwares.map((sw) => (
            <button
              key={sw.id}
              onClick={() => setSelected(sw)}
              className="group relative bg-white/5 border border-white/10 hover:border-white/30 rounded-2xl p-5 text-left hover:bg-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/30 flex flex-col overflow-hidden cursor-pointer"
            >
              {/* Badge */}
              <span className={`self-start text-xs font-bold px-2.5 py-1 rounded-full mb-4 ${badgeColor[sw.badge] || 'bg-gray-700 text-white'}`}>
                {sw.badge}
              </span>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sw.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {sw.icon}
              </div>

              <h3 className="text-white font-bold text-sm leading-snug mb-1">{sw.name}</h3>
              <p className="text-gray-500 text-xs mb-3 flex-1 leading-relaxed line-clamp-2">{sw.shortDesc}</p>

              {/* Stars + rating */}
              <div className="flex items-center gap-1.5 mb-3">
                <Stars rating={sw.rating} />
                <span className="text-gray-400 text-xs">{sw.rating} ({sw.reviews})</span>
              </div>

              {/* Price */}
              <div className="flex items-end gap-2">
                <p className="text-white font-black text-lg">{sw.price}</p>
                <p className="text-gray-600 text-xs line-through mb-0.5">{sw.oldPrice}</p>
              </div>

              {/* Category tag */}
              <p className="text-gray-600 text-xs mt-1">{sw.category}</p>

              {/* Hover: click hint */}
              <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 rounded-2xl transition-colors duration-300" />
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-red-400 text-xs font-bold">View Details →</span>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom trust strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm border-t border-white/5 pt-10">
          {['✅ Lifetime License', '🛠️ Free Installation', '📞 1-Year Support', '🔄 Free Updates', '💳 bKash & Card Payment', '🔒 Secure Checkout'].map((t) => (
            <span key={t} className="text-gray-500">{t}</span>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {selected && <ReviewModal sw={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
