import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/auth': {
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
