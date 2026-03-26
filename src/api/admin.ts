import type { AxiosResponse } from 'axios';
import { apiClient } from './client';

export type ClientSummaryResponse = {
  success: boolean;
  count: number;
  data: Array<{
    client: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      qrCode: string | null;
      qrValue: string | null;
    };
    trainingsCount: number;
    consultationsCount: number;
  }>;
};

export const fetchClientsSummary = async (params: { search?: string; filter?: string } = {}) => {
  const res = await apiClient.get('/api/admin/clients/summary', {
    params: {
      search: params.search || '',
      filter: params.filter || 'all',
    },
  });
  return res.data;
};

export const fetchClientDetails = async (id: string) => {
  const res = await apiClient.get(`/api/admin/users/${id}`);
  return res.data;
};

export const downloadAllClientsPDF = async (params: { search?: string } = {}) => {
  const res: AxiosResponse<Blob> = await apiClient.get('/api/admin/clients/download-pdf', {
    params: { search: params.search || '' },
    responseType: 'blob',
  });
  return res.data;
};

export const downloadClientPDF = async (id: string) => {
  const res: AxiosResponse<Blob> = await apiClient.get(`/api/admin/users/${id}/download`, {
    responseType: 'blob',
  });
  return res.data;
};

