import { create } from 'zustand'
import type { BoardDetail, Column, Task } from '@/api/endpoints/boards'

interface KanbanState {
  board: BoardDetail | null
  isLoading: boolean
  error: string | null
  
  selectedTask: Task | null
  isTaskModalOpen: boolean
  isColumnModalOpen: boolean
  isDeleteModalOpen: boolean
  deleteTarget: { type: 'task' | 'column' | 'board'; id: number; name: string } | null
  editingColumnId: number | null
  
  setBoard: (board: BoardDetail | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  openTaskModal: (task?: Task) => void
  closeTaskModal: () => void
  
  openColumnModal: () => void
  closeColumnModal: () => void
  
  openDeleteModal: (type: 'task' | 'column' | 'board', id: number, name: string) => void
  closeDeleteModal: () => void
  
  setEditingColumn: (columnId: number | null) => void
  
  addColumn: (column: Column) => void
  updateColumn: (columnId: number, updates: Partial<Column>) => void
  removeColumn: (columnId: number) => void
  reorderColumns: (columnIds: number[]) => void
  
  addTask: (columnId: number, task: Task) => void
  updateTask: (taskId: number, updates: Partial<Task>) => void
  removeTask: (taskId: number) => void
  moveTask: (taskId: number, targetColumnId: number, newPosition: number) => void
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  board: null,
  isLoading: false,
  error: null,
  
  selectedTask: null,
  isTaskModalOpen: false,
  isColumnModalOpen: false,
  isDeleteModalOpen: false,
  deleteTarget: null,
  editingColumnId: null,
  
  setBoard: (board) => set({ board }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  openTaskModal: (task) => set({ isTaskModalOpen: true, selectedTask: task || null }),
  closeTaskModal: () => set({ isTaskModalOpen: false, selectedTask: null }),
  
  openColumnModal: () => set({ isColumnModalOpen: true }),
  closeColumnModal: () => set({ isColumnModalOpen: false }),
  
  openDeleteModal: (type, id, name) => set({ 
    isDeleteModalOpen: true, 
    deleteTarget: { type, id, name } 
  }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, deleteTarget: null }),
  
  setEditingColumn: (columnId) => set({ editingColumnId: columnId }),
  
  addColumn: (column) => {
    const { board } = get()
    if (!board) return
    
    set({
      board: {
        ...board,
        columns: [...board.columns, column],
      },
    })
  },
  
  updateColumn: (columnId, updates) => {
    const { board } = get()
    if (!board) return
    
    set({
      board: {
        ...board,
        columns: board.columns.map((col) =>
          col.id === columnId ? { ...col, ...updates } : col
        ),
      },
    })
  },
  
  removeColumn: (columnId) => {
    const { board } = get()
    if (!board) return
    
    set({
      board: {
        ...board,
        columns: board.columns.filter((col) => col.id !== columnId),
      },
    })
  },
  
  reorderColumns: (columnIds) => {
    const { board } = get()
    if (!board) return
    
    const columnMap = new Map(board.columns.map((col) => [col.id, col]))
    const reorderedColumns = columnIds
      .map((id, index) => {
        const column = columnMap.get(id)
        return column ? { ...column, position: index } : null
      })
      .filter((col): col is Column => col !== null)
    
    set({
      board: {
        ...board,
        columns: reorderedColumns,
      },
    })
  },
  
  addTask: (columnId, task) => {
    const { board } = get()
    if (!board) return
    
    set({
      board: {
        ...board,
        columns: board.columns.map((col) =>
          col.id === columnId
            ? { ...col, tasks: [...col.tasks, task], tasks_count: col.tasks_count + 1 }
            : col
        ),
      },
    })
  },
  
  updateTask: (taskId, updates) => {
    const { board } = get()
    if (!board) return
    
    set({
      board: {
        ...board,
        columns: board.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        })),
      },
    })
  },
  
  removeTask: (taskId) => {
    const { board } = get()
    if (!board) return
    
    set({
      board: {
        ...board,
        columns: board.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((task) => task.id !== taskId),
          tasks_count: col.tasks.some((t) => t.id === taskId)
            ? col.tasks_count - 1
            : col.tasks_count,
        })),
      },
    })
  },
  
  moveTask: (taskId, targetColumnId, newPosition) => {
    const { board } = get()
    if (!board) return
    
    let movedTask: Task | null = null
    let sourceColumnId: number | null = null
    
    for (const col of board.columns) {
      const task = col.tasks.find((t) => t.id === taskId)
      if (task) {
        movedTask = task
        sourceColumnId = col.id
        break
      }
    }
    
    if (!movedTask || sourceColumnId === null) return
    
    const newColumns = board.columns.map((col) => {
      if (col.id === sourceColumnId && col.id === targetColumnId) {
        const tasks = col.tasks.filter((t) => t.id !== taskId)
        tasks.splice(newPosition, 0, { ...movedTask!, column: targetColumnId, position: newPosition })
        return {
          ...col,
          tasks: tasks.map((t, idx) => ({ ...t, position: idx })),
        }
      }
      
      if (col.id === sourceColumnId) {
        return {
          ...col,
          tasks: col.tasks
            .filter((t) => t.id !== taskId)
            .map((t, idx) => ({ ...t, position: idx })),
          tasks_count: col.tasks_count - 1,
        }
      }
      
      if (col.id === targetColumnId) {
        const tasks = [...col.tasks]
        tasks.splice(newPosition, 0, { ...movedTask!, column: targetColumnId, position: newPosition })
        return {
          ...col,
          tasks: tasks.map((t, idx) => ({ ...t, position: idx })),
          tasks_count: col.tasks_count + 1,
        }
      }
      
      return col
    })
    
    set({
      board: {
        ...board,
        columns: newColumns,
      },
    })
  },
}))