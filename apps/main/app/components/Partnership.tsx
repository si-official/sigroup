const tiers = [
  {
    name: 'Silver Partner',
    price: '৳50,000',
    period: '/year',
    color: 'from-gray-400 to-gray-500',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    features: [
      'Access to SI Group network',
      'Co-branding opportunities',
      'Quarterly business reviews',
      'Email & chat support',
      'Partner directory listing',
    ],
    cta: 'Start Silver',
    ctaClass: 'bg-gray-800 text-white hover:bg-gray-700',
  },
  {
    name: 'Gold Partner',
    price: '৳1,50,000',
    period: '/year',
    color: 'from-yellow-400 to-yellow-600',
    border: 'border-yellow-300',
    badge: 'bg-yellow-100 text-yellow-700',
    featured: true,
    features: [
      'All Silver benefits',
      'Priority project referrals',
      'Joint marketing campaigns',
      'Dedicated partner manager',
      'Monthly strategy sessions',
      'Revenue sharing program',
    ],
    cta: 'Start Gold',
    ctaClass: 'bg-yellow-500 text-white hover:bg-yellow-600',
  },
  {
    name: 'Platinum Partner',
    price: 'Custom',
    period: 'pricing',
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    features: [
      'All Gold benefits',
      'Exclusive territory rights',
      'White-label solutions',
      'C-level introductions',
      'Custom SLA agreements',
      'Equity participation option',
    ],
    cta: 'Contact Us',
    ctaClass: 'bg-blue-900 text-white hover:bg-blue-800',
  },
]

export default function Partnership() {
  return (
    <section id="partnership" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Partner With Us</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4">
            Partnership Programs
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Join the SI Group ecosystem and grow your business with our proven partnership model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl border-2 ${tier.border} p-8 flex flex-col ${tier.featured ? 'shadow-2xl scale-105' : 'shadow-sm'} transition-all hover:shadow-lg`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className={`inline-flex items-center gap-2 ${tier.badge} rounded-full px-3 py-1 text-sm font-semibold w-fit mb-6`}>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${tier.color}`} />
                {tier.name}
              </div>

              <div className="mb-8">
                <span className="text-4xl font-black text-gray-900">{tier.price}</span>
                <span className="text-gray-400 ml-1">{tier.period}</span>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="text-green-500 mt-0.5 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a href="https://portal.sigroup.com.bd" className={`block text-center py-3.5 rounded-2xl font-bold transition ${tier.ctaClass}`}>
                {tier.cta} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
