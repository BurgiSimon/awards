#!/usr/bin/env node
// The asset log: where every image, video and mesh a build ships came from, on what terms, and whether it is
// synthetic. Lives at .awards/assets.json beside AWARDS.md. Pattern: references/patterns/imagery-and-assets.md.
// Usage:
//   node assets.mjs add --file <path> --kind owned|licensed|generated|drawn|placeholder
//        [--source <url>] [--author <name>] [--licence <name>] [--licence-url <url>] [--credit <line>]
//        [--tool <name>] [--prompt <text>] [--project <dir>]
//   node assets.mjs check [dir] [--json]     files without an entry, licences without a URL, placeholders still shipping
//   node assets.mjs credits [--project <dir>] credit lines for a credits page
//   node assets.mjs search "<query>" [--video] [--source openverse,met,…] [--limit 6] [--min-width 1600] [--json]
//        real pictures (or footage) of the subject's world from open collections that need no key, commercial-safe
//        licences only; results are cached in .awards/asset-search.json so get can use their refs
//   node assets.mjs get <ref> [--out public/images] [--name <file stem>]   download one result and log it, credit included
//   search and get refuse while the project's AWARDS.md says `Found pictures: off` (craft or concept --no-found-pictures).
// Exit: 0 clean, written or found · 2 check found gaps · 3 found pictures are off for this build · 4 no collection
//       reachable or the download failed · 1 usage.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, fmtTable } from './lib/report.mjs';
import { search, resolveFile, download, creditLine, SOURCES } from './lib/collections.mjs';

const args = parseArgs(process.argv.slice(2), { json: 'boolean', video: 'boolean' });
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
const foundOff = () => { try { return /^- Found pictures:\s*off\b/im.test(fs.readFileSync(path.join(project, 'AWARDS.md'), 'utf8')); } catch { return false; } };

if ((command === 'search' || command === 'get') && foundOff()) {
  console.error('found pictures are off for this build (AWARDS.md `Found pictures: off`): use the client\'s own pictures or made imagery, or set that line to `search` to use the open collections');
  process.exit(3);
}

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
} else if (command === 'search') {
  // A search is the inventory turned into queries: the client's street in old postcards, its material up close,
  // its trade in engravings. A found picture shows the world around the client and is never presented as its own.
  if (!target || target === true) { console.error('usage: node assets.mjs search "<query>" [--video] [--source …] [--limit 6] [--min-width 1600] [--json]'); process.exit(1); }
  const sources = args.source && args.source !== true ? String(args.source).split(',').map((x) => x.trim()) : undefined;
  const unknown = (sources ?? []).filter((x) => !SOURCES.includes(x));
  if (unknown.length) { console.error(`unknown source(s): ${unknown.join(', ')}; known: ${SOURCES.join(', ')}`); process.exit(1); }
  const found = await search(String(target), { sources, limit: Number(args.limit ?? 6), video: !!args.video, minWidth: Number(args['min-width'] ?? 0) });
  const cacheFile = path.join(project, '.awards', 'asset-search.json');
  const cache = (() => { try { return JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch { return { results: {} }; } })();
  for (const r of found.results) cache.results[r.ref] = { ...r, query: found.query, at: new Date().toISOString().slice(0, 10) };
  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2) + '\n');
  if (args.json) console.log(JSON.stringify(found, null, 2));
  else {
    console.log(`${found.results.length} ${found.video ? 'clip' : 'picture'}(s) for “${found.query}” from ${found.sources.join(', ')}`);
    if (found.results.length) console.log(fmtTable(found.results.map((r) => [r.ref, r.licence, r.width ? `${r.width}${r.height ? `×${r.height}` : ''}` : '—', `${r.title.slice(0, 60)}${r.creator ? ` — ${r.creator.slice(0, 30)}` : ''}`]), ['ref', 'licence', 'size', 'title — creator']));
    for (const r of found.results) console.log(`  ${r.ref}  ${r.page}`);
    for (const u of found.unreachable) console.log(`  unreachable: ${u.source} (${u.reason})`);
    console.log('Look at each before choosing: `assets.mjs get <ref>` downloads it and logs its credit. Use found pictures large and with intent; never as the client\'s own product, room, dish or person.');
  }
  process.exitCode = found.results.length || found.unreachable.length < found.sources.length ? 0 : 4;
} else if (command === 'get') {
  const cacheFile = path.join(project, '.awards', 'asset-search.json');
  const record = (() => { try { return JSON.parse(fs.readFileSync(cacheFile, 'utf8')).results[String(target)]; } catch { return null; } })();
  if (!record) { console.error(`no search result ${target} in ${path.relative(process.cwd(), cacheFile) || cacheFile}; run assets.mjs search first`); process.exit(1); }
  let url;
  try { url = await resolveFile(record); } catch (e) { console.error(`could not resolve the file for ${target}: ${e.message}`); process.exit(4); }
  if (!url) { console.error(`${target} names no downloadable file; open ${record.page}`); process.exit(4); }
  let file;
  try {
    const { bytes, type } = await download(url);
    // The extension the file names, else the one its type names, else the URL path's own; never a guess of jpg for a video.
    const byType = /png/.test(type) ? 'png' : /webp/.test(type) ? 'webp' : /avif/.test(type) ? 'avif' : /gif/.test(type) ? 'gif' : /jpe?g/.test(type) ? 'jpg' : /mp4/.test(type) ? 'mp4' : /webm/.test(type) ? 'webm' : /ogg/.test(type) ? 'ogv' : /quicktime/.test(type) ? 'mov' : null;
    const ext = (url.match(/\.(jpe?g|png|webp|avif|gif|tiff?|mp4|webm|ogv|mov)(?:$|[?#])/i)?.[1] ?? byType ?? new URL(url).pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1] ?? (record.video ? 'mp4' : 'jpg')).toLowerCase().replace('jpeg', 'jpg');
    let slug = (args.name && args.name !== true ? String(args.name) : record.title).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || record.source;
    const out = path.resolve(project, args.out && args.out !== true ? String(args.out) : record.video ? 'public/video' : 'public/images');
    fs.mkdirSync(out, { recursive: true });
    // Two results with one title must not overwrite each other's file and credit.
    const taken = (f) => fs.existsSync(f) && load().assets.some((a) => a.file === rel(f) && a.source !== record.page);
    if (taken(path.join(out, `${slug}.${ext}`))) slug = `${slug}-${String(record.id).toLowerCase().replace(/[^a-z0-9]+/g, '').slice(-10)}`;
    file = path.join(out, `${slug}.${ext}`);
    fs.writeFileSync(file, bytes);
  } catch (e) {
    console.error(`download failed for ${target}: ${e.message}`);
    process.exit(4);
  }
  const log = load();
  const entry = { file: rel(file), kind: 'licensed', synthetic: false, found: true, collection: record.collection, source: record.page, author: record.creator ?? undefined, licence: record.licence, licenceUrl: record.licenceUrl ?? undefined, credit: creditLine(record), query: record.query, date: new Date().toISOString().slice(0, 10) };
  for (const k of Object.keys(entry)) if (entry[k] === undefined) delete entry[k];
  log.assets = log.assets.filter((a) => a.file !== entry.file).concat(entry);
  save(log);
  console.log(`saved ${entry.file} (${(fs.statSync(file).size / 1024).toFixed(0)} KB) and logged its credit: ${entry.credit}`);
  if (record.note) console.log(`note: ${record.note}`);
  console.log('Compress it to budget before shipping (references/patterns/asset-pipeline.md), and caption it for what it shows, never for where it came from.');
} else {
  console.error('usage: node assets.mjs add|check|credits|search|get …');
  process.exit(1);
}
