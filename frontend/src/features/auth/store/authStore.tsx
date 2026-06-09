import { create } from 'zustand'
import { cacheService } from '@/services/cache.service'
import { authApi } from '@/api/endpoints/auth'
import type { User } from '../../../api/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  showSessionExpired: boolean
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setShowSessionExpired: (show: boolean) => void
  login: (user: User, tokens: { access: string }) => void
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  showSessionExpired: false,

  setUser: (user) => set({ user }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setShowSessionExpired: (show) => set({ showSessionExpired: show }),

  login: (user, tokens) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, accessToken: tokens.access, isAuthenticated: true })
  },

  logout: async () => {
    cacheService.clearUserCache()
    localStorage.removeItem('user')
    set({ user: null, accessToken: null, isAuthenticated: false })
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Backend logout failed:', err)
    }
  },

  initialize: async () => {
    try {
      set({ isInitializing: true })
      const response = await authApi.refreshToken()
      const { user, tokens } = response.data
      set({ 
        user, 
        accessToken: tokens.access, 
        isAuthenticated: true, 
        isInitializing: false 
      })
    } catch {
      cacheService.clearAllCache()
      localStorage.removeItem('user')
      set({ 
        user: null, 
        accessToken: null, 
        isAuthenticated: false, 
        isInitializing: false 
      })
    }
  },
}))