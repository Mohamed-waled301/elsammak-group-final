// import { apiClient } from './client';

export interface ContactFormData {
 name: string;
 email: string;
 subject: string;
 message: string;
}

/**
 * Submits the contact form to the backend.
 * Currently stubbed to simulate network delay.
 */
export const submitContactForm = async (data: ContactFormData) => {
 // Real implementation: return apiClient.post('/contact', data);
 console.log('Stub: Submitting contact form', data);
 return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'Message sent!' }), 1000));
};

/**
 * Fetches available professional services.
 * Currently stubbed.
 */
export const fetchServices = async () => {
 // Real implementation: return apiClient.get('/services');
 console.log('Stub: Fetching services list');
 return new Promise((resolve) => setTimeout(() => resolve([]), 500));
};

/**
 * Fetches available training courses.
 * Currently stubbed.
 */
export const fetchTrainingCourses = async () => {
 // Real implementation: return apiClient.get('/courses');
 console.log('Stub: Fetching training courses');
 return new Promise((resolve) => setTimeout(() => resolve([]), 500));
};
