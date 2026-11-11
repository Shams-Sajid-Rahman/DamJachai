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
  // Vite's own helpers (dynamic import preloading, CommonJS interop) are used by the lazy three.js chunk too.
  // Without this rule they end up inside it, and then every page has to download three.js.
  if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'vendor-react';
  if (!id.includes('node_modules')) return undefined;
  if (id.includes('/node_modules/@babel/runtime/')) return 'vendor-react';
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
    // vendor-three (about 250 kB gzipped) is only loaded by the lazy 3D hero, never on first paint.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: { manualChunks },
    },
  },
});
