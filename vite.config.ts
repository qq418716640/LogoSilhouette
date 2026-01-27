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
          // GTM code injection (only for production)
          const gtmId = env.VITE_GTM_ID || ''
          const gtmHeadScript = gtmId
            ? `<!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');</script>
    <!-- End Google Tag Manager -->`
            : ''

          const gtmBodyNoScript = gtmId
            ? `<!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->`
            : ''

          return html
            .replace(/%VITE_UMAMI_WEBSITE_ID%/g, env.VITE_UMAMI_WEBSITE_ID || '')
            .replace(/%VITE_UMAMI_SRC%/g, env.VITE_UMAMI_SRC || '')
            .replace(/%VITE_BASE_PATH%/g, normalizedBase)
            .replace('<!-- GTM_HEAD_PLACEHOLDER -->', gtmHeadScript)
            .replace('<!-- GTM_BODY_PLACEHOLDER -->', gtmBodyNoScript)
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
