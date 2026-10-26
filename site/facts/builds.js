// The record (AWARDS.md, SIGNATURE): five builds this plugin made, each with the trail of what its jury said, read at
// build from the build's own AWARDS.md `## Jury log` and its `.awards/jury/` reports. Names and the one-line "what it
// is" are authored here; every verdict, score, date, file and quoted sentence is read, and a record that cannot be
// read stops the build (baseline fault 1: nothing printed describes a build other than the one named).
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot, siteRoot, fail } from './collect.js';

// `frame` is the build's first viewport as this site's build captured it (scripts/builds.mjs → public/builds/).
export const BUILDS = [
  {
    id: 'awards-home',
    name: 'awards, a press proof',
    what: 'An earlier home page for this plugin, built as a showcase: the page as a press proof printed out of register.',
    fictional: false,
    awards: 'showcase/awards-home/AWARDS.md',
    folder: 'showcase/awards-home',
  },
  {
    id: 'ekvator',
    name: 'Ekvator E1',
    what: 'A lamp maker in Tromsø whose window panel replays another city’s sun. A fictional client, invented for the build.',
    fictional: true,
    awards: 'showcase/ekvator/AWARDS.md',
    folder: 'showcase/ekvator',
  },
  {
    id: 'extinct',
    name: 'The Museum of Extinct Colours',
    what: 'A one-room museum in Antwerp showing seven pigments that can no longer be bought. A fictional client, invented for the build.',
    fictional: true,
    awards: 'showcase/extinct/AWARDS.md',
    folder: 'showcase/extinct',
  },
  {
    id: 'petrel',
    name: 'C/S Petrel',
    what: 'A cable ship out of Ponta Delgada that mends broken internet cables on the Atlantic floor. A fictional client, invented for the build.',
    fictional: true,
    awards: 'showcase/petrel/AWARDS.md',
    folder: 'showcase/petrel',
  },
  {
    id: 'contact-sheet',
    name: 'The contact sheet',
    what: 'The page this one replaces: this site’s previous build, a strip of its own screenshots marked up by its jury.',
    fictional: false,
    awards: 'site/.awards/redesign-2/baseline-AWARDS.md',
    folder: 'site/.awards/redesign-2',
    // Its first baseline line scored the site before it (the wind-tunnel build); the last one re-judged this build
    // under the 1.0.0 jury, as the baseline of the page you are reading.
    skipFirstBaseline: true,
  },
];

const read = (rel) => {
  const abs = resolve(repoRoot, rel);
  if (!existsSync(abs)) fail(`the record needs ${rel}, which is not on disk`);
  return readFileSync(abs, 'utf8');
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
export const shortDate = (iso) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1].slice(0, 3)}`; };

// One `## Jury log` line → a round. Formats (awards:jury): `date · [component <sel> · | verdict · | baseline ·]
// <disposition> · D a / U b / C c [/ Co d] → [mean ]w · … [· .awards/jury/<file>.md]`.
const LINE = /^- (\d{4}-\d{2}-\d{2}) · (?:(component) [^·]+· |(verdict) · |(baseline) · )?(ship|fix|rebuild|recapture) · D ([\d.]+) \/ U ([\d.]+) \/ C ([\d.]+)(?: \/ Co ([\d.]+))? → (?:mean )?([\d.]+)(.*)$/;

function rounds(text, file) {
  const log = text.split(/^## /m).find((s) => s.startsWith('Jury log'));
  if (!log) fail(`${file} has no "## Jury log"`);
  const out = [];
  for (const raw of log.split('\n').filter((l) => l.startsWith('- 2'))) {
    const m = LINE.exec(raw);
    if (!m) fail(`${file}: a Jury log line the record cannot read: ${raw.slice(0, 90)}`);
    const [, date, component, verdict, baseline, word, d, u, c, co, w, rest] = m;
    const kind = component ? 'component' : verdict ? 'verdict' : baseline ? 'baseline' : 'page';
    const report = /\.awards\/jury\/([\w.-]+\.md)/.exec(rest)?.[1] ?? null;
    out.push({ date, kind, word, d: +d, u: +u, c: +c, co: co ? +co : null, w: +w, report });
  }
  return out;
}

// The first paragraph line (quoted or not) under a report's `## Memory test` (written before the juror read the contract).
function memory(dir, report) {
  const rel = `${dir}/.awards/jury/${report}`;
  const text = read(rel);
  const section = text.split(/^## /m).find((s) => s.startsWith('Memory test'));
  if (!section) fail(`${rel} has no "## Memory test"`);
  const line = section.split('\n').slice(1).map((l) => l.trim()).find((l) => l && !/^[(|-]/.test(l));
  if (!line) fail(`${rel}: no memory sentence`);
  // A quoted sentence ends at its closing quote; whatever the juror wrote after it is commentary, not the sentence.
  const quoted = /^["“](.+?)["”](?=\s|$)/.exec(line);
  return { text: quoted ? quoted[1] : line, file: rel };
}

// A verdict report, when the log line names none: `<date>-verdict.md` beside the page report.
function reportFor(dir, round) {
  if (round.report) return round.report;
  if (round.kind === 'verdict' && existsSync(resolve(repoRoot, `${dir}/.awards/jury/${round.date}-verdict.md`))) return `${round.date}-verdict.md`;
  return null;
}

export function collectBuilds() {
  return BUILDS.map((b) => {
    const dir = b.awards.replace(/\/[^/]+$/, '').replace(/\/\.awards\/redesign-2$/, '');
    const reportDir = b.id === 'contact-sheet' ? 'site' : b.folder;
    let trail = rounds(read(b.awards), b.awards);
    if (b.skipFirstBaseline) {
      const i = trail.findIndex((r) => r.kind === 'baseline');
      if (i === 0) trail = trail.slice(1);
    }
    // Baselines inside a trail are kept only as the last line: a later jury re-scoring the finished build.
    trail = trail.filter((r, i) => r.kind !== 'baseline' || i === trail.length - 1);
    for (const r of trail) r.report = reportFor(reportDir, r);
    const scored = trail.filter((r) => r.kind !== 'component');
    if (!scored.length) fail(`${b.awards}: no page round in the Jury log`);
    const last = scored[scored.length - 1];
    const firstPage = scored.find((r) => r.kind === 'page' && r.report);
    if (!firstPage) fail(`${b.awards}: no page round names its report`);
    const mem = memory(reportDir, firstPage.report);
    const frame = `builds/${b.id}-desktop.webp`;
    if (!existsSync(resolve(siteRoot, 'public', frame))) fail(`public/${frame} is missing; run npm run builds`);
    return { ...b, dir, reportDir, trail, last, memory: { ...mem, date: firstPage.date }, frame };
  });
}

// The Museum of Extinct Colours' component rebuild and its fix, for the interruption (chapter 3).
export function rebuildStory(builds) {
  const b = builds.find((x) => x.id === 'extinct');
  const first = b.trail.find((r) => r.word === 'rebuild');
  if (!first?.report) fail('the extinct record has no rebuild round with a report');
  const rel = `${b.folder}/.awards/jury/${first.report}`;
  const text = read(rel);
  const mem = memory(b.folder, first.report);
  // The report's own reason for the word, its first sentence after the score line.
  const why = /^The rebuild is .+?\.(?=\s|$)/m.exec(text)?.[0];
  if (!why) fail(`${rel}: no "The rebuild is …" sentence`);
  const shipped = b.trail.find((r) => r.kind === 'page');
  const second = b.trail[b.trail.indexOf(first) + 1];
  if (!shipped || !second) fail('the extinct record has no round after its rebuild');
  return { build: b, round: first, file: rel, memory: mem.text, why, shipped, second, shippedMemory: b.memory };
}
