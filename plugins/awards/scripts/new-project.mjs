#!/usr/bin/env node
// Scaffold an award-level project from the plugin's starter.
// Usage: node new-project.mjs --stack vite|next|nuxt|astro|sveltekit --name <dir> [--webgl] [--keep-existing] [--dry-run]
// --keep-existing scaffolds around a project the earlier phases started (AWARDS.md, DESIGN.md, tokens, pages):
// it writes only the missing files and never touches one that exists.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/report.mjs';
import { satisfies } from './lib/semver.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const plugin = path.resolve(here, '..');
const args = parseArgs(process.argv.slice(2), { webgl: 'boolean', 'dry-run': 'boolean', 'keep-existing': 'boolean' });
const stack = String(args.stack ?? 'vite');
const name = args.name ? String(args.name) : null;
if (!name) {
  console.error('usage: node new-project.mjs --stack vite|next|nuxt|astro|sveltekit --name <dir> [--webgl] [--keep-existing] [--dry-run]');
  process.exit(1);
}
const dest = path.resolve(name);
const slug = path.basename(dest).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site';
const title = path.basename(dest).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// The pinned framework's Node floor, from the ## Node table in versions.md: say so before npm does.
const nodeRow = fs.readFileSync(path.join(plugin, 'references/stacks/versions.md'), 'utf8').split(/^## Node$/m)[1]?.split(/^## /m)[0]
  .split('\n').find((row) => row.startsWith(`| ${stack} `));
const floor = nodeRow?.match(/`([^`]+)`/)?.[1].replace(/\\\|/g, '|');
if (floor && !satisfies(process.versions.node, floor)) {
  console.log(`warning: ${nodeRow.split('|')[1].trim()} needs Node ${floor}; this is ${process.versions.node}. Install Node 22 LTS or 24 LTS before installing dependencies.`);
}

if (stack !== 'vite') {
  const note = path.join(plugin, 'references/stacks', `${stack}.md`);
  console.log(`No copyable scaffold ships for "${stack}" yet. Follow the verified setup in:\n  ${fs.existsSync(note) ? note : 'references/stacks/<stack>.md'}\nThen copy src/lib/{awards-hook,reduced-motion,quality-tiers,raf}.js from the vite-vanilla scaffold.`);
  process.exit(0);
}

const src = path.join(plugin, 'assets/scaffold/vite-vanilla');
const keep = Boolean(args['keep-existing']);
const nonEmpty = fs.existsSync(dest) && fs.readdirSync(dest).length > 0;
if (nonEmpty && !keep && !args['dry-run']) {
  console.error(`refusing to overwrite a non-empty directory: ${dest}\nPass --keep-existing to add only the missing files; --dry-run lists them first.`);
  process.exit(1);
}
if (nonEmpty && !keep) console.log(`dry run: ${dest} is not empty; a real run needs --keep-existing and keeps every file marked "would keep".`);
const copies = [];
(function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const from = path.join(dir, ent.name);
    const to = path.join(dest, path.relative(src, from));
    if (ent.isDirectory()) walk(from);
    else copies.push([from, to]);
  }
})(src);
// The contract and system templates are the single source; the scaffold carries no copies.
for (const f of ['AWARDS.md', 'DESIGN.md']) copies.push([path.join(plugin, 'assets/templates', f), path.join(dest, f)]);
const written = new Set();
const kept = [];
for (const [from, to] of copies) {
  if (!args.webgl && /src[\\/]webgl[\\/]/.test(from)) continue;
  const relTo = path.relative(process.cwd(), to);
  if (fs.existsSync(to)) {
    kept.push(to);
    console.log(`${args['dry-run'] ? 'would keep' : 'kept'} ${relTo} (exists)`);
    continue;
  }
  if (args['dry-run']) {
    console.log(`would write ${relTo}`);
    continue;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  let content = fs.readFileSync(from);
  if (/\.(html|md|json|js|css)$/.test(from)) {
    content = Buffer.from(content.toString('utf8').replaceAll('__PROJECT_NAME__', title).replaceAll('__PROJECT_SLUG__', slug));
  }
  fs.writeFileSync(to, content);
  written.add(to);
  console.log(`wrote ${relTo}`);
}
if (!args['dry-run']) {
  // Only files written in this run are trimmed; a kept file belongs to the phase that wrote it.
  const pkgPath = path.join(dest, 'package.json');
  const html = path.join(dest, 'index.html');
  if (!args.webgl) {
    if (written.has(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      delete pkg.dependencies.three;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    }
    if (written.has(html)) fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace(' data-scene', ''));
  }
  if (kept.includes(html) && !/src=["']\/?src\/main\.js["']/.test(fs.readFileSync(html, 'utf8'))) {
    console.log(`\nindex.html was kept and does not load the boot yet: add <script type="module" src="/src/main.js"></script> before </body>.`);
  }
  if (kept.includes(pkgPath)) {
    console.log(`package.json was kept: add gsap, lenis${args.webgl ? ', three' : ''} and vite at the versions in ${path.relative(process.cwd(), path.join(src, 'package.json'))}.`);
  }
  const fill = written.has(path.join(dest, 'AWARDS.md')) ? '\n  Fill AWARDS.md (or run /awards:craft), then DESIGN.md + src/styles/tokens.css via /awards:system.' : '';
  console.log(`\nNext:\n  cd ${path.relative(process.cwd(), dest) || '.'} && npm install && npm run dev${fill}`);
}
