/**
 * Default backend origin when `VITE_API_URL` is not set.
 * Override via `VITE_API_URL` in `.env` (e.g. local: `http://127.0.0.1:5000`).
 */
export const DEFAULT_API_BASE_URL = 'https://server-production-1c6f5.up.railway.app';

/**
 * API base URL for `fetch` / axios. Uses `VITE_API_URL` when set; otherwise {@link DEFAULT_API_BASE_URL}.
 * Use empty `VITE_API_URL` only if you intentionally want same-origin relative `/api` (advanced).
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.trim().replace(/\/$/, '');
  }
  return DEFAULT_API_BASE_URL.replace(/\/$/, '');
}
