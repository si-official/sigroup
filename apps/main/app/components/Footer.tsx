const platforms = [
  { label: 'SI Shop', href: 'https://shop.sigroup.com.bd', desc: 'App & Software buy & sell', emoji: '🛍️', color: 'from-orange-600 to-red-700' },
  { label: 'SI Mart', href: 'https://www.simart.com.bd', desc: 'E-commerce platform', emoji: '🛒', color: 'from-red-600 to-rose-800' },
  { label: 'SI School', href: 'https://school.sigroup.com.bd', desc: 'Online course platform', emoji: '🎓', color: 'from-rose-700 to-red-900' },
  { label: 'SIG Portal', href: 'https://portal.sigroup.com.bd', desc: 'Client & employee portal', emoji: '🔐', color: 'from-gray-700 to-gray-900' },
  { label: 'WC EDGE — ISP', href: 'https://wcedge.com.bd', desc: 'Internet services', emoji: '📡', color: 'from-red-800 to-black' },
]

const quickLinks = [
  { label: 'About Us', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Partnership', href: '#partnership' },
  { label: 'Careers', href: '#' },
  { label: 'Contact', href: '#contact' },
]

const socials = [
  { label: 'FB', icon: 'f', href: '#' },
  { label: 'LinkedIn', icon: 'in', href: '#' },
  { label: 'Twitter', icon: '𝕏', href: '#' },
  { label: 'YouTube', icon: '▶', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white relative overflow-hidden">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-red-600/10 blur-3xl pointer-events-none" />

      {/* Newsletter / CTA strip */}
      <div className="relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-black text-white mb-1">Ready to start your project?</h3>
            <p className="text-gray-400 text-sm">Get a free consultation from our team within 2 hours.</p>
          </div>
          <a
            href="#contact"
            className="flex-shrink-0 bg-gradient-to-r from-red-600 to-red-900 hover:from-red-600 hover:to-red-900 text-white px-8 py-4 rounded-full font-bold transition-all hover:-translate-y-0.5 shadow-xl shadow-red-600/20 whitespace-nowrap"
          >
            Get Free Quote →
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                <span className="text-white font-black text-base">SI</span>
              </div>
              <div>
                <p className="font-black text-lg leading-none">SI Group</p>
                <p className="text-xs text-gray-500">sigroup.com.bd</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Bangladesh&apos;s leading technology conglomerate. Delivering innovative solutions across industries in 12+ countries worldwide.
            </p>
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-700 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-5 text-xs uppercase tracking-[0.15em]">Company</h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-red-600 transition-all duration-200 overflow-hidden" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platforms */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-5 text-xs uppercase tracking-[0.15em]">Our Platforms</h4>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {platforms.map((p) => (
                <a
                  key={p.label}
                  href={p.href}
                  className="group flex items-center gap-3 bg-white/4 hover:bg-white/8 border border-white/8 hover:border-white/15 rounded-2xl p-4 transition-all duration-200"
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {p.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white leading-none mb-0.5">{p.label}</p>
                    <p className="text-xs text-gray-500 leading-none">{p.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact bar */}
        <div className="border-t border-white/5 pt-8 pb-6">
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-500">
            <span className="flex items-center gap-2"><span>📍</span> Dhaka, Bangladesh · Dubai, UAE · London, UK</span>
            <span className="flex items-center gap-2"><span>📞</span> +880 1234-567890</span>
            <span className="flex items-center gap-2"><span>✉️</span> hello@sigroup.com.bd</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} SI Group Bangladesh. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
