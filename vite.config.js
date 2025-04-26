import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    server: {
      hmr: {
        // Fix WebSocket connection issues
        protocol: 'ws',
        host: 'localhost',
      },
      proxy: {
        // Proxy API requests to the backend
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction,
      // Optimize chunks for better performance
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
          }
        }
      }
    },
    // Base path for production deployment
    // Change this to '/' if deploying to the root domain
    base: '/'
  }
})
