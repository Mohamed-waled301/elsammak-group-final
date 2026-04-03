import { getApiBaseUrl } from '../config/api';

export function getStoredAuthToken(): string {
  return localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
}

export async function adminApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getStoredAuthToken();
  return fetch(`${getApiBaseUrl()}/api/admin${path}`, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
    mode: 'cors',
  });
}
