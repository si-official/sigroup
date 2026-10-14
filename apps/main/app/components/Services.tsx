const services = [
  { icon: '🌐', title: 'Web Development', desc: 'Next.js, Laravel, full-stack web apps built for speed, scale, and conversions.', color: 'from-red-600 to-red-800', bg: 'from-red-950/30 to-red-900/10', border: 'group-hover:border-red-700/60', tag: 'Most Popular' },
  { icon: '📱', title: 'Mobile Apps', desc: 'React Native & Flutter apps for iOS and Android — performant, beautiful, fast.', color: 'from-rose-600 to-rose-800', bg: 'from-rose-950/30 to-rose-900/10', border: 'group-hover:border-rose-700/60', tag: '' },
  { icon: '💻', title: 'Custom Software', desc: 'Enterprise-grade ERP, CRM, billing systems tailored to your exact workflow.', color: 'from-red-700 to-gray-800', bg: 'from-gray-900/60 to-red-950/20', border: 'group-hover:border-red-800/60', tag: '' },
  { icon: '🎨', title: 'UI/UX Design', desc: 'Figma-first design systems that convert — beautiful, accessible, on-brand.', color: 'from-pink-700 to-red-800', bg: 'from-pink-950/30 to-red-900/10', border: 'group-hover:border-pink-700/60', tag: '' },
  { icon: '📣', title: 'Digital Marketing', desc: 'SEO, social media, paid ads — measurable growth for your business online.', color: 'from-red-600 to-rose-700', bg: 'from-red-950/20 to-rose-950/20', border: 'group-hover:border-red-700/60', tag: '' },
  { icon: '☁️', title: 'IT Infrastructure', desc: 'Cloud hosting, networking, cybersecurity and 24/7 managed IT support.', color: 'from-gray-700 to-red-900', bg: 'from-gray-900/60 to-red-950/20', border: 'group-hover:border-gray-600/60', tag: '' },
]

export default function Services() {
  return (
    <section id="services" className="py-28 bg-gray-950 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block text-red-400 font-bold text-xs uppercase tracking-[0.2em] bg-red-500/10 border border-red-700/30 px-4 py-2 rounded-full mb-5">
            What We Do
          </span>
          <h2 className="text-4xl md:text-5xl xl:text-6xl font-black text-white mb-5 leading-tight">
            Services That Drive
            <span className="block bg-gradient-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">
              Real Business Growth
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            From ideation to deployment, we handle every layer of your digital transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title}
              className={`group relative bg-gradient-to-br ${s.bg} border border-white/8 ${s.border} rounded-3xl p-8 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden`}
            >
              {s.tag && (
                <span className="absolute top-5 right-5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">{s.tag}</span>
              )}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-7 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {s.icon}
              </div>
              <h3 className="text-white font-black text-xl mb-3">{s.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm mb-6">{s.desc}</p>
              <div className="flex items-center gap-2 text-sm font-bold text-white/50 group-hover:text-red-400 transition-colors">
                Learn more
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-tl ${s.color} opacity-0 group-hover:opacity-10 rounded-full blur-xl transition-opacity duration-300`} />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a href="#contact" className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold text-base transition-all hover:-translate-y-0.5 shadow-xl shadow-red-600/20">
            Discuss Your Project
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
      </div>
    </section>
  )
}
