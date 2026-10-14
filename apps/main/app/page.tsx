import dynamic from 'next/dynamic'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import WhyUs from './components/WhyUs'
import BusinessPlatforms from './components/BusinessPlatforms'
import DevServices from './components/DevServices'
import Portfolio from './components/Portfolio'
import Partnership from './components/Partnership'
import Testimonials from './components/Testimonials'
import Presence from './components/Presence'
import Footer from './components/Footer'

const Navbar = dynamic(() => import('./components/Navbar'), { ssr: false })
const SoftwareMarket = dynamic(() => import('./components/SoftwareMarket'), { ssr: false })
const SchoolSection = dynamic(() => import('./components/SchoolSection'), { ssr: false })
const Contact = dynamic(() => import('./components/Contact'), { ssr: false })

export default function MainPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <WhyUs />

      {/* Business Overview */}
      <BusinessPlatforms />

      {/* Individual Business Sections */}
      <SoftwareMarket />
      <SchoolSection />
      <DevServices />

      <Portfolio />
      <Partnership />
      <Testimonials />
      <Presence />
      <Contact />
      <Footer />
    </main>
  )
}
