import { useParams, useNavigate, Link } from 'react-router-dom'
import { useKanban } from '@/features/kanban/hooks/useKanban'
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard'
import { BoardSkeleton } from '@/features/kanban/components/BoardSkeleton'

const ErrorState = ({ message, onBack }: { message: string; onBack: () => void }) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', animation: 'slideUp 0.4s ease' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>😕</div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{message}</h2>
      <button
        onClick={onBack}
        style={{ marginTop: 20, padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--accent-end))', color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', border: 'none', fontFamily: 'var(--font-sans)' }}
      >
        Back to Dashboard
      </button>
    </div>
  </div>
)

export const Board = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const boardId = id ? parseInt(id) : 0

  const { board, isLoading, isFetching, error } = useKanban(boardId)

  if (!id || isNaN(boardId) || boardId <= 0) {
    return <ErrorState message="Invalid board ID" onBack={() => navigate('/dashboard')} />
  }

  if (isLoading && !board) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
        <nav style={navStyle} className="glass">
          <div style={navInner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link to="/dashboard" style={backLink}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
              <div style={navDivider} />
              <div style={{ height: 16, width: 120, borderRadius: 6, background: 'rgba(255,255,255,0.07)', animation: 'shimmer 1.8s ease infinite' }} className="skeleton" />
            </div>
          </div>
        </nav>
        <main style={{ flex: 1, overflow: 'hidden', padding: 16 }}>
          <BoardSkeleton />
        </main>
      </div>
    )
  }

  if (error && !board) {
    return <ErrorState message="Failed to load board" onBack={() => navigate('/dashboard')} />
  }

  if (!board) {
    return <ErrorState message="Board not found" onBack={() => navigate('/dashboard')} />
  }

  const totalTasks = board.columns.reduce((acc, col) => acc + col.tasks.length, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <nav style={navStyle} className="glass">
        <div style={navInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/dashboard" style={backLink}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <div style={navDivider} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>⚡</span>
              <h1 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {board.name}
              </h1>
              {isFetching && (
                <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ color: 'var(--text-muted)', opacity: 0.25 }} />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                </svg>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ padding: '3px 9px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)' }}>
                {board.columns.length} columns
              </span>
              <span style={{ padding: '3px 9px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)' }}>
                {totalTasks} tasks
              </span>
            </span>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, overflow: 'hidden', padding: '12px 16px 16px' }}>
        <KanbanBoard boardId={board.id} />
      </main>
    </div>
  )
}

const navStyle: React.CSSProperties = {
  position: 'sticky', top: 0, zIndex: 100,
  borderBottom: '1px solid var(--border-subtle)',
  borderRadius: 0,
}

const navInner: React.CSSProperties = {
  maxWidth: '100%',
  padding: '0 20px',
  height: 56,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}

const backLink: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  color: 'var(--text-secondary)', fontSize: '0.83rem', fontWeight: 500,
  transition: 'color 0.15s',
  textDecoration: 'none',
}

const navDivider: React.CSSProperties = {
  width: 1, height: 18, background: 'var(--border-subtle)',
}