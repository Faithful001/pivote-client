import { type ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMe } from '../api/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { data: user, isLoading } = useMe();

  // Simple client-side token presence validation
  useEffect(() => {
    if (!token) {
      navigate({ to: '/login' });
    }
  }, [token, navigate]);

  // Admin route check
  useEffect(() => {
    if (token && !isLoading && requireAdmin && user && user.role !== 'admin') {
      navigate({ to: '/' });
    }
  }, [token, isLoading, requireAdmin, user, navigate]);

  if (!token || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  if (requireAdmin && user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
