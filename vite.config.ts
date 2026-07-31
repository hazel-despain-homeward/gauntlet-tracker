import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: the SPA talks to the FastAPI backend on :8000.
// The `/api` prefix is stripped so backend routes are declared without it,
// matching how Vercel serves the Python function in production.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
