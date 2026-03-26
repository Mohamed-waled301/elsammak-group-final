import axios from 'axios';
import { mockSubmitContact, fetchCourses as mockFetchCourses } from './mockData';

// Replace base URL when backend is ready
const API = axios.create({ baseURL: 'https://api.elsammak-group.com/v1' });

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
