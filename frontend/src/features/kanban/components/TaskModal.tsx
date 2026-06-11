import { useState, useEffect } from 'react'
import type { Task } from '@/api/endpoints/boards'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
  }) => Promise<void>
  task?: Task | null
  columnId: number
}

const PRIORITIES: { value: 'low' | 'medium' | 'high'; label: string; color: string; bg: string }[] = [
  { value: 'low',    label: 'Low',    color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  { value: 'medium', label: 'Medium', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  { value: 'high',   label: 'High',   color: '#f87171', bg: 'rgba(239,68,68,0.15)'  },
]

export const TaskModal = ({ isOpen, onClose, onSubmit, task }: TaskModalProps) => {
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority]     = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate]       = useState('')
  const [isLoading, setIsLoading]   = useState(false)
  const [errors, setErrors]         = useState<{ title?: string }>({})

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setDueDate(task.due_date || '')
    } else {
      setTitle(''); setDescription(''); setPriority('medium'); setDueDate('')
    }
    setErrors({})
  }, [task, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (!title.trim()) { setErrors({ title: 'Task title is required' }); return }
    if (title.length > 200) { setErrors({ title: 'Task title cannot exceed 200 characters' }); return }
    setIsLoading(true)
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), priority, due_date: dueDate || null })
    } catch { /* Error handled in hook */ } finally { setIsLoading(false) }
  }

  const handleClose = () => {
    setTitle(''); setDescription(''); setPriority('medium'); setDueDate(''); setErrors({})
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(6px)',
          animation: 'overlayIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', zIndex: 51,
        width: '100%', maxWidth: 500,
        background: 'rgba(12,11,22,0.95)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.1)',
        animation: 'modalIn 0.25s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {task ? 'Edit Task' : 'Create Task'}
            </h2>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {task ? 'Update task details' : 'Fill in the details for your new task'}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: 6, borderRadius: 8,
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              TITLE
            </label>
            <input
              className="dark-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              disabled={isLoading}
              autoFocus
            />
            {errors.title && (
              <p style={{ fontSize: '0.76rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              DESCRIPTION <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              className="dark-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              rows={3}
              disabled={isLoading}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Priority picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              PRIORITY
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: `1.5px solid ${priority === p.value ? p.color + '80' : 'rgba(255,255,255,0.08)'}`,
                    background: priority === p.value ? p.bg : 'rgba(255,255,255,0.03)',
                    color: priority === p.value ? p.color : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: priority === p.value ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: p.color,
                    opacity: priority === p.value ? 1 : 0.4,
                    flexShrink: 0,
                    transition: 'opacity 0.15s',
                  }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              DUE DATE <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="date"
              className="dark-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '9px 20px',
                borderRadius: 40,
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--border-medium)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '9px 22px',
                borderRadius: 40,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)' }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)' }}
            >
              {isLoading && (
                <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isLoading ? 'Saving…' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}