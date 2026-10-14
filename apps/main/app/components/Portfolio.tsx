const projects = [
  {
    category: 'Web Development',
    title: 'Bangladesh Courier Platform',
    desc: 'Full-stack logistics management platform with real-time tracking for 50,000+ parcels/day.',
    tech: ['Next.js', 'Laravel', 'MySQL'],
    color: 'from-red-600 to-red-900',
  },
  {
    category: 'E-Commerce',
    title: 'Multi-Vendor Marketplace',
    desc: 'SSLCommerz-integrated marketplace with 2,000+ vendors and mobile-first design.',
    tech: ['React', 'PHP', 'Redis'],
    color: 'from-red-800 to-red-950',
  },
  {
    category: 'Mobile App',
    title: 'FinTech Payment App',
    desc: 'Mobile banking super-app for UAE with biometric auth and instant transfers.',
    tech: ['React Native', 'Node.js', 'PostgreSQL'],
    color: 'from-red-800 to-pink-600',
  },
  {
    category: 'EdTech',
    title: 'Online Learning Portal',
    desc: 'Bangladesh\'s first AI-personalized learning system. 25,000+ active students.',
    tech: ['Next.js', 'Python', 'MongoDB'],
    color: 'from-emerald-500 to-teal-600',
  },
  {
    category: 'ISP Management',
    title: 'ISP Billing System',
    desc: 'Automated billing and network management for 150,000+ subscribers in BD.',
    tech: ['Laravel', 'Vue.js', 'MySQL'],
    color: 'from-orange-500 to-red-600',
  },
  {
    category: 'UI/UX Design',
    title: 'Hospital Management System',
    desc: 'Full UI redesign and system rebuild for a 500-bed hospital in Dhaka.',
    tech: ['Figma', 'React', 'Node.js'],
    color: 'from-teal-500 to-cyan-600',
  },
]

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-red-400 font-semibold text-sm uppercase tracking-widest">Our Work</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4">
            Selected Projects
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            500+ projects delivered. Here are a few that we're most proud of.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.title} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default">
              {/* Color header */}
              <div className={`h-3 bg-gradient-to-r ${p.color}`} />

              <div className="p-6">
                <span className="text-xs font-semibold text-red-400 bg-red-600 px-3 py-1 rounded-full">
                  {p.category}
                </span>
                <h3 className="text-gray-900 font-bold text-xl mt-4 mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{p.desc}</p>

                <div className="flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span key={t} className="bg-gray-50 border border-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <p className="text-gray-500 mb-5">Want to see more? We have 500+ case studies.</p>
          <a href="#contact" className="bg-gray-900 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-bold text-lg transition inline-block">
            Request Full Portfolio
          </a>
        </div>
      </div>
    </section>
  )
}
