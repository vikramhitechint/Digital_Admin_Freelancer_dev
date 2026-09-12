import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser, AuthSession } from '@/types/api.types';

interface AuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  requires2FA: boolean;
  setSession: (session: AuthSession) => void;
  setRequires2FA: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      requires2FA: false,

      setSession: (session) => {
        localStorage.setItem('htge_admin_token', session.token);
        set({
          admin: session.admin,
          token: session.token,
          isAuthenticated: true,
          requires2FA: false,
        });
      },

      setRequires2FA: (val) => set({ requires2FA: val }),

      logout: () => {
        localStorage.removeItem('htge_admin_token');
        localStorage.removeItem('htge_admin_user');
        set({ admin: null, token: null, isAuthenticated: false, requires2FA: false });
      },
    }),
    {
      name: 'htge_admin_auth',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
