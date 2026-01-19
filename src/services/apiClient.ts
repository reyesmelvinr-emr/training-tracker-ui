import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5115';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add correlation ID to all requests
api.interceptors.request.use((config) => {
  config.headers['X-Correlation-Id'] = crypto.randomUUID();
  return config;
});

export const coursesApi = {
  getAll: async (page = 1, pageSize = 20) => {
    const response = await api.get('/api/courses', { params: { page, pageSize } });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/courses/${id}`);
    return response.data;
  },
  
  create: async (course: {
    title: string;
    isRequired: boolean;
    isActive: boolean;
    validityMonths?: number | null;
    category?: string | null;
    description?: string | null;
  }) => {
    const response = await api.post('/api/courses', course);
    return response.data;
  },
  
  update: async (id: string, course: {
    title: string;
    isRequired: boolean;
    isActive: boolean;
    validityMonths?: number | null;
    category?: string | null;
    description?: string | null;
  }) => {
    const response = await api.put(`/api/courses/${id}`, course);
    return response.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/api/courses/${id}`);
  },
};

export const usersApi = {
  getAll: async (page = 1, pageSize = 20) => {
    const response = await api.get('/api/users', { params: { page, pageSize } });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },
  
  create: async (user: {
    email: string;
    fullName: string;
    isActive: boolean;
  }) => {
    const response = await api.post('/api/users', user);
    return response.data;
  },
  
  update: async (id: string, user: {
    email: string;
    fullName: string;
    isActive: boolean;
  }) => {
    const response = await api.put(`/api/users/${id}`, user);
    return response.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/api/users/${id}`);
  },
};

export default api;
