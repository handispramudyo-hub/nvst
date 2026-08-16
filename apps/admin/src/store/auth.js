import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (data) => set({ token: data.token, user: data.user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'nivest-admin' },
  ),
);
