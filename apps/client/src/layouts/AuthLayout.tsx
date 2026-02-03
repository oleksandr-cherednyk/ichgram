import { Navigate, Outlet } from 'react-router-dom';

import { Toaster } from '../components/ui/sonner';
import { useAuthStore } from '../stores/auth';

export const AuthLayout = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main
      aria-label="Authentication"
      className="flex min-h-screen items-center justify-center"
    >
      <Outlet />
      <Toaster />
    </main>
  );
};
