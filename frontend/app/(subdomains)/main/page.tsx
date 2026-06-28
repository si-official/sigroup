import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Partnership from './components/Partnership'
import Presence from './components/Presence'
import Footer from './components/Footer'

export default function MainPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Partnership />
      <Presence />
      <Footer />
    </main>
  )
}
