import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({ root: fileURLToPath(new URL('.', import.meta.url)), base: '/review-preview/',
  build: { outDir: fileURLToPath(new URL('../../apps/web/dist/review-preview', import.meta.url)), emptyOutDir: false,
    rollupOptions: { input: fileURLToPath(new URL('./web-preview.html', import.meta.url)) } } });
