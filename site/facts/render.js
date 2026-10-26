// Plugin facts → HTML. Simple facts replace a literal (a number inside its sentence, or a whole string); the
// rest regenerate a list, a table or a region from the plugin's own files. Authored copy in the pages (what a
// family catches, what a skill does) is kept by name; only the bound part is rewritten.
import { esc, inline } from './html.js';
import { fail } from './collect.js';
import { longDate, shortDate } from './builds.js';

const warned = new Set();
const warn = (m) => { if (!warned.has(m)) { warned.add(m); console.warn(`facts: ${m}`); } };

// --- simple facts: the literal each `data-fact` / `data-fact-attr` name stands for ---------------------------------
export function simpleFacts(f, { siteBase }) {
  const verified = f.recipes.filter((r) => r.verified?.date);
  const out = {
    version: f.version,
    license: f.license,
    repo: f.repo,
    'site-root': siteBase,
    build: f.build.id,
    skills: f.skills.length,
    rules: f.rules.length,
    'rules-p0p1': f.p0p1,
    sites: f.sites.length,
    skeletons: f.skeletons.length,
    patterns: f.patterns.length,
    recipes: f.recipes.length,
    'recipes-focused': f.recipes.filter((r) => !r.id.startsWith('complete-')).length,
    'recipes-verified': verified.length,
    'recipes-framed': f.recipes.filter((r) => f.frames.has(r.id)).length,
    playwright: f.playwright,
    builds: f.builds.length,
  };
  for (const fam of f.families) out[`rules-${fam.scope}`] = fam.rules.length;
  for (const g of f.groups) out[`recipes-group-${g.id}`] = g.count;
  return out;
}

// Facts that belong to one generated entry, never to the page: the regions below write them.
export const ENTRY_FACTS = new Set(['recipe-pass', 'recipe-frame']);

// Copy that states a count in words is held to it, so a ninth family or a third command cannot make it false.
export function assertWordedCounts(f) {
  if (f.families.length !== 8 || f.families.some((x) => !x.rules.length)) fail(`the pages say "eight families"; rules.json now fills ${f.families.filter((x) => x.rules.length).length}`);
  for (const [client, list] of Object.entries(f.commands)) if (list.length !== 2) fail(`the pages say "two commands"; README.md lists ${list.length} for ${client}`);
  if (f.builds.length !== 5) fail(`the home page says "five builds"; the record holds ${f.builds.length}`);
  if (f.dispositions.length !== 4) fail(`the pages say "four words"; the jury agent lists ${f.dispositions.length}`);
}

const blob = (f, rel) => `${f.repo}/blob/main/${rel}`;
const tree = (f, rel) => `${f.repo}/tree/main/${rel}`;
const score = (n) => n.toFixed(2).replace(/0$/, '').replace(/\.$/, '.0');
const two = (n) => n.toFixed(2);

// --- element facts: the inner HTML of `data-fact` elements that hold more than one literal ---------------------------
// A command is a line of text with its own Copy button; without script the button is hidden and one click on the
// line selects all of it (user-select: all).
const commandList = (lines) => lines.map((c) => `\n            <li class="command"><code>${esc(c)}</code><button class="copy" type="button" data-copy aria-label="Copy ${esc(c)}"><span class="copy__label">Copy</span></button></li>`).join('') + '\n          ';

export function elementFacts(f) {
  return {
    'commands-claude-code': () => commandList(f.commands['claude-code']),
    'commands-codex': () => commandList(f.commands.codex),
    'playwright-install': () => esc(`npm install --global playwright@${f.playwright}`),
    // The marking key: counts from rules.json, the one thing each family catches kept as written.
    families(inner) {
      const authored = new Map([...inner.matchAll(/<tr><th scope="row">([^<]+)<\/th><td class="num">\d+<\/td><td>([^]*?)<\/td><\/tr>/g)].map((m) => [m[1], m[2]]));
      const rows = f.families.map((fam) => {
        const what = authored.get(fam.name);
        if (what === undefined) fail(`the families table has no "one thing it catches" for ${fam.name}`);
        return `\n          <tr><th scope="row">${esc(fam.name)}</th><td class="num">${fam.rules.length}</td><td>${what}</td></tr>`;
      }).join('');
      return inner.replace(/<tbody>[^]*?<\/tbody>/, `<tbody>${rows}\n        </tbody>`);
    },
    // The dispositions, verbatim from the jury agent: the ship rule printed once, from the file the juror applies.
    dispositions: () => f.dispositions.map(({ id, rule }) => {
      const dd = inline(rule.charAt(0).toUpperCase() + rule.slice(1))
        .replace(/\b(P[0-3])\/(P[0-3])\b/g, '<span class="nobr"><code>$1</code>/<code>$2</code></span>')
        .replace(/\b(P[0-3])\b(?!<\/code>)/g, '<code>$1</code>');
      return `\n          <div class="word" data-word="${esc(id)}"><dt>${esc(id)}</dt><dd>${dd}</dd></div>`;
    }).join('') + '\n        ',
    // The skills: every skill directory once, in the page's order; a new skill gets its own description's first sentence.
    'skill-list'(inner) {
      const authored = [...inner.matchAll(/<div><dt><code>([a-z0-9-]+)<\/code><\/dt><dd>([^]*?)<\/dd><\/div>/g)].map((m) => [m[1], m[2]]);
      const ids = new Set(f.skills.map((s) => s.id));
      for (const [id] of authored) if (!ids.has(id)) warn(`docs lists skill "${id}", which plugins/awards/skills no longer has; dropped`);
      const kept = authored.filter(([id]) => ids.has(id));
      const added = f.skills.filter((s) => !kept.some(([id]) => id === s.id)).map((s) => {
        warn(`skill "${s.id}" has no authored line in docs.html; printing its description's first sentence`);
        return [s.id, inline(s.description)];
      });
      return [...kept, ...added].map(([id, dd]) => `\n        <div><dt><code>${esc(id)}</code></dt><dd>${dd}</dd></div>`).join('') + '\n      ';
    },
  };
}

// --- the recipes' own frames: the explorer's, read from plugins/awards/recipes/_gallery ------------------------------
const frameSrc = (id) => `./recipes/${id}.webp`;
function frameAlt(r, f) {
  const fr = f.frames.get(r.id);
  return `Frame of the recipe “${r.title}” in headless Chromium at ${f.framesViewport.width} × ${f.framesViewport.height}${fr?.state ? `, state “${fr.state}”` : ''}.`;
}
function frameImg(r, f, { lazy = true, sizes } = {}) {
  if (!f.frames.has(r.id)) { warn(`recipe ${r.id} has no frame in recipes/_gallery/frames.json; listed without one`); return ''; }
  return `<img src="${esc(frameSrc(r.id))}" width="${f.framesSize.width}" height="${f.framesSize.height}"${lazy ? ' loading="lazy"' : ''} decoding="async"${sizes ? ` sizes="${sizes}"` : ''} alt="${esc(frameAlt(r, f))}">`;
}

function entryHtml(r, f) {
  const img = frameImg(r, f);
  const frame = img ? `\n            <a class="entry__frame" href="${esc(frameSrc(r.id))}">${img}</a>` : '';
  const meta = [r.intent, (r.tags ?? []).join(' · '), r.verified?.date ? `passed ${r.verified.date}` : 'no recorded pass yet'].filter(Boolean).map((s) => `<span>${esc(s)}</span>`).join('');
  return `
          <li class="entry" id="recipe-${esc(r.id)}" data-group="${esc(r.group)}" data-tags="${esc((r.tags ?? []).join(' '))}">${frame}
            <h3><a href="${esc(tree(f, `plugins/awards/recipes/${r.id}`))}">${esc(r.title)}</a></h3>
            <p class="entry__id"><code>${esc(r.id)}</code></p>
            <p class="entry__summary">${inline(r.summary)}</p>
            <p class="entry__meta">${meta}</p>
          </li>`;
}

// --- the record (home, chapter 2): the signature's DOM, in ranked order from the first paint -------------------------
const KIND = { component: 'first viewport', page: 'page round', verdict: 'verdict', baseline: 're-judged' };
const AXES = [['d', 'Design'], ['u', 'Usability'], ['c', 'Creativity'], ['co', 'Content']];

function recordEntry(b, i, f) {
  const l = b.last;
  const trail = b.trail.map((r) => {
    const label = `${KIND[r.kind]}, ${shortDate(r.date)}`;
    const body = `<span class="trail__word" data-word="${r.word}">${r.word}</span> ${two(r.w)}<span class="sr-only">, ${esc(label)}</span>`;
    const href = r.report ? blob(f, `${b.reportDir}/.awards/jury/${r.report}`) : null;
    return `<li title="${esc(label)}">${href ? `<a href="${esc(href)}">${body}</a>` : body}</li>`;
  }).join('');
  const scores = AXES.map(([k, name]) => `<div data-axis="${k}"><dt>${name}</dt><dd>${score(l[k])}</dd></div>`).join('');
  return `
          <li class="row" id="build-${esc(b.id)}" data-build="${esc(b.id)}" data-w="${l.w}" data-d="${l.d}" data-u="${l.u}" data-c="${l.c}" data-co="${l.co}" data-word="${l.word}">
            <figure class="row__frame" data-gather><img src="./${esc(b.frame)}" width="960" height="600" ${i < 3 ? 'decoding="async" fetchpriority="high"' : 'loading="lazy" decoding="async"'} alt="${esc(`First screen of ${b.name}, as the plugin built it, captured at 1440 × 900.`)}"></figure>
            <div class="row__id">
              <h3 class="row__name"><a href="${esc(tree(f, b.folder))}">${esc(b.name)}</a></h3>
              <p class="row__what">${esc(b.what)}</p>
            </div>
            <p class="row__verdict"><span class="trail__word" data-word="${l.word}">${l.word}</span> <span class="row__w" data-axis="w">${two(l.w)}</span><span class="row__when">${esc(KIND[l.kind])}, ${esc(shortDate(l.date))}</span></p>
            <dl class="row__scores">${scores}</dl>
            <ol class="row__trail" role="list" aria-label="Every round of ${esc(b.name)}">${trail}</ol>
          </li>`;
}

function memoryEntry(b, f) {
  const href = blob(f, b.memory.file);
  return `
          <li class="memory" data-build="${esc(b.id)}">
            <blockquote cite="${esc(href)}"><p>“${esc(b.memory.text)}”</p></blockquote>
            <p class="memory__source"><span class="memory__name">${esc(b.name)}</span>, <a href="${esc(href)}">${esc(b.memory.file.replace(/^.*\/\.awards\//, '.awards/'))}</a>, ${esc(longDate(b.memory.date))}</p>
          </li>`;
}

// --- chrome: one band and one colophon for every route ---------------------------------------------------------------
const ROUTES_NAV = [
  ['install', './install.html', 'Install'],
  ['build', './#build', 'How a build goes'],
  ['recipes', './recipes.html', 'Recipes'],
  ['docs', './docs.html', 'Docs'],
];

// Home's chapters, for the band's second row: the depth cue (walk 6), by chapter name, never a number.
const CHAPTERS = [
  ['top', 'The claim'],
  ['record', 'Five builds'],
  ['rebuild', 'Rebuild'],
  ['build', 'How a build goes'],
  ['recipes', 'The recipes'],
  ['terms', 'The terms'],
  ['install', 'The close'],
];

function band(f, route) {
  const here = (id) => (id === route ? ' aria-current="page"' : '');
  const items = ROUTES_NAV.map(([id, href, label]) => {
    // On home the chapter row carries "How a build goes", so the first row does not name it twice.
    if (route === 'home' && id === 'build') return '';
    const h = href;
    return `\n        <li class="band__item band__item--${id}"><a href="${h}"${here(id)}>${label}</a></li>`;
  }).join('');
  const chapters = route === 'home' ? `
    <nav class="band__chapters" aria-label="Chapters of this page">
      <ol role="list">${CHAPTERS.map(([id, label], i) => `
        <li><a href="#${id}" data-chapter="${id}"${i === 0 ? ' aria-current="true"' : ''}>${label}</a></li>`).join('')}
      </ol>
    </nav>` : '';
  return `
  <header class="band${route === 'home' ? ' band--chapters' : ''}">
    <p class="band__mark"><a class="band__wordmark" href="./"${route === 'home' ? ' aria-current="page"' : ''}>awards</a> <span class="band__version">${esc(f.version)}</span></p>
    <button class="band__menu" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="band__nav" id="site-nav" aria-label="Site">
      <ul role="list">${items}
        <li class="band__item band__item--source"><a href="${esc(f.repo)}">Source</a></li>
      </ul>
    </nav>
    <a class="band__install" href="./install.html"${here('install')}>Install</a>${chapters}
  </header>
  `;
}

function colophon(f) {
  const libs = f.libraries.map((l) => `\n          <tr><th scope="row">${esc(l.name)} ${esc(l.version)}</th><td>${esc(l.credit)}</td></tr>`).join('');
  return `
  <footer class="colophon">
    <div class="colophon__edition">
      <p class="colophon__name">awards ${esc(f.version)}</p>
      <p>${esc(f.license)} licence, by BurgiSimon. This is build <code>${esc(f.build.id)}</code>.</p>
    </div>
    <ul class="colophon__links" role="list">
      <li><a href="${esc(f.repo)}">Source on GitHub</a></li>
      <li><a href="${esc(blob(f, 'CHANGELOG.md'))}">Release notes</a></li>
      <li><a href="${esc(blob(f, 'LICENSE'))}">Licence</a></li>
      <li><a href="${esc(blob(f, `${f.siteDir}/AWARDS.md`))}">This page’s contract</a></li>
    </ul>
    <table class="data colophon__credits">
      <caption>Credits</caption>
      <thead><tr><th scope="col">Part</th><th scope="col">Source</th></tr></thead>
      <tbody>
          <tr><th scope="row">Gloock</th><td>Duarte Pinto, SIL Open Font License 1.1</td></tr>
          <tr><th scope="row">Familjen Grotesk</th><td>Familjen STHLM, SIL Open Font License 1.1</td></tr>
          <tr><th scope="row">Commands and code</th><td>your system’s monospace</td></tr>${libs}
      </tbody>
    </table>
    <p class="colophon__note">Every picture here was made by the plugin: the five builds’ first screens, captured by this site’s build with the plugin’s own capture script, and the recipes’ frames from the plugin’s recipe explorer. Every score and verdict is read from the build’s own <code>AWARDS.md</code> and jury reports when this page is built. The scores are this plugin’s jury, not an award.</p>
  </footer>
  `;
}

// --- regions: `<!-- @fact:name … -->…<!-- /@fact -->` -------------------------------------------------------------------
export function regions(f, route) {
  return {
    band: () => band(f, route),
    colophon: () => colophon(f),
    'rule-tables': () => f.families.map((fam) => `
        <details id="rules-${fam.scope}">
          <summary>${esc(fam.name)} <span class="count" data-fact="rules-${fam.scope}">${fam.rules.length} rules</span></summary>
          <table class="data">
            <caption class="sr-only">${esc(fam.name)} rules</caption>
            <thead><tr><th scope="col">Rule</th><th scope="col">Severity</th><th scope="col">What it flags</th></tr></thead>
            <tbody>${fam.rules.map((r) => `
            <tr><td><code>${esc(r.id)}</code></td><td><code>${esc(r.severity)}</code></td><td>${esc(r.message)}</td></tr>`).join('')}
            </tbody>
          </table>
        </details>`).join('') + '\n        ',
    'group-index': () => `
        <ol role="list">${f.groups.filter((g) => g.count).map((g) => `
          <li><a href="#group-${esc(g.id)}">${esc(g.title)}</a> <span class="count" data-fact="recipes-group-${esc(g.id)}">${g.count}</span></li>`).join('')}
        </ol>
        `,
    'filter-groups': () => f.groups.filter((g) => g.count).map((g) => `
          <button type="button" class="filter__button" aria-pressed="false" data-filter-group="${esc(g.id)}">${esc(g.title)}<span class="count">${g.count}</span></button>`).join('') + '\n        ',
    'filter-tags': () => '\n        ' + f.tags.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join('') + '\n        ',
    catalogue: () => f.groups.filter((g) => g.count).map((g) => {
      const members = f.recipes.filter((r) => r.group === g.id);
      return `
      <section class="chapter group" id="group-${esc(g.id)}" aria-labelledby="group-${esc(g.id)}-title">
        <h2 id="group-${esc(g.id)}-title">${esc(g.title)}</h2>
        <p class="group__intro">${members.length} ${members.length === 1 ? 'entry' : 'entries'}: ${esc(g.about)}.</p>
        <ol class="entries" role="list">${members.map((r) => entryHtml(r, f)).join('')}
        </ol>
      </section>`;
    }).join('') + '\n    ',
    // Home, chapter 5: every recipe's frame, by group; each group's first entry leads at double size with its name.
    'recipe-wall': () => '\n      <ol class="wall" role="list" aria-label="Every recipe’s frame, by group">' + f.groups.filter((g) => g.count).map((g) => {
      const members = f.recipes.filter((r) => r.group === g.id && f.frames.has(r.id));
      return members.map((r, i) => `
        <li class="wall__tile${i === 0 ? ' wall__tile--lead' : ''}" data-group="${esc(g.id)}"><a href="./recipes.html#recipe-${esc(r.id)}">${frameImg(r, f)}${i === 0 ? `<span class="wall__group">${esc(g.title)}</span>` : ''}</a></li>`).join('');
    }).join('') + '\n      </ol>\n      ',
    record: () => '\n        <ol class="record__list" role="list" data-record>' + [...f.builds]
      .sort((a, b) => b.last.w - a.last.w)
      .map((b, i) => recordEntry(b, i, f)).join('') + '\n        </ol>\n        ',
    memories: () => '\n        <ol class="memories" role="list">' + [...f.builds].sort((a, b) => b.last.w - a.last.w).map((b) => memoryEntry(b, f)).join('') + '\n        </ol>\n        ',
    // Home, chapter 3: the Museum's first-viewport verdict, in the juror's own words.
    rebuild: () => {
      const s = f.rebuild;
      const href = blob(f, s.file);
      const shipHref = blob(f, s.shippedMemory.file);
      return `
        <p class="rebuild__scores">The Museum of Extinct Colours, its first screen before any motion existed, ${esc(longDate(s.round.date))}: Design ${score(s.round.d)}, Usability ${score(s.round.u)}, Creativity ${score(s.round.c)}. ${esc(s.why)}</p>
        <div class="rebuild__pair">
          <blockquote class="memory memory--then" cite="${esc(href)}">
            <p>“${esc(s.memory)}”</p>
            <footer>Remembered at the rebuild: <a href="${esc(href)}">${esc(s.file.replace(/^.*\/\.awards\//, '.awards/'))}</a></footer>
          </blockquote>
          <blockquote class="memory memory--now" cite="${esc(shipHref)}">
            <p>“${esc(s.shippedMemory.text)}”</p>
            <footer>Remembered when it shipped at ${two(s.shipped.w)}: <a href="${esc(shipHref)}">${esc(s.shippedMemory.file.replace(/^.*\/\.awards\//, '.awards/'))}</a></footer>
          </blockquote>
        </div>
        <figure class="rebuild__frame">
          <img src="./${esc(s.build.frame)}" srcset="./${esc(s.build.frame)} 960w, ./${esc(s.build.frame.replace('-desktop.webp', '-desktop-2x.webp'))} 1920w" sizes="(min-width: 1024px) 62vw, 92vw" width="960" height="600" loading="lazy" decoding="async" alt="The Museum of Extinct Colours’ first screen as it shipped: “Seven colours you can no longer buy” beside a resin block holding a seven-layer paint cross-section, and a Book a viewing button.">
          <figcaption>The same first screen as it shipped. The next pass of the first screen came back ${esc(s.second.word)} at ${two(s.second.w)}, the page round ${esc(s.shipped.word)} at ${two(s.shipped.w)}.</figcaption>
        </figure>
        `;
    },
    // Home, chapter 4: the nine phases in three runs, each with one line from the Museum's own files.
    phases: () => f.phases.map((run) => `
        <section class="run"${run.name === 'Judge' ? ' data-theme="ship"' : ''} aria-labelledby="run-${run.name.toLowerCase()}">
          <h3 id="run-${run.name.toLowerCase()}">${esc(run.name)}</h3>
          <ol class="run__phases" role="list">${run.phases.map((p) => `
            <li class="phase">
              <h4>${esc(p.name)}</h4>
              <p class="phase__does">${esc(p.does)}</p>
              <p class="phase__file">Writes ${inline(p.file.replace(/^(\S+\.md|\.awards\/\S+\/|tokens\.css)/, '`$1`').replace(/, (tokens\.css)/, ', `$1`'))}</p>
              <blockquote class="phase__quote"><p>${esc(p.quote)}</p></blockquote>
            </li>`).join('')}
          </ol>
        </section>`).join('') + '\n        ',
  };
}
