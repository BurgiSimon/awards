// Multi-page build: every recipe folder with an index.html becomes an entry, and so does every draft in _drafts/.
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recipeFiles } from '../scripts/build-gallery.mjs';
import { draftIds, draftDir, draftsData, isDraftId, writeReview, DECISIONS } from '../scripts/lib/drafts.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
// AWARDS_RECIPES_ONLY=id,id (set by verify-recipes --only) builds just those entries, recipes or drafts.
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
const drafts = draftIds().filter((id) => !only || only.has(id));
for (const id of drafts) {
  for (const f of fs.readdirSync(draftDir(id))) {
    if (f.endsWith('.html')) input[`_drafts/${id}/${f.replace(/\.html$/, '')}`] = path.join(draftDir(id), f);
  }
}
input.index = path.join(root, 'index.html');

// The gallery (index.html, _gallery/) shows each recipe's own files beside its demo. They are served as plain text at
// _gallery/src/<id>/<file>.txt (a draft's at _gallery/src/_drafts/<id>/<file>.txt): read from disk on each request in
// dev, copied into dist/ by the build. The Drafts tab reads _drafts/drafts.json, built fresh on every request in dev,
// and saves a decision with POST _drafts/<id>/review, which writes that draft's review.json (dev only).
function recipeSources() {
  const SRC = /^\/_gallery\/src\/(?:(_drafts)\/)?([\w-]+)\/(.+)\.txt$/;
  const REVIEW = /^\/_drafts\/([\w-]+)\/review$/;
  const send = (res, code, body) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
  };
  return {
    name: 'awards-recipe-sources',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0]);
        const m = SRC.exec(url);
        if (m) {
          const dir = m[1] ? draftDir(m[2]) : path.join(root, m[2]);
          if ((m[1] && !isDraftId(m[2])) || !fs.existsSync(path.join(dir, 'recipe.json')) || !recipeFiles(m[2], dir).includes(m[3])) return next();
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          return res.end(fs.readFileSync(path.join(dir, m[3])));
        }
        if (url === '/_drafts/drafts.json' && req.method === 'GET') return send(res, 200, await draftsData({ writable: true }));
        const r = REVIEW.exec(url);
        if (!r) return next();
        // Only this page may write: a JSON body (which a cross-site form cannot send without a preflight) from this host.
        if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
        const origin = req.headers.origin;
        const sameHost = () => { try { return new URL(origin).host === req.headers.host; } catch { return false; } };
        if (origin && !sameHost()) return send(res, 403, { error: 'cross-origin write refused' });
        if (!String(req.headers['content-type'] ?? '').startsWith('application/json')) return send(res, 415, { error: 'send JSON' });
        if (!isDraftId(r[1]) || !draftIds().includes(r[1])) return send(res, 404, { error: `no draft ${r[1]}` });
        let body = '';
        for await (const chunk of req) { body += chunk; if (body.length > 64 * 1024) return send(res, 413, { error: 'too large' }); }
        let parsed;
        try { parsed = JSON.parse(body); } catch { return send(res, 400, { error: 'invalid JSON' }); }
        if (!DECISIONS.includes(parsed?.status)) return send(res, 400, { error: `status must be one of ${DECISIONS.join(', ')}` });
        try { return send(res, 200, { review: writeReview(r[1], { status: parsed.status, notes: String(parsed.notes ?? '') }) }); }
        catch (e) { return send(res, 500, { error: String(e.message ?? e) }); }
      });
    },
    async generateBundle() {
      for (const id of ids) {
        for (const f of recipeFiles(id)) this.emitFile({ type: 'asset', fileName: `_gallery/src/${id}/${f}.txt`, source: fs.readFileSync(path.join(root, id, f)) });
      }
      for (const id of drafts) {
        for (const f of recipeFiles(id, draftDir(id))) this.emitFile({ type: 'asset', fileName: `_gallery/src/_drafts/${id}/${f}.txt`, source: fs.readFileSync(path.join(draftDir(id), f)) });
        const frame = path.join(draftDir(id), 'frame.webp');
        if (fs.existsSync(frame)) this.emitFile({ type: 'asset', fileName: `_drafts/${id}/frame.webp`, source: fs.readFileSync(frame) });
      }
      this.emitFile({ type: 'asset', fileName: '_drafts/drafts.json', source: JSON.stringify(await draftsData({ writable: false })) });
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
