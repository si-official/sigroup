const reasons = [
  {
    icon: '🏆',
    title: 'Industry-Proven Expertise',
    desc: '15+ years of delivering enterprise-grade solutions across tech, education, e-commerce and ISP industries.',
    stat: '500+',
    statLabel: 'projects done',
  },
  {
    icon: '⚡',
    title: 'Fast Delivery',
    desc: 'We don\'t just build — we launch. Average project delivery is 40% faster than industry standard.',
    stat: '40%',
    statLabel: 'faster delivery',
  },
  {
    icon: '🌍',
    title: 'Global Standards, Local Prices',
    desc: 'World-class quality at Bangladesh-friendly pricing. Best value for money in the region.',
    stat: '12+',
    statLabel: 'countries served',
  },
  {
    icon: '🔒',
    title: 'Secure & Scalable',
    desc: 'Every solution is built with security-first architecture and designed to scale as your business grows.',
    stat: '99.9%',
    statLabel: 'uptime SLA',
  },
  {
    icon: '🤝',
    title: 'Long-Term Partnership',
    desc: 'We don\'t disappear after launch. 90% of our clients work with us for 3+ years.',
    stat: '90%',
    statLabel: 'retention rate',
  },
  {
    icon: '📞',
    title: '24/7 Support',
    desc: 'Round-the-clock support team in BD, UAE & UK. Someone always answers your call.',
    stat: '< 2hr',
    statLabel: 'response time',
  },
]

export default function WhyUs() {
  return (
    <section id="why-us" className="py-24 bg-gray-950 text-white relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-red-400 font-semibold text-sm uppercase tracking-widest">Why SI Group</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            Why 500+ Clients Choose Us
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We don't just deliver projects. We build relationships, solve real problems, and grow with our clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-red-700/50 transition-all duration-300 cursor-default"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-5">
                <div className="text-4xl">{r.icon}</div>
                <div className="text-right">
                  <p className="text-3xl font-black text-red-400">{r.stat}</p>
                  <p className="text-gray-500 text-xs">{r.statLabel}</p>
                </div>
              </div>

              <h3 className="text-white font-bold text-lg mb-3">{r.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{r.desc}</p>

              {/* Hover border glow */}
              <div className="absolute inset-0 rounded-2xl border border-red-700/0 group-hover:border-red-700/30 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6 text-lg">Ready to work with Bangladesh's best?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="bg-red-600 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-red-600/20">
              Get Free Consultation
            </a>
            <a href="https://portal.sigroup.com.bd" className="border border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-full font-bold text-lg transition">
              View Portfolio →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
