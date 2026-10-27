// Build-time facts: every count, list and command the site prints is read here from the plugin repository, so the
// page cannot drift from it. Nothing is cached across builds; the dev server re-reads on every page request.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { collectBuilds, rebuildStory } from './builds.js';
import { collectPhases } from './phases.js';

export const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const repoRoot = resolve(siteRoot, '..');
export const pluginRoot = resolve(repoRoot, 'plugins/awards');

const read = (p) => readFileSync(p, 'utf8');
const json = (p) => JSON.parse(read(p));
const fromPlugin = (p) => resolve(pluginRoot, p);

// The audit's eight families, in the order rules.json and the docs print them: scope → the name the page uses.
export const FAMILIES = [
  ['fonts', 'Type'],
  ['contrast', 'Colour'],
  ['motion', 'Motion'],
  ['a11y', 'Accessibility'],
  ['layout', 'Layout'],
  ['perf', 'Performance'],
  ['surfaces', 'Browser surfaces'],
  ['slop', 'Slop scan'],
];

// The libraries the built page ships (or is built with), credited with the version actually installed.
const LIBRARIES = [
  ['gsap', 'GSAP', 'GreenSock, the GSAP standard no-charge licence'],
  ['lenis', 'Lenis', 'darkroom.engineering, MIT licence'],
  ['vite', 'Vite', 'build only, MIT licence'],
];

class FactError extends Error {}
export const fail = (message) => { throw new FactError(`facts: ${message}`); };

// The site's own build inputs: the five pages, the sources, the facts plugin, the public files (frames included)
// and the build config. dist/, node_modules/ and .awards/ are outputs or evidence, never inputs.
const SOURCE_ROOTS = ['index.html', 'install.html', 'docs.html', 'recipes.html', '404.html', 'src', 'facts', 'public', 'vite.config.js', 'package.json', 'package-lock.json'];
// What the record and the recipe wall read outside the site: the showcase builds' records and the explorer's frames.
const RECORD_INPUTS = ['showcase/awards-home', 'showcase/ekvator', 'showcase/extinct', 'showcase/petrel'];

function sourceFiles() {
  const out = [];
  const walk = (rel) => {
    const abs = resolve(siteRoot, rel);
    if (!existsSync(abs)) return;
    if (statSync(abs).isDirectory()) {
      for (const name of readdirSync(abs).sort()) walk(`${rel}/${name}`);
    } else out.push(rel);
  };
  for (const r of SOURCE_ROOTS) walk(r);
  return out;
}

// Git's own blob id for a file's bytes, so the working tree can be compared with HEAD without trusting the index
// (an assume-unchanged flag hides an edit from `git status`, never from this).
const blobId = (buf) => createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');

// "version+commit.sources": the plugin's manifest version, the repository's short commit, and a digest of the
// site's own inputs plus every fact the page prints. Two builds that print anything different carry different ids,
// committed or not, so a capture manifest names exactly the build it shot and the strip's caption can tell the
// frames' build from the one being read (component jury, 2026-10-22). `dirty` compares the site's files with HEAD
// byte for byte and adds the plugin's tracked changes.
export function buildInfo(version, factsDigest = '') {
  let hash = null;
  let dirty = null;
  const files = sourceFiles();
  const digest = createHash('sha256');
  const bytes = new Map();
  for (const rel of files) {
    const buf = readFileSync(resolve(siteRoot, rel));
    bytes.set(rel, buf);
    digest.update(`${rel}\0${buf.length}\0`).update(buf);
  }
  digest.update(`facts\0${factsDigest}`);
  const sources = digest.digest('hex').slice(0, 7);
  try {
    hash = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const site = relative(repoRoot, siteRoot).split('\\').join('/');
    const head = new Map(execFileSync('git', ['ls-tree', '-r', 'HEAD', '--', site], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).toString()
      .split('\n').filter(Boolean).map((l) => { const [meta, path] = l.split('\t'); return [path.slice(site.length + 1), meta.split(' ')[2]]; }));
    const inSources = (rel) => SOURCE_ROOTS.some((r) => rel === r || rel.startsWith(`${r}/`));
    const siteDirty = files.some((rel) => head.get(rel) !== blobId(bytes.get(rel))) || [...head.keys()].some((rel) => inSources(rel) && !bytes.has(rel));
    const pluginDirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no', '--', 'plugins/awards', 'README.md', ...RECORD_INPUTS], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().length > 0;
    dirty = siteDirty || pluginDirty;
  } catch {
    hash = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.slice(0, 7) : null;
  }
  return { id: `${version}+${hash ?? 'nogit'}.${sources}`, version, hash, sources, dirty };
}

// Fenced code blocks of one `### heading` inside `## Install` of the repository README.
function installCommands() {
  const file = resolve(repoRoot, 'README.md');
  const text = read(file);
  const install = text.split(/^## /m).find((s) => s.startsWith('Install'));
  if (!install) fail('README.md has no "## Install" section');
  const blocksUnder = (heading) => {
    const part = install.split(/^### /m).find((s) => s.startsWith(heading));
    if (!part) fail(`README.md "## Install" has no "### ${heading}"`);
    return [...part.matchAll(/```[a-z]*\n([\s\S]*?)```/g)].map((m) => m[1].split('\n').map((l) => l.trim()).filter(Boolean));
  };
  // The published repository's commands, never the local-checkout form with an absolute path in it.
  const pick = (heading, re) => {
    const block = blocksUnder(heading).find((lines) => lines.length && lines.every((l) => re.test(l)) && !lines.some((l) => l.includes('/absolute/path')));
    if (!block) fail(`README.md "### ${heading}" has no published-repository command block`);
    return block;
  };
  return {
    'claude-code': pick('Claude Code', /^\/plugin /),
    codex: pick('Codex', /^codex plugin /),
  };
}

function pinnedVersion(pkg) {
  const text = read(fromPlugin('references/stacks/versions.md'));
  const row = text.split('\n').find((l) => l.startsWith(`| ${pkg} |`));
  const v = row?.split('|')[2]?.trim();
  if (!v || !/^\d+\.\d+\.\d+$/.test(v)) fail(`references/stacks/versions.md has no pinned row for ${pkg}`);
  return v;
}

// The four dispositions as the juror applies them: `## Dispositions` of the jury agent, one line each. Home and /docs
// print these lines and nothing else, so the ship rule is written once, where the jury reads it.
const DISPOSITIONS = ['ship', 'fix', 'rebuild', 'recapture'];
function dispositions() {
  const text = read(fromPlugin('agents/awards-jury.md'));
  const section = text.split(/^## /m).find((s) => s.startsWith('Dispositions'));
  if (!section) fail('agents/awards-jury.md has no "## Dispositions" section');
  const lines = new Map([...section.matchAll(/^- `([a-z]+)` — (.+)$/gm)].map((m) => [m[1], m[2].trim()]));
  for (const d of DISPOSITIONS) if (!lines.has(d)) fail(`agents/awards-jury.md ## Dispositions has no line for \`${d}\``);
  if (lines.size !== DISPOSITIONS.length) fail(`agents/awards-jury.md ## Dispositions lists ${lines.size} dispositions; the pages print ${DISPOSITIONS.length}`);
  return DISPOSITIONS.map((id) => ({ id, rule: lines.get(id) }));
}

// A skill's first sentence, for a skill the docs have no authored line for yet.
function skillDescription(dir) {
  const head = read(fromPlugin(`skills/${dir}/SKILL.md`)).split(/^---$/m)[1] ?? '';
  const m = /^description:\s*"?(.+?)"?\s*$/m.exec(head);
  const d = (m?.[1] ?? '').replace(/\\"/g, '"');
  return (d.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? d).trim();
}

export function collectFacts() {
  const manifest = json(fromPlugin('.claude-plugin/plugin.json'));
  const rulesById = json(fromPlugin('scripts/data/rules.json'));
  const rules = Object.entries(rulesById).map(([id, r]) => ({ id, ...r }));
  for (const r of rules) if (!FAMILIES.some(([scope]) => scope === r.scope)) fail(`rule ${r.id} has scope "${r.scope}", which the page has no family name for`);
  const skills = readdirSync(fromPlugin('skills')).filter((d) => existsSync(fromPlugin(`skills/${d}/SKILL.md`))).sort();
  const sites = readdirSync(fromPlugin('references/sites')).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => f.slice(0, -3));
  const skeletonDir = fromPlugin('references/sites/skeletons');
  const skeletons = existsSync(skeletonDir) ? readdirSync(skeletonDir).filter((f) => f.endsWith('.png') && sites.includes(f.slice(0, -4))) : [];
  const patterns = readdirSync(fromPlugin('references/patterns')).filter((f) => f.endsWith('.md'));
  const recipes = readdirSync(fromPlugin('recipes'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && existsSync(fromPlugin(`recipes/${d.name}/recipe.json`)))
    .map((d) => json(fromPlugin(`recipes/${d.name}/recipe.json`)))
    .sort((a, b) => a.id.localeCompare(b.id));
  const vocab = json(fromPlugin('scripts/data/recipe-tags.json'));
  const groups = Object.entries(vocab.groups).map(([id, g]) => ({ id, title: g.title, about: g.about, count: recipes.filter((r) => r.group === id).length }));
  for (const r of recipes) if (!vocab.groups[r.group]) fail(`recipe ${r.id} has group "${r.group}", which recipe-tags.json does not define`);
  const libraries = LIBRARIES.map(([pkg, name, credit]) => {
    const file = resolve(siteRoot, 'node_modules', pkg, 'package.json');
    if (!existsSync(file)) fail(`${pkg} is not installed; run npm ci in ${relative(repoRoot, siteRoot)}`);
    return { pkg, name, credit, version: json(file).version };
  });
  const repo = String(manifest.repository ?? '').replace(/\.git$/, '');
  if (!/^https:\/\/github\.com\//.test(repo)) fail(`plugin.json repository is not a GitHub URL: ${manifest.repository}`);
  const bySeverity = (...s) => rules.filter((r) => s.includes(r.severity)).length;
  const facts = {
    manifest,
    version: manifest.version,
    license: manifest.license,
    repo,
    siteDir: relative(repoRoot, siteRoot).split('\\').join('/'),
    rules,
    families: FAMILIES.map(([scope, name]) => ({ scope, name, rules: rules.filter((r) => r.scope === scope) })),
    p0p1: bySeverity('P0', 'P1'),
    skills: skills.map((id) => ({ id, description: skillDescription(id) })),
    sites,
    skeletons,
    patterns,
    recipes,
    groups,
    tags: [...new Set(recipes.flatMap((r) => r.tags ?? []))].sort(),
    commands: installCommands(),
    dispositions: dispositions(),
    playwright: pinnedVersion('playwright'),
    libraries,
  };
  // The build id digests everything the page prints from the plugin too, so a changed count is a different build.
  // The recipe explorer's frames (plugins/awards/recipes/_gallery): one per recipe, shot in headless Chromium.
  const gallery = json(fromPlugin('recipes/_gallery/frames.json'));
  facts.frames = new Map(Object.entries(gallery.frames ?? {}));
  facts.framesSize = gallery.frame;
  facts.framesViewport = gallery.viewport;
  facts.framesDir = fromPlugin('recipes/_gallery/frames');
  facts.builds = collectBuilds();
  facts.rebuild = rebuildStory(facts.builds);
  facts.phases = collectPhases();
  const { builds, rebuild, phases, frames, ...printed } = facts;
  facts.build = buildInfo(manifest.version, createHash('sha256').update(JSON.stringify({ printed, builds, rebuild, phases, frames: [...frames] })).digest('hex'));
  return facts;
}
