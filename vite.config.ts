import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '')

  // Get base path from env, ensure it ends with /
  const basePath = env.VITE_BASE_PATH || '/'
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`

  return {
    base: normalizedBase,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html
            .replace(/%VITE_UMAMI_WEBSITE_ID%/g, env.VITE_UMAMI_WEBSITE_ID || '')
            .replace(/%VITE_UMAMI_SRC%/g, env.VITE_UMAMI_SRC || '')
            .replace(/%VITE_BASE_PATH%/g, normalizedBase)
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    worker: {
      format: 'es',
    },
    optimizeDeps: {
      include: ['imagetracerjs'],
    },
  }
})
