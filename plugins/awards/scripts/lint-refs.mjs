#!/usr/bin/env node
// Every cross-reference in the plugin must resolve to a file that exists: [site:slug],
// [recipe:id], [pattern:file#anchor] and ${CLAUDE_PLUGIN_ROOT}/<path>. A dangling citation is a
// promise the corpus does not keep, and no other check catches one.
// Usage: node scripts/lint-refs.mjs [--json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = process.argv.includes('--json');
// The forms that are written as examples of the syntax rather than as citations.
const PLACEHOLDERS = new Set(['slug', 'id', 'name', 'file', 'x', 'section', 'component', 'archetype', 'model']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '_verify', '.git', '.awards', 'results']);

const files = [];
(function walk(dir) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(d.name)) continue;
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p);
    else if (/\.(md|mjs|js|json)$/.test(d.name)) files.push(p);
  }
})(root);

const misses = [];
const miss = (file, line, ref, why) => misses.push({ file: path.relative(root, file), line, ref, why });
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');

  for (const m of text.matchAll(/\[site:([a-z0-9-]+)\]/g)) {
    if (PLACEHOLDERS.has(m[1])) continue;
    if (!fs.existsSync(path.join(root, 'references/sites', `${m[1]}.md`))) miss(file, lineOf(text, m.index), m[0], 'no references/sites/<slug>.md');
  }
  for (const m of text.matchAll(/\[recipe:([a-z0-9-]+)\]/g)) {
    if (PLACEHOLDERS.has(m[1])) continue;
    if (!fs.existsSync(path.join(root, 'recipes', m[1], 'recipe.json'))) miss(file, lineOf(text, m.index), m[0], 'no recipes/<id>/recipe.json');
  }
  for (const m of text.matchAll(/\[pattern:([a-z0-9-]+)(#[a-z0-9-]+)?\]/g)) {
    if (PLACEHOLDERS.has(m[1])) continue;
    const target = path.join(root, 'references/patterns', `${m[1]}.md`);
    if (!fs.existsSync(target)) { miss(file, lineOf(text, m.index), m[0], 'no references/patterns/<file>.md'); continue; }
    if (!m[2] || PLACEHOLDERS.has(m[2].slice(1))) continue;
    // Anchors are GitHub-style slugs of the headings in that file.
    const anchors = new Set(
      [...fs.readFileSync(target, 'utf8').matchAll(/^#{1,6}\s+(.+)$/gm)]
        .map((h) => h[1].toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')),
    );
    if (!anchors.has(m[2].slice(1))) miss(file, lineOf(text, m.index), m[0], `no heading matching ${m[2]} in references/patterns/${m[1]}.md`);
  }
  for (const m of text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9_./-]+)/g)) {
    const rel = m[1].replace(/[.,;:)`'"]+$/, '');
    if (rel.includes('<') || rel.includes('*')) continue;
    if (!fs.existsSync(path.join(root, rel))) miss(file, lineOf(text, m.index), `\${CLAUDE_PLUGIN_ROOT}/${rel}`, 'path does not exist');
  }
}

if (json) {
  console.log(JSON.stringify({ scanned: files.length, misses }, null, 2));
} else {
  for (const m of misses) console.log(`${m.file}:${m.line}  ${m.ref}  — ${m.why}`);
  console.log(`\n${files.length} file(s) scanned · ${misses.length} dangling reference(s)`);
}
process.exit(misses.length ? 1 : 0);
