import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { api } from '@/lib/api';
import type { AuthResponse, RegisterPayload, User, Wallet } from '@/lib/types';

const secureStorage = createJSONStorage(() => ({
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}));

const webStorage = createJSONStorage(() => ({
  getItem: (key) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: (key, value) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
}));

const storage = Platform.OS === 'web' ? webStorage : secureStorage;

interface AuthState {
  token: string | null;
  user: User | null;
  wallet: Wallet | null;
  status: 'idle' | 'authenticated' | 'guest';
  hydrated: boolean;
  setSession: (payload: AuthResponse) => void;
  setProfile: (user: User, wallet: Wallet) => void;
  updateWallet: (wallet: Wallet) => void;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      wallet: null,
      status: 'idle',
      hydrated: false,

      setSession: (payload) => {
        set({
          token: payload.token,
          user: payload.user,
          status: 'authenticated',
          hydrated: true,
        });
      },

      setProfile: (user, wallet) => {
        set({ user, wallet, status: 'authenticated' });
      },

      updateWallet: (wallet) => {
        set({ wallet });
      },

      logout: async () => {
        const token = get().token;
        if (token) {
          api
            .post('/auth/logout')
            .catch(() => undefined);
        }
        set({ token: null, user: null, wallet: null, status: 'guest' });
      },

      refreshMe: async () => {
        const { token } = get();
        if (!token) return;
        const { data } = await api.get<{ data: { user: User; wallet: Wallet } }>('/auth/me');
        get().setProfile(data.data.user, data.data.wallet);
      },
    }),
    {
      name: 'nivest-auth',
      storage,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        wallet: state.wallet,
        status: state.status,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hydrated: true });
      },
    },
  ),
);

export function loginRequest(payload: { phone: string; password: string; device_name: string }) {
  return api.post<{ data: AuthResponse }>('/auth/login', payload);
}

export function registerRequest(payload: RegisterPayload) {
  return api.post<{ data: AuthResponse }>('/auth/register', payload);
}
