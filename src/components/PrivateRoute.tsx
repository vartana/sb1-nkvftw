import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}