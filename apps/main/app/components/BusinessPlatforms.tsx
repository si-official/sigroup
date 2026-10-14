const platforms = [
  {
    id: 1,
    icon: '🛒',
    name: 'SI Mart',
    tagline: 'Online E-Commerce',
    desc: 'Bangladesh\'s trusted online shopping platform. Fast delivery across all 64 districts in 24–48 hours.',
    link: 'https://www.simart.com.bd',
    color: 'from-orange-600 to-red-700',
    glow: 'shadow-orange-700/30',
    border: 'border-orange-800/40',
    hover: 'hover:border-orange-600/60',
  },
  {
    id: 2,
    icon: '🌐',
    name: 'WC EDGE',
    tagline: 'Internet Service Provider',
    desc: 'High-speed internet & technology solutions across Bangladesh. Products, services, connectivity.',
    link: 'https://wcedge.com.bd',
    color: 'from-red-700 to-rose-800',
    glow: 'shadow-red-700/30',
    border: 'border-red-800/40',
    hover: 'hover:border-red-600/60',
  },
  {
    id: 3,
    icon: '🎓',
    name: 'SI School',
    tagline: 'Online Learning Platform',
    desc: 'Professional dev courses, design classes & academic education in Bangla & English with certificate.',
    link: 'https://school.sigroup.com.bd',
    color: 'from-rose-700 to-pink-800',
    glow: 'shadow-rose-700/30',
    border: 'border-rose-800/40',
    hover: 'hover:border-rose-600/60',
  },
  {
    id: 4,
    icon: '📷',
    name: 'SI Technology',
    tagline: 'CCTV & Security',
    desc: 'Complete CCTV, IP surveillance, access control & security products. Supply, install and maintain.',
    link: 'https://sitechnology.com.bd',
    color: 'from-gray-700 to-gray-900',
    glow: 'shadow-gray-700/30',
    border: 'border-gray-700/40',
    hover: 'hover:border-gray-500/60',
  },
  {
    id: 5,
    icon: '💾',
    name: 'SI Software & Design',
    tagline: 'Digital Marketplace',
    desc: 'Buy & sell all types of software, graphic designs, templates, logos and digital assets.',
    link: 'https://shop.sigroup.com.bd',
    color: 'from-red-800 to-black',
    glow: 'shadow-red-900/30',
    border: 'border-red-900/40',
    hover: 'hover:border-red-700/60',
  },
]

export default function BusinessPlatforms() {
  return (
    <section id="platforms" className="py-24 bg-black relative overflow-hidden">
      {/* Dot grid bg */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '36px 36px' }}
      />
      {/* Red glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-24 bg-red-700/20 blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-700/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-red-400 font-bold text-xs uppercase tracking-[0.25em] bg-red-500/10 border border-red-700/30 px-5 py-2 rounded-full mb-5">
            Our Business Platforms
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            One Group.
            <span className="block bg-gradient-to-r from-red-400 via-rose-300 to-white bg-clip-text text-transparent">
              Five Powerful Platforms.
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            SI Group operates five specialized platforms — all under one trusted brand since 2009.
          </p>
        </div>

        {/* ALL PLATFORMS IN ONE HORIZONTAL ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {platforms.map((p) => (
            <div
              key={p.id}
              className={`group relative bg-white/3 border ${p.border} ${p.hover} rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${p.glow} overflow-hidden`}
            >
              {/* Top gradient strip */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.color} opacity-70 group-hover:opacity-100 transition-opacity`} />

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-3xl shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {p.icon}
              </div>

              {/* Name */}
              <h3 className="text-white font-black text-base leading-tight mb-1">{p.name}</h3>
              <p className="text-red-400 text-xs font-semibold mb-3 tracking-wide">{p.tagline}</p>

              {/* Desc */}
              <p className="text-white/50 text-xs leading-relaxed mb-6 flex-1">{p.desc}</p>

              {/* Visit Now button */}
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full bg-gradient-to-r ${p.color} hover:opacity-90 text-white text-sm font-bold py-3 px-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg`}
              >
                Visit Now →
              </a>

              {/* Hover glow overlay */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${p.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 pt-10 border-t border-white/5">
          {['✅ Trusted Since 2009', '🌍 12+ Countries', '💼 200+ Team', '🔒 Secure Platforms'].map((t) => (
            <span key={t} className="text-white/30 text-xs">{t}</span>
          ))}
        </div>

      </div>
    </section>
  )
}
