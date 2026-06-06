import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canAccessPath, getRoleHome } from '../utils/roleAccess'

function RouteSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )
}

/** Strip trailing slashes so `/admin/` matches `/admin` on Vercel and elsewhere */
export function TrailingSlashRedirect() {
  const location = useLocation()

  if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
    return (
      <Navigate
        to={{
          pathname: location.pathname.replace(/\/+$/, ''),
          search: location.search,
          hash: location.hash,
        }}
        replace
      />
    )
  }

  return null
}

export function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) return <RouteSpinner />

  return <Navigate to={user ? getRoleHome(user.role) : '/discover'} replace />
}

export function NotFoundRedirect() {
  const { user, loading } = useAuth()

  if (loading) return <RouteSpinner />

  return <Navigate to={user ? getRoleHome(user.role) : '/discover'} replace />
}

/** After login, return to the page the user originally requested when allowed */
export function getPostAuthPath(userRole: Parameters<typeof getRoleHome>[0], from?: string): string {
  if (from && canAccessPath(from, userRole)) {
    return from
  }
  return getRoleHome(userRole)
}
