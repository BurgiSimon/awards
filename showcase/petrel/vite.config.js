import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    // three is one lazy 137 KB (gz) chunk by design; the budget in AWARDS.md is the limit that matters.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        missing: resolve(import.meta.dirname, '404.html'),
      },
      output: {
        // Keep WebGL out of the entry chunk.
        manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : undefined),
      },
    },
  },
});
