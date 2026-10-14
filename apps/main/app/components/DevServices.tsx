const packages = [
  {
    id: 1,
    name: 'Starter Website',
    desc: 'Professional 5-page business website with contact form, mobile responsive, and SEO optimised.',
    price: '৳15,000',
    delivery: '7 days',
    features: ['5 Pages', 'Mobile Responsive', 'Contact Form', 'Basic SEO', '1 Revision', '1 Month Support'],
    icon: '🌐',
    color: 'from-red-600 to-red-800',
    popular: false,
  },
  {
    id: 2,
    name: 'Business Web App',
    desc: 'Custom web application with admin panel, user auth, database, API and full deployment.',
    price: '৳45,000',
    delivery: '21 days',
    features: ['Custom Design', 'Admin Dashboard', 'User Auth', 'REST API', 'Database', '3 Months Support'],
    icon: '💼',
    color: 'from-red-800 to-red-900',
    popular: true,
  },
  {
    id: 3,
    name: 'Mobile App (iOS + Android)',
    desc: 'Cross-platform React Native app for both iOS and Android with backend integration.',
    price: '৳65,000',
    delivery: '30 days',
    features: ['React Native', 'iOS + Android', 'Push Notifications', 'API Backend', 'App Store Submit', '3 Months Support'],
    icon: '📱',
    color: 'from-red-700 to-red-950',
    popular: false,
  },
  {
    id: 4,
    name: 'Enterprise System',
    desc: 'Full enterprise ERP, CRM or custom platform built to your specifications. Scalable architecture.',
    price: 'Custom',
    delivery: '60+ days',
    features: ['Full Custom Build', 'Multi-User Roles', 'Advanced Analytics', 'Cloud Hosting', 'CI/CD Pipeline', 'Dedicated Support'],
    icon: '🏗️',
    color: 'from-emerald-500 to-teal-700',
    popular: false,
  },
]

export default function DevServices() {
  return (
    <section id="dev-services" className="py-28 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/50 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">⚙️</span>
              <span className="text-gray-800 font-bold text-xs uppercase tracking-[0.2em] bg-gray-200 px-4 py-2 rounded-full">Software Development</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-950 leading-tight">
              We Build Your
              <span className="block bg-gradient-to-r from-gray-800 to-red-800 bg-clip-text text-transparent">
                Vision Into Reality
              </span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg leading-relaxed">
              From a simple website to a complex enterprise system — our senior developers deliver on time, every time.
            </p>
          </div>
          <a
            href="#contact"
            className="flex-shrink-0 group flex items-center gap-2 bg-gray-950 hover:bg-gray-800 text-white px-7 py-3.5 rounded-full font-bold transition-all hover:-translate-y-0.5 shadow-xl"
          >
            Get Custom Quote
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
        </div>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((p) => (
            <a
              key={p.id}
              href="#contact"
              className={`group relative bg-white border-2 ${p.popular ? 'border-red-800 shadow-xl shadow-red-600/20' : 'border-gray-100 hover:border-gray-200'} rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col`}
            >
              {/* Popular badge */}
              {p.popular && (
                <div className="absolute top-0 right-8 bg-red-700 text-white text-xs font-black px-4 py-1.5 rounded-b-xl">
                  ⭐ Most Popular
                </div>
              )}

              {/* Top row */}
              <div className="flex items-center gap-5 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-xl">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400 text-xs">⏱ Delivery:</span>
                    <span className="text-gray-700 text-xs font-bold">{p.delivery}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-6">{p.desc}</p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-8 flex-1">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Starting from</p>
                  <p className="text-3xl font-black text-gray-950">{p.price}</p>
                </div>
                <div className={`${p.popular ? 'bg-red-700 hover:bg-red-700' : 'bg-gray-900 group-hover:bg-red-600'} text-white px-6 py-3 rounded-2xl font-bold text-sm transition-colors duration-300 flex items-center gap-2`}>
                  Start Project
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </div>
              </div>

              {/* Background glow on hover */}
              <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tl ${p.color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-300`} />
            </a>
          ))}
        </div>

        {/* Process steps */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Discuss', desc: 'Tell us your requirements — free consultation', icon: '💬' },
            { step: '02', title: 'Proposal', desc: 'Receive detailed scope, timeline & quote', icon: '📋' },
            { step: '03', title: 'Build', desc: 'Our team builds with weekly progress updates', icon: '🔨' },
            { step: '04', title: 'Launch', desc: 'Deploy, train your team, and ongoing support', icon: '🚀' },
          ].map((s) => (
            <div key={s.step} className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-red-400 font-black text-xs mb-1">STEP {s.step}</p>
              <p className="font-black text-gray-900 mb-1">{s.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
