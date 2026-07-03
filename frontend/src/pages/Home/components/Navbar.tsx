import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

export const Navbar = () => {
  const { isAuthenticated } = useAuth()

  return (
    <nav className="border-b border-slate-800 bg-[#030712] sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <span className="text-3xl animate-pulse">⚡</span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Thunder<span className="text-blue-500">Kanban</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link to="/#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/#preview" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Workspace
          </Link>
          <Link to="/#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            FAQ
          </Link>
          <Link to="/about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            About
          </Link>
          <Link to="/blog" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Blog
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 hover:bg-slate-900 rounded-lg transition-all"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
