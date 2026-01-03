import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/api/endpoints/auth'
import { useAuthStore } from '../store/authStore'
import type { RegisterFormData } from '../schemas/authSchemas'

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const response = await authApi.register(data)
      login(response.data.user, response.data.tokens)
      toast.success('Registration successful!')
      navigate('/dashboard')
    } catch (error: unknown) {
      console.error('Registration error:', error)
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errors?: Array<{ detail: string }> } } }
        const errors = axiosError.response?.data?.errors
        if (errors && errors.length > 0) {
          errors.forEach((err) => {
            toast.error(err.detail)
          })
        } else {
          toast.error('Registration failed. Please try again.')
        }
      } else {
        toast.error('Network error. Please check your connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { handleRegister, isLoading }
}