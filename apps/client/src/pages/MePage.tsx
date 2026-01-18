import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../stores/auth';

export const MePage = () => {
  const { isAuthenticated, clear } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    clear();
    navigate('/login');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-zinc-900">
      <section className="w-full max-w-md rounded-xl border border-[#DBDBDB] bg-white px-8 py-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Me</h1>
        <p className="mt-2 text-sm text-[#737373]">
          {isAuthenticated ? 'You are logged in.' : 'Not authenticated yet.'}
        </p>
        {isAuthenticated ? (
          <Button className="mt-6 w-full" onClick={handleLogout}>
            Log out
          </Button>
        ) : null}
      </section>
    </main>
  );
};
