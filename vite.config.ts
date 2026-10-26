import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { APP_HOST, APP_PORT } from './ports.ts';
import { assertPortFree } from './scripts/sonda-porta.ts';

export default defineConfig(async ({ command }) => {
  // O app usa `host: '0.0.0.0'` de proposito (servido ao celular na rede local).
  // Esse e o caso em que o bind tem sucesso mesmo com a loopback ocupada, entao
  // `strictPort` sozinho NAO cobre — a sonda antes do bind e a unica defesa.
  if (command === 'serve') {
    await assertPortFree(APP_PORT);
  }

  return {
    server: {
      port: APP_PORT,
      host: APP_HOST,
      strictPort: true,
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      }
    },
    base: './',
    build: {
      outDir: 'dist/app',
      emptyOutDir: true,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor',
                test: /node_modules[\\/](?:react|react-dom)[\\/]/,
                priority: 20,
              },
              {
                name: 'ui',
                test: /node_modules[\\/]lucide-react[\\/]/,
                priority: 10,
              },
            ],
          }
        }
      }
    }
  };
});
