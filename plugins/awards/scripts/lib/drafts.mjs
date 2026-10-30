// Draft recipes: proposals that live in recipes/_drafts/<id>/ until the maintainer decides on them in the explorer's
// Drafts tab. A draft is a recipe folder one level deeper (same files, `../../_shared/` instead of `../_shared/`) plus
// a review.json holding the decision. The folder starts with an underscore, so the catalogue, the counts, the frames
// and the verifier's default run never see a draft until scripts/drafts.mjs promotes it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { recipeFiles } from '../build-gallery.mjs';
import { isDay } from '../build-catalogue.mjs';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const recipesDir = path.join(plugin, 'recipes');
export const draftsDir = path.join(recipesDir, '_drafts');

// The decisions a review can hold. `new` (no review.json yet) and `revised` (changed after an `improve`) wait for
// the maintainer; the other three are theirs.
export const STATUSES = {
  new: 'To review',
  revised: 'Revised',
  accept: 'Accepted',
  improve: 'Changes asked',
  reject: 'Rejected',
};
export const DECISIONS = ['accept', 'improve', 'reject'];
export const REQUIRED_FILES = ['index.html', 'main.js', 'style.css', 'README.md', 'recipe.json', 'verify.mjs'];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const today = () => new Date().toISOString().slice(0, 10);

export const isDraftId = (id) => typeof id === 'string' && ID.test(id);
export const draftDir = (id) => path.join(draftsDir, id);

export const draftIds = () => (fs.existsSync(draftsDir) ? fs.readdirSync(draftsDir, { withFileTypes: true }) : [])
  .filter((d) => d.isDirectory() && isDraftId(d.name) && fs.existsSync(path.join(draftsDir, d.name, 'recipe.json')))
  .map((d) => d.name).sort();

export function readManifest(id) {
  try { return JSON.parse(fs.readFileSync(path.join(draftDir(id), 'recipe.json'), 'utf8')); } catch { return null; }
}

export function readReview(id) {
  const file = path.join(draftDir(id), 'review.json');
  let r = null;
  try { r = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  if (!r || !STATUSES[r.status]) return { status: 'new', notes: '', date: null, reply: '', history: [] };
  return { status: r.status, notes: String(r.notes ?? ''), date: r.date ?? null, reply: String(r.reply ?? ''), history: Array.isArray(r.history) ? r.history : [] };
}

function saveReview(id, review) {
  fs.writeFileSync(path.join(draftDir(id), 'review.json'), JSON.stringify(review, null, 2) + '\n');
  return review;
}

// The maintainer's decision. A decision made after a revision keeps the round it answers in the history; changing
// one's mind before anyone replied simply replaces it.
export function writeReview(id, { status, notes = '' }) {
  if (!DECISIONS.includes(status)) throw new Error(`status must be one of ${DECISIONS.join(', ')}`);
  const prev = readReview(id);
  const history = [...prev.history];
  if (prev.status === 'revised') history.push({ status: 'improve', notes: prev.notes, date: prev.date, reply: prev.reply });
  return saveReview(id, { status, notes: String(notes).slice(0, 8000), date: today(), history });
}

// The builder's answer to an `improve`: what changed. The draft goes back to the maintainer as `revised`.
export function writeReply(id, reply) {
  const prev = readReview(id);
  return saveReview(id, { status: 'revised', notes: prev.notes, date: prev.date ?? today(), reply: String(reply), history: prev.history });
}

// What keeps a draft from being promoted as it stands: the catalogue's own manifest checks plus the contract's files.
export function draftProblems(id, manifest = readManifest(id)) {
  const vocab = JSON.parse(fs.readFileSync(path.join(plugin, 'scripts/data/recipe-tags.json'), 'utf8'));
  const facetOf = new Map(Object.entries(vocab.facets).flatMap(([facet, tags]) => tags.map((t) => [t, facet])));
  const out = [];
  if (!manifest) return ['recipe.json is not valid JSON'];
  for (const f of REQUIRED_FILES) if (!fs.existsSync(path.join(draftDir(id), f))) out.push(`no ${f}`);
  if (manifest.id !== id) out.push(`recipe.json id is ${manifest.id ?? 'missing'}, the folder is ${id}`);
  for (const key of ['title', 'intent', 'group', 'summary']) if (!manifest[key]) out.push(`recipe.json has no ${key}`);
  if (manifest.group && !vocab.groups[manifest.group]) out.push(`unknown group ${manifest.group}`);
  if (!['P0', 'P1', 'P2'].includes(manifest.tier)) out.push(`tier is ${manifest.tier ?? 'missing'}, not P0, P1 or P2`);
  if (!Array.isArray(manifest.tags) || !manifest.tags.length) out.push('no tags');
  for (const t of manifest.tags ?? []) {
    if (t in vocab.aliases) out.push(`retired tag ${t}${vocab.aliases[t] ? ` (use ${vocab.aliases[t]})` : ''}`);
    else if (!facetOf.has(t)) out.push(`tag ${t} is not in scripts/data/recipe-tags.json`);
  }
  if (manifest.drafted !== undefined && !isDay(manifest.drafted)) out.push(`drafted is ${manifest.drafted}, not a YYYY-MM-DD date`);
  if (fs.existsSync(path.join(recipesDir, id))) out.push(`recipes/${id} already exists: rename the draft before promoting it`);
  return out;
}

// The verifier's desktop states, as the explorer's scrub marks show them. Imported fresh whenever the file changes,
// because the dev server stays up while a draft is edited.
const DEGRADED = /^(rm|reduced|static|fallback|nogl|offscreen|hidden|teardown|crash|forced|retier)(-|$)/;
async function draftStates(id) {
  const file = path.join(draftDir(id), 'verify.mjs');
  if (!fs.existsSync(file)) return [];
  const mod = await import(`${pathToFileURL(file).href}?v=${fs.statSync(file).mtimeMs}`).catch(() => ({}));
  return (mod.states ?? [])
    .filter((s) => typeof s.scroll === 'number' && (!s.viewport || s.viewport === 'desktop') && !s.reducedMotion && !DEGRADED.test(s.name))
    .map((s) => ({ name: s.name, scroll: s.scroll }));
}

// Everything the explorer's Drafts tab shows, as one JSON document (served live by the dev server, written into
// dist/ by the build).
export async function draftsData({ writable = false } = {}) {
  const frames = framesData().drafts ?? {};
  const drafts = [];
  for (const id of draftIds()) {
    const j = readManifest(id) ?? {};
    const hasFrame = fs.existsSync(path.join(draftDir(id), 'frame.webp'));
    drafts.push({
      id, title: j.title ?? id, intent: j.intent ?? '', group: j.group ?? '', summary: j.summary ?? '', tags: j.tags ?? [],
      deps: j.deps ?? [], tier: j.tier ?? '', variants: j.variants ?? [], seenIn: j.seenIn ?? [], drafted: isDay(j.drafted) ? j.drafted : null,
      frame: hasFrame ? { state: frames[id]?.state ?? null, scroll: frames[id]?.scroll ?? null } : null,
      states: await draftStates(id),
      files: recipeFiles(id, draftDir(id)),
      review: readReview(id),
      problems: draftProblems(id, j),
    });
  }
  return { writable, statuses: STATUSES, drafts };
}

export const framesFile = path.join(recipesDir, '_gallery/frames.json');
export function framesData() {
  try { return JSON.parse(fs.readFileSync(framesFile, 'utf8')); } catch { return { frames: {} }; }
}

// A draft sits one folder deeper than a recipe: every relative path that climbs out of it climbs one level more.
// Applied to the text files only, in quotes, url() and @import, where the recipes write their relative paths.
export const TEXT_EXT = new Set(['.html', '.js', '.mjs', '.css', '.md', '.jsx', '.vue', '.svelte', '.astro', '.glsl', '.frag', '.vert']);
export function rebase(text, direction) {
  return direction === 'out'
    ? text.replace(/(['"(])\.\.\/\.\.\//g, '$1../')
    : text.replace(/(['"(])\.\.\/(?!\.\.\/)/g, '$1../../');
}
