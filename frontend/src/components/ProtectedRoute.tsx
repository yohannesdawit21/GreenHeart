import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type AppRole = 'client' | 'advisor' | 'partner_doctor' | 'admin'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: AppRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role as AppRole)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'partner_doctor') return <Navigate to="/partner" replace />
    if (user.role === 'advisor') return <Navigate to="/advisor" replace />
    return <Navigate to="/discover" replace />
  }

  return <>{children}</>
}
