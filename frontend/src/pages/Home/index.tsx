import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { MockKanban } from './components/MockKanban'
import { Features } from './components/Features'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'

export const Home = () => {
  return (
    <div className="min-h-screen bg-[#030712] flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <MockKanban />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
