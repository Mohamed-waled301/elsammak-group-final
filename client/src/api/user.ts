import { delay } from './mockData';

export async function updateMe(data: { name?: string; email?: string; phone?: string }) {
  await delay(300);
  try {
    const raw = localStorage.getItem('user_data');
    const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const next = {
      ...prev,
      name: data.name ?? prev.name,
      email: data.email ?? prev.email,
      phone: data.phone ?? prev.phone,
    };
    localStorage.setItem('user_data', JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return { success: true, message: 'Saved (demo)' };
}
