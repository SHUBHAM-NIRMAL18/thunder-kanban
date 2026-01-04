import { useCallback, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { boardsApi } from '@/api/endpoints/boards'
import { columnsApi } from '@/api/endpoints/columns'
import { tasksApi } from '@/api/endpoints/tasks'
import { useKanbanStore } from '../store/kanbanStore'
import { cacheService } from '@/services/cache.service'
import { CacheKeys } from '@/services/cache.keys'
import type { CreateTaskRequest, UpdateTaskRequest, MoveTaskRequest } from '@/api/endpoints/tasks'
import type { CreateColumnRequest, UpdateColumnRequest } from '@/api/endpoints/columns'
import type { BoardDetail } from '@/api/endpoints/boards'

export const useKanban = (boardId: number) => {
  const store = useKanbanStore()
  const previousBoardRef = useRef<BoardDetail | null>(null)

  const fetchBoard = useCallback(async (id: number, isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      const cached = cacheService.get<BoardDetail>(CacheKeys.board(id))
      if (cached) {
        store.setBoard(cached)
        store.setFetching(true)
      } else {
        store.setLoading(true)
      }
    } else {
      store.setFetching(true)
    }

    store.setError(null)

    try {
      const response = await boardsApi.get(id)
      store.setBoardWithCache(response.data)
    } catch (error) {
      console.error('Failed to fetch board:', error)
      if (!store.board) {
        store.setError('Failed to load board')
        toast.error('Failed to load board')
      }
    } finally {
      store.setLoading(false)
      store.setFetching(false)
    }
  }, [store])

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId)
    }

    return () => {
      store.setBoard(null)
      store.setLoading(false)
      store.setFetching(false)
      store.setError(null)
    }
  }, [boardId, fetchBoard])

  useEffect(() => {
    const handleFocus = () => {
      if (boardId && store.board) {
        fetchBoard(boardId, true)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [boardId, fetchBoard, store.board])

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
  }, [store])

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
  }, [store])

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
  }, [store])

  const reorderColumns = useCallback(async (columnIds: number[]) => {
    const previousBoard = store.board
    store.reorderColumns(columnIds)

    try {
      await columnsApi.reorder({ column_ids: columnIds })
    } catch (error) {
      console.error('Failed to reorder columns:', error)
      toast.error('Failed to reorder columns')

      if (previousBoard) {
        store.setBoard(previousBoard)
        cacheService.set(CacheKeys.board(previousBoard.id), previousBoard)
      }
    }
  }, [store])

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
  }, [store])

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
  }, [store])

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
  }, [store])

  const moveTask = useCallback(async (taskId: number, data: MoveTaskRequest) => {
    previousBoardRef.current = store.board
    store.moveTask(taskId, data.column, data.position)

    try {
      await tasksApi.move(taskId, data)
    } catch (error) {
      console.error('Failed to move task:', error)
      toast.error('Failed to move task')

      if (previousBoardRef.current) {
        store.setBoard(previousBoardRef.current)
        cacheService.set(CacheKeys.board(previousBoardRef.current.id), previousBoardRef.current)
        previousBoardRef.current = null
      }
    }
  }, [store])

  return {
    board: store.board,
    isLoading: store.isLoading,
    isFetching: store.isFetching,
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