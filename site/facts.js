// Build-time facts: every count and list on the site is read from the plugin, so the page cannot drift from it.
// Also inlines the shared header and footer partials. Placeholders: %%name%% and <!-- @partial -->.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const plugin = resolve(here, '../plugins/awards');
const json = (p) => JSON.parse(readFileSync(resolve(plugin, p), 'utf8'));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const FAMILIES = [
  ['T', 'fonts', 'Type', 'reflex faces, CDN links, unclamped display sizes, crushed tracking, text set against reading'],
  ['C', 'contrast', 'Colour', 'body contrast under 4.5:1, pure black grounds, more than six hues, gradient text'],
  ['M', 'motion', 'Motion', 'no reduced-motion path, global animation kills, scrubs with easing, layout properties animated'],
  ['A', 'a11y', 'Accessibility', 'missing alt, skipped headings, canvas with no DOM mirror, click handlers on divs, no skip link'],
  ['L', 'layout', 'Layout', 'sideways overflow, icon-card grids, eyebrow labels, lines past 90 characters, text touching a phone edge'],
  ['P', 'perf', 'Performance', 'unsized images, eager media, heavy font files, WebGL in the entry chunk'],
  ['S', 'surfaces', 'Browser surfaces', 'selection, scrollbar, theme-color, color-scheme, favicon, Open Graph image'],
  ['X', 'slop', 'Slop scan', 'the habits a generator falls into: glow, glass, framework purple, bounce easing, promise words, hero-metric rows'],
];

export function collectFacts() {
  const manifest = json('.claude-plugin/plugin.json');
  const rules = json('scripts/data/rules.json');
  const skills = readdirSync(resolve(plugin, 'skills')).filter((d) => existsSync(resolve(plugin, 'skills', d, 'SKILL.md')));
  const sites = readdirSync(resolve(plugin, 'references/sites')).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const patterns = readdirSync(resolve(plugin, 'references/patterns')).filter((f) => f.endsWith('.md'));
  const recipes = readdirSync(resolve(plugin, 'recipes'))
    .filter((d) => existsSync(resolve(plugin, 'recipes', d, 'recipe.json')))
    .map((d) => json(`recipes/${d}/recipe.json`))
    .sort((a, b) => a.id.localeCompare(b.id));
  const ruleList = Object.entries(rules).map(([id, r]) => ({ ...r, id }));
  const bySev = (s) => ruleList.filter((r) => r.severity === s).length;
  return { manifest, rules: ruleList, skills, sites, patterns, recipes, bySev };
}

function render(f) {
  const verified = f.recipes.filter((r) => r.verified?.date);
  const families = FAMILIES.map(([prefix, scope, name, what]) => {
    const n = f.rules.filter((r) => r.scope === scope).length;
    return `<tr><th scope="row"><span class="mono">${prefix}</span> ${name}</th><td class="num">${n}</td><td>${what}</td></tr>`;
  }).join('\n');
  const ruleTable = FAMILIES.map(([prefix, scope, name]) => {
    const rows = f.rules.filter((r) => r.scope === scope)
      .map((r) => `<tr><td class="mono">${r.id}</td><td class="mono">${r.severity}</td><td>${esc(r.message)}</td></tr>`).join('');
    return `<details class="rules"><summary><span class="mono">${prefix}</span> ${name} <span class="count">${f.rules.filter((r) => r.scope === scope).length} rules</span></summary>
<table><caption class="sr-only">${name} rules</caption><thead><tr><th scope="col">Rule</th><th scope="col">Severity</th><th scope="col">What it flags</th></tr></thead><tbody>${rows}</tbody></table></details>`;
  }).join('\n');
  const recipeList = f.recipes.map((r) =>
    `<li id="recipe-${r.id}"><span class="mono id">${r.id}</span><span class="title">${esc(r.title)}</span><span class="mono tags">${r.tags.slice(0, 4).map(esc).join(' · ')}</span><span class="mono when">${r.verified?.date ? `verified ${r.verified.date}` : 'unverified'}</span></li>`).join('\n');
  const jury = JSON.parse(readFileSync(resolve(here, 'jury.json'), 'utf8'));
  const score = (v) => (typeof v === 'number' ? v.toFixed(2) : 'unmeasured');
  return {
    'site-root': process.env.SITE_ROOT || '/',
    'jury-design': score(jury.design),
    'jury-usability': score(jury.usability),
    'jury-creativity': score(jury.creativity),
    'jury-content': score(jury.content),
    'jury-weighted': score(jury.weighted),
    'jury-disposition': jury.disposition ?? 'pending',
    'jury-date': jury.date ?? 'not yet judged',
    'jury-memory': esc(jury.memory ?? 'The jury has not run on this build yet.'),
    version: f.manifest.version,
    license: f.manifest.license,
    repo: f.manifest.repository,
    skills: f.skills.length,
    recipes: f.recipes.length,
    'recipes-verified': verified.length,
    'recipes-focused': f.recipes.filter((r) => !r.id.startsWith('complete-')).length,
    rules: f.rules.length,
    'rules-slop': f.rules.filter((r) => r.scope === 'slop').length,
    'rules-p0p1': f.bySev('P0') + f.bySev('P1'),
    sites: f.sites.length,
    patterns: f.patterns.length,
    families,
    'rule-table': ruleTable,
    'recipe-list': recipeList,
  };
}

export default function facts() {
  let values;
  return {
    name: 'awards-facts',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        values ??= render(collectFacts());
        return html
          .replace(/<!-- @(\w+) -->/g, (_, name) => readFileSync(resolve(here, 'partials', `${name}.html`), 'utf8'))
          .replace(/%%([\w-]+)%%/g, (m, key) => {
            if (!(key in values)) throw new Error(`facts: unknown placeholder ${m}`);
            return values[key];
          });
      },
    },
  };
}
