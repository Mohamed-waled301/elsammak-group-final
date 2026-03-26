import { apiClient } from './client';

export const fetchUsers = async () => {
  const res = await apiClient.get('/api/admin/users');
  return res.data;
};

export const fetchUserById = async (id: string) => {
  const res = await apiClient.get(`/api/admin/users/${id}`);
  return res.data;
};
