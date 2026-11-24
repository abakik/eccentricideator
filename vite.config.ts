import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Server-side files are not part of the page; without this, saving one reloads the browser
        // and cuts off any idea stream in progress.
        watch: { ignored: ['**/server/**', '**/api/**', '**/dev-server.ts', '**/*.md', '**/vercel.json'] },
      },
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
