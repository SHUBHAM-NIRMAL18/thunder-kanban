import { Link } from 'react-router-dom'

export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold">Thunder</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-blue-100 p-6">
              <span className="text-6xl">⚡</span>
            </div>
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900">
            Manage Your Tasks with <span className="text-blue-600">Thunder Speed</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            A lightning-fast Kanban board that helps you organize, track, and complete your work with ease.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium">
              Start Free Trial →
            </Link>
            <Link to="/login" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 text-lg font-medium">
              Sign In
            </Link>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Why Thunder?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600">Built with modern technology for instant updates</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Intuitive Design</h3>
              <p className="text-gray-600">Drag and drop tasks between columns with ease</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Team Ready</h3>
              <p className="text-gray-600">Collaborate with your team in real-time</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-blue-600 px-8 py-16 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Ready to boost your productivity?</h2>
          <p className="mb-8 text-lg opacity-90">Join thousands of teams using Thunder.</p>
          <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 text-lg font-medium inline-block">
            Get Started Now →
          </Link>
        </section>
      </main>

      <footer className="border-t py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2026 Thunder Kanban | Shubham Nirmal.
        </div>
      </footer>
    </div>
  )
}