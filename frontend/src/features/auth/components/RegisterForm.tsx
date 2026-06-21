import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '../schemas/authSchemas'
import { useRegister } from '../hooks/useRegister'

export const RegisterForm = () => {
  const { handleRegister, isLoading } = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const location = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => {
    handleRegister(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* First Name & Last Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="first_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            First Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="h-4 w-4" />
            </div>
            <input
              id="first_name"
              type="text"
              placeholder="John"
              {...register('first_name')}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border ${
                errors.first_name ? 'border-red-500/80 focus:ring-red-500/20' : 'border-white/10 focus:border-violet-500/80 focus:ring-violet-500/20'
              } rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>
          {errors.first_name && (
            <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="last_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Last Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="h-4 w-4" />
            </div>
            <input
              id="last_name"
              type="text"
              placeholder="Doe"
              {...register('last_name')}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border ${
                errors.last_name ? 'border-red-500/80 focus:ring-red-500/20' : 'border-white/10 focus:border-violet-500/80 focus:ring-violet-500/20'
              } rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>
          {errors.last_name && (
            <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border ${
              errors.email ? 'border-red-500/80 focus:ring-red-500/20' : 'border-white/10 focus:border-violet-500/80 focus:ring-violet-500/20'
            } rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        </div>
        {errors.email && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
            disabled={isLoading}
            className={`w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border ${
              errors.password ? 'border-red-500/80 focus:ring-red-500/20' : 'border-white/10 focus:border-violet-500/80 focus:ring-violet-500/20'
            } rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <label htmlFor="password2" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password2"
            type={showPassword2 ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password2')}
            disabled={isLoading}
            className={`w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border ${
              errors.password2 ? 'border-red-500/80 focus:ring-red-500/20' : 'border-white/10 focus:border-violet-500/80 focus:ring-violet-500/20'
            } rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <button
            type="button"
            onClick={() => setShowPassword2(!showPassword2)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password2 && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.password2.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Redirect Link */}
      <p className="text-center text-xs text-slate-400 mt-4">
        Already have an account?{' '}
        <Link 
          to="/login" 
          state={location.state}
          className="text-violet-400 hover:text-violet-300 font-semibold hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}