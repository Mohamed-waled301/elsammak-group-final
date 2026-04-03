import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Default dev proxy target; mirror `DEFAULT_API_BASE_URL` in `src/config/api.ts`. */
const DEFAULT_API_TARGET = 'https://server-production-1c6f5.up.railway.app'

/**
 * Merge repo root + client/.env so VITE_* works from either place (npm workspaces / monorepo).
 * Order: root first, then client — client values override root for the same key.
 */
function mergedEnv(mode: string) {
  const rootDir = path.resolve(__dirname, '..')
  const clientDir = __dirname
  return { ...loadEnv(mode, rootDir, ''), ...loadEnv(mode, clientDir, '') }
}

export default defineConfig(({ mode }) => {
  const env = mergedEnv(mode)
  const apiTarget = (env.VITE_API_URL || DEFAULT_API_TARGET).replace(/\/$/, '')
  const viteEnvDefine = Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => key.startsWith('VITE_'))
      .map(([key, val]) => [`import.meta.env.${key}`, JSON.stringify(val ?? '')])
  ) as Record<string, string>

  return {
    resolve: {
      alias: {
        '@project-data': path.resolve(__dirname, '../data'),
      },
    },
    /** Root-relative assets — required for Vercel / React Router (avoid `./` breaking deep routes). */
    base: '/',
    /** Injects merged VITE_* so the bundle matches root + client/.env (client wins). */
    define: viteEnvDefine,
    envDir: __dirname,
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: false,
      fs: {
        allow: [path.resolve(__dirname, '..')],
      },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
