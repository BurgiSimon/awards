// Build-time includes for a plain multi-page Vite site. No runtime cost: every directive
// below becomes static HTML in dev and in the build, so the page reads with JavaScript off.
//
//   <!--#include header current="trust" -->     partials/header.html, aria-current on the matching link
//   <!--#picture slot="hero" class="print" sizes="56vw" note="…" loading="eager" -->
//   <!--#credits -->                             the picture-credits list, from the same manifest
//   <!--#monthpicker -->  <!--#monthtable -->     from src/data/months.json
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const readJSON = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attrs = (src) => Object.fromEntries([...src.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

function pictures() {
  try { return readJSON('src/data/pictures.json'); } catch { return []; }
}

function licenceLink(p) {
  return p.licenceUrl ? `<a href="${esc(p.licenceUrl)}" rel="license noopener">${esc(p.licence)}</a>` : esc(p.licence);
}

function creditLine(p) {
  const who = [p.creator, p.institution].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' / ');
  return `<a href="${esc(p.sourceUrl)}" rel="noopener">${esc(p.title)}</a>${who ? `, ${esc(who)}` : ''} · ${licenceLink(p)}`;
}

function picture(a) {
  const p = pictures().find((x) => x.slot === a.slot);
  if (!p) return `<!-- picture "${esc(a.slot)}" not in src/data/pictures.json -->`;
  const sizes = Object.entries(p.files).map(([w, f]) => [Number(w), f]).sort((x, y) => x[0] - y[0]);
  const small = sizes[0][1];
  const srcset = sizes.map(([w, f]) => `${f} ${w}w`).join(', ');
  const loading = a.loading || 'lazy';
  const priority = loading === 'eager' ? ' fetchpriority="high"' : '';
  const lead = a.lead ?? '';
  const where = [p.place, p.date].filter(Boolean).join(', ');
  const note = a.note ? ` ${esc(a.note)}` : '';
  const style = a.position ? ` style="--pos:${esc(a.position)}"` : '';
  return `<figure class="print ${esc(a.class || '')}" data-slot="${esc(p.slot)}"${p.bw ? ' data-bw' : ''}${style}>
  <div class="print__paper"><img src="${small}" srcset="${srcset}" sizes="${esc(a.sizes || '100vw')}" width="${p.width}" height="${p.height}" alt="${esc(p.alt)}" loading="${loading}" decoding="async"${priority}></div>
  <figcaption class="caption"><span class="caption__text">${lead ? esc(lead) + ' ' : ''}${esc(where.charAt(0).toUpperCase() + where.slice(1))}.${note}</span> <span class="caption__credit">${creditLine(p)}</span></figcaption>
</figure>`;
}

function credits() {
  const list = pictures();
  if (!list.length) return '';
  const items = list.map((p) => `<li><span class="credits__where">${esc([p.place, p.date].filter(Boolean).join(', '))}</span> ${creditLine(p)}</li>`).join('\n');
  return `<details class="credits">
  <summary>Picture credits (${list.length})</summary>
  <p>None of these photographs shows Wrenmouth: the lido and the town are fictional. They are real pictures of other people's pools, coasts and swims, used under the licences below.</p>
  <ol class="credits__list">
${items}
  </ol>
</details>`;
}

function monthPicker() {
  const months = readJSON('src/data/months.json');
  const radios = months.map((m, i) => `<label class="months__tab"><input type="radio" name="month" value="${i}"${m.month === 'March' ? ' checked' : ''}><span><abbr title="${m.month}">${m.short}</abbr></span></label>`).join('\n      ');
  const panels = months.map((m, i) => `<div class="months__answer" data-month="${i}" data-band="${m.band}"${m.month === 'March' ? '' : ' hidden'}>
      <p class="months__temp"><span class="num">${m.c}</span><span class="months__unit">°C</span></p>
      <div class="months__copy">
        <p class="months__lead">${m.month}: about ${m.c}&nbsp;°C (${m.f}&nbsp;°F).</p>
        <p>${esc(m.wear)} ${esc(m.time)}</p>
        <p class="months__note">${esc(m.note)}</p>
      </div>
    </div>`).join('\n    ');
  return `<fieldset class="months__tabs">
      <legend class="sr-only">Month</legend>
      ${radios}
    </fieldset>
    <div class="months__answers" aria-live="polite">
    ${panels}
    </div>`;
}

function monthTable() {
  const months = readJSON('src/data/months.json');
  const rows = months.map((m) => `<tr><th scope="row">${m.month}</th><td class="num">${m.c}&nbsp;°C</td><td class="num">${m.f}&nbsp;°F</td><td>${esc(m.wear)}</td><td>${esc(m.time)}</td></tr>`).join('\n      ');
  return `<table class="table table--months">
    <caption class="sr-only">Typical water temperature by month, with what to wear and how long a first swim lasts</caption>
    <thead><tr><th scope="col">Month</th><th scope="col">Water</th><th scope="col"><span class="sr-only">Water in </span>°F</th><th scope="col">Wear</th><th scope="col">First swim</th></tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`;
}

function include(a) {
  let html = readFileSync(resolve(root, 'partials', `${a.name}.html`), 'utf8');
  if (a.current) html = html.replace(new RegExp(`data-nav="${a.current}"`, 'g'), `data-nav="${a.current}" aria-current="page"`);
  return render(html);
}

function render(html) {
  return html.replace(/<!--#(\w+)([^>]*?)-->/g, (whole, kind, rest) => {
    const a = attrs(rest);
    if (kind === 'include') return include({ name: rest.trim().split(/\s+/)[0], ...a });
    if (kind === 'picture') return picture(a);
    if (kind === 'credits') return credits();
    if (kind === 'monthpicker') return monthPicker();
    if (kind === 'monthtable') return monthTable();
    return whole;
  });
}

export function htmlIncludes() {
  return {
    name: 'wrenmouth-html-includes',
    transformIndexHtml: {
      order: 'pre',
      handler: render,
    },
    handleHotUpdate({ file, server }) {
      if (/partials\/|src\/data\//.test(file)) server.ws.send({ type: 'full-reload' });
    },
  };
}
