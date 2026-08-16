import { create as createAxios, isAxiosError, type AxiosError } from 'axios';
import { Platform } from 'react-native';

import { useAuthStore } from '@/store/auth';

const DEFAULT_BASE_URL = Platform.select({
  web: 'http://127.0.0.1:8080/api/v1',
  android: 'http://10.0.2.2:8080/api/v1',
  default: 'http://127.0.0.1:8080/api/v1',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_BASE_URL;

export const api = createAxios({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const e = error as AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>;
    const data = e.response?.data;
    if (data) {
      const firstError = data.errors ? Object.values(data.errors)[0]?.[0] : undefined;
      return firstError ?? data.message ?? e.message;
    }
    if (e.code === 'ECONNABORTED') {
      return 'Waktu permintaan habis. Periksa koneksi anda.';
    }
    if (!e.response) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet.';
    }
    return e.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Terjadi kesalahan yang tidak diketahui.';
}

export function isUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}

export function handleLogoutOn401(error: unknown): void {
  if (isUnauthorized(error)) {
    useAuthStore.getState().logout();
  }
}
