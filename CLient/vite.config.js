import path from "path";
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  // Use VITE_API_URL from environment variables or fallback to a default value
  const apiUrl = env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiUrl, // Use the environment variable here
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    build: {
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});