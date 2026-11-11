import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vendor code goes into separate long-lived chunks, so a code change does not bust the whole cache.
const VENDOR_CHUNKS = {
  react: ['react', 'react-dom', 'scheduler'],
  router: ['react-router', 'react-router-dom'],
  data: ['@tanstack/react-query', 'axios'],
  i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
  three: ['three', '@react-three/fiber', '@react-three/drei'],
  charts: ['recharts'],
};

function manualChunks(id) {
  if (!id.includes('node_modules')) return undefined;
  for (const [chunk, packages] of Object.entries(VENDOR_CHUNKS)) {
    if (packages.some((p) => id.includes(`/node_modules/${p}/`))) return `vendor-${chunk}`;
  }
  return undefined;
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    restoreMocks: true,
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: { manualChunks },
    },
  },
});
