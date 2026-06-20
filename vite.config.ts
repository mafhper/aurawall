import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
