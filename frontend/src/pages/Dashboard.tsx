import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBoards } from '@/features/kanban/hooks/useBoards'
import { BoardCard } from '@/features/boards/components/BoardCard'
import { CreateBoardModal } from '@/features/boards/components/CreateBoardModal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { authApi } from '@/api/endpoints/auth'

export const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { boards, isLoading, fetchBoards, createBoard, deleteBoard, duplicateBoard } = useBoards()
  
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [boardToDelete, setBoardToDelete] = useState<{ id: number; name: string } | null>(null)
  
  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])
  
  const handleLogoutClick = () => setShowLogoutModal(true)
  
  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true)
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) await authApi.logout(refreshToken)
      logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch {
      logout()
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
  
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold">Thunder</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.first_name} {user?.last_name}</span>
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Boards</h1>
            <p className="text-gray-600">Manage your Kanban boards</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <span className="text-6xl mb-4 block">📋</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No boards yet</h2>
            <p className="text-gray-600 mb-6">Create your first board to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                id={board.id}
                name={board.name}
                description={board.description}
                columnsCount={board.columns_count}
                tasksCount={board.tasks_count}
                onDuplicate={() => duplicateBoard(board.id)}
                onDelete={() => handleDeleteClick(board.id, board.name)}
              />
            ))}
          </div>
        )}
      </main>
      
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBoard}
      />
      
      <ConfirmDialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
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