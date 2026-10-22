// Build-time facts: every count, list and command the site prints is read here from the plugin repository, so the
// page cannot drift from it. Nothing is cached across builds; the dev server re-reads on every page request.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

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

// "version+hash": the plugin's manifest version and the repository's short commit, so every capture manifest
// records which build it shot. The working tree's state rides beside it, never inside it.
export function buildInfo(version) {
  let hash = null;
  let dirty = null;
  try {
    hash = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    // The page reads the plugin as well as its own sources, so the whole repository decides "dirty".
    dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().length > 0;
  } catch {
    hash = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.slice(0, 7) : null;
  }
  return { id: `${version}+${hash ?? 'nogit'}`, version, hash, dirty };
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
  return {
    manifest,
    version: manifest.version,
    license: manifest.license,
    repo,
    build: buildInfo(manifest.version),
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
    playwright: pinnedVersion('playwright'),
    libraries,
  };
}
