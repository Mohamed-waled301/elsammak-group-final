/**
 * CORS — applied before all routes (see server.js).
 * Uses the `cors` package.
 *
 * Default origins: local Vite + production Vercel frontend.
 * Merge `CORS_ORIGIN` (comma-separated). If it includes `*`, all origins are allowed
 * (credentials disabled — browsers forbid credentials with wildcard).
 */

const cors = require('cors');

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://elsammak-group-final-e1du.vercel.app',
];

function buildAllowedSet() {
  const set = new Set(DEFAULT_ORIGINS);
  const fromEnv = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.includes('*')) {
    return null; // signal: allow all (no credentials)
  }
  fromEnv.forEach((o) => set.add(o));
  return set;
}

function createCorsMiddleware() {
  const allowedSet = buildAllowedSet();
  const allowAll = allowedSet === null;
  const isProd = process.env.NODE_ENV === 'production';

  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowAll) {
        return callback(null, true);
      }
      if (allowedSet.has(origin)) {
        return callback(null, true);
      }
      if (!isProd) {
        const localOk =
          /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
            origin
          );
        if (localOk) {
          return callback(null, true);
        }
      }
      return callback(null, false);
    },
    credentials: !allowAll,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 204,
  });
}

module.exports = { createCorsMiddleware, DEFAULT_ORIGINS };
