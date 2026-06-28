const subdomains = [
  { label: 'SI Shop', href: 'https://shop.sigroup.com.bd', desc: 'E-commerce platform', emoji: '🛍️' },
  { label: 'SI School', href: 'https://school.sigroup.com.bd', desc: 'Education portal', emoji: '🎓' },
  { label: 'SI Portal', href: 'https://portal.sigroup.com.bd', desc: 'Client & employee portal', emoji: '🔐' },
  { label: 'SI ISP', href: 'https://isp.sigroup.com.bd', desc: 'Internet services', emoji: '📡' },
]

const quickLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Services', href: '#services' },
  { label: 'Partnership', href: '#partnership' },
  { label: 'Careers', href: '#' },
  { label: 'News', href: '#' },
  { label: 'Contact', href: '#' },
]

export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">SI</span>
              </div>
              <div>
                <p className="font-bold text-lg">SI Group</p>
                <p className="text-xs text-gray-400">sigroup.com.bd</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Bangladesh&apos;s leading technology conglomerate, delivering innovative solutions across industries worldwide.
            </p>
            <div className="flex gap-3">
              {['f', 'in', 'tw', 'yt'].map((s) => (
                <div key={s} className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition">
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-gray-400 hover:text-white text-sm transition">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Platforms */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Our Platforms</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subdomains.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{s.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-white">{s.label}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact row */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-wrap gap-8 text-sm text-gray-400">
            <span>📍 Dhaka, Bangladesh</span>
            <span>📞 +880-XXX-XXXXXXX</span>
            <span>✉️ info@sigroup.com.bd</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SI Group. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
