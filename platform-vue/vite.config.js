import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const proxy = {
  '/api': {
    target: 'http://127.0.0.1:4173',
    changeOrigin: true,
    timeout: 8000
  }
}

export default defineConfig({
  base: '/Smart-Farm/',
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: { host: '127.0.0.1', port: 5173, proxy },
  preview: { host: '127.0.0.1', port: 4174, proxy },
  build: { chunkSizeWarningLimit: 1600 }
})
