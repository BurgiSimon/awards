// Build-time facts: every count, name and command this page prints is read here from the plugin and from the
// Ekvator showcase, so the page cannot drift from the repository. A skill without a line, or a missing file,
// stops the build instead of printing something stale.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const repoRoot = resolve(siteRoot, '../..');
export const pluginRoot = resolve(repoRoot, 'plugins/awards');
const ekvatorRoot = resolve(repoRoot, 'showcase/ekvator');

const read = (p) => readFileSync(p, 'utf8');
const json = (p) => JSON.parse(read(p));
const fail = (m) => { throw new Error(`facts: ${m}`); };

// The run, in the order craft drives it; each phase names the skill that does it. Phase 0 is craft's own.
const RUN = [
  ['Brief', 'craft', 'Takes the brief, keeps AWARDS.md honest and hands each phase to the next skill. It will not call a build finished before a jury and a ship report exist.'],
  ['Concept', 'concept', 'Reads the corpus, writes seven worlds from the audience’s own culture, deals three with a seeded roll and locks one direction contract.'],
  ['System', 'system', 'Turns the world into tokens: one type contract, two to four colours under a named strategy, a fluid scale, motion curves, themed browser surfaces.'],
  ['Structure', 'structure', 'Plans chapters with beats, one interruption and an authored close, then builds the semantic skeleton, the 404 and a hero probe.'],
  ['Stack', 'stack', 'Scaffolds Vite or a framework and boots Lenis and GSAP on one ticker, with quality tiers and the hook the capture tools drive.'],
  ['Motion', 'motion', 'Writes the motion score before any code: one moment per chapter, one signature, three reduced-motion tiers.'],
  ['WebGL', 'webgl', 'Adds a canvas only where a beat needs depth, with a DOM mirror, a no-GL fallback and a budget, or records that it declined.'],
  ['Jury', 'jury', 'Scores captures in a fresh context: Design, Usability, Creativity, Content and the six developer criteria, then one disposition.'],
  ['Ship', 'ship', 'Applies the jury’s fixes in one batch, runs the audit and the captures again, and writes the ship report.'],
];
const OUTSIDE = [
  ['component', 'One element at award level inside an existing world: a hero, a menu, a cursor, a footer.'],
  ['research', 'Turns a reference site into a corpus card: the principles to take and the signature to refuse.'],
];

// The audit's eight families, in the order the docs print them: scope → the name the page uses.
const FAMILIES = [
  ['fonts', 'Type'], ['contrast', 'Colour'], ['motion', 'Motion'], ['a11y', 'Accessibility'],
  ['layout', 'Layout'], ['perf', 'Performance'], ['surfaces', 'Browser surfaces'], ['slop', 'Slop scan'],
];
const QUOTED_RULES = ['T01', 'M01', 'X01'];

function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^"|"$/g, '');
  }
  return out;
}

function skills() {
  const dirs = readdirSync(resolve(pluginRoot, 'skills'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const named = new Set([...RUN.map((r) => r[1]), ...OUTSIDE.map((o) => o[0])]);
  for (const d of dirs) if (!named.has(d)) fail(`skill "${d}" has no line on the page; add it to RUN or OUTSIDE`);
  for (const n of named) if (!dirs.includes(n)) fail(`the page names a skill "${n}" that the plugin does not have`);
  for (const d of dirs) {
    const fm = frontmatter(read(resolve(pluginRoot, 'skills', d, 'SKILL.md')));
    if (fm.name !== d) fail(`skills/${d}/SKILL.md names itself "${fm.name}"`);
  }
  return {
    count: dirs.length,
    run: RUN.map(([phase, skill, line], i) => ({ n: i, phase, skill, line })),
    outside: OUTSIDE.map(([skill, line]) => ({ skill, line })),
  };
}

function recipes() {
  const tags = json(resolve(pluginRoot, 'scripts/data/recipe-tags.json'));
  const dir = resolve(pluginRoot, 'recipes');
  const list = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(resolve(dir, d.name, 'recipe.json')))
    .map((d) => json(resolve(dir, d.name, 'recipe.json')));
  const groups = Object.entries(tags.groups).map(([id, g]) => ({
    id, title: g.title, about: g.about,
    items: list.filter((r) => r.group === id).sort((a, b) => a.title.localeCompare(b.title)).map((r) => ({ id: r.id, title: r.title.replace(/`/g, '') })),
  })).filter((g) => g.items.length);
  const compositions = list.filter((r) => r.group === 'compositions').length;
  return { count: list.length, focused: list.length - compositions, compositions, groups };
}

function rules() {
  const all = json(resolve(pluginRoot, 'scripts/data/rules.json'));
  const ids = Object.keys(all);
  const families = FAMILIES.map(([scope, name]) => ({ scope, name, count: ids.filter((id) => all[id].scope === scope).length }));
  const counted = families.reduce((s, f) => s + f.count, 0);
  if (counted !== ids.length) fail(`rules.json has ${ids.length} rules but the families count ${counted}`);
  const quoted = QUOTED_RULES.map((id) => (all[id] ? { id, message: all[id].message } : fail(`rule ${id} is gone from rules.json`)));
  return { count: ids.length, families, quoted, render: ids.filter((id) => /render/i.test(all[id].message + (all[id].fix || ''))).length };
}

function corpus() {
  const dir = resolve(pluginRoot, 'references/sites');
  const cards = readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const index = read(resolve(dir, '_index.md'));
  const rows = index.split('\n').filter((l) => /^\| `[a-z0-9-]+` \|/.test(l));
  const clones = rows.filter((l) => /clone-level only/.test(l)).length;
  return { cards: cards.length, indexed: rows.length, clones, sites: cards.length - clones };
}

// The proof: Ekvator's seed and the latest jury line it logged (page rounds first, else the latest component pass).
function ekvator() {
  const md = read(resolve(ekvatorRoot, 'AWARDS.md'));
  const seed = (md.match(/\*\*Seed:\*\*\s*SEED (\S+) · DEALT ([\d ]+) of (\d+) · LEAD (\d+)/) || fail('ekvator AWARDS.md has no Seed line'));
  const log = md.slice(md.indexOf('## Jury log'), md.indexOf('## Ship log'));
  const lines = log.split('\n').filter((l) => /^- \d{4}-\d{2}-\d{2} · /.test(l));
  if (!lines.length) fail('ekvator has no jury line yet');
  const page = lines.filter((l) => !/· component |· baseline /.test(l));
  const latest = (page.length ? page : lines).at(-1);
  const m = latest.match(/^- (\d{4}-\d{2}-\d{2}) · (?:component \S+ · )?(\w+) · (D [\d.]+ \/ U [\d.]+ \/ C [\d.]+(?: \/ Co [\d.]+)?) → (?:mean )?([\d.]+)/);
  if (!m) fail(`cannot read the jury line: ${latest}`);
  const shipped = /- \[x\] Shipped/.test(md);
  const ship = md.slice(md.indexOf('## Ship log'), md.indexOf('## Exceptions')).split('\n').filter((l) => /^- \d{4}/.test(l)).at(-1) || null;
  return {
    seed: seed[1], dealt: seed[2].trim().split(/\s+/).join(' '), of: seed[3], lead: seed[4],
    jury: { date: m[1], disposition: m[2], scores: m[3].replace(/ \/ /g, ' · '), result: m[4], kind: page.length ? 'page' : 'component' },
    rounds: lines.length,
    shipped,
    shipLine: ship,
  };
}

export function collect() {
  const manifest = json(resolve(pluginRoot, '.claude-plugin/plugin.json'));
  return {
    version: manifest.version,
    licence: manifest.license,
    repo: manifest.repository,
    read: new Date().toISOString().slice(0, 10),
    skills: skills(),
    recipes: recipes(),
    rules: rules(),
    corpus: corpus(),
    ekvator: ekvator(),
  };
}
