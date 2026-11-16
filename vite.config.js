import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/auth': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
      '/me': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
      '/academico': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
      '/asistencia': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
      '/comunicaciones': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
    },
  },
})
