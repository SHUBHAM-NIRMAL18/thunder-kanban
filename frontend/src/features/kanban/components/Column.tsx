import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Column as ColumnType, Task } from '@/api/endpoints/boards'

interface ColumnProps {
  column: ColumnType
  onEditColumn: () => void
  onDeleteColumn: () => void
  onUpdateColumnName: (name: string) => void
  isEditing: boolean
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
}

export const Column = ({
  column,
  onEditColumn,
  onDeleteColumn,
  onUpdateColumnName,
  isEditing,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: ColumnProps) => {
  const [editName, setEditName] = useState(column.name)
  const [showMenu, setShowMenu] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { columnId: column.id },
  })

  const handleNameSubmit = () => {
    if (editName.trim() && editName.trim() !== column.name) {
      onUpdateColumnName(editName.trim())
    } else {
      setEditName(column.name)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit()
    } else if (e.key === 'Escape') {
      setEditName(column.name)
      onEditColumn()
    }
  }

  return (
    <div
      className={`flex-shrink-0 w-72 bg-gray-100 rounded-lg flex flex-col max-h-full ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="p-3 flex items-center justify-between">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 px-2 py-1 text-sm font-semibold bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {column.name}
            <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {column.tasks.length}
            </span>
          </h3>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-gray-200 text-gray-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onEditColumn()
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onDeleteColumn()
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]"
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
            />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            No tasks yet
          </div>
        )}
      </div>

      <div className="p-2">
        <button
          onClick={onAddTask}
          className="w-full flex items-center justify-center gap-1 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>
    </div>
  )
}