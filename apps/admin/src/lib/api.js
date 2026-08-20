import axios from 'axios';
import { useAuthStore } from '../store/auth';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const api = axios.create({
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

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const current = window.location.pathname;
      if (current !== '/login') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      const first = data.errors ? Object.values(data.errors)[0]?.[0] : undefined;
      return first ?? data.message ?? error.message;
    }
    if (error.code === 'ECONNABORTED') return 'Waktu permintaan habis. Periksa koneksi anda.';
    if (!error.response) return 'Tidak dapat terhubung ke server. Periksa koneksi internet.';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan yang tidak diketahui.';
}

export function isUnauthorized(error) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function handleLogoutOn401(error) {
  if (isUnauthorized(error)) {
    useAuthStore.getState().logout();
  }
}
