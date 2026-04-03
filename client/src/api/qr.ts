import { api } from './client';

export type QrApiResponse = {
  success: boolean;
  message: string;
  dataUrl?: string;
  base64?: string;
};

export async function generateQr(text: string): Promise<QrApiResponse> {
  const { data } = await api.post<QrApiResponse>('/api/qr', { text });
  return data;
}
