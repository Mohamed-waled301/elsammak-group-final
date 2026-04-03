import { api } from './client';

export type ContactPayload = { name: string; email: string; subject: string; message: string };

export type ContactApiResponse = {
  success: boolean;
  message: string;
  id?: string;
  emailSent?: boolean;
  emailWarning?: string;
};

export async function sendContactMessage(payload: ContactPayload): Promise<ContactApiResponse> {
  const { data } = await api.post<ContactApiResponse>('/api/contact', {
    name: payload.name,
    email: payload.email,
    message: payload.message,
    subject: payload.subject || undefined,
  });
  return data;
}
