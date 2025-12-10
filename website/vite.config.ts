import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  root: path.resolve(__dirname),
  // Separate cache for website to avoid conflict with main app when running concurrently
  cacheDir: path.resolve(__dirname, '../node_modules/.vite-website'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy /app/ to main application
      '/app': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app/, '')
      }
    }
  },
  base: command === 'serve' ? '/' : '/aurawall/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  }
}))