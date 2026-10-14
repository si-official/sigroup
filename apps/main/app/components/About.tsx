const milestones = [
  { year: '2009', title: 'Founded in Dhaka', desc: 'SI Group started as a small IT firm with 5 people and a big vision.' },
  { year: '2013', title: 'First 100 clients', desc: 'Expanded to web development and digital marketing across Bangladesh.' },
  { year: '2017', title: 'Went International', desc: 'Opened offices in UAE and UK. Serving clients in 8 countries.' },
  { year: '2021', title: 'SI School & Shop', desc: 'Launched education and e-commerce platforms to serve more Bangladeshis.' },
  { year: '2024', title: '500+ Projects', desc: 'Delivered over 500 successful projects for clients worldwide.' },
]

const values = [
  { icon: '🎯', title: 'Mission', desc: 'To empower businesses across Bangladesh and beyond with world-class technology and education solutions.' },
  { icon: '👁️', title: 'Vision', desc: 'To become South Asia\'s most trusted technology conglomerate by 2030.' },
  { icon: '💎', title: 'Values', desc: 'Integrity, Innovation, Excellence. We deliver what we promise, every single time.' },
]

export default function About() {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading + Team Photo */}
        <div className="grid lg:grid-cols-2 gap-14 items-center mb-20">
          <div>
            <span className="text-red-500 font-semibold text-sm uppercase tracking-widest">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-5">
              About SI Group
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              Founded in 2009 in Dhaka, Bangladesh, SI Group has grown from a small IT startup into a diversified business conglomerate serving clients across 12+ countries.
            </p>
            <p className="text-gray-400 leading-relaxed">
              We operate five specialized platforms — e-commerce, internet services, online education, CCTV & security, and a digital software marketplace — all under one trusted brand.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80"
              alt="SI Group team"
              className="w-full h-80 object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute inset-0 rounded-3xl ring-1 ring-black/10" />
            <div className="absolute -bottom-4 -left-4 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl text-sm">
              15+ Years of Excellence
            </div>
          </div>
        </div>

        {/* Mission / Vision / Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {values.map((v) => (
            <div key={v.title} className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-red-900/40 text-center hover:border-red-700/60 hover:shadow-xl hover:shadow-red-900/20 transition-all duration-300">
              <div className="text-5xl mb-4">{v.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
              <p className="text-gray-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Journey Timeline */}
        <div className="relative">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black text-gray-900">Our Journey</h3>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-600 -translate-x-1/2 hidden md:block" />

            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div key={m.year} className={`flex flex-col md:flex-row items-center gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition inline-block w-full md:max-w-sm ${i % 2 === 0 ? 'md:ml-auto' : ''}`}>
                      <p className="text-red-400 font-black text-2xl mb-1">{m.year}</p>
                      <h4 className="text-gray-900 font-bold text-lg mb-2">{m.title}</h4>
                      <p className="text-gray-500 text-sm">{m.desc}</p>
                    </div>
                  </div>

                  {/* Dot */}
                  <div className="w-5 h-5 bg-red-600 rounded-full border-4 border-white shadow-lg z-10 flex-shrink-0 hidden md:block" />

                  {/* Empty space for opposite side */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats banner */}
        <div className="mt-20 bg-gradient-to-r from-red-600 to-red-900 rounded-3xl p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { v: '15+', l: 'Years in Business' },
              { v: '500+', l: 'Projects Delivered' },
              { v: '12+', l: 'Countries Served' },
              { v: '200+', l: 'Team Members' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-5xl font-black text-white mb-2">{s.v}</p>
                <p className="text-red-400 font-medium">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
