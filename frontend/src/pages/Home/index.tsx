import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { MockKanban } from './components/MockKanban'
import { Features } from './components/Features'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'

export const Home = () => {
  const { isAuthenticated, isInitializing } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isInitializing, navigate])

  if (isInitializing || isAuthenticated) {
    return null
  }

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
