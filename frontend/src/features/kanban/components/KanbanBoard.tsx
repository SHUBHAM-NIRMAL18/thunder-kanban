import { useCallback, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { ColumnModal } from './ColumnModal'
import { TaskPreviewModal } from './TaskPreviewModal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useKanban } from '../hooks/useKanban'
import type { Task } from '@/api/endpoints/boards'

interface KanbanBoardProps {
  boardId: number
}

export const KanbanBoard = ({ boardId }: KanbanBoardProps) => {
  const {
    board,
    isTaskModalOpen,
    isColumnModalOpen,
    isDeleteModalOpen,
    deleteTarget,
    selectedTask,
    editingColumnId,
    openTaskModal,
    closeTaskModal,
    openColumnModal,
    closeColumnModal,
    openDeleteModal,
    closeDeleteModal,
    setEditingColumn,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useKanban()

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [addingToColumnId, setAddingToColumnId] = useState<number | null>(null)
  const [previewTask, setPreviewTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const taskId = active.id as number

      if (!board) return

      for (const column of board.columns) {
        const task = column.tasks.find((t) => t.id === taskId)
        if (task) {
          setActiveTask(task)
          break
        }
      }
    },
    [board]
  )

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Handle drag over for visual feedback if needed
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveTask(null)

      if (!over || !board) return

      const taskId = active.id as number
      let targetColumnId: number | null = null
      let newPosition = 0

      if (String(over.id).startsWith('column-')) {
        targetColumnId = parseInt(String(over.id).replace('column-', ''))
        const targetColumn = board.columns.find((c) => c.id === targetColumnId)
        newPosition = targetColumn?.tasks.length || 0
      } else {
        const overTaskId = over.id as number
        for (const column of board.columns) {
          const taskIndex = column.tasks.findIndex((t) => t.id === overTaskId)
          if (taskIndex !== -1) {
            targetColumnId = column.id
            newPosition = taskIndex
            break
          }
        }
      }

      if (targetColumnId === null) return

      let sourceColumnId: number | null = null
      for (const column of board.columns) {
        if (column.tasks.some((t) => t.id === taskId)) {
          sourceColumnId = column.id
          break
        }
      }

      if (sourceColumnId === null) return

      if (sourceColumnId === targetColumnId) {
        const column = board.columns.find((c) => c.id === sourceColumnId)
        const currentIndex = column?.tasks.findIndex((t) => t.id === taskId) ?? -1
        if (currentIndex === newPosition) return
      }

      moveTask(taskId, { column: targetColumnId, position: newPosition })
    },
    [board, moveTask]
  )

  const handleAddTask = (columnId: number) => {
    setAddingToColumnId(columnId)
    openTaskModal()
  }

  const handleTaskSubmit = async (data: {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
  }) => {
    if (selectedTask) {
      await updateTask(selectedTask.id, data)
    } else if (addingToColumnId) {
      await createTask({
        column: addingToColumnId,
        ...data,
      })
    }
    setAddingToColumnId(null)
  }

  const handleColumnSubmit = async (name: string) => {
    if (!board) return
    await createColumn({ board: board.id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'task') {
      await deleteTask(deleteTarget.id)
    } else if (deleteTarget.type === 'column') {
      await deleteColumn(deleteTarget.id)
    }
  }

  const handleTaskClick = (task: Task) => {
    setPreviewTask(task)
  }

  if (!board) return null

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="text-sm text-gray-500">
          {board.columns.length} column{board.columns.length !== 1 ? 's' : ''} •{' '}
          {board.columns.reduce((acc, col) => acc + col.tasks.length, 0)} task
          {board.columns.reduce((acc, col) => acc + col.tasks.length, 0) !== 1 ? 's' : ''}
        </div>
        <button
          onClick={openColumnModal}
          disabled={board.columns.length >= 10}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Column
          {board.columns.length >= 10 && <span className="text-xs text-gray-400">(Max 10)</span>}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-0 h-full min-h-[500px]">
            {board.columns.map((column, index) => (
              <div
                key={column.id}
                className={`flex-shrink-0 ${
                  index !== board.columns.length - 1 ? 'border-r-2 border-gray-300' : ''
                }`}
              >
                <Column
                  column={column}
                  isEditing={editingColumnId === column.id}
                  onEditColumn={() => setEditingColumn(column.id)}
                  onDeleteColumn={() => openDeleteModal('column', column.id, column.name)}
                  onUpdateColumnName={(name) => updateColumn(column.id, { name })}
                  onAddTask={() => handleAddTask(column.id)}
                  onEditTask={(task) => openTaskModal(task)}
                  onDeleteTask={(task) => openDeleteModal('task', task.id, task.title)}
                  onTaskClick={handleTaskClick}
                />
              </div>
            ))}

            {board.columns.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">📋</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No columns yet</h3>
                  <p className="text-gray-500 mb-4">Add your first column to get started</p>
                  <button
                    onClick={openColumnModal}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Column
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3">
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          closeTaskModal()
          setAddingToColumnId(null)
        }}
        onSubmit={handleTaskSubmit}
        task={selectedTask}
        columnId={addingToColumnId || 0}
      />

      <ColumnModal isOpen={isColumnModalOpen} onClose={closeColumnModal} onSubmit={handleColumnSubmit} />

      <TaskPreviewModal
        isOpen={!!previewTask}
        onClose={() => setPreviewTask(null)}
        task={previewTask}
        onEdit={() => {
          if (previewTask) {
            openTaskModal(previewTask)
            setPreviewTask(null)
          }
        }}
        onDelete={() => {
          if (previewTask) {
            openDeleteModal('task', previewTask.id, previewTask.title)
            setPreviewTask(null)
          }
        }}
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteTarget?.type === 'task' ? 'Task' : 'Column'}`}
        description={`Are you sure you want to delete "${deleteTarget?.name}"? ${
          deleteTarget?.type === 'column' ? 'All tasks in this column will be deleted.' : ''
        }`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}