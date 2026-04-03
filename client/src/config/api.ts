/**
 * API base URL. In dev, Vite proxies `/api` when using relative URLs — prefer '' in DEV
 * so requests hit the same origin and the proxy forwards to the Express server.
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.replace(/\/$/, '');
  }
  return '';
}
