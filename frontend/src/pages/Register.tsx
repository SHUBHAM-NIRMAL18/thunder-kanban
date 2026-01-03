import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { useAuth } from '@/features/auth/hooks/useAuth'

export const Register = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link to="/" className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-100 p-3">
              <span className="text-3xl">⚡</span>
            </div>
          </Link>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Get started with Thunder in seconds</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}