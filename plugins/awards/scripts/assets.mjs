#!/usr/bin/env node
// The asset log: where every image, video and mesh a build ships came from, on what terms, and whether it is
// synthetic. Lives at .awards/assets.json beside AWARDS.md. Pattern: references/patterns/imagery-and-assets.md.
// Usage:
//   node assets.mjs add --file <path> --kind owned|licensed|generated|drawn|placeholder
//        [--source <url>] [--author <name>] [--licence <name>] [--licence-url <url>] [--credit <line>]
//        [--tool <name>] [--prompt <text>] [--project <dir>]
//   node assets.mjs check [dir] [--json]     files without an entry, licences without a URL, placeholders still shipping
//   node assets.mjs credits [--project <dir>] credit lines for a credits page
// Exit: 0 clean or written · 2 check found gaps · 1 usage.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from './lib/report.mjs';

const args = parseArgs(process.argv.slice(2), { json: 'boolean' });
const [command, target] = args._;
const KINDS = ['owned', 'licensed', 'generated', 'drawn', 'placeholder'];
const MEDIA = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.mp4', '.webm', '.mov', '.glb', '.gltf', '.ktx2', '.hdr', '.exr', '.riv', '.lottie']);
const SKIP = new Set(['node_modules', '.git', '.awards', '.next', '.nuxt', '.svelte-kit', 'coverage']);

// The project is the nearest folder with AWARDS.md above the starting point, else the starting point itself.
const projectOf = (start) => {
  for (let d = path.resolve(start); ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, 'AWARDS.md'))) return d;
    if (d === path.dirname(d)) return path.resolve(start);
  }
};
const project = projectOf(String(args.project ?? (command === 'check' && target ? target : '.')));
const logFile = path.join(project, '.awards', 'assets.json');
const load = () => { try { return JSON.parse(fs.readFileSync(logFile, 'utf8')); } catch { return { assets: [] }; } };
const save = (log) => { fs.mkdirSync(path.dirname(logFile), { recursive: true }); fs.writeFileSync(logFile, JSON.stringify(log, null, 2) + '\n'); };
const rel = (f) => path.relative(project, path.resolve(f)).split(path.sep).join('/');

if (command === 'add') {
  if (!args.file || !KINDS.includes(String(args.kind))) {
    console.error(`usage: node assets.mjs add --file <path> --kind ${KINDS.join('|')} [--source …] [--licence …] [--licence-url …] [--tool …] [--prompt …]`);
    process.exit(1);
  }
  if (args.kind === 'licensed' && (!args.source || !args.licence)) { console.error('a licensed asset needs --source and --licence'); process.exit(1); }
  if (args.kind === 'generated' && !args.tool) { console.error('a generated asset needs --tool (and --prompt)'); process.exit(1); }
  const log = load();
  const entry = { file: rel(String(args.file)), kind: String(args.kind), synthetic: args.kind === 'generated' || args.kind === 'placeholder' };
  for (const [key, flag] of [['source', 'source'], ['author', 'author'], ['licence', 'licence'], ['licenceUrl', 'licence-url'], ['credit', 'credit'], ['tool', 'tool'], ['prompt', 'prompt']]) {
    if (args[flag] !== undefined && args[flag] !== true) entry[key] = String(args[flag]);
  }
  entry.date = new Date().toISOString().slice(0, 10);
  log.assets = log.assets.filter((a) => a.file !== entry.file).concat(entry);
  save(log);
  console.log(`logged ${entry.file} (${entry.kind}) in ${path.relative(process.cwd(), logFile) || logFile}`);
} else if (command === 'check') {
  const root = path.resolve(String(target ?? project));
  const files = [];
  (function walk(dir, depth = 0) {
    if (depth > 10 || !fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) { if (!SKIP.has(ent.name) && !ent.name.startsWith('.')) walk(path.join(dir, ent.name), depth + 1); }
      else if (MEDIA.has(path.extname(ent.name).toLowerCase())) files.push(path.join(dir, ent.name));
    }
  })(root);
  const log = load();
  const logged = new Map(log.assets.map((a) => [a.file, a]));
  // A build output repeats source files under hashed names; match those by their stem before the hash.
  const stem = (f) => path.basename(f).replace(/-[A-Za-z0-9_]{6,}(?=\.[a-z0-9]+$)/, '');
  const stems = new Set(log.assets.map((a) => stem(a.file)));
  const missing = files.map(rel).filter((f) => !logged.has(f) && !stems.has(stem(f)));
  const noLicence = log.assets.filter((a) => a.kind === 'licensed' && !a.licenceUrl).map((a) => a.file);
  const placeholders = log.assets.filter((a) => a.kind === 'placeholder' && files.some((f) => rel(f) === a.file || stem(f) === stem(a.file))).map((a) => a.file);
  const report = { project, scanned: files.length, missing, noLicence, placeholders };
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`${files.length} media file(s) under ${path.relative(process.cwd(), root) || '.'} · ${missing.length} unlogged · ${noLicence.length} licence without URL · ${placeholders.length} placeholder(s) shipping`);
    for (const f of missing) console.log(`  unlogged: ${f}`);
    for (const f of noLicence) console.log(`  no licence URL: ${f}`);
    for (const f of placeholders) console.log(`  placeholder: ${f}`);
  }
  process.exitCode = missing.length + noLicence.length + placeholders.length ? 2 : 0;
} else if (command === 'credits') {
  const lines = load().assets.filter((a) => a.credit || a.kind === 'licensed' || a.kind === 'generated').map((a) =>
    a.kind === 'generated' ? `${a.file}: generated with ${a.tool}` : a.credit ?? `${a.file}: ${a.author ? `${a.author}, ` : ''}${a.licence}${a.source ? `, ${a.source}` : ''}`);
  console.log(lines.length ? lines.join('\n') : 'no credits needed: every logged asset is owned or drawn');
} else {
  console.error('usage: node assets.mjs add|check|credits …');
  process.exit(1);
}
