const hq = {
  flag: '🇧🇩',
  name: 'Bangladesh',
  type: 'Headquarters',
  branches: [
    { branch: 'Chattogram Branch', address: 'Bohoderhat Deginto Tower, Chattogram, Bangladesh' },
    { branch: 'Lohagara Branch', address: 'Haji Sulaiman Tower, 2nd Floor, Padua, Lohagara, Chittagong, Bangladesh' },
  ],
  phone: '09649444447-8 | 01973563201-4',
  email: 'info@sigroup.com.bd | sioffice2021@gmail.com',
}

const countries = [
  { flag: '🇺🇸', name: 'United States', role: 'Development Center', region: 'North America' },
  { flag: '🇮🇳', name: 'India',         role: 'Development Center', region: 'Asia' },
  { flag: '🇦🇪', name: 'Dubai, UAE',    role: 'Business Connected', region: 'Middle East' },
  { flag: '🇲🇾', name: 'Malaysia',      role: 'Business Connected', region: 'Asia' },
  { flag: '🇸🇦', name: 'Saudi Arabia',  role: 'Business Connected', region: 'Middle East' },
]

export default function Presence() {
  return (
    <section id="presence" className="py-20 md:py-28 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-800/60 to-transparent" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-red-950/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-950/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14 md:mb-20">
          <span className="inline-block text-red-400 font-bold text-xs uppercase tracking-[0.25em] bg-red-500/10 border border-red-700/30 px-5 py-2 rounded-full mb-5">
            Global Reach
          </span>
          <h2 className="text-4xl md:text-5xl xl:text-6xl font-black text-white mb-4 leading-tight">
            Our Worldwide
            <span className="block bg-gradient-to-r from-red-400 via-rose-300 to-white bg-clip-text text-transparent">
              Presence
            </span>
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-2xl mx-auto">
            SI Group operates across 5 continents — connecting businesses from Dhaka to Dubai, London to Los Angeles.
          </p>
        </div>

        {/* HQ Card */}
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-green-600/30 rounded-3xl p-6 md:p-8 mb-8 overflow-hidden shadow-2xl shadow-green-900/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-green-400 to-green-600 opacity-80 rounded-t-3xl" />
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-green-500/5 rounded-full blur-3xl" />

          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-shrink-0 lg:w-72">
              <div className="flex items-center gap-4 mb-5">
                <span className="text-5xl md:text-6xl">{hq.flag}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-white font-black text-xl md:text-2xl">{hq.name}</h3>
                    <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">{hq.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-medium">Active — Main Office</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-lg mt-0.5">📞</span>
                  <span className="text-white/60">{hq.phone}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-lg mt-0.5">✉️</span>
                  <span className="text-white/60 break-all">{hq.email}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hq.branches.map((b) => (
                <div key={b.branch} className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-green-600/30 hover:bg-white/6 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🏢</span>
                    <p className="text-white font-bold text-sm">{b.branch}</p>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">{b.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Country cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {countries.map((c) => (
            <div
              key={c.name}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/8 rounded-2xl p-4 flex flex-col items-center text-center hover:border-red-700/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-950/30 transition-all duration-300 group"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{c.flag}</span>
              <p className="text-white font-bold text-sm leading-tight mb-1">{c.name}</p>
              <p className="text-white/40 text-[11px] mb-2">{c.region}</p>
              {c.role === 'Business Connected' ? (
                <span className="bg-red-950/60 border border-red-800/40 text-red-400 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  No Office
                </span>
              ) : (
                <span className="bg-blue-950/60 border border-blue-700/40 text-blue-400 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {c.role}
                </span>
              )}
            </div>
          ))}
        </div>


      </div>
    </section>
  )
}
