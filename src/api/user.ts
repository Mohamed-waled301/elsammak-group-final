import { apiClient } from './client';

export const updateMe = async (data: { name?: string; email?: string; phone?: string }) => {
  const res = await apiClient.put('/api/users/me', data);
  return res.data;
};

