// How a build goes (home, chapter 4): the nine phases, each with the file it writes, what the phase does (authored)
// and one real line from the Museum of Extinct Colours' own files (read). A quote is cut at 25 words, at a clause
// boundary where one falls late enough; a pattern that no longer matches stops the build.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot, fail } from './collect.js';

const DIR = 'showcase/extinct';
const read = (rel) => {
  const abs = resolve(repoRoot, `${DIR}/${rel}`);
  if (!existsSync(abs)) fail(`how a build goes needs ${DIR}/${rel}`);
  return readFileSync(abs, 'utf8');
};

// At most 25 words, ending on a full word; an ellipsis when it was cut.
export function clip(text, max = 25) {
  const clean = text.replace(/\*\*|`/g, '').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  if (words.length <= max) return clean.replace(/[;,:]$/, '');
  let cut = words.slice(0, max).join(' ');
  const stop = Math.max(cut.lastIndexOf(';'), cut.lastIndexOf(':'), cut.lastIndexOf(','));
  if (stop > cut.length * 0.55) cut = cut.slice(0, stop);
  return `${cut.replace(/[;,:(]\s*$/, '')} …`;
}

const field = (text, name, file) => {
  const m = new RegExp(`^- \\*\\*${name}:\\*\\*\\s*(.+)$`, 'm').exec(text);
  if (!m) fail(`${DIR}/${file} has no "${name}" line`);
  return m[1];
};

export function collectPhases() {
  const awards = read('AWARDS.md');
  const design = read('DESIGN.md');
  const section = (name) => awards.split(/^## /m).find((s) => s.startsWith(name)) ?? fail(`${DIR}/AWARDS.md has no "## ${name}"`);
  const pageRows = section('Page map').split('\n').filter((l) => /^\| (\d+|—) \|/.test(l));
  const scoreRows = section('Motion score').split('\n').filter((l) => /^\| (?!Moment|---)/.test(l));
  const juryLine = section('Jury log').split('\n').find((l) => / · rebuild · /.test(l)) ?? fail('no rebuild line in the extinct Jury log');
  const shipLine = section('Ship log').split('\n').find((l) => l.startsWith('- 2')) ?? fail('no Ship log line in the extinct AWARDS.md');
  const budgets = section('Budgets & tiers');
  const gl = /GL chunk \(gz\): ([^·]+)/.exec(budgets)?.[1] ?? fail('no GL chunk figure in the extinct budgets');
  const stack = /^- Stack: (.+)$/m.exec(budgets)?.[1] ?? fail('no Stack line in the extinct budgets');
  const strategy = /^- \*\*Colour strategy:\*\* (.+)$/m.exec(design)?.[1] ?? fail('no colour strategy in the extinct DESIGN.md');
  const signature = /^- \*\*SIGNATURE:\*\* (.+)$/m.exec(awards)?.[1] ?? fail('no SIGNATURE in the extinct AWARDS.md');
  const cells = (row) => row.split('|').slice(1, -1).map((c) => c.trim());

  const run = (name, phases) => ({ name, phases });
  return [
    run('Decide', [
      { name: 'Brief', does: 'At most three questions: what only this subject can prove, who reads it and where, and what a visitor should do.', file: 'AWARDS.md, Brief', quote: clip(field(awards, 'Stakes and conversion \\(what a visitor should do, matched to the price of the decision\\)', 'AWARDS.md')) },
      { name: 'Concept', does: 'Seven candidate worlds, three dealt by a seeded roll, one locked and written down as a direction contract.', file: 'AWARDS.md, Direction contract', quote: clip(field(awards, 'THESIS', 'AWARDS.md')) },
      { name: 'System', does: 'One type contract, two to four colour tokens under a named strategy, self-hosted faces, every browser surface themed.', file: 'DESIGN.md, tokens.css', quote: clip(strategy) },
    ]),
    run('Build', [
      { name: 'Structure', does: 'Chapters with beats, one interruption and a designed close, as semantic HTML before any motion.', file: 'AWARDS.md, Page map', quote: `${pageRows.length} rows, the 404 among them: ${clip(pageRows.map((r) => cells(r)[1]).join(' · '), 22)}` },
      { name: 'Stack', does: 'Vite by default; Lenis and GSAP on one ticker, and a hook that lets captures drive the page.', file: 'AWARDS.md, Budgets & tiers', quote: clip(stack) },
      { name: 'Motion', does: 'One authored moment per chapter, each with a reduced-motion tier, never a global animation kill.', file: 'AWARDS.md, Motion score', quote: `${scoreRows.length} rows. ${clip(cells(scoreRows.find((r) => /Signature/.test(r)) ?? scoreRows[0]).slice(0, 2).join(': '), 20)}` },
      { name: 'WebGL', does: 'Only where a beat needs depth: its own lazy chunk, a DOM mirror, and a page that works without it.', file: 'the GL chunk, or a written decline', quote: clip(`GL chunk: ${gl.trim()}. ${signature}`, 24) },
    ]),
    run('Judge', [
      { name: 'Jury', does: 'A juror in a separate session reads the captures before the contract, scores four axes and ends on one word.', file: '.awards/jury/, Jury log', quote: clip(juryLine.replace(/^- /, '').replace(/ · \.awards\/jury\/\S+$/, '')) },
      { name: 'Ship', does: 'The fixes in one batch, the audit clean or every exception explained, the performance measured.', file: '.awards/ship/, Ship log', quote: clip(shipLine.replace(/^- /, '').replace(/ · \.awards\/ship\/\S+$/, '').replace(/ from \S+manifest\.json/, '')) },
    ]),
  ];
}
