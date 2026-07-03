import React, { useState } from 'react'
import { StaticPageLayout } from '@/components/StaticPageLayout'
import toast from 'react-hot-toast'

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'support',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    // Mock API submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      toast.success('Your message has been sent successfully!')
    }, 1200)
  }

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: 'support',
      message: '',
    })
    setIsSubmitted(false)
  }

  return (
    <StaticPageLayout
      title="Contact Support"
      subtitle="Got questions, feedback, or need troubleshooting? We're here to help."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Help Cards */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-[#0b0f19] p-6 rounded-xl border border-slate-850 glass space-y-3">
            <span className="text-2xl">📧</span>
            <h3 className="text-lg font-bold text-white">Email Us</h3>
            <p className="text-sm text-slate-400">
              Drop us a line directly for partnership inquiries or account-related help.
            </p>
            <a
              href="mailto:support@thunderkanban.com"
              className="text-sm text-blue-400 font-semibold hover:underline block pt-2"
            >
              support@thunderkanban.com
            </a>
          </div>

          <div className="bg-[#0b0f19] p-6 rounded-xl border border-slate-850 glass space-y-3">
            <span className="text-2xl">🌐</span>
            <h3 className="text-lg font-bold text-white">Open Source</h3>
            <p className="text-sm text-slate-400">
              Thunder Kanban is open-source. Report issues or suggest pull requests directly on our repository.
            </p>
            <a
              href="https://github.com/SHUBHAM-NIRMAL18/thunder-kanban"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 font-semibold hover:underline block pt-2"
            >
              GitHub Repository →
            </a>
          </div>

          <div className="bg-[#0b0f19] p-6 rounded-xl border border-slate-850 glass space-y-3 flex-1">
            <span className="text-2xl">⚡</span>
            <h3 className="text-lg font-bold text-white">Average Response Time</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We monitor feedback and bugs around the clock. Typical response rates are:
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-900/60 rounded-lg text-center border border-slate-800">
                <span className="text-xs text-slate-500 block">Bugs & Security</span>
                <span className="text-sm font-bold text-green-400">&lt; 12 hours</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-lg text-center border border-slate-800">
                <span className="text-xs text-slate-500 block">General Help</span>
                <span className="text-sm font-bold text-slate-300">&lt; 24 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Box */}
        <div className="lg:col-span-2 bg-[#0b0f19] p-8 md:p-10 rounded-xl border border-slate-850 glass flex flex-col justify-between">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="dark-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="dark-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Inquiry Topic
                </label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="dark-input cursor-pointer"
                >
                  <option value="support">General Support & Troubleshooting</option>
                  <option value="feedback">Feature Request & Feedback</option>
                  <option value="bug">Security / Bug Reporting</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Message Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you organize your tasks today?"
                  rows={6}
                  className="dark-input resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending message...
                  </>
                ) : (
                  'Send Support Ticket'
                )}
              </button>
            </form>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-12">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-green-500/5 animate-pulse">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Message Dispatched</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  Thank you for reaching out! We've received your request and will follow up with you via email shortly.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-300 px-6 py-2.5 rounded-lg text-sm transition-all"
              >
                Submit Another Inquiry
              </button>
            </div>
          )}
        </div>
      </div>
    </StaticPageLayout>
  )
}
export default Contact
