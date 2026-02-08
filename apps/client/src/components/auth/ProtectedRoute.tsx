import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { refreshAccessToken } from '../../lib/api';
import { isTokenExpired } from '../../lib/jwt';
import { useAuthStore } from '../../stores/auth';
import { Spinner } from '../ui/spinner';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

/**
 * Wrapper that redirects to /login if user is not authenticated.
 * Checks token expiry and attempts refresh before rendering.
 */
export const ProtectedRoute = () => {
  const { accessToken, setAccessToken, clear } = useAuthStore();
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    const checkAuth = async () => {
      // Token exists and not expired - authenticated
      if (accessToken && !isTokenExpired(accessToken)) {
        setStatus('authenticated');
        return;
      }

      // No token or expired token - try to refresh via cookie
      const newToken = await refreshAccessToken();

      if (newToken) {
        setAccessToken(newToken);
        setStatus('authenticated');
      } else {
        clear();
        setStatus('unauthenticated');
      }
    };

    checkAuth();
  }, [accessToken, setAccessToken, clear]);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
