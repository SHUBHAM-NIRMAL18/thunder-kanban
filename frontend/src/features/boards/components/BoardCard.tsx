import { Link } from 'react-router-dom'

interface BoardCardProps {
  id: number
  name: string
  description: string
  columnsCount: number
  tasksCount: number
  onDuplicate: () => void
  onDelete: () => void
}

export const BoardCard = ({
  id,
  name,
  description,
  columnsCount,
  tasksCount,
  onDuplicate,
  onDelete,
}: BoardCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <Link to={`/boards/${id}`} className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {name}
          </h3>
        </Link>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault()
              const menu = document.getElementById(`menu-${id}`)
              menu?.classList.toggle('hidden')
            }}
            className="p-1 rounded hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <div
            id={`menu-${id}`}
            className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                onDuplicate()
                document.getElementById(`menu-${id}`)?.classList.add('hidden')
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
            >
              Duplicate
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                onDelete()
                document.getElementById(`menu-${id}`)?.classList.add('hidden')
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {description || 'No description'}
      </p>
      
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <span>{columnsCount} columns</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>{tasksCount} tasks</span>
        </div>
      </div>
      
      <Link
        to={`/boards/${id}`}
        className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Open board
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}