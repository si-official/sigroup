const stats = [
  { value: '15+', label: 'Years Experience' },
  { value: '500+', label: 'Projects Delivered' },
  { value: '12', label: 'Countries' },
  { value: '200+', label: 'Team Members' },
]

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-800/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-32 pt-40">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-700/50 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-blue-200 text-sm font-medium">Bangladesh&apos;s Trusted Business Conglomerate</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Building Tomorrow&apos;s
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              Digital Future
            </span>
          </h1>

          <p className="text-blue-200 text-xl md:text-2xl leading-relaxed mb-10 max-w-2xl">
            SI Group delivers world-class technology, education, and business solutions across Bangladesh and beyond.
          </p>

          <div className="flex flex-wrap gap-4 mb-20">
            <a href="#services" className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition shadow-xl">
              Our Services
            </a>
            <a href="https://portal.sigroup.com.bd" className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition">
              Client Portal →
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-4xl font-black text-white mb-1">{s.value}</p>
                <p className="text-blue-300 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
