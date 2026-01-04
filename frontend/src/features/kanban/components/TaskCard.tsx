import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/api/endpoints/boards'

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onClick?: () => void
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

export const TaskCard = ({ task, onEdit, onDelete, onClick }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onClick?.()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
        isDragging ? 'opacity-50 shadow-lg rotate-2' : ''
      } ${onClick ? 'hover:border-blue-300' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-900 flex-1 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {task.due_date && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
            task.is_overdue ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(task.due_date)}
          </span>
        )}
      </div>

      {onClick && (
        <div className="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-gray-400">Click to view details</span>
        </div>
      )}
    </div>
  )
}