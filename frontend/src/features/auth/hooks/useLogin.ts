import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/api/endpoints/auth'
import { useAuthStore } from '../store/authStore'
import type { LoginFormData } from '../schemas/authSchemas'

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(data)
      login(response.data.user, response.data.tokens)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error: unknown) {
      console.error('Login error:', error)
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errors?: Array<{ detail: string }> } } }
        const errors = axiosError.response?.data?.errors
        if (errors && errors.length > 0) {
          errors.forEach((err) => {
            toast.error(err.detail)
          })
        } else {
          toast.error('Invalid email or password.')
        }
      } else {
        toast.error('Network error. Please check your connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading }
}