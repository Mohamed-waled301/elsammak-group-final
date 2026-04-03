import { getApiBaseUrl } from '../config/api';

function trainingBookingUrl() {
  const base = getApiBaseUrl();
  return base ? `${base.replace(/\/$/, '')}/api/training/booking` : '/api/training/booking';
}

export type TrainingBookingPayload = {
  name: string;
  email: string;
  phone: string;
  course: string;
  bookingDate: string;
  governorate: string;
  city: string;
};

export async function submitTrainingBooking(payload: TrainingBookingPayload) {
  const res = await fetch(trainingBookingUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    mode: 'cors',
  });
  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    emailSent?: boolean;
    emailWarning?: string;
  };
  if (!res.ok) {
    const msg = typeof data.message === 'string' ? data.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
