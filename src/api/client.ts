import axios from 'axios';

// Centralized API base URL for all frontend API calls.
// Auth endpoints use absolute paths like "/api/auth/login", so this base should NOT include "/api".
// Default to same-origin so Vite proxy can route /api in development.
const API_BASE_URL_RAW = import.meta.env.VITE_API_URL || '';

// Normalize: remove trailing slashes and an accidental "/api" suffix.
const API_BASE_URL = API_BASE_URL_RAW
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');

export const apiClient = axios.create({
 baseURL: API_BASE_URL,
 headers: {
 'Content-Type': 'application/json',
 },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
 // Hook for adding auth tokens in the future
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore storage read errors
  }
  return config;
});

apiClient.interceptors.response.use(
 (response) => response,
 (error) => {
 // Global error handling
 console.error('API Error:', error);
 return Promise.reject(error);
 }
);
