'use client'
import { useState, useEffect } from 'react'

const OFFER_END = '2026-07-10'

const courses = [
  {
    id: 1,
    title: 'Digital Marketing Full Course',
    subtitle: 'SEO · Facebook Ads · Google Ads · Email',
    instructor: 'Karim Sir',
    instructorTitle: 'Digital Marketing Expert',
    price: 2999,
    oldPrice: 6000,
    rating: 4.8,
    reviews: 2140,
    students: 8200,
    lessons: 95,
    duration: '3 months',
    level: 'Beginner',
    icon: '📣',
    color: 'from-orange-500 to-pink-600',
    badge: 'Best Seller',
    badgeBg: 'bg-orange-500',
    offer: '50% OFF',
    offerBg: 'bg-red-500',
    tags: ['SEO', 'Facebook Ads', 'Google'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
  },
  {
    id: 2,
    title: 'Microsoft Office Full Course',
    subtitle: 'Word · Excel · PowerPoint · Outlook',
    instructor: 'Nadia Madam',
    instructorTitle: 'MS Office Trainer',
    price: 1499,
    oldPrice: 3000,
    rating: 4.7,
    reviews: 3400,
    students: 12500,
    lessons: 72,
    duration: '6 weeks',
    level: 'Beginner',
    icon: '💼',
    color: 'from-red-600 to-red-900',
    badge: 'Most Popular',
    badgeBg: 'bg-red-600',
    offer: '50% OFF',
    offerBg: 'bg-red-500',
    tags: ['Word', 'Excel', 'PowerPoint'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
  },
  {
    id: 3,
    title: 'Graphics Design Full Course',
    subtitle: 'Photoshop · Illustrator · Canva · Figma',
    instructor: 'Sara Madam',
    instructorTitle: 'Senior Designer, 10yr exp',
    price: 3499,
    oldPrice: 7000,
    rating: 4.9,
    reviews: 1870,
    students: 6800,
    lessons: 120,
    duration: '4 months',
    level: 'Beginner → Pro',
    icon: '🎨',
    color: 'from-pink-500 to-rose-600',
    badge: 'Trending',
    badgeBg: 'bg-pink-600',
    offer: 'SAVE 50%',
    offerBg: 'bg-red-500',
    tags: ['Photoshop', 'Canva', 'Figma'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
  },
  {
    id: 4,
    title: 'Full-Stack Web Development',
    subtitle: 'HTML · CSS · JavaScript · React · Laravel',
    instructor: 'Rahim Sir',
    instructorTitle: 'Lead Dev, SI Group',
    price: 4999,
    oldPrice: 10000,
    rating: 4.9,
    reviews: 3420,
    students: 9100,
    lessons: 180,
    duration: '6 months',
    level: 'Beginner → Pro',
    icon: '🌐',
    color: 'from-red-800 to-rose-800',
    badge: '⭐ Top Rated',
    badgeBg: 'bg-red-700',
    offer: '50% OFF',
    offerBg: 'bg-red-500',
    tags: ['HTML/CSS', 'React', 'Laravel'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&q=80',
  },
  {
    id: 5,
    title: 'WordPress Full Course',
    subtitle: 'Site building · WooCommerce · Elementor',
    instructor: 'Piash Sir',
    instructorTitle: 'WordPress Developer',
    price: 1999,
    oldPrice: 4000,
    rating: 4.6,
    reviews: 1240,
    students: 5400,
    lessons: 60,
    duration: '2 months',
    level: 'Beginner',
    icon: '🔵',
    color: 'from-sky-500 to-cyan-600',
    badge: 'Job Ready',
    badgeBg: 'bg-cyan-600',
    offer: '50% OFF',
    offerBg: 'bg-red-500',
    tags: ['WordPress', 'WooCommerce', 'Elementor'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&q=80',
  },
  {
    id: 6,
    title: 'Basic Coding for Beginners',
    subtitle: 'Python · Logic Building · Problem Solving',
    instructor: 'Tanha Madam',
    instructorTitle: 'Software Engineer',
    price: 1299,
    oldPrice: 2500,
    rating: 4.5,
    reviews: 980,
    students: 4200,
    lessons: 45,
    duration: '6 weeks',
    level: 'Absolute Beginner',
    icon: '💻',
    color: 'from-emerald-500 to-teal-600',
    badge: 'New',
    badgeBg: 'bg-emerald-600',
    offer: '48% OFF',
    offerBg: 'bg-red-500',
    tags: ['Python', 'Logic', 'Coding'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80',
  },
  {
    id: 7,
    title: 'Video Editing Pro Course',
    subtitle: 'Premiere Pro · After Effects · DaVinci',
    instructor: 'Arif Sir',
    instructorTitle: 'Video Production Expert',
    price: 2999,
    oldPrice: 6000,
    rating: 4.7,
    reviews: 760,
    students: 3100,
    lessons: 80,
    duration: '3 months',
    level: 'Beginner → Pro',
    icon: '🎬',
    color: 'from-red-700 to-red-950',
    badge: 'Hot',
    badgeBg: 'bg-rose-700',
    offer: '50% OFF',
    offerBg: 'bg-red-500',
    tags: ['Premiere', 'After Effects', '4K'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869ad10e2b1?w=400&q=80',
  },
  {
    id: 8,
    title: 'Mobile App Development',
    subtitle: 'React Native · Flutter · Firebase',
    instructor: 'Rakib Sir',
    instructorTitle: 'Mobile Dev Lead',
    price: 5999,
    oldPrice: 12000,
    rating: 4.8,
    reviews: 980,
    students: 2800,
    lessons: 150,
    duration: '5 months',
    level: 'Intermediate',
    icon: '📱',
    color: 'from-red-600 to-red-900',
    badge: 'Advanced',
    badgeBg: 'bg-red-700',
    offer: '50% OFF',
    offerBg: 'bg-red-500',
    tags: ['React Native', 'Flutter', 'Firebase'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
  },
  {
    id: 9,
    title: 'Freelancing Full Course',
    subtitle: 'Fiverr · Upwork · Profile · Proposal Writing',
    instructor: 'Shanto Sir',
    instructorTitle: 'Top-Rated Freelancer',
    price: 1999,
    oldPrice: 4000,
    rating: 4.9,
    reviews: 2100,
    students: 9800,
    lessons: 55,
    duration: '6 weeks',
    level: 'Beginner',
    icon: '💰',
    color: 'from-amber-500 to-orange-600',
    badge: '🔥 Viral',
    badgeBg: 'bg-amber-600',
    offer: '50% OFF',
    offerBg: 'bg-red-500',
    tags: ['Fiverr', 'Upwork', 'Freelancing'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=400&q=80',
  },
  {
    id: 10,
    title: 'UI/UX Design Mastery',
    subtitle: 'Figma · Prototyping · Design Systems · UX Research',
    instructor: 'Mim Madam',
    instructorTitle: 'Product Designer',
    price: 3499,
    oldPrice: 7000,
    rating: 4.8,
    reviews: 1870,
    students: 5200,
    lessons: 110,
    duration: '4 months',
    level: 'Beginner → Pro',
    icon: '🎭',
    color: 'from-fuchsia-500 to-pink-700',
    badge: 'Creative',
    badgeBg: 'bg-fuchsia-600',
    offer: '50% OFF',
    offerBg: 'bg-red-500',
    tags: ['Figma', 'Prototyping', 'UX'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&q=80',
  },
  {
    id: 11,
    title: 'Cybersecurity Essentials',
    subtitle: 'Ethical Hacking · Network Security · Pen Testing',
    instructor: 'Hasan Sir',
    instructorTitle: 'Certified Ethical Hacker',
    price: 4499,
    oldPrice: 9000,
    rating: 4.7,
    reviews: 540,
    students: 1900,
    lessons: 90,
    duration: '3 months',
    level: 'Intermediate',
    icon: '🔐',
    color: 'from-slate-600 to-gray-800',
    badge: 'In Demand',
    badgeBg: 'bg-slate-700',
    offer: '50% OFF',
    offerBg: 'bg-red-500',
    tags: ['Hacking', 'Security', 'Network'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
  },
  {
    id: 12,
    title: 'Data Entry & Typing Master',
    subtitle: 'Fast Typing · Excel Data Entry · 10-Key Numeric',
    instructor: 'Puja Madam',
    instructorTitle: 'Office Admin Trainer',
    price: 799,
    oldPrice: 1500,
    rating: 4.4,
    reviews: 1650,
    students: 7200,
    lessons: 30,
    duration: '3 weeks',
    level: 'Absolute Beginner',
    icon: '⌨️',
    color: 'from-teal-500 to-emerald-700',
    badge: 'Quick Start',
    badgeBg: 'bg-teal-600',
    offer: '47% OFF',
    offerBg: 'bg-red-500',
    tags: ['Typing', 'Data Entry', 'Excel'],
    certificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <svg key={n} className={`w-3 h-3 ${n <= Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

function CountdownTimer() {
  const [d, setD] = useState(0)
  const [h, setH] = useState(0)
  const [m, setM] = useState(0)
  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, new Date(OFFER_END).getTime() - Date.now())
      setD(Math.floor(diff / 86400000))
      setH(Math.floor((diff % 86400000) / 3600000))
      setM(Math.floor((diff % 3600000) / 60000))
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-center gap-2">
      {[{ v: d, l: 'Days' }, { v: h, l: 'Hrs' }, { v: m, l: 'Min' }].map((u) => (
        <div key={u.l} className="bg-red-600 text-white rounded-lg px-2.5 py-1 text-center min-w-[44px]">
          <p className="text-lg font-black leading-none">{String(u.v).padStart(2, '0')}</p>
          <p className="text-red-200 text-[10px]">{u.l}</p>
        </div>
      ))}
    </div>
  )
}

export default function SchoolSection() {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? courses : courses.slice(0, 6)

  return (
    <section id="school" className="py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/30 to-transparent" />
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-red-700 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Offer Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-5 mb-12 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl shadow-red-600/20">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-white font-black text-xl">Limited Time Offer — Up to 50% OFF All Courses!</p>
              <p className="text-red-200 text-sm">Enroll before the offer expires. Certificate included with every course.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-center text-white/70 text-xs mr-2">Offer ends in:</div>
            <CountdownTimer />
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎓</span>
              <span className="text-red-300 font-bold text-xs uppercase tracking-[0.2em] bg-red-700 border border-red-800 px-4 py-2 rounded-full">
                SI School — Online Courses
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-950 leading-tight">
              Learn Skills That
              <span className="block bg-gradient-to-r from-red-800 to-rose-800 bg-clip-text text-transparent">
                Get You Hired & Paid
              </span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl leading-relaxed">
              Expert Bangla & English courses with certificates. {courses.length} courses across design, tech, marketing & business.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <a href="https://school.sigroup.com.bd" className="flex items-center gap-2 bg-red-700 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm transition hover:-translate-y-0.5 shadow-lg shadow-red-600/30">
              Visit SI School ↗
            </a>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>📚 {courses.reduce((a, c) => a + c.lessons, 0)}+ Lessons</span>
              <span>👥 {(courses.reduce((a, c) => a + c.students, 0) / 1000).toFixed(0)}k+ Students</span>
            </div>
          </div>
        </div>

        {/* Course grid — 2 rows of 6 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {visible.map((c) => (
            <a
              key={c.id}
              href={`https://school.sigroup.com.bd/course/${c.id}`}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              {/* Thumbnail image header */}
              <div className="relative h-32 overflow-hidden flex-shrink-0">
                <img src={(c as any).thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className={`absolute inset-0 bg-gradient-to-t ${c.color} opacity-60`} />
                <span className={`absolute top-2 right-2 ${c.offerBg} text-white text-[10px] font-black px-2 py-0.5 rounded-full`}>
                  {c.offer}
                </span>
                <span className={`absolute bottom-2 left-2 ${c.badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>{c.badge}</span>
                <div className="absolute bottom-2 right-2 text-xl">{c.icon}</div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-black text-gray-900 text-sm leading-snug mb-1">{c.title}</h3>
                <p className="text-gray-400 text-xs mb-2 leading-relaxed line-clamp-2">{c.subtitle}</p>

                {/* Instructor */}
                <p className="text-gray-500 text-[11px] mb-2">by {c.instructor}</p>

                {/* Stars + reviews */}
                <div className="flex items-center gap-1 mb-2">
                  <Stars rating={c.rating} />
                  <span className="text-gray-500 text-[10px]">({(c.reviews / 1000).toFixed(1)}k)</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-3">
                  <span>📚 {c.lessons} lessons</span>
                  <span>·</span>
                  <span>⏱ {c.duration}</span>
                </div>

                {/* Certificate badge */}
                {c.certificate && (
                  <span className="self-start text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold mb-3">
                    ✅ Certificate
                  </span>
                )}

                {/* Price + Enroll */}
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <p className="text-gray-950 font-black text-lg">৳{c.price.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs line-through">৳{c.oldPrice.toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-red-700 group-hover:bg-red-700 text-white text-xs font-black py-2.5 rounded-xl text-center transition-colors duration-300">
                    Enroll Now →
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* More Courses Button */}
        {!showAll && (
          <div className="text-center mt-10">
            <div className="inline-flex flex-col items-center gap-3">
              <p className="text-gray-400 text-sm">{courses.length - 6} more courses available</p>
              <button
                onClick={() => setShowAll(true)}
                className="group flex items-center gap-3 bg-gray-950 hover:bg-red-700 text-white px-10 py-4 rounded-full font-bold text-base transition-all hover:-translate-y-0.5 shadow-xl hover:shadow-red-600/30"
              >
                <span>More Courses</span>
                <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {showAll && (
          <div className="text-center mt-10">
            <a
              href="https://school.sigroup.com.bd"
              className="inline-flex items-center gap-3 bg-red-700 hover:bg-red-700 text-white px-10 py-4 rounded-full font-bold text-base transition hover:-translate-y-0.5 shadow-lg shadow-red-600/30"
            >
              View All Courses at SI School ↗
            </a>
          </div>
        )}

        {/* Bottom stat bar */}
        <div className="mt-14 bg-gradient-to-r from-red-800 via-red-700 to-red-950 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { v: '12+', l: 'Available Courses' },
              { v: (courses.reduce((a, c) => a + c.students, 0) / 1000).toFixed(0) + 'k+', l: 'Students Enrolled' },
              { v: courses.reduce((a, c) => a + c.lessons, 0) + '+', l: 'Video Lessons' },
              { v: '92%', l: 'Job Placement Rate' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-4xl font-black">{s.v}</p>
                <p className="text-white/70 text-sm mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
