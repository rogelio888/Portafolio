import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { fitscanMockAdapter } from './mockAdapter';

export const api = axios.create({
  baseURL: '/api',
  adapter: fitscanMockAdapter,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('fitscan_token');
    const isPublicAuthRoute = config.url?.includes('/auth/login');

    if (token && config.headers && !isPublicAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;

      if (!config.headers['X-Branch-Id']) {
        const activeBranchId = localStorage.getItem('fitscan_active_branch_id');
        if (activeBranchId && (activeBranchId === 'all' || UUID_REGEX.test(activeBranchId))) {
          config.headers['X-Branch-Id'] = activeBranchId;
        }
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('fitscan_token');
        localStorage.removeItem('fitscan_user');
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
