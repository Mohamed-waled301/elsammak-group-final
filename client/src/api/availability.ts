import { delay } from './mockData';

export async function getAvailability(_params: { serviceType?: string; month: string }) {
  await delay(200);
  return { unavailableDates: [] as string[], month: _params.month };
}
