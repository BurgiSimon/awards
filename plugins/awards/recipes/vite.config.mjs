// Multi-page build: every recipe folder with an index.html becomes an entry.
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recipeFiles } from '../scripts/build-gallery.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
// AWARDS_RECIPES_ONLY=id,id (set by verify-recipes --only) builds just those entries.
const only = process.env.AWARDS_RECIPES_ONLY ? new Set(process.env.AWARDS_RECIPES_ONLY.split(',')) : null;
const input = {};
const ids = [];
for (const dir of fs.readdirSync(root, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name.startsWith('_') || dir.name === 'node_modules' || dir.name === 'dist') continue;
  if (only && !only.has(dir.name)) continue;
  if (fs.existsSync(path.join(root, dir.name, 'recipe.json'))) ids.push(dir.name);
  // Every top-level .html in a recipe folder is an entry (page-transition recipes ship several pages).
  for (const f of fs.readdirSync(path.join(root, dir.name))) {
    if (f.endsWith('.html')) input[`${dir.name}/${f.replace(/\.html$/, '')}`] = path.join(root, dir.name, f);
  }
}
input.index = path.join(root, 'index.html');

// The gallery (index.html, _gallery/) shows each recipe's own files beside its demo. They are served as plain text at
// _gallery/src/<id>/<file>.txt: read from disk on each request in dev, copied into dist/ by the build.
function recipeSources() {
  const SRC = /^\/_gallery\/src\/([\w-]+)\/(.+)\.txt$/;
  return {
    name: 'awards-recipe-sources',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = SRC.exec(decodeURIComponent((req.url ?? '').split('?')[0]));
        if (!m || !fs.existsSync(path.join(root, m[1], 'recipe.json')) || !recipeFiles(m[1]).includes(m[2])) return next();
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(fs.readFileSync(path.join(root, m[1], m[2])));
      });
    },
    generateBundle() {
      for (const id of ids) {
        for (const f of recipeFiles(id)) this.emitFile({ type: 'asset', fileName: `_gallery/src/${id}/${f}.txt`, source: fs.readFileSync(path.join(root, id, f)) });
      }
    },
  };
}

export default defineConfig({
  root,
  base: './',
  plugins: [recipeSources()],
  build: { outDir: 'dist', emptyOutDir: true, rollupOptions: { input }, target: 'es2022' },
  server: { port: 5174, open: false },
});
