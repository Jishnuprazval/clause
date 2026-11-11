import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach Authorization header
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('clauseradar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to handle 401 unauth
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Don't auto-clear on login/register failures
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('clauseradar_token');
        localStorage.removeItem('clauseradar_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
