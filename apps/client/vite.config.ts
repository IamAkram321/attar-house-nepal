import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type UserConfig } from 'vite';

export default defineConfig(({ mode }): UserConfig => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  const port = Number(env.PORT || 5173);
  const basePath = env.BASE_PATH || "/";

  return {
    base: basePath,

    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
      },

      dedupe: ['react', 'react-dom'],
    },

    root: path.resolve(import.meta.dirname),

    build: {
      outDir: path.resolve(import.meta.dirname, 'dist'),
      emptyOutDir: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'wouter', '@tanstack/react-query'],
            motion: ['framer-motion'],
            charts: ['recharts'],
            three: ['three', '@react-three/fiber', '@react-three/drei'],
          },
        },
      },
    },

    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,

      fs: {
        strict: true,
      },

      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },

    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});