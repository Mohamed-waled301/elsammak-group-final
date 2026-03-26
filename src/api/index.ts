import axios from 'axios';
import { mockSubmitContact, fetchCourses as mockFetchCourses } from './mockData';

// NOTE (production/Vercel): avoid hardcoding any external or localhost API.
// If/when a backend exists, configure it via VITE_API_URL (same convention as `src/api/client.ts`).
const API_BASE_URL_RAW = (import.meta as any).env?.VITE_API_URL || '';
const API_BASE_URL = String(API_BASE_URL_RAW).replace(/\/+$/, '').replace(/\/api$/i, '');
const API = axios.create({ baseURL: API_BASE_URL });

// Toggle this flag to use real API or Mock data
const USE_MOCK = true;

// Courses endpoints
export const getCourses = async () => {
 if (USE_MOCK) return mockFetchCourses();
 const response = await API.get('/courses');
 return response.data;
};

// Contact endpoints
export const submitContactForm = async (formData: unknown) => {
 if (USE_MOCK) return mockSubmitContact(formData);
 const response = await API.post('/contact', formData);
 return response.data;
};
