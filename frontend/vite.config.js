import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'https://backend-ulf8.onrender.com/api';
  const apiOrigin = new URL(apiUrl).origin;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: false,
      open: true,
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
