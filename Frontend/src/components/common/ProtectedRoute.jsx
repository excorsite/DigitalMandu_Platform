import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated } = useAuthStore();
  const { userRole } = useUIStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" replace />;
  return children;
}
