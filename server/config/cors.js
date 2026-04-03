/**
 * CORS setup — applied before all routes.
 * Always allows http://localhost:5173 (and 127.0.0.1:5173).
 * Merges CORS_ORIGIN (comma-separated). In non-production, allows any localhost / 127.0.0.1 port (Vite).
 */

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

function buildAllowedSet() {
  const set = new Set(DEFAULT_ORIGINS);
  const fromEnv = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.includes('*')) {
    return null; // signal: allow all
  }
  fromEnv.forEach((o) => set.add(o));
  return set;
}

function createCorsMiddleware() {
  const allowedSet = buildAllowedSet();
  const isProd = process.env.NODE_ENV === 'production';

  return require('cors')({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedSet === null) {
        return callback(null, true);
      }
      if (allowedSet.has(origin)) {
        return callback(null, true);
      }
      if (!isProd) {
        // Allow local dev when frontend runs via LAN IP (e.g. 192.168.x.x).
        // This keeps things working without forcing users to manually configure CORS_ORIGIN.
        const localOk = /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
        if (localOk) {
          return callback(null, true);
        }
      }
      return callback(null, false);
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 204,
  });
}

module.exports = { createCorsMiddleware, DEFAULT_ORIGINS };
