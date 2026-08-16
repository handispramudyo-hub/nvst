import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      wallet: null,
      setAuth: (data) => set({ token: data.token, user: data.user }),
      setWallet: (wallet) => set({ wallet }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null, wallet: null }),
    }),
    { name: 'nivest-auth-web' },
  ),
);
