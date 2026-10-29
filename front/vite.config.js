import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  server: {
    proxy: {
      '/user': { target: 'http://localhost:3000', changeOrigin: true },
      '/devices': { target: 'http://localhost:3000', changeOrigin: true },
      '/app_name': { target: 'http://localhost:3000', changeOrigin: true },
      '/test': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
