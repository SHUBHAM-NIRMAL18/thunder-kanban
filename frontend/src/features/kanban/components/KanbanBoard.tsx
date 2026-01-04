import { useCallback } from 'react'
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
import { useState } from 'react'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModel'
import { ColumnModal } from './ColumnModal'
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

  const handleDragStart = useCallback((event: DragStartEvent) => {
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
  }, [board])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Handle drag over for visual feedback if needed
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
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
  }, [board, moveTask])

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

  if (!board) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {board.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            isEditing={editingColumnId === column.id}
            onEditColumn={() => setEditingColumn(column.id)}
            onDeleteColumn={() => openDeleteModal('column', column.id, column.name)}
            onUpdateColumnName={(name) => updateColumn(column.id, { name })}
            onAddTask={() => handleAddTask(column.id)}
            onEditTask={(task) => openTaskModal(task)}
            onDeleteTask={(task) => openDeleteModal('task', task.id, task.title)}
          />
        ))}

        <div className="flex-shrink-0 w-72">
          <button
            onClick={openColumnModal}
            className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-2 border-dashed border-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Column
          </button>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>

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

      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={closeColumnModal}
        onSubmit={handleColumnSubmit}
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
    </DndContext>
  )
}