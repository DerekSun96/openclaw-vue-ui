import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyHttpTarget = env.VITE_PROXY_HTTP_URL || 'http://127.0.0.1:18790'
  const proxyWsTarget = env.VITE_PROXY_WS_URL || 'ws://127.0.0.1:18790'

  return {
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '/@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyHttpTarget,
          changeOrigin: true,
        },
        '/ws': {
          target: proxyWsTarget,
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ws/, ''),
        },
      },
    },
  }
})
