import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '@shared/contracts/auth.api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, roles, redirectTo = '/auth' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const home =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'partner_doctor'
          ? '/partner'
          : user.role === 'advisor'
            ? '/advisor'
            : '/discover';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
