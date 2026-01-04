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
  const board = useKanbanStore((state) => state.board)
  const isLoading = useKanbanStore((state) => state.isLoading)
  const isFetching = useKanbanStore((state) => state.isFetching)
  const error = useKanbanStore((state) => state.error)
  const selectedTask = useKanbanStore((state) => state.selectedTask)
  const isTaskModalOpen = useKanbanStore((state) => state.isTaskModalOpen)
  const isColumnModalOpen = useKanbanStore((state) => state.isColumnModalOpen)
  const isDeleteModalOpen = useKanbanStore((state) => state.isDeleteModalOpen)
  const deleteTarget = useKanbanStore((state) => state.deleteTarget)
  const editingColumnId = useKanbanStore((state) => state.editingColumnId)

  const actions = useKanbanStore((state) => ({
    setBoard: state.setBoard,
    setBoardWithCache: state.setBoardWithCache,
    setLoading: state.setLoading,
    setFetching: state.setFetching,
    setError: state.setError,
    openTaskModal: state.openTaskModal,
    closeTaskModal: state.closeTaskModal,
    openColumnModal: state.openColumnModal,
    closeColumnModal: state.closeColumnModal,
    openDeleteModal: state.openDeleteModal,
    closeDeleteModal: state.closeDeleteModal,
    setEditingColumn: state.setEditingColumn,
    addColumn: state.addColumn,
    updateColumn: state.updateColumn,
    removeColumn: state.removeColumn,
    reorderColumns: state.reorderColumns,
    addTask: state.addTask,
    updateTask: state.updateTask,
    removeTask: state.removeTask,
    moveTask: state.moveTask,
  }))

  const isMountedRef = useRef(true)
  const currentBoardIdRef = useRef(boardId)

  const fetchBoard = useCallback(async (id: number, isBackgroundRefresh = false) => {
    if (!isMountedRef.current || currentBoardIdRef.current !== id) return

    if (!isBackgroundRefresh) {
      const cached = cacheService.get<BoardDetail>(CacheKeys.board(id))
      if (cached) {
        actions.setBoard(cached)
        actions.setFetching(true)
      } else {
        actions.setLoading(true)
      }
    } else {
      actions.setFetching(true)
    }

    actions.setError(null)

    try {
      const response = await boardsApi.get(id)

      if (isMountedRef.current && currentBoardIdRef.current === id) {
        actions.setBoardWithCache(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch board:', error)
      
      if (isMountedRef.current && currentBoardIdRef.current === id) {
        const currentBoard = useKanbanStore.getState().board
        if (!currentBoard) {
          actions.setError('Failed to load board')
          toast.error('Failed to load board')
        }
      }
    } finally {
      if (isMountedRef.current && currentBoardIdRef.current === id) {
        actions.setLoading(false)
        actions.setFetching(false)
      }
    }
  }, [actions])

  useEffect(() => {
    isMountedRef.current = true
    currentBoardIdRef.current = boardId

    if (boardId) {
      fetchBoard(boardId)
    }

    return () => {
      isMountedRef.current = false
    }
  }, [boardId]) 

  useEffect(() => {
    const handleFocus = () => {
      const currentBoard = useKanbanStore.getState().board
      if (boardId && currentBoard && isMountedRef.current) {
        fetchBoard(boardId, true)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [boardId]) 

  const createColumn = useCallback(async (data: CreateColumnRequest) => {
    try {
      const response = await columnsApi.create(data)
      actions.addColumn({ ...response.data, tasks: [] })
      toast.success('Column created')
      actions.closeColumnModal()
    } catch (error) {
      console.error('Failed to create column:', error)
      toast.error('Failed to create column')
    }
  }, [actions])

  const updateColumn = useCallback(async (columnId: number, data: UpdateColumnRequest) => {
    try {
      await columnsApi.update(columnId, data)
      actions.updateColumn(columnId, data)
      actions.setEditingColumn(null)
      toast.success('Column updated')
    } catch (error) {
      console.error('Failed to update column:', error)
      toast.error('Failed to update column')
    }
  }, [actions])

  const deleteColumn = useCallback(async (columnId: number) => {
    try {
      await columnsApi.delete(columnId)
      actions.removeColumn(columnId)
      actions.closeDeleteModal()
      toast.success('Column deleted')
    } catch (error) {
      console.error('Failed to delete column:', error)
      toast.error('Failed to delete column')
    }
  }, [actions])

  const reorderColumns = useCallback(async (columnIds: number[]) => {
    const previousBoard = useKanbanStore.getState().board

    actions.reorderColumns(columnIds)

    try {
      await columnsApi.reorder({ column_ids: columnIds })
    } catch (error) {
      console.error('Failed to reorder columns:', error)
      toast.error('Failed to reorder columns')

      if (previousBoard) {
        actions.setBoard(previousBoard)
        cacheService.set(CacheKeys.board(previousBoard.id), previousBoard)
      }
    }
  }, [actions])

  const createTask = useCallback(async (data: CreateTaskRequest) => {
    try {
      const response = await tasksApi.create(data)
      actions.addTask(data.column, response.data)
      toast.success('Task created')
      actions.closeTaskModal()
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    }
  }, [actions])

  const updateTask = useCallback(async (taskId: number, data: UpdateTaskRequest) => {
    try {
      const response = await tasksApi.update(taskId, data)
      actions.updateTask(taskId, response.data)
      toast.success('Task updated')
      actions.closeTaskModal()
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    }
  }, [actions])

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await tasksApi.delete(taskId)
      actions.removeTask(taskId)
      actions.closeDeleteModal()
      toast.success('Task deleted')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }, [actions])

  const moveTask = useCallback(async (taskId: number, data: MoveTaskRequest) => {
    const previousBoard = useKanbanStore.getState().board

    actions.moveTask(taskId, data.column, data.position)

    try {
      await tasksApi.move(taskId, data)
    } catch (error) {
      console.error('Failed to move task:', error)
      toast.error('Failed to move task')

      if (previousBoard) {
        actions.setBoard(previousBoard)
        cacheService.set(CacheKeys.board(previousBoard.id), previousBoard)
      }
    }
  }, [actions])

  return {
    board,
    isLoading,
    isFetching,
    error,

    selectedTask,
    isTaskModalOpen,
    isColumnModalOpen,
    isDeleteModalOpen,
    deleteTarget,
    editingColumnId,

    openTaskModal: actions.openTaskModal,
    closeTaskModal: actions.closeTaskModal,
    openColumnModal: actions.openColumnModal,
    closeColumnModal: actions.closeColumnModal,
    openDeleteModal: actions.openDeleteModal,
    closeDeleteModal: actions.closeDeleteModal,
    setEditingColumn: actions.setEditingColumn,

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