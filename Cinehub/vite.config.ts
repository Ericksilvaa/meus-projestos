import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const tmdbProxyPort = Number(process.env.TMDB_PROXY_PORT || 4175)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/tmdb': {
        target: `http://127.0.0.1:${tmdbProxyPort}`,
        changeOrigin: true,
      },
    },
  },
})
