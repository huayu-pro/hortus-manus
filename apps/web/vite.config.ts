import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': r('./src'),
      '@hortus/shared/copy': r('../../packages/shared/src/copy.ts'),
      '@hortus/shared': r('../../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    host: '127.0.0.1',
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
      '/s/': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 4096,
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
})