import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { facts } from './src/lib/facts.js';
import { CITIES } from './src/lib/sun.js';

// The static HTML carries real sun figures for Lisbon on the day it was built, so a reader without
// JavaScript (or a crawler) gets true numbers; the page rewrites them for the day it is read.
function sunFacts() {
  return {
    name: 'ekvator-sun-facts',
    transformIndexHtml(html) {
      const f = facts(Date.now(), CITIES[0]);
      return html
        .replace(/(<(time|span)[^>]*data-sun="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, tag, key, text, close) => (key in f ? `${open}${f[key]}${close}` : m))
        .replace(/(<span data-city-line="([^"]+)">)([^<]*)(<\/span>)/g, (m, open, id, text, close) => (`line-${id}` in f ? `${open}${f[`line-${id}`]}${close}` : m));
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [sunFacts()],
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
