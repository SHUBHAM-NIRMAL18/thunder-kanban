import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useKanban } from '@/features/kanban/hooks/useKanban'
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard'

export const Board = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { board, isLoading, error, fetchBoard } = useKanban()

  useEffect(() => {
    if (id) {
      fetchBoard(parseInt(id))
    }
  }, [id, fetchBoard])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load board</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Board not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <nav className="border-b bg-white flex-shrink-0">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h1 className="text-lg font-semibold text-gray-900">{board.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{board.columns.length} columns</span>
            <span>•</span>
            <span>
              {board.columns.reduce((acc, col) => acc + col.tasks.length, 0)} tasks
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden p-4">
        <KanbanBoard boardId={board.id} />
      </main>
    </div>
  )
}