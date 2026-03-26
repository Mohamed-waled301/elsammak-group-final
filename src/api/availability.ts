import { apiClient } from './client';

export const getAvailability = async (params: { serviceType: string; month: string }) => {
  const res = await apiClient.get('/api/bookings/availability', { params });
  return res.data as { success: boolean; threshold: number; unavailableDates: string[] };
};

