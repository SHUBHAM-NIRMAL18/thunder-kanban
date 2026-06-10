import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBoards } from '@/features/kanban/hooks/useBoards'
import { BoardCard } from '@/features/boards/components/BoardCard'
import { CreateBoardModal } from '@/features/boards/components/CreateBoardModal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { boards, isLoading, fetchBoards, createBoard, deleteBoard, duplicateBoard } = useBoards()

  const [showLogoutModal, setShowLogoutModal]   = useState(false)
  const [isLoggingOut, setIsLoggingOut]         = useState(false)
  const [showCreateModal, setShowCreateModal]   = useState(false)
  const [showDeleteModal, setShowDeleteModal]   = useState(false)
  const [boardToDelete, setBoardToDelete]       = useState<{ id: number; name: string } | null>(null)
  const [showUserMenu, setShowUserMenu]         = useState(false)
  const [mounted, setMounted]                   = useState(false)

  useEffect(() => { fetchBoards() }, [fetchBoards])
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handler = () => setShowUserMenu(false)
    if (showUserMenu) window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [showUserMenu])

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch {
      navigate('/login')
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const handleCreateBoard = async (data: { name: string; description: string }) => {
    const board = await createBoard(data)
    navigate(`/boards/${board.id}`)
  }

  const handleDeleteClick = (id: number, name: string) => {
    setBoardToDelete({ id, name })
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!boardToDelete) return
    await deleteBoard(boardToDelete.id)
    setShowDeleteModal(false)
    setBoardToDelete(null)
  }

  const totalTasks = boards.reduce((acc, b) => acc + (b.tasks_count ?? 0), 0)

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase()
    : '?'

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div style={styles.root}>
      {/* Background aura blobs */}
      <div style={styles.aura1} />
      <div style={styles.aura2} />

      {/* ── NAVBAR ── */}
      <nav style={styles.nav} className="glass">
        <div style={styles.navInner}>
          {/* Logo */}
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚡</span>
            <span style={styles.logoText} className="gradient-text">Thunder</span>
          </div>

          {/* Right section */}
          <div style={styles.navRight}>
            {/* User avatar + dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                style={styles.avatarBtn}
                onClick={(e) => { e.stopPropagation(); setShowUserMenu(v => !v) }}
                title={`${user?.first_name} ${user?.last_name}`}
              >
                <div style={styles.avatar}>{initials}</div>
                <span style={styles.avatarName}>{user?.first_name}</span>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div style={styles.dropdown} className="glass-strong" onClick={e => e.stopPropagation()}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownAvatar}>{initials}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user?.first_name} {user?.last_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
                    </div>
                  </div>
                  <div style={styles.dropdownDivider} />
                  <button
                    style={styles.dropdownItem}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-soft)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => { setShowUserMenu(false); setShowLogoutModal(true) }}
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--danger)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span style={{ color: 'var(--danger)' }}>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={styles.main}>

        {/* Header */}
        <div style={{ ...styles.header, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'all 0.5s ease' }}>
          <div>
            <p style={styles.greeting}>{greeting},</p>
            <h1 style={styles.heroTitle}>
              <span className="gradient-text">{user?.first_name ?? 'there'}</span> 👋
            </h1>
            <p style={styles.heroSub}>Here's what you're working on today.</p>
          </div>

          {/* Stats chips */}
          <div style={styles.statsRow}>
            <div style={styles.statChip} className="glass">
              <svg width="16" height="16" fill="none" stroke="var(--accent-light)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{boards.length}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Boards</span>
            </div>
            <div style={styles.statChip} className="glass">
              <svg width="16" height="16" fill="none" stroke="var(--accent-light)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{totalTasks}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tasks</span>
            </div>
          </div>
        </div>

        {/* Section header */}
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>My Boards</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {boards.length === 0 ? 'Create your first board to get started' : `${boards.length} board${boards.length !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <button
            id="create-board-btn"
            style={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.3)' }}
          >
            <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={styles.skeletonGrid}>
            {[1, 2, 3].map(i => (
              <div key={i} style={styles.skeletonCard} className="glass">
                <div style={{ height: 4, borderRadius: 4, marginBottom: 20 }} className="skeleton" />
                <div style={{ height: 20, width: '60%', marginBottom: 10 }} className="skeleton" />
                <div style={{ height: 14, width: '80%', marginBottom: 6 }} className="skeleton" />
                <div style={{ height: 14, width: '50%', marginBottom: 28 }} className="skeleton" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ height: 28, width: 80, borderRadius: 20 }} className="skeleton" />
                  <div style={{ height: 28, width: 68, borderRadius: 20 }} className="skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div style={styles.emptyState} className="glass">
            <div style={styles.emptyIcon}>
              <span style={{ fontSize: '3rem', animation: 'float 3s ease-in-out infinite', display: 'block' }}>📋</span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              No boards yet
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 28, maxWidth: 320, textAlign: 'center' }}>
              Create your first Kanban board and start organizing your work like a pro.
            </p>
            <button
              style={styles.createBtn}
              onClick={() => setShowCreateModal(true)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.3)' }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create First Board
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {boards.map((board, idx) => (
              <div
                key={board.id}
                style={{
                  animation: `slideUp 0.4s ease both`,
                  animationDelay: `${idx * 60}ms`,
                }}
              >
                <BoardCard
                  id={board.id}
                  name={board.name}
                  description={board.description}
                  columnsCount={board.columns_count}
                  tasksCount={board.tasks_count}
                  colorIndex={idx % 6}
                  onDuplicate={() => duplicateBoard(board.id)}
                  onDelete={() => handleDeleteClick(board.id, board.name)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBoard}
      />

      <ConfirmDialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign out"
        description="Are you sure you want to sign out of Thunder?"
        confirmText="Sign out"
        cancelText="Stay"
        isLoading={isLoggingOut}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setBoardToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Board"
        description={`Are you sure you want to delete "${boardToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    position: 'relative',
    overflowX: 'hidden',
  },
  aura1: {
    position: 'fixed', top: '-20vh', left: '-10vw',
    width: '55vw', height: '55vw',
    background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
  },
  aura2: {
    position: 'fixed', bottom: '-20vh', right: '-10vw',
    width: '50vw', height: '50vw',
    background: 'radial-gradient(ellipse, rgba(79,70,229,0.10) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
  },
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    borderBottom: '1px solid var(--border-subtle)',
    borderRadius: 0,
  },
  navInner: {
    maxWidth: 1280, margin: '0 auto',
    padding: '0 28px',
    height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: '1.5rem', lineHeight: 1 },
  logoText: { fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' },
  navRight: { display: 'flex', alignItems: 'center', gap: 12 },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '6px 10px 6px 6px',
    borderRadius: 40,
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem', fontWeight: 500,
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
    color: '#fff',
    fontSize: '0.78rem', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarName: { color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.85rem' },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
    minWidth: 220,
    padding: '8px',
    animation: 'slideDown 0.18s ease',
    zIndex: 200,
    borderRadius: 14,
  },
  dropdownHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 10px 12px',
  },
  dropdownAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
    color: '#fff', fontSize: '0.85rem', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  dropdownDivider: { height: 1, background: 'var(--border-subtle)', margin: '0 4px 6px' },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '9px 10px',
    borderRadius: 8,
    fontSize: '0.85rem', fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s',
    background: 'transparent',
  },
  main: {
    maxWidth: 1280, margin: '0 auto',
    padding: '48px 28px 80px',
    position: 'relative', zIndex: 1,
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 52, gap: 20, flexWrap: 'wrap',
  },
  greeting: { fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400, marginBottom: 4 },
  heroTitle: { fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 8 },
  heroSub: { fontSize: '0.92rem', color: 'var(--text-secondary)' },
  statsRow: { display: 'flex', gap: 10, alignSelf: 'flex-end', paddingBottom: 4 },
  statChip: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '10px 16px',
    borderRadius: 40,
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionTitle: { fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' },
  createBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '11px 22px',
    borderRadius: 40,
    background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
    color: '#fff', fontSize: '0.88rem', fontWeight: 600,
    boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
    transition: 'all 0.25s ease',
    cursor: 'pointer',
    border: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  skeletonCard: {
    padding: 24, borderRadius: 16,
    animation: 'fadeIn 0.4s ease',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '72px 24px',
    borderRadius: 20,
    border: '1.5px dashed rgba(124,58,237,0.3)',
    animation: 'fadeIn 0.5s ease',
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'rgba(124,58,237,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
}