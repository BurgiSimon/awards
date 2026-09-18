#!/usr/bin/env node
// Scaffold an award-level project from the plugin's starter.
// Usage: node new-project.mjs --stack vite|next|nuxt|astro|sveltekit --name <dir> [--webgl] [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/report.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const plugin = path.resolve(here, '..');
const args = parseArgs(process.argv.slice(2), { webgl: 'boolean', 'dry-run': 'boolean' });
const stack = String(args.stack ?? 'vite');
const name = args.name ? String(args.name) : null;
if (!name) {
  console.error('usage: node new-project.mjs --stack vite|next|nuxt|astro|sveltekit --name <dir> [--webgl] [--dry-run]');
  process.exit(1);
}
const dest = path.resolve(name);
const slug = path.basename(dest).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site';
const title = path.basename(dest).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

if (stack !== 'vite') {
  const note = path.join(plugin, 'references/stacks', `${stack}.md`);
  console.log(`No copyable scaffold ships for "${stack}" yet. Follow the verified setup in:\n  ${fs.existsSync(note) ? note : 'references/stacks/<stack>.md'}\nThen copy src/lib/{awards-hook,reduced-motion,quality-tiers,raf}.js from the vite-vanilla scaffold.`);
  process.exit(0);
}

const src = path.join(plugin, 'assets/scaffold/vite-vanilla');
if (fs.existsSync(dest) && fs.readdirSync(dest).length) {
  console.error(`refusing to overwrite a non-empty directory: ${dest}`);
  process.exit(1);
}
const copies = [];
(function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const from = path.join(dir, ent.name);
    const to = path.join(dest, path.relative(src, from));
    if (ent.isDirectory()) walk(from);
    else copies.push([from, to]);
  }
})(src);
for (const [from, to] of copies) {
  if (!args.webgl && /src[\\/]webgl[\\/]/.test(from)) continue;
  const relTo = path.relative(process.cwd(), to);
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
  console.log(`wrote ${relTo}`);
}
if (!args['dry-run']) {
  if (!args.webgl) {
    const pkgPath = path.join(dest, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    delete pkg.dependencies.three;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    const html = path.join(dest, 'index.html');
    fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace(' data-scene', ''));
  }
  console.log(`\nNext:\n  cd ${path.relative(process.cwd(), dest) || '.'} && npm install && npm run dev\n  Fill AWARDS.md (or run /awards:craft), then DESIGN.md + src/styles/tokens.css via /awards:system.`);
}
