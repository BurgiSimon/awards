// src/data/proof.json → the contact sheet's evidence, written into static HTML at build (AWARDS.md, LOAD & CLOSE).
//   state a (report)   frames of the runs a page-round report cites, with the jury's marks and its lines
//   state b (capture)  frames of the newest valid capture run, dated and unmarked, and what that capture measured
//   state c (none)     nothing: every slot renders empty and the paper takes the full width
// Each width class gets its own list (desktop and tablet in the strip, phone inline and in the Frames disclosure);
// CSS shows the reader's own. Hidden lists cost nothing: their frames are lazy, except s00 and s25 on desktop.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { esc, inline } from './html.js';
import { siteRoot, fail } from './collect.js';

export const PROOF_ATTR = { a: 'report', b: 'capture', c: 'none' };
const CLASSES = ['desktop', 'tablet', 'mobile'];
const STOP_WORDS = { 0: 'the top', 25: 'a quarter down', 50: 'halfway', 75: 'three quarters down', 100: 'the end' };

export function loadProof() {
  const file = resolve(siteRoot, 'src/data/proof.json');
  if (!existsSync(file)) return { state: 'c', strip: false, routes: [] };
  const proof = JSON.parse(readFileSync(file, 'utf8'));
  if (!['a', 'b', 'c'].includes(proof.state)) fail(`src/data/proof.json has state "${proof.state}"`);
  // Every frame file proof.json names must ship; a missing one would render as a broken picture.
  for (const r of proof.routes ?? []) for (const cls of CLASSES) for (const fr of r.frames?.[cls] ?? []) {
    for (const f of [fr.strip, fr.full]) if (f?.src && !existsSync(resolve(siteRoot, 'public', f.src))) fail(`proof.json names public/${f.src}, which is not on disk; run npm run proof`);
  }
  return proof;
}

const url = (rel) => `./${rel}`;
const stopLabel = (s) => `s${String(s).padStart(2, '0')}`;
const pct = (at) => `${Math.round(at * 100)} %`;

// ISO timestamp → "22 October 2026, 13:40 UTC" (or the date alone).
function when(iso, { time = true } = {}) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(+d)) return String(iso);
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return time && /T\d/.test(iso) ? `${date}, ${d.toISOString().slice(11, 16)} UTC` : date;
}

// The frames of one route at one width class; a missing tablet list falls back to the desktop frames.
function framesOf(route, cls) {
  const list = route?.frames?.[cls] ?? [];
  if (list.length || cls !== 'tablet') return list;
  return route?.frames?.desktop ?? [];
}

// Where a frame's link goes without script: the chapter at that depth of the page (script then scrolls exactly).
function hrefFor(at, sections) {
  if (!sections.length || at === null || at === undefined) return '#main';
  const i = Math.max(0, Math.min(sections.length - 1, Math.round(at * (sections.length - 1))));
  return `#${sections[i] ?? 'main'}`;
}

export function chapterIds(html) {
  const main = /<main\b[^]*?<\/main>/.exec(html)?.[0] ?? '';
  return [...main.matchAll(/<section class="chapter\b[^"]*"(?: id="([^"]+)")?/g)].map((m) => m[1] ?? 'main');
}

// --- the drawn marks ------------------------------------------------------------------------------------------------
// One hand, one stroke weight, in a 0–100 box laid 6 px past the frame on every side. The black wax has to sit on
// the frame's own light picture to read (the rebate around it is black too), so the ring loops just inside the
// frame's edge and only its closing stroke runs out over it, about 6 px. A second mark of one kind is a second stroke.
const RING = [
  'M12 8 C 34 4, 68 4, 89 6 C 95 7, 96 13, 96 23 C 96 44, 96 65, 95 83 C 94 92, 90 95, 81 95 C 60 96, 33 96, 14 94 C 6 93, 4 88, 4 78 C 4 58, 4 38, 5 20 C 6 10, 10 6, 20 5 C 36 3, 54 1, 74 0',
  'M16 6 C 40 3, 70 4, 90 8 C 95 9, 96 16, 95 27 C 94 48, 95 68, 93 84 C 92 92, 87 95, 77 95 C 54 96, 31 95, 12 92 C 5 91, 4 85, 5 72 C 6 53, 5 34, 7 17 C 8 9, 13 6, 24 5 C 42 3, 60 2, 80 1',
];
const CROSS = [
  ['M26 28 C 42 43, 58 59, 75 76', 'M74 25 C 59 41, 43 58, 25 75'],
  ['M32 24 C 47 40, 62 56, 80 70', 'M78 31 C 62 45, 45 61, 28 79'],
  ['M20 35 C 35 49, 51 64, 68 84', 'M68 17 C 53 33, 38 52, 21 69'],
];
const ARROW = (n) => {
  const o = n * 3;
  return [`M${54 + o} ${56 + o} C ${64 + o} ${66 + o}, ${74 + o} ${76}, ${86} ${88}`, 'M86 88 L 78 87', 'M86 88 L 85 80'];
};

function marksSvg(marks) {
  if (!marks?.length) return '';
  const count = { ring: 0, cross: 0, arrow: 0 };
  const paths = [];
  marks.forEach((m, order) => {
    const n = count[m.type]++;
    const d = m.type === 'ring' ? [RING[n % RING.length]] : m.type === 'cross' ? CROSS[n % CROSS.length] : ARROW(n % 3);
    for (const p of d) paths.push(`<path d="${p}" pathLength="1" data-mark="${m.type}" data-mark-id="${esc(m.id)}" data-order="${order}"/>`);
  });
  return `<svg class="frame__marks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-motion="marks">${paths.join('')}</svg>`;
}

// A mark's caption: the report's own words, then where they come from.
function noteText(m) {
  if (m.type === 'arrow') return esc(m.label);
  if (m.source === 'memory' && m.sentence) return `“${inline(m.sentence)}”`;
  if (m.cells) {
    const cell = (name) => Object.entries(m.cells).find(([k]) => k.toLowerCase() === name)?.[1]?.trim() ?? '';
    const parts = [cell('location'), cell('change')].filter(Boolean);
    if (parts.length) return parts.map(inline).join(': ');
  }
  return inline(String(m.line ?? '').replace(/^\s*-\s*/, ''));
}

function notesHtml(marks) {
  return (marks ?? []).map((m) => `<p class="frame__note caption" data-mark-id="${esc(m.id)}" data-motion="mark-note">${noteText(m)} <span class="frame__source edge">report ${esc(m.date)} · ${esc(m.section)}</span></p>`).join('');
}

// --- one frame ------------------------------------------------------------------------------------------------------
// One file per use, no srcset: a strip file is about twice the width the strip draws it, and the loupe's full-size
// file twice the loupe's (scripts/proof.mjs writes the full size only for the loupe).
function imgHtml(fr, { eager = fr.eager, cls = 'frame__img', useFull = false }) {
  const main = useFull ? fr.full ?? fr.strip : fr.strip;
  return `<img class="${cls}" src="${esc(url(main.src))}" width="${main.width}" height="${main.height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" alt="${esc(fr.alt)}">`;
}

// The picture and its marks share one box, so the marks register on the frame and never on its edge print.
const plateHtml = (fr, opts) => `<span class="frame__plate">${imgHtml(fr, opts)}${marksSvg(fr.marks)}</span>`;

const edgeHtml = (fr) => `<span class="frame__edge edge" aria-hidden="true"><span>${esc(fr.label)}</span><span>${esc(fr.capture)}</span></span>`;

function frameLink(fr, { sizes, sections, extra = '', eager }) {
  const at = fr.at ?? (fr.stop !== null ? fr.stop / 100 : null);
  return `<a class="frame${extra}" href="${hrefFor(at, sections)}"${at !== null ? ` data-at="${at}"` : ''} data-frame="${esc(fr.id)}"${fr.marks?.length ? ' data-marked' : ''}>${plateHtml(fr, { sizes, eager })}${edgeHtml(fr)}</a>`;
}

// Plain stops in depth order; a state, hover or focus frame (or a marked twin of a stop) beside its nearest stop.
function stripItems(list, { sizes, sizesBeside, sections, eager = true }) {
  const isStop = (fr) => fr.kind === 'scroll' && !fr.variants?.length && !fr.duplicateOf;
  const items = [];
  for (const fr of list) {
    if (isStop(fr) || !items.length) { items.push({ main: fr, beside: [] }); continue; }
    const near = fr.duplicateOf ? fr.stop : fr.near;
    const host = items.find((it) => isStop(it.main) && it.main.stop === near);
    if (host) host.beside.push(fr);
    else items.push({ main: fr, beside: [] });
  }
  return items.map(({ main, beside }) => {
    const notes = [main, ...beside].map((fr) => notesHtml(fr.marks)).join('');
    const besideHtml = beside.map((fr) => frameLink(fr, { sizes: sizesBeside, sections, extra: ' frame--beside', eager: false })).join('');
    return `\n          <li class="strip__item${beside.length ? ' strip__item--pair' : ''}"${main.stop !== null ? ` data-stop="${main.stop}"` : ''}>${frameLink(main, { sizes, sections, eager: eager && main.eager })}${besideHtml}${notes}</li>`;
  }).join('');
}

// --- slots ----------------------------------------------------------------------------------------------------------

export function proofSlots({ proof, routeName, html, facts }) {
  const state = proof.state;
  const has = state === 'a' || state === 'b';
  const route = has ? (proof.routes ?? []).find((r) => r.name === routeName) ?? null : null;
  const home = has ? (proof.routes ?? []).find((r) => r.name === 'home') ?? null : null;
  const sections = chapterIds(html);
  const label = state === 'a' ? 'Frames of this page as the jury captured them' : 'Frames of this page as the capture shot them';
  const caption = route ? `<p class="strip__caption edge">${esc(route.caption)}</p>` : '';

  const stripList = (cls, sizes, sizesBeside, eager) => {
    const list = framesOf(route, cls);
    return list.length ? `\n        <ol class="strip__list" data-class="${cls}" role="list" data-motion="strip">${stripItems(list, { sizes, sizesBeside, sections, eager })}\n        </ol>` : '';
  };

  const slots = {
    // The strip in the rebate column (desktop and tablet), and on phones the Frames disclosure in the band.
    strip() {
      if (!route) return '';
      const desktop = stripList('desktop', 'calc(25vw - 60px)', 'calc(12.5vw - 36px)', true);
      const tablet = stripList('tablet', 'calc(22vw - 32px)', 'calc(11vw - 20px)', false);
      if (!desktop && !tablet) return '';
      return `<nav class="strip" aria-label="${label}">${desktop}${tablet}
        ${caption}
      </nav>`;
    },
    disclosure() {
      const list = framesOf(route, 'mobile');
      if (!route || !list.length) return '';
      const items = list.map((fr) => {
        const at = fr.at ?? (fr.stop !== null ? fr.stop / 100 : null);
        const where = fr.kind === 'scroll' && !fr.variants?.length ? STOP_WORDS[fr.stop] ?? `${pct(at)} down` : `${fr.label}${at !== null ? `, ${pct(at)} down` : ''}`;
        // A marked frame carries the report's lines here too: on a phone the disclosure is where a route without
        // inline frames shows what the jury drew on it.
        return `\n            <li><a href="${hrefFor(at, sections)}"${at !== null ? ` data-at="${at}"` : ''} data-frame="${esc(fr.id)}"><span>${esc(fr.kind === 'scroll' ? stopLabel(fr.stop) : fr.label)}</span> <span class="edge">${esc(where)}${fr.marks?.length ? `, ${fr.marks.map((m) => m.type).join(' and ')} drawn` : ''}</span></a>${notesHtml(fr.marks)}</li>`;
      }).join('');
      return `<details class="frames-disclosure">
        <summary>Frames</summary>
        <div class="frames-disclosure__panel">
          <ol class="frames-disclosure__list" role="list" aria-label="${label}, phone width">${items}
          </ol>
          ${caption}
        </div>
      </details>`;
    },
    // Phone: each chapter carries its own frames inline at its head; the first chapter carries the whole row.
    inline({ chapter, stops }) {
      if (!route) return '';
      const list = framesOf(route, 'mobile');
      if (!list.length) return '';
      if (chapter === 'sheet') {
        return `<ol class="chapter__frames chapter__frames--row" data-theme="rebate" role="list" aria-label="${label}, phone width">${stripItems(list, { sizes: '42vw', sizesBeside: '21vw', sections, eager: false })}
      </ol>`;
      }
      const want = String(stops ?? '').split(/\s+/).filter(Boolean);
      const picked = list.filter((fr) => fr.kind === 'scroll' && want.includes(stopLabel(fr.stop)) && !fr.variants?.length && !fr.duplicateOf);
      if (!picked.length) return '';
      return picked.map((fr) => `<figure class="chapter__frames" data-theme="rebate">
        <div class="frame"${fr.marks?.length ? ' data-marked' : ''}>${plateHtml(fr, { sizes: '38vw', eager: false })}</div>${edgeHtml(fr)}
        ${fr.marks?.length ? `<figcaption>${notesHtml(fr.marks)}</figcaption>` : ''}
      </figure>`).join('\n      ');
    },
    // Chapter 3: the frame the memory sentence came from (state a), else the capture's s00, and the figures.
    loupe() {
      const pick = loupeFrames(proof, home);
      if (!pick) return '';
      const plates = CLASSES.map((cls) => pick[cls] && `<a class="loupe-frame__link" data-class="${cls}" href="${esc(url(pick[cls].full.src))}">${imgHtml(pick[cls], { sizes: cls === 'desktop' ? '50vw' : cls === 'tablet' ? '70vw' : '100vw', eager: false, cls: 'loupe-frame__img', useFull: true })}</a>`).filter(Boolean).join('');
      const fr = pick.desktop ?? pick.tablet ?? pick.mobile;
      const what = state === 'a' && proof.report?.memory?.frames?.length ? `the frame the jury's memory sentence came from, ${esc(fr.label)}` : `${esc(fr.label)}, this page as the capture first shot it`;
      return `<div class="proof__loupe" data-motion="loupe">
        <a class="proof__skip" href="#proof-figures">Skip the frame</a>
        <figure class="loupe-frame">
          <div class="loupe-frame__plate" data-theme="rebate">${plates}</div>
          <figcaption class="caption">${what}; capture ${esc(fr.capture)}.</figcaption>
        </figure>
        <button class="loupe__open copy" type="button" aria-haspopup="dialog" aria-controls="loupe" data-loupe-open>Open at full size</button>
      </div>
      <div class="proof__figures" id="proof-figures" tabindex="-1">${state === 'a' ? reportFigures(proof, facts) : captureFigures(proof)}
      </div>`;
    },
    'loupe-dialog'() {
      const pick = loupeFrames(proof, home);
      if (!pick) return '';
      const fr = pick.desktop ?? pick.tablet ?? pick.mobile;
      const imgs = CLASSES.map((cls) => pick[cls] && `<img class="loupe__img" data-class="${cls}" src="${esc(url(pick[cls].full.src))}" width="${pick[cls].full.width}" height="${pick[cls].full.height}" loading="lazy" decoding="async" alt="${esc(pick[cls].alt)}">`).filter(Boolean).join('');
      return `<dialog class="loupe" id="loupe" data-theme="rebate" aria-labelledby="loupe-title">
  <div class="loupe__bar">
    <h2 class="loupe__title" id="loupe-title">${esc(fr.label)} at full size <span class="edge">capture ${esc(fr.capture)}</span></h2>
    <form method="dialog"><button class="loupe__close copy" type="submit">Close</button></form>
  </div>
  <div class="loupe__plate" data-lenis-prevent>${imgs}</div>
</dialog>`;
    },
    // Chapter 4: this page's newest audit, in one sentence naming its file and date.
    audit() {
      const a = proof.audit;
      if (!has || !a?.summary) return '';
      const s = a.summary;
      const parts = [];
      const zeroHigh = !s.P0 && !s.P1;
      const count = (n, sev) => `${n} at <code>${sev}</code>`;
      const rest = ['P2', 'P3'].filter((k) => s[k]).map((k) => count(s[k], k));
      const lead = zeroHigh ? 'no <code>P0</code> or <code>P1</code> finding' : ['P0', 'P1'].filter((k) => s[k]).map((k) => count(s[k], k)).join(' and ');
      parts.push(lead);
      if (rest.length) parts.push(rest.join(' and '));
      else if (zeroHigh) parts[0] = 'no finding at any severity';
      const rendered = a.rendered ? ', with the page opened in Chromium at desktop, tablet and phone widths' : ', from the source files alone';
      const ex = a.exceptions ? `; ${a.exceptions} accepted exception${a.exceptions === 1 ? ' is' : 's are'} recorded with a reason` : '';
      return `<p class="marks-key__audit">The newest audit of this page (<code>${esc(a.file)}</code>, ${esc(when(a.date))}) reports ${parts.join(', and ')}${rendered}${ex}.</p>`;
    },
    // Chapter 6: the strip's s100 frame (this close as it was shot), beside the ticket.
    'close-frame'({ stop }) {
      if (!home || routeName !== 'home') return '';
      const k = Number(String(stop ?? 's100').replace(/^s/, ''));
      const pick = Object.fromEntries(CLASSES.map((cls) => [cls, framesOf(home, cls).find((fr) => fr.kind === 'scroll' && fr.stop === k && !fr.variants?.length && !fr.duplicateOf)]));
      const fr = pick.desktop ?? pick.tablet ?? pick.mobile;
      if (!fr) return '';
      const plates = CLASSES.map((cls) => pick[cls] && `<div class="frame" data-class="${cls}"${pick[cls].marks?.length ? ' data-marked' : ''}>${plateHtml(pick[cls], { sizes: cls === 'desktop' ? '12vw' : cls === 'tablet' ? '28vw' : '45vw', eager: false })}</div>`).filter(Boolean).join('');
      return `<figure class="select__frame" data-theme="rebate">${plates}
        <figcaption class="frame__edge edge"><span>${esc(fr.label)}</span><span>${esc(fr.capture)}</span></figcaption>
      </figure>`;
    },
    // Footer: Docs and Recipes, which the phone band gives up to the Frames disclosure once frames exist.
    pages() {
      if (!route) return '';
      return `<li><a href="./docs.html">Docs</a></li>\n      <li><a href="./recipes.html">Recipes</a></li>`;
    },
    // Footer: the jury line, only when a page-round report exists.
    'jury-line'() {
      const r = proof.report;
      if (state !== 'a' || !r) return '';
      const weighted = r.scores?.weighted ?? r.scores?.mean;
      const href = `${facts.repo}/blob/main/${facts.siteDir}/${r.file}`;
      return `<p class="colophon__jury">Judged ${esc(r.date)}: <code>${esc(r.disposition)}</code>${weighted ? `, weighted ${esc(weighted)}` : ''}. Report: <a href="${esc(href)}"><code>${esc(r.file)}</code></a> in the repository.</p>`;
    },
  };
  return slots;
}

// The loupe's frame per width class: the memory test's source frame (state a), else each class's s00 of home.
function loupeFrames(proof, home) {
  if (!home) return null;
  const memory = proof.state === 'a' ? proof.report?.memory?.frames?.[0] : null;
  const all = CLASSES.flatMap((cls) => (home.frames?.[cls] ?? []).map((fr) => ({ fr, cls })));
  const source = memory ? all.find((x) => x.fr.id === memory) : null;
  const stop = source?.fr.kind === 'scroll' ? source.fr.stop : 0;
  const pick = {};
  for (const cls of CLASSES) {
    const list = home.frames?.[cls] ?? [];
    pick[cls] = (source && source.cls === cls ? source.fr : null) ?? list.find((fr) => fr.kind === 'scroll' && fr.stop === stop && !fr.variants?.length && !fr.duplicateOf) ?? null;
  }
  return pick.desktop || pick.tablet || pick.mobile ? pick : null;
}

// State b: what the capture itself measured, and the build's audit summary, each naming its file and date.
function captureFigures(proof) {
  const m = proof.metrics;
  const a = proof.audit;
  const run = proof.captures?.[0]?.capture ?? '';
  const routesFile = proof.why?.match(/\.awards\/captures\/\S+?routes\.json/)?.[0] ?? `.awards/captures/${run}/routes.json`;
  const capturedAt = when((m?.routes ?? []).map((r) => r.capturedAt).filter(Boolean).sort()[0]);
  const n = (m?.routes ?? []).length;
  const passes = [...new Set((m?.routes ?? []).flatMap((r) => Object.keys(r.viewports ?? {})))];
  const widths = passes.filter((p) => !/-rm$/.test(p)).length;
  const rows = [];
  if (m?.max?.cls !== null && m?.max?.cls !== undefined) rows.push(['Largest layout shift, any route or width', String(m.max.cls)]);
  if (m?.max?.blockingMs !== null && m?.max?.blockingMs !== undefined) rows.push(['Longest main-thread blocking', `${m.max.blockingMs} ms`]);
  if (m) rows.push(['Page errors', String(m.pageErrors ?? 0)]);
  let out = '';
  if (rows.length) out += `
        <table class="data figures">
          <caption>What the capture measured</caption>
          <thead><tr><th scope="col">Measure</th><th scope="col" class="num">Value</th></tr></thead>
          <tbody>${rows.map(([k, v]) => `
            <tr><th scope="row">${k}</th><td class="num">${esc(v)}</td></tr>`).join('')}
          </tbody>
        </table>
        <p class="figures__source caption"><code>${esc(routesFile)}</code>, ${esc(capturedAt)}: ${n} route${n === 1 ? '' : 's'} at ${widths} widths${passes.some((p) => /-rm$/.test(p)) ? ' and with reduced motion' : ''}, lab figures from headless Chromium, never field data.</p>`;
  if (a?.summary) {
    const sev = ['P0', 'P1', 'P2', 'P3'];
    out += `
        <table class="data figures figures--audit">
          <caption>What the audit found</caption>
          <thead><tr>${sev.map((k) => `<th scope="col"><code>${k}</code></th>`).join('')}</tr></thead>
          <tbody><tr>${sev.map((k) => `<td>${a.summary[k] ?? 0}</td>`).join('')}</tr></tbody>
        </table>
        <p class="figures__source caption"><code>${esc(a.file)}</code>, ${esc(when(a.date))}: ${a.rendered ? 'the source files, and the page opened in Chromium at desktop, tablet and phone widths' : 'the source files alone'}${a.exceptions ? `; ${a.exceptions} accepted exception${a.exceptions === 1 ? '' : 's'} on record, each with its reason` : ''}.</p>`;
  }
  if (!out) return '';
  return out + `
        <p class="figures__note caption">No jury has scored this build yet; its scores take this place when one does.</p>`;
}

// State a: the report's scores, disposition, date and memory sentence, verbatim.
function reportFigures(proof, facts) {
  const r = proof.report;
  const axes = (r.axes ?? []).filter((x) => x.score && x.score !== 'unmeasured');
  const href = `${facts.repo}/blob/main/${facts.siteDir}/${r.file}`;
  const rows = axes.map((x) => `
            <tr><th scope="row">${inline(x.name)}</th><td class="num">${esc(x.score)}</td></tr>`).join('');
  const memory = r.memory?.sentence ? `
        <blockquote class="figures__memory"><p>“${inline(r.memory.sentence)}”</p></blockquote>
        <p class="figures__note caption">The juror's memory test, written from the first viewport before it read the contract.</p>` : '';
  return `
        <table class="data figures">
          <caption>What the jury scored</caption>
          <thead><tr><th scope="col">Axis</th><th scope="col" class="num">Score</th></tr></thead>
          <tbody>${rows}
          </tbody>
        </table>
        <p class="figures__disposition"><span class="edge">disposition</span> <code>${esc(r.disposition)}</code></p>${memory}
        <p class="figures__source caption">Report <a href="${esc(href)}"><code>${esc(r.file)}</code></a>, ${esc(r.date)}, quoted unedited.</p>`;
}
