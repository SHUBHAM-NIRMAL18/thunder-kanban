import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="bg-[#030712] border-t border-slate-900 py-12">
      <div className="container mx-auto px-6">
        {/* Top Section: Brand + Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity w-fit">
              <span className="text-2xl">⚡</span>
              <span className="text-lg font-bold tracking-tight text-white">
                Thunder<span className="text-blue-500">Kanban</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
              The lightning-fast way to organize your projects and ship faster.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-slate-500">
              <Link to="/#features" className="hover:text-slate-300 transition-colors">Features</Link>
              <Link to="/#preview" className="hover:text-slate-300 transition-colors">Workspace</Link>
              <Link to="/#faq" className="hover:text-slate-300 transition-colors">FAQ</Link>
              <Link to="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-slate-500">
              <Link to="/about" className="hover:text-slate-300 transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact Support</Link>
              <Link to="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-slate-300 transition-colors">Register</Link>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Legal</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-slate-500">
              <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            </nav>
          </div>
        </div>

        <hr className="border-slate-900 my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <span>&copy; {new Date().getFullYear()} Thunder Kanban. All rights reserved.</span>
          <div>
            Created by <a href="https://github.com/SHUBHAM-NIRMAL18" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors">Shubham Nirmal</a>.
          </div>
        </div>
      </div>
    </footer>
  )
}
