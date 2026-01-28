import { Outlet } from 'react-router-dom';

export const AuthLayout = () => (
  <main
    aria-label="Authentication"
    className="flex min-h-screen items-center justify-center"
  >
    <Outlet />
  </main>
);
