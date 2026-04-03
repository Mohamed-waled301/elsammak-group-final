import { delay } from './mockData';

export async function submitBooking(_payload: Record<string, unknown>) {
  await delay(500);
  return { success: true, message: 'Booking recorded (demo)' };
}
