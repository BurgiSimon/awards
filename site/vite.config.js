import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import facts from './facts/index.js';

const page = (file) => resolve(import.meta.dirname, file);

export default defineConfig({
  // Relative asset paths: dist/ works from a domain root or any subfolder (the 404 sets its own <base> from SITE_ROOT).
  base: './',
  appType: 'mpa',
  plugins: [facts()],
  build: {
    target: 'es2022',
    // Vite 8 is Rolldown-based; rolldownOptions replaces the deprecated rollupOptions alias.
    rolldownOptions: {
      input: {
        index: page('index.html'),
        install: page('install.html'),
        docs: page('docs.html'),
        recipes: page('recipes.html'),
        404: page('404.html'),
      },
    },
  },
});
