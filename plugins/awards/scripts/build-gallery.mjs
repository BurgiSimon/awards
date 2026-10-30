#!/usr/bin/env node
// The recipe gallery, recipes/index.html, generated from every recipe.json so the page cannot drift from the data:
// one plate per recipe (its frame from _gallery/frames/, title, intent, tier, libraries) in group order, readable
// and linked without script, plus one JSON block the explorer (_gallery/gallery.js) reads for search, facets and
// the live stage: the full manifest, the source files shown beside the demo and the verifier's desktop states.
// Drafts (recipes/_drafts/) are not written into the page: its Drafts tab reads _drafts/drafts.json at run time,
// so a new draft or a saved review never makes this page stale.
// Usage: node scripts/build-gallery.mjs [--check]   Exit: 0 written or in sync · 1 drift.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from './lib/report.mjs';
import { isDay } from './build-catalogue.mjs';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const recipesDir = path.join(plugin, 'recipes');
const indexFile = path.join(recipesDir, 'index.html');
const SOURCE_EXT = new Set(['.html', '.js', '.mjs', '.css', '.md', '.jsx', '.vue', '.svelte', '.astro', '.glsl', '.frag', '.vert']);
const DEGRADED = /^(rm|reduced|static|fallback|nogl|offscreen|hidden|teardown|crash|forced|retier)(-|$)/;
const NEW_DAYS = 30;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const recipeIds = () => fs.readdirSync(recipesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !['node_modules', 'dist'].includes(d.name) && fs.existsSync(path.join(recipesDir, d.name, 'recipe.json')))
  .map((d) => d.name).sort();

// The text files of one recipe the explorer can show, README first and the verifier last. A draft passes its own
// folder (recipes/_drafts/<id>).
export function recipeFiles(id, root = path.join(recipesDir, id)) {
  const out = [];
  (function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) { if (!['node_modules', 'visuals'].includes(ent.name)) walk(p); }
      else if (SOURCE_EXT.has(path.extname(ent.name))) out.push(path.relative(root, p).split(path.sep).join('/'));
    }
  })(root);
  const rank = (f) => ['README.md', 'main.js', 'style.css', 'index.html'].indexOf(f) + 1 || (f === 'verify.mjs' ? 9 : f.includes('/') ? 8 : 5);
  return out.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Backticks in the manifests become <code>; everything else is escaped text.
const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const day = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : null;
};
const LIBS = { gsap: 'GSAP', lenis: 'Lenis', three: 'three.js', animejs: 'anime.js', '@unseenco/taxi': 'Taxi', 'matter-js': 'matter.js', ogl: 'OGL', postprocessing: 'postprocessing' };
const libName = (dep) => LIBS[dep.replace(/@[^@]*$/, '')] ?? dep.replace(/@[^@]*$/, '');

export async function verifierStates(id, dir = path.join(recipesDir, id)) {
  const file = path.join(dir, 'verify.mjs');
  if (!fs.existsSync(file)) return [];
  const mod = await import(pathToFileURL(file).href).catch(() => ({}));
  return (mod.states ?? [])
    .filter((s) => typeof s.scroll === 'number' && (!s.viewport || s.viewport === 'desktop') && !s.reducedMotion && !DEGRADED.test(s.name))
    .map((s) => ({ name: s.name, scroll: s.scroll }));
}

export async function gallery() {
  const vocab = JSON.parse(fs.readFileSync(path.join(plugin, 'scripts/data/recipe-tags.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(plugin, '.claude-plugin/plugin.json'), 'utf8'));
  const framesFile = path.join(recipesDir, '_gallery/frames.json');
  const shot = fs.existsSync(framesFile) ? JSON.parse(fs.readFileSync(framesFile, 'utf8')) : {};
  const frames = shot.frames ?? {};
  const sheet = shot.sheet && fs.existsSync(path.join(recipesDir, '_gallery', shot.sheet.file)) ? shot.sheet : null;
  const repo = String(manifest.repository ?? manifest.homepage ?? '').replace(/\/$/, '');
  const recipes = [];
  for (const id of recipeIds()) {
    const j = JSON.parse(fs.readFileSync(path.join(recipesDir, id, 'recipe.json'), 'utf8'));
    const hasFrame = fs.existsSync(path.join(recipesDir, '_gallery/frames', `${id}.webp`));
    recipes.push({
      id, title: j.title ?? id, intent: j.intent ?? '', group: j.group ?? '', summary: j.summary ?? '', tags: j.tags ?? [],
      deps: j.deps ?? [], tier: j.tier ?? '', variants: j.variants ?? [], seenIn: j.seenIn ?? [], addedIso: isDay(j.added) ? j.added : null,
      verified: j.verified?.date ? { date: day(j.verified.date), chromium: j.verified.chromium ?? null } : null,
      frame: hasFrame ? { state: frames[id]?.state ?? null, scroll: frames[id]?.scroll ?? null } : null,
      states: await verifierStates(id),
      files: recipeFiles(id),
    });
  }
  // New: added within NEW_DAYS of the newest `added` date in the catalogue. Measured against the data, not the clock,
  // so the page is the same whenever it is built, and a batch stops being new once a later one lands.
  const newest = recipes.reduce((m, r) => (r.addedIso && r.addedIso > m ? r.addedIso : m), '');
  for (const r of recipes) {
    r.added = day(r.addedIso);
    r.isNew = !!r.addedIso && (Date.parse(newest) - Date.parse(r.addedIso)) / 86_400_000 <= NEW_DAYS;
    delete r.addedIso;
  }
  const groups = Object.entries(vocab.groups).map(([key, g]) => ({ id: key, title: g.title, about: g.about, pattern: g.pattern ?? null }))
    .filter((g) => recipes.some((r) => r.group === g.id));
  const count = recipes.length;
  const verified = recipes.filter((r) => r.verified).length;
  // Counted as check-sync counts them: a complete composition is a recipe whose id starts with complete-.
  const compositions = recipes.filter((r) => r.id.startsWith('complete-')).length;

  let eager = 3;
  const plate = (r) => {
    const libs = [...new Set(r.deps.map(libName))];
    const img = r.frame
      ? `<img src="./_gallery/frames/${r.id}.webp" width="800" height="500" alt="" loading="${eager-- > 0 ? 'eager' : 'lazy'}" decoding="async">`
      : `<span class="plate__blank" aria-hidden="true">${esc(r.intent)}</span>`;
    return `        <li class="plate" data-id="${r.id}">
          <div class="plate__frame">${img}</div>
          <h3 class="plate__title"><a href="./${r.id}/index.html">${esc(r.title)}</a>${r.isNew ? ' <span class="new">New</span>' : ''}</h3>
          <p class="plate__intent">${esc(r.intent)}</p>
          <p class="plate__meta"><span class="tier" title="Tier ${r.tier}">${r.tier}</span>${libs.length ? ` <span class="plate__libs">${esc(libs.join(' · '))}</span>` : ' <span class="plate__libs">no library</span>'}</p>
        </li>`;
  };
  const sections = groups.map((g) => {
    const rows = recipes.filter((r) => r.group === g.id).sort((a, b) => a.tier.localeCompare(b.tier) || a.id.localeCompare(b.id));
    return `    <section class="group" id="group-${g.id}" data-group="${g.id}" aria-labelledby="group-${g.id}-title">
      <div class="group__head">
        <h2 id="group-${g.id}-title">${esc(g.title)}</h2>
        <p>${esc(g.about[0].toUpperCase() + g.about.slice(1))}.</p>
        <p class="group__count" data-group-count data-total="${rows.length}">${rows.length} recipe${rows.length === 1 ? '' : 's'}</p>
      </div>
      <ol class="plates" role="list">
${rows.map(plate).join('\n')}
      </ol>
    </section>`;
  }).join('\n');
  // The overview: every recipe as one tile of _gallery/sheet.webp, in catalogue order (decoration; the plates are the links).
  const shown = groups.flatMap((g) => recipes.filter((r) => r.group === g.id).sort((a, b) => a.tier.localeCompare(b.tier) || a.id.localeCompare(b.id)));
  const at = (n, of) => (of > 1 ? Math.round((n / (of - 1)) * 10000) / 100 : 0);
  const tiles = sheet ? shown.filter((r) => sheet.ids.includes(r.id)).map((r) => {
    const i = sheet.ids.indexOf(r.id);
    return `<span class="tile" data-id="${r.id}" data-group="${r.group}" style="--x:${at(i % sheet.cols, sheet.cols)}%;--y:${at(Math.floor(i / sheet.cols), sheet.rows)}%"></span>`;
  }) : [];
  const mosaic = tiles.length
    ? `      <div class="mosaic" aria-hidden="true" style="--cols:${sheet.cols};--rows:${sheet.rows}">\n        ${tiles.join('\n        ')}\n      </div>\n`
    : '';
  const toc = groups.map((g) => `          <li><a href="#group-${g.id}">${esc(g.title)}</a> <span class="toc__count">${recipes.filter((r) => r.group === g.id).length}</span></li>`).join('\n');

  // Site cards the "Seen in" lines can link to (a slug without a card stays plain text).
  const sites = [...new Set(recipes.flatMap((r) => r.seenIn))].filter((slug) => fs.existsSync(path.join(plugin, 'references/sites', `${slug}.md`))).sort();
  const data = { repo, count, groups, facets: vocab.facets, sites, recipes };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const description = `All ${count} recipes of the awards plugin: run each one live, scrub its scroll and read its source.`;

  const html = `<!doctype html>
<!-- Generated by scripts/build-gallery.mjs from every recipe.json; edit those, not this page. The explorer is _gallery/. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recipes · awards</title>
  <meta name="description" content="${esc(description)}">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#f1eee7" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#141312" media="(prefers-color-scheme: dark)">
  <meta property="og:title" content="Recipes · awards">
  <meta property="og:description" content="${esc(description)}">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23141312'/%3E%3Cpath d='M9 23 16 8l7 15' fill='none' stroke='%23f1eee7' stroke-width='2.6'/%3E%3C/svg%3E">
  <script>(function(d){d.classList.add('js');try{var t=localStorage.getItem('awards-gallery-theme');if(t==='light'||t==='dark')d.dataset.theme=t}catch(e){}})(document.documentElement)</script>
  <link rel="stylesheet" href="./_gallery/gallery.css">
  <script type="module" src="./_gallery/gallery.js"></script>
</head>
<body>
  <a class="skip" href="#recipes">Skip to the recipes</a>
  <header class="masthead">
    <a class="wordmark" href="./"><span class="wordmark__a">awards</span> <span class="wordmark__b">recipes</span></a>
    <nav class="masthead__nav" aria-label="Elsewhere">
      <ul role="list">
        <li><a href="#run">Run locally</a></li>
        <li><a href="${esc(repo)}/tree/main/plugins/awards/recipes">Source</a></li>
        <li class="js-only"><button class="theme-toggle" type="button" data-theme-toggle aria-label="Colour theme: system">System</button></li>
      </ul>
    </nav>
  </header>

  <main id="main">
    <div class="views js-only" data-views hidden>
      <div class="views__tabs" role="tablist" aria-label="Catalogue or drafts">
        <button type="button" role="tab" id="tab-catalogue" aria-controls="catalogue" aria-selected="true">Catalogue <span class="views__count">${count}</span></button>
        <button type="button" role="tab" id="tab-drafts" aria-controls="drafts" aria-selected="false" tabindex="-1">Drafts <span class="views__count" data-drafts-count></span></button>
      </div>
    </div>
    <div class="catalogue" id="catalogue">
    <section class="intro" aria-labelledby="title">
      <h1 id="title">Recipes <span class="intro__count">${count}</span></h1>
      <div class="intro__text">
        <p class="lede">The moves award-winning sites keep repeating, each built once in plain Vite, pinned to its libraries and driven through its states in headless Chromium.</p>
        <p>${count - compositions} focused recipes and ${compositions === 1 ? 'one complete composition' : `${compositions} complete compositions`}; ${verified} carry a recorded pass. Open one to run it live beside its source, scrub through its scroll, and read why it is built the way it is. The plugin's skills adapt them to a project's own world; they are never pasted.</p>
      </div>
${mosaic}      <nav class="toc" aria-label="Groups">
        <ol role="list">
${toc}
        </ol>
      </nav>
    </section>

    <div class="toolbar js-only" id="toolbar">
      <div class="toolbar__row">
        <div class="search">
          <label class="sr-only" for="q">Search the recipes</label>
          <svg class="search__icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg>
          <input id="q" type="search" placeholder="Search: scrub, shader, preloader…" autocomplete="off" spellcheck="false">
          <kbd class="search__key" aria-hidden="true">/</kbd>
        </div>
        <button class="toolbar__button" type="button" data-facets-toggle aria-expanded="false" aria-controls="facets">Filters<span class="toolbar__badge" data-filter-count hidden></span></button>
        <div class="segmented" role="group" aria-label="Tier" data-tier>
          <button type="button" data-value="" aria-pressed="true">All</button>
          <button type="button" data-value="P0" aria-pressed="false">P0</button>
          <button type="button" data-value="P1" aria-pressed="false">P1</button>
          <button type="button" data-value="P2" aria-pressed="false">P2</button>
        </div>
        <div class="segmented" role="group" aria-label="Layout" data-view>
          <button type="button" data-value="plates" aria-pressed="true">Plates</button>
          <button type="button" data-value="index" aria-pressed="false">Index</button>
        </div>
        <button class="toolbar__button toolbar__random" type="button" data-random>Random</button>
      </div>
      <p class="toolbar__status" role="status" data-status>${count} recipes</p>
      <div class="facets" id="facets" hidden></div>
    </div>

    <div class="results" id="recipes" tabindex="-1">
${sections}
      <p class="empty" data-empty hidden>Nothing matches. <button type="button" data-clear>Clear the search and filters</button></p>
    </div>
    </div>
  </main>

  <footer class="colophon" id="run">
    <h2>Run them</h2>
    <div class="colophon__grid">
      <div>
        <p>Every recipe is a small Vite page with its own README, manifest and verifier. From <code>plugins/awards/recipes</code>:</p>
        <pre><code>npm install
npm run dev                              # this index, every recipe live
node ../scripts/verify-recipes.mjs --only scroll-pin-scrub</code></pre>
      </div>
      <div>
        <p>This page is generated by <code>scripts/build-gallery.mjs</code> from the manifests; its frames come from <code>scripts/gallery-frames.mjs</code>, shot at 1440 × 900 in headless Chromium with software WebGL, which proves a recipe works, not that it is fast.</p>
        <p>Recipes, frames and this page are the plugin's own work under the MIT licence.</p>
      </div>
    </div>
  </footer>
  <script type="application/json" id="gallery-data">${json}</script>
</body>
</html>
`;
  return { html, count };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), { check: 'boolean' });
  const { html, count } = await gallery();
  const current = fs.existsSync(indexFile) ? fs.readFileSync(indexFile, 'utf8') : '';
  if (args.check) {
    const drift = current !== html;
    if (drift) console.error('recipes/index.html is out of date: run node scripts/build-gallery.mjs');
    console.log(`${count} recipe(s) · gallery ${drift ? 'stale' : 'in sync'}`);
    process.exit(drift ? 1 : 0);
  }
  fs.writeFileSync(indexFile, html);
  console.log(`${count} recipe(s) → recipes/index.html`);
}
