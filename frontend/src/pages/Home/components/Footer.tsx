import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="bg-[#030712] border-t border-slate-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="text-lg font-bold tracking-tight text-white">
              Thunder<span className="text-blue-500">Kanban</span>
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
            <a href="#preview" className="hover:text-slate-300 transition-colors">Workspace</a>
            <a href="#faq" className="hover:text-slate-300 transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-slate-300 transition-colors">Register</Link>
          </div>
        </div>

        <hr className="border-slate-900 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <div>
            &copy; {new Date().getFullYear()} Thunder Kanban. The lightning-fast way to organize your projects.
          </div>
          <div>
            Created by <a href="https://github.com/SHUBHAM-NIRMAL18" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors">Shubham Nirmal</a>.
          </div>
        </div>
      </div>
    </footer>
  )
}
