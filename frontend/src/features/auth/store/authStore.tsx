import { create } from 'zustand'
import { cacheService } from '@/services/cache.service'
import type { User } from '../../../api/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  showSessionExpired: boolean
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setShowSessionExpired: (show: boolean) => void
  login: (user: User, tokens: { access: string; refresh: string }) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  showSessionExpired: false,

  setUser: (user) => set({ user }),

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setShowSessionExpired: (show) => set({ showSessionExpired: show }),

  login: (user, tokens) => {
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    cacheService.clearUserCache()
    
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  },

  initialize: () => {
    const userStr = localStorage.getItem('user')
    const accessToken = localStorage.getItem('access_token')

    if (userStr && accessToken) {
      try {
        const user = JSON.parse(userStr)
        set({ user, isAuthenticated: true })
      } catch {
        cacheService.clearAllCache()
        localStorage.clear()
        set({ user: null, isAuthenticated: false })
      }
    }
  },
}))