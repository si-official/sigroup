const services = [
  {
    icon: '🌐',
    title: 'Web Development',
    desc: 'Modern, scalable web applications built with cutting-edge technologies.',
    color: 'from-blue-500 to-blue-700',
  },
  {
    icon: '💻',
    title: 'Software Solutions',
    desc: 'Custom enterprise software tailored to your business needs.',
    color: 'from-violet-500 to-violet-700',
  },
  {
    icon: '📱',
    title: 'Mobile Apps',
    desc: 'iOS & Android applications with seamless user experiences.',
    color: 'from-pink-500 to-pink-700',
  },
  {
    icon: '🎨',
    title: 'UI/UX Design',
    desc: 'Beautiful, intuitive designs that convert visitors into customers.',
    color: 'from-orange-500 to-orange-700',
  },
  {
    icon: '📣',
    title: 'Digital Marketing',
    desc: 'Data-driven marketing strategies to grow your brand online.',
    color: 'from-green-500 to-green-700',
  },
  {
    icon: '🖥️',
    title: 'IT Infrastructure',
    desc: 'Robust IT solutions, networking, and cloud infrastructure.',
    color: 'from-cyan-500 to-cyan-700',
  },
]

export default function Services() {
  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4">
            Our Business Services
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            From technology to education, we provide comprehensive solutions to help businesses thrive in the digital age.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s) => (
            <div key={s.title} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 cursor-pointer">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
              <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                Learn more <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
