import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias:{
      "@": path.resolve(__dirname,"./src")
    }
  },
  server: {
    proxy: {
      '/api': {
        target: mode === 'production' 
          ? process.env.VITE_API_URL 
          : process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: mode === 'production',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
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
}));