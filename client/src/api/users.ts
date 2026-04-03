import { adminApiFetch } from './adminFetch';
import type { UserData } from '../context/AuthContext';

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  trainings: unknown[];
  consultations: unknown[];
  trainingsCount: number;
  consultationsCount: number;
  createdAt: string | null;
  emailVerified?: boolean;
};

export async function fetchUsers(): Promise<{ data: AdminUserRow[] }> {
  const res = await adminApiFetch('/clients');
  const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string; data?: unknown[] };
  if (res.status === 401 || res.status === 403) {
    throw new Error(typeof json.message === 'string' ? json.message : 'Not authorized');
  }
  if (!res.ok) {
    throw new Error(typeof json.message === 'string' ? json.message : `Request failed (${res.status})`);
  }
  const rows = Array.isArray(json.data) ? json.data : [];
  const data: AdminUserRow[] = rows.map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: row.phone != null && String(row.phone) !== '' ? String(row.phone) : null,
    trainings: [],
    consultations: [],
    trainingsCount: Number(row.trainingsCount) || 0,
    consultationsCount: Number(row.consultationsCount) || 0,
    createdAt: row.createdAt != null ? String(row.createdAt) : null,
    emailVerified: row.emailVerified === true,
  }));
  return { data };
}

export async function fetchUserById(id: string): Promise<UserData | null> {
  const res = await adminApiFetch(`/clients/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const json = (await res.json().catch(() => ({}))) as {
    data?: { user?: Record<string, unknown> };
  };
  const u = json.data?.user;
  if (!u) return null;
  return {
    id: String(u._id ?? id),
    name: String(u.name ?? ''),
    email: String(u.email ?? ''),
    picture: u.picture != null ? String(u.picture) : undefined,
    phone: u.phone != null ? String(u.phone) : undefined,
    role: 'client',
    nationalId: u.nationalId != null ? String(u.nationalId) : undefined,
    governorate: u.governorate != null ? String(u.governorate) : undefined,
    city: u.city != null ? String(u.city) : undefined,
  };
}
