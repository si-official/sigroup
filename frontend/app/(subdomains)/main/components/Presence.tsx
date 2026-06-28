const countries = [
  { flag: '🇧🇩', name: 'Bangladesh', role: 'Headquarters', color: 'bg-green-50 border-green-200' },
  { flag: '🇺🇸', name: 'United States', role: 'North America Office', color: 'bg-blue-50 border-blue-200' },
  { flag: '🇬🇧', name: 'United Kingdom', role: 'Europe Office', color: 'bg-red-50 border-red-200' },
  { flag: '🇦🇪', name: 'UAE', role: 'Middle East Office', color: 'bg-yellow-50 border-yellow-200' },
  { flag: '🇸🇬', name: 'Singapore', role: 'Asia Pacific Office', color: 'bg-purple-50 border-purple-200' },
  { flag: '🇨🇦', name: 'Canada', role: 'Partner Office', color: 'bg-orange-50 border-orange-200' },
  { flag: '🇦🇺', name: 'Australia', role: 'Partner Office', color: 'bg-cyan-50 border-cyan-200' },
  { flag: '🇩🇪', name: 'Germany', role: 'Tech Hub', color: 'bg-gray-50 border-gray-200' },
  { flag: '🇮🇳', name: 'India', role: 'Development Center', color: 'bg-orange-50 border-orange-200' },
  { flag: '🇯🇵', name: 'Japan', role: 'Partner Office', color: 'bg-red-50 border-red-200' },
  { flag: '🇲🇾', name: 'Malaysia', role: 'ASEAN Office', color: 'bg-blue-50 border-blue-200' },
  { flag: '🇸🇦', name: 'Saudi Arabia', role: 'Gulf Office', color: 'bg-green-50 border-green-200' },
]

export default function Presence() {
  return (
    <section id="presence" className="py-24 bg-gradient-to-br from-blue-950 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-blue-300 font-semibold text-sm uppercase tracking-widest">Global Reach</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            Our Worldwide Presence
          </h2>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            SI Group operates across 12+ countries, bringing world-class solutions to every corner of the globe.
          </p>
        </div>

        {/* World Map placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12 text-center backdrop-blur-sm">
          <div className="text-8xl mb-4">🌍</div>
          <p className="text-blue-200 text-lg">Serving clients across 5 continents</p>
          <div className="flex justify-center gap-8 mt-6 flex-wrap">
            {['Asia', 'Europe', 'North America', 'Middle East', 'Australia'].map((c) => (
              <span key={c} className="bg-blue-800/50 text-blue-200 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-700/50">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Country cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {countries.map((c) => (
            <div key={c.name} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition backdrop-blur-sm group">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{c.flag}</div>
              <p className="text-white font-semibold text-sm">{c.name}</p>
              <p className="text-blue-300 text-xs mt-1">{c.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
