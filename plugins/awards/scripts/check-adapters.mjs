#!/usr/bin/env node
// Framework adapters are code, so they are checked as code: every recipes/<id>/adapters/*.jsx|tsx parses (Vite's
// bundled Oxc transform, no React install needed), imports only the pinned libraries or its own recipe's files,
// and uses useGSAP when it uses GSAP; every P0 recipe's README carries a Webflow section, the host the corpus
// ships on most (16 of 62 cards).
// Usage: node scripts/check-adapters.mjs [--json]   Exit: 0 clean · 1 a problem.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { parseArgs } from './lib/report.mjs';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const recipes = path.join(plugin, 'recipes');
const args = parseArgs(process.argv.slice(2), { json: 'boolean' });
const ALLOWED = /^(react|react-dom|react\/jsx-runtime|gsap|gsap\/[\w-]+|@gsap\/react|lenis|lenis\/react|three|three\/[\w/.-]+|@react-three\/fiber|@react-three\/drei|\.{1,2}\/.+)$/;

let transformWithOxc;
try {
  const vite = createRequire(path.join(recipes, 'package.json')).resolve('vite');
  ({ transformWithOxc } = await import(pathToFileURL(vite).href));
} catch {
  console.log('check-adapters: unmeasured (run npm install in recipes/ for the parser)');
  process.exit(0);
}

const problems = [];
let adapters = 0;
for (const id of fs.readdirSync(recipes).filter((d) => fs.existsSync(path.join(recipes, d, 'recipe.json')))) {
  const meta = JSON.parse(fs.readFileSync(path.join(recipes, id, 'recipe.json'), 'utf8'));
  const readme = fs.existsSync(path.join(recipes, id, 'README.md')) ? fs.readFileSync(path.join(recipes, id, 'README.md'), 'utf8') : '';
  if (meta.tier === 'P0' && !/^#{2,4}\s*Webflow\b/im.test(readme)) problems.push(`${id}: P0 README has no Webflow section`);
  const dir = path.join(recipes, id, 'adapters');
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((f) => /\.(jsx|tsx)$/.test(f))) {
    adapters++;
    const file = path.join(dir, f);
    const code = fs.readFileSync(file, 'utf8');
    try { await transformWithOxc(code, file, { lang: f.endsWith('.tsx') ? 'tsx' : 'jsx' }); }
    catch (e) { problems.push(`${id}/adapters/${f}: does not parse — ${String(e.message ?? e).split('\n')[0].slice(0, 140)}`); continue; }
    for (const m of code.matchAll(/^\s*import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/gm)) {
      if (!ALLOWED.test(m[1])) problems.push(`${id}/adapters/${f}: imports ${m[1]}, not a pinned library or a recipe file`);
    }
    if (/from ['"]gsap['"]/.test(code) && !/useGSAP/.test(code)) problems.push(`${id}/adapters/${f}: uses GSAP without useGSAP (cleanup on unmount)`);
  }
}
if (args.json) console.log(JSON.stringify({ adapters, problems }, null, 2));
else {
  for (const p of problems) console.log(`  ${p}`);
  console.log(`${adapters} adapter(s) parsed · ${problems.length} problem(s)`);
}
process.exit(problems.length ? 1 : 0);
