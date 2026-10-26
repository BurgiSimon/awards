import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { htmlIncludes } from './build/html-includes.js';

const page = (p) => resolve(import.meta.dirname, p);

export default defineConfig({
  appType: 'mpa',
  plugins: [htmlIncludes()],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        home: page('index.html'),
        dawnSwim: page('dawn-swim/index.html'),
        seasonPasses: page('season-passes/index.html'),
        trust: page('trust/index.html'),
        visit: page('visit/index.html'),
        notFound: page('404.html'),
      },
    },
  },
});
