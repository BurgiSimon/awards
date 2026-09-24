import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import facts from './facts.js';

export default defineConfig({
  // Relative asset paths: dist/ works from a domain root or any subfolder.
  base: './',
  plugins: [facts()],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        install: resolve(import.meta.dirname, 'install.html'),
        docs: resolve(import.meta.dirname, 'docs.html'),
        404: resolve(import.meta.dirname, '404.html'),
      },
      output: {
        // Keep WebGL out of the entry chunk.
        manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : undefined),
      },
    },
  },
});
