const stats = [
  { value: '15+', label: 'Years Experience', icon: '🏆' },
  { value: '500+', label: 'Projects Delivered', icon: '🚀' },
  { value: '12+', label: 'Countries', icon: '🌍' },
  { value: '200+', label: 'Team Members', icon: '👥' },
]

const techBadges = ['Next.js', 'Laravel', 'React Native', 'AI/ML', 'Flutter', 'Node.js', 'MySQL', 'AWS']

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden gradient-animated">
      {/* Background photo */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
      </div>
      {/* Mesh grid */}
      <div className="absolute inset-0 opacity-[0.06] z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />
      {/* Red glows */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-red-700/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-red-900/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-800/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Rotating rings */}
      <div className="absolute right-10 top-24 w-72 h-72 border border-red-900/30 rounded-full animate-spin-slow hidden lg:block" />
      <div className="absolute right-24 top-36 w-48 h-48 border border-red-700/20 rounded-full animate-spin-slow hidden lg:block" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />

      <div className="relative max-w-7xl mx-auto px-6 py-32 pt-44 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-3 bg-red-950/60 backdrop-blur-sm border border-red-800/50 rounded-full px-5 py-2.5 mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-white/90 text-sm font-semibold tracking-wide">Bangladesh&apos;s #1 Tech Conglomerate</span>
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Building
              <span className="block shimmer-text">Tomorrow&apos;s</span>
              Digital Future
            </h1>

            <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              From Dhaka to Dubai — SI Group powers businesses with world-class web, mobile, education, and e-commerce solutions across 12+ countries.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <a href="#services"
                className="group relative bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-300 hover:-translate-y-0.5 shadow-xl shadow-red-600/30"
              >
                Explore Services
              </a>
              <a href="#contact"
                className="group flex items-center gap-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white/10 hover:border-white/30 transition-all duration-300"
              >
                Get Free Quote
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              {techBadges.map((t) => (
                <span key={t} className="bg-white/5 border border-white/10 text-white/60 text-xs font-medium px-3 py-1.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-red-950/40 hover:border-red-800/50 transition-all duration-300 hover:-translate-y-1 cursor-default"
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <p className="text-5xl font-black text-white mb-2 leading-none">{s.value}</p>
                <p className="text-white/50 text-sm font-medium">{s.label}</p>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-600/0 to-red-900/0 group-hover:from-red-600/5 group-hover:to-red-900/10 transition-all duration-300" />
              </div>
            ))}

            {/* Portal CTA card */}
            <div className="col-span-2 bg-red-900/40 border border-red-800/50 backdrop-blur-sm rounded-3xl p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-bold text-lg">Client Portal</p>
                <p className="text-red-200/70 text-sm">Track projects, invoices & support</p>
              </div>
              <a href="https://portal.sigroup.com.bd"
                className="flex-shrink-0 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full font-bold text-sm transition shadow-lg"
              >
                Login →
              </a>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-wrap items-center gap-6">
          <span className="font-semibold text-white/50 text-sm">Trusted by businesses in:</span>
          {['🇧🇩 Bangladesh', '🇦🇪 UAE', '🇬🇧 UK', '🇺🇸 USA', '🇸🇬 Singapore', '🇦🇺 Australia'].map((c) => (
            <span key={c} className="text-white/40 text-sm">{c}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
