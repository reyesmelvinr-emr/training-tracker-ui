import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL as string;
const useMocks = import.meta.env.VITE_USE_API_MOCKS === 'true';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Error', error);
    }
    return Promise.reject(error);
  }
);

// Mock/Live API toggle helper
export function maybeMock<T>(mockData: T, fn: () => Promise<T>): Promise<T> {
  if (useMocks) {
    return new Promise((resolve) => setTimeout(() => resolve(mockData), 300));
  }
  return fn();
}
