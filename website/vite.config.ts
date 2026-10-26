import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// O Vite empacota este config como `.mjs`, e nesse empacotamento um import de
// `../ports` sem extensao nao resolve. O caminho `.ts` e o que funciona daqui.
import { APP_PORT, WEBSITE_PORT } from '../ports.ts'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  root: path.resolve(import.meta.dirname),
  // Separate cache for website to avoid conflict with main app when running concurrently
  cacheDir: path.resolve(import.meta.dirname, '../node_modules/.vite-website'),
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // Portas nomeadas, fora das faixas de incremento do Vite (5173-5175 e
    // 4173-4175). `npm run dev` sobe as DUAS superficies ao mesmo tempo via
    // `concurrently`, entao elas precisam de numeros distintos E o proxy abaixo
    // precisa mirar a porta certa do app.
    port: WEBSITE_PORT,
    strictPort: true,
    proxy: {
      // Proxy /app/ to main application
      '/app': {
        target: `http://localhost:${APP_PORT}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app/, '')
      }
    }
  },
  base: command === 'serve' ? '/' : '/aurawall/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  ssr: {
    noExternal: ['react-helmet-async']
  }
}))
