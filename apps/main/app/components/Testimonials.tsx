const reviews = [
  {
    name: 'Md. Rafiqul Islam',
    title: 'CEO, Dhaka Logistics Ltd.',
    country: '🇧🇩 Bangladesh',
    text: 'SI Group built our entire parcel tracking system from scratch. Delivered on time, on budget, and the quality is outstanding. We\'ve been working together for 5 years now.',
    rating: 5,
  },
  {
    name: 'Sarah Al-Hassan',
    title: 'Founder, GulfTech Solutions',
    country: '🇦🇪 UAE',
    text: 'We hired SI Group for our FinTech app. Their team was professional, responsive, and technically brilliant. Highly recommend to anyone looking for world-class dev at competitive prices.',
    rating: 5,
  },
  {
    name: 'James Whitfield',
    title: 'Director, EduBridge UK',
    country: '🇬🇧 United Kingdom',
    text: 'Outstanding work on our learning platform. The UI/UX team really listened to what we needed. Post-launch support has been incredible — any issue gets fixed within hours.',
    rating: 5,
  },
  {
    name: 'Fatema Khatun',
    title: 'MD, ShopBD E-Commerce',
    country: '🇧🇩 Bangladesh',
    text: 'Our marketplace went from idea to live in 3 months. SI Group managed everything — design, development, and payment gateway integration. I couldn\'t be happier.',
    rating: 5,
  },
  {
    name: 'Nasir Uddin',
    title: 'CTO, ISP Solutions BD',
    country: '🇧🇩 Bangladesh',
    text: 'The billing system they built for us handles 150,000 subscribers without a hiccup. The code is clean and the team is always available. True long-term partners.',
    rating: 5,
  },
  {
    name: 'Ahmed Karimi',
    title: 'GM, Al-Falah Hospital',
    country: '🇦🇪 UAE',
    text: 'The hospital management system transformed our operations. Patient wait times dropped 40%. SI Group is our go-to technology partner for everything.',
    rating: 5,
  },
]

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-red-400 font-semibold text-sm uppercase tracking-widest">Client Voices</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            500+ successful projects. 90% retention rate. Real results, real clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col">
              <Stars n={r.rating} />

              <p className="text-gray-600 leading-relaxed mt-4 mb-6 flex-1">
                &ldquo;{r.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {r.name[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-gray-400 text-xs">{r.title}</p>
                  <p className="text-gray-400 text-xs">{r.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
