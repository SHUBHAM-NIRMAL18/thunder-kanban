import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { boardsApi } from '@/api/endpoints/boards'
import { columnsApi } from '@/api/endpoints/columns'
import { tasksApi } from '@/api/endpoints/tasks'
import { useKanbanStore } from '../store/kanbanStore'
import type { CreateTaskRequest, UpdateTaskRequest, MoveTaskRequest } from '@/api/endpoints/tasks'
import type { CreateColumnRequest, UpdateColumnRequest } from '@/api/endpoints/columns'

export const useKanban = () => {
  const store = useKanbanStore()
  
  const fetchBoard = useCallback(async (boardId: number) => {
    store.setLoading(true)
    store.setError(null)
    
    try {
      const response = await boardsApi.get(boardId)
      store.setBoard(response.data)
    } catch (error) {
      console.error('Failed to fetch board:', error)
      store.setError('Failed to load board')
      toast.error('Failed to load board')
    } finally {
      store.setLoading(false)
    }
  }, [])
  
  const createColumn = useCallback(async (data: CreateColumnRequest) => {
    try {
      const response = await columnsApi.create(data)
      store.addColumn({ ...response.data, tasks: [] })
      toast.success('Column created')
      store.closeColumnModal()
    } catch (error) {
      console.error('Failed to create column:', error)
      toast.error('Failed to create column')
    }
  }, [])
  
  const updateColumn = useCallback(async (columnId: number, data: UpdateColumnRequest) => {
    try {
      await columnsApi.update(columnId, data)
      store.updateColumn(columnId, data)
      store.setEditingColumn(null)
      toast.success('Column updated')
    } catch (error) {
      console.error('Failed to update column:', error)
      toast.error('Failed to update column')
    }
  }, [])
  
  const deleteColumn = useCallback(async (columnId: number) => {
    try {
      await columnsApi.delete(columnId)
      store.removeColumn(columnId)
      store.closeDeleteModal()
      toast.success('Column deleted')
    } catch (error) {
      console.error('Failed to delete column:', error)
      toast.error('Failed to delete column')
    }
  }, [])
  
  const reorderColumns = useCallback(async (columnIds: number[]) => {
    const previousColumns = store.board?.columns || []
    
    store.reorderColumns(columnIds)
    
    try {
      await columnsApi.reorder({ column_ids: columnIds })
    } catch (error) {
      console.error('Failed to reorder columns:', error)
      toast.error('Failed to reorder columns')
      
      if (store.board) {
        store.setBoard({ ...store.board, columns: previousColumns })
      }
    }
  }, [store.board])
  
  const createTask = useCallback(async (data: CreateTaskRequest) => {
    try {
      const response = await tasksApi.create(data)
      store.addTask(data.column, response.data)
      toast.success('Task created')
      store.closeTaskModal()
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    }
  }, [])
  
  const updateTask = useCallback(async (taskId: number, data: UpdateTaskRequest) => {
    try {
      const response = await tasksApi.update(taskId, data)
      store.updateTask(taskId, response.data)
      toast.success('Task updated')
      store.closeTaskModal()
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    }
  }, [])
  
  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await tasksApi.delete(taskId)
      store.removeTask(taskId)
      store.closeDeleteModal()
      toast.success('Task deleted')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }, [])
  
  const moveTask = useCallback(async (taskId: number, data: MoveTaskRequest) => {
    const previousBoard = store.board
    
    store.moveTask(taskId, data.column, data.position)
    
    try {
      await tasksApi.move(taskId, data)
    } catch (error) {
      console.error('Failed to move task:', error)
      toast.error('Failed to move task')
      
      if (previousBoard) {
        store.setBoard(previousBoard)
      }
    }
  }, [store.board])
  
  return {
    board: store.board,
    isLoading: store.isLoading,
    error: store.error,
    
    selectedTask: store.selectedTask,
    isTaskModalOpen: store.isTaskModalOpen,
    isColumnModalOpen: store.isColumnModalOpen,
    isDeleteModalOpen: store.isDeleteModalOpen,
    deleteTarget: store.deleteTarget,
    editingColumnId: store.editingColumnId,
    
    openTaskModal: store.openTaskModal,
    closeTaskModal: store.closeTaskModal,
    openColumnModal: store.openColumnModal,
    closeColumnModal: store.closeColumnModal,
    openDeleteModal: store.openDeleteModal,
    closeDeleteModal: store.closeDeleteModal,
    setEditingColumn: store.setEditingColumn,
    
    fetchBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  }
}