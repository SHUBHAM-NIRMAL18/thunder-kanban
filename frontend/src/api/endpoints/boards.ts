import api from '../client'
import type { ApiResponse } from '../types'

export interface Board {
  id: number
  name: string
  description: string
  is_archived: boolean
  owner: string
  owner_name: string
  columns_count: number
  tasks_count: number
  created_at: string
  updated_at: string
}

export interface Column {
  id: number
  board: number
  board_name: string
  name: string
  position: number
  tasks_count: number
  tasks: Task[]
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  column: number
  column_name: string
  board_id: number
  board_name: string
  title: string
  description: string
  position: number
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  is_overdue: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface BoardDetail extends Board {
  columns: Column[]
}

export interface CreateBoardRequest {
  name: string
  description?: string
}

export interface UpdateBoardRequest {
  name?: string
  description?: string
}

export const boardsApi = {
  list: async () => {
    const response = await api.get<ApiResponse<Board[]>>('/boards/')
    return response.data
  },

  get: async (id: number) => {
    const response = await api.get<ApiResponse<BoardDetail>>(`/boards/${id}/`)
    return response.data
  },

  create: async (data: CreateBoardRequest) => {
    const response = await api.post<ApiResponse<BoardDetail>>('/boards/', data)
    return response.data
  },

  update: async (id: number, data: UpdateBoardRequest) => {
    const response = await api.patch<ApiResponse<Board>>(`/boards/${id}/`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/boards/${id}/`)
    return response.data
  },

  duplicate: async (id: number) => {
    const response = await api.post<ApiResponse<BoardDetail>>(`/boards/${id}/duplicate/`)
    return response.data
  },
}