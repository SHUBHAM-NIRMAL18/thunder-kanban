import { Button } from '@/components/ui/button'
import type { Task } from '@/api/endpoints/boards'

interface TaskPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onEdit: () => void
  onDelete: () => void
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

export const TaskPreviewModal = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
}: TaskPreviewModalProps) => {
  if (!isOpen || !task) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              <p className="text-sm text-gray-500 mt-1">in {task.column_name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-500 block mb-1">Priority</span>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>

            {task.due_date && (
              <div>
                <span className="text-xs text-gray-500 block mb-1">Due Date</span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1 ${
                  task.is_overdue ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(task.due_date)}
                  {task.is_overdue && ' (Overdue)'}
                </span>
              </div>
            )}
          </div>

          <div>
            <span className="text-xs text-gray-500 block mb-2">Description</span>
            {task.description ? (
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {task.description}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No description provided</p>
            )}
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500 pt-4 border-t border-gray-100">
            <div>
              <span className="block">Created</span>
              <span className="text-gray-700">{formatDate(task.created_at)}</span>
            </div>
            <div>
              <span className="block">Updated</span>
              <span className="text-gray-700">{formatDate(task.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onDelete} 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
          <Button onClick={onEdit}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Task
          </Button>
        </div>
      </div>
    </div>
  )
}