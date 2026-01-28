import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      setAccessToken: (token) =>
        set({ accessToken: token, isAuthenticated: Boolean(token) }),
      clear: () => set({ accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
