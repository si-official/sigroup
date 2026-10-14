import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1a1a2e' }} className="text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 — Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#1CAB87] flex items-center justify-center">
                <span className="text-white font-black text-sm">SI</span>
              </div>
              <span className="font-black text-white text-xl">School</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্ম। বাংলায় শিখুন, দক্ষতা বাড়ান, ক্যারিয়ার গড়ুন।
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1CAB87] transition text-xs font-bold">
                f
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1CAB87] transition text-xs font-bold">
                ▶
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1CAB87] transition text-xs">
                IG
              </a>
            </div>
          </div>

          {/* Col 2 — লিংক */}
          <div>
            <h4 className="text-white font-bold mb-4">লিংক</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Courses', href: '/courses' },
                { label: 'Instructors', href: '/instructors' },
                { label: 'Coaching Centers', href: '/coaching' },
                { label: 'Blog', href: '/blog' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#1CAB87] transition">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — সহায়তা */}
          <div>
            <h4 className="text-white font-bold mb-4">সহায়তা</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Help Center', href: '/help' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Refund Policy', href: '/refund' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#1CAB87] transition">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — যোগাযোগ */}
          <div>
            <h4 className="text-white font-bold mb-4">যোগাযোগ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2"><span>📍</span><span>ঢাকা, বাংলাদেশ</span></li>
              <li className="flex gap-2"><span>📞</span><span>01700-000000</span></li>
              <li className="flex gap-2"><span>✉️</span><span>support@sischool.com.bd</span></li>
            </ul>
            <div className="mt-5 space-y-2">
              <a href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition rounded-xl px-3 py-2">
                <span className="text-lg">🍎</span>
                <div>
                  <div className="text-[10px] text-gray-400">Download on the</div>
                  <div className="text-xs font-bold text-white">App Store</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition rounded-xl px-3 py-2">
                <span className="text-lg">▶️</span>
                <div>
                  <div className="text-[10px] text-gray-400">Get it on</div>
                  <div className="text-xs font-bold text-white">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>© 2025 SI School. All rights reserved.</p>
          <p>Made with ❤️ in Bangladesh 🇧🇩</p>
        </div>
      </div>
    </footer>
  )
}
