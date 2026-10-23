import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { collect } from './facts/collect.js';
import { render } from './facts/render.js';

// Every count, name and command on the page is read from the plugin at build time (facts/), so the sheet
// cannot drift from the repository it describes. The dev server re-reads on every request.
function facts() {
  return {
    name: 'awards-home-facts',
    transformIndexHtml(html) {
      return render(html, collect());
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [facts()],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        missing: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
