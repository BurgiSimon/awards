// Plugin facts → HTML. Simple facts replace a literal (a number inside its sentence, or a whole string); the
// rest regenerate a list, a table or a region from the plugin's own files. Authored copy in the pages (what a
// family catches, what a skill does) is kept by name; only the bound part is rewritten.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { esc, inline } from './html.js';
import { siteRoot, fail } from './collect.js';

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
    playwright: f.playwright,
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
}

// --- element facts: the inner HTML of `data-fact` elements that hold more than one literal ---------------------------
const commandList = (lines) => lines.map((c) => `\n            <li><code>${esc(c)}</code><button class="copy" type="button" data-copy>Copy</button></li>`).join('') + '\n          ';

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
        if (what === undefined) fail(`the marking key has no "one thing it catches" for ${fam.name}`);
        return `\n          <tr><th scope="row">${esc(fam.name)}</th><td class="num">${fam.rules.length}</td><td>${what}</td></tr>`;
      }).join('');
      return inner.replace(/<tbody>[^]*?<\/tbody>/, `<tbody>${rows}\n        </tbody>`);
    },
    // The dispositions, verbatim from the jury agent: the ship rule printed once, from the file the juror applies.
    dispositions: () => f.dispositions.map(({ id, rule }) => {
      const dd = inline(rule.charAt(0).toUpperCase() + rule.slice(1))
        .replace(/\b(P[0-3])\/(P[0-3])\b/g, '<span class="nobr"><code>$1</code>/<code>$2</code></span>')
        .replace(/\b(P[0-3])\b(?!<\/code>)/g, '<code>$1</code>');
      return `\n          <div><dt><code>${esc(id)}</code></dt><dd>${dd}</dd></div>`;
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

// --- regions: `<!-- @fact:name -->…<!-- /@fact -->` -------------------------------------------------------------------

// The frames data file written by scripts/recipe-frames.mjs, cross-checked against each recipe.json.
function catalogue(f) {
  const file = resolve(siteRoot, 'src/data/recipes.json');
  const data = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { recipes: [] };
  const framed = new Map((data.recipes ?? []).map((r) => [r.id, r]));
  for (const id of framed.keys()) if (!f.recipes.some((r) => r.id === id)) warn(`src/data/recipes.json lists ${id}, which the plugin no longer has; dropped (npm run frames)`);
  return f.recipes.map((p) => {
    const d = framed.get(p.id);
    if (!d) warn(`recipe ${p.id} has no frame in src/data/recipes.json; listed without one (npm run frames)`);
    const passed = p.verified?.date ?? null;
    if (d && (d.title !== p.title || (d.verified ?? null) !== passed)) warn(`src/data/recipes.json is older than ${p.id}/recipe.json; the page prints the recipe's own title and pass (npm run frames)`);
    return { ...p, passed, frame: d?.frame ?? null, alt: d?.alt ?? null };
  });
}

const src = (rel) => `./${rel}`;

function entryHtml(r, f) {
  const frame = r.frame
    ? `\n            <a class="entry__frame" data-theme="rebate" href="${esc(src(r.frame.src))}"><img src="${esc(src(r.frame.src))}" width="${r.frame.width}" height="${r.frame.height}" loading="lazy" decoding="async" alt="${esc(r.alt)}"></a>`
    : '';
  const meta = [r.intent, (r.tags ?? []).join(' · '), r.passed ? `passed ${r.passed}` : 'no recorded pass yet'].filter(Boolean).map((s) => `<span>${esc(s)}</span>`).join('');
  return `
          <li class="entry" id="recipe-${esc(r.id)}" data-group="${esc(r.group)}" data-tags="${esc((r.tags ?? []).join(' '))}">${frame}
            <h3><a href="${esc(`${f.repo}/tree/main/plugins/awards/recipes/${r.id}`)}">${esc(r.title)}</a></h3>
            <p class="entry__id">${esc(r.id)}</p>
            <p class="entry__summary">${inline(r.summary)}</p>
            <p class="entry__meta edge">${meta}</p>
          </li>`;
}

export function regions(f) {
  let entries = null;
  const list = () => (entries ??= catalogue(f));
  return {
    'rule-tables': () => f.families.map((fam) => `
        <details id="rules-${fam.scope}">
          <summary>${esc(fam.name)} <span class="edge" data-fact="rules-${fam.scope}">${fam.rules.length} rules</span></summary>
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
          <li><a href="#group-${esc(g.id)}">${esc(g.title)}</a><span class="edge" data-fact="recipes-group-${esc(g.id)}">${g.count}</span></li>`).join('')}
        </ol>
        `,
    'filter-groups': () => f.groups.filter((g) => g.count).map((g) => `
          <button type="button" class="filter__button" aria-pressed="false" data-filter-group="${esc(g.id)}">${esc(g.title)}</button>`).join('') + '\n        ',
    'filter-tags': () => '\n        ' + f.tags.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join('') + '\n        ',
    catalogue: () => f.groups.filter((g) => g.count).map((g) => {
      const members = list().filter((r) => r.group === g.id);
      return `
      <section class="chapter group" id="group-${esc(g.id)}" aria-labelledby="group-${esc(g.id)}-title">
        <h2 id="group-${esc(g.id)}-title">${esc(g.title)}</h2>
        <p class="group__intro">${members.length} ${members.length === 1 ? 'entry' : 'entries'}: ${esc(g.about)}.</p>
        <ol class="entries" role="list">${members.map((r) => entryHtml(r, f)).join('')}
        </ol>
      </section>`;
    }).join('') + '\n    ',
    // One frame from each group: its first entry by id with a recorded pass, else its first entry.
    'recipe-row': () => '\n      <ol class="archive__row proof-row" data-theme="rebate" role="list" aria-label="Recipe frames, one from each group">' + f.groups.filter((g) => g.count).map((g) => {
      const members = list().filter((r) => r.group === g.id && r.frame);
      const pick = members.find((r) => r.passed) ?? members[0];
      if (!pick) return '';
      return `
          <li class="proof-row__item"><a class="proof-row__frame" href="./recipes.html#recipe-${esc(pick.id)}"><img src="${esc(src(pick.frame.src))}" width="${pick.frame.width}" height="${pick.frame.height}" loading="lazy" decoding="async" alt="${esc(pick.alt)}"></a><span class="edge">${esc(pick.id)}</span></li>`;
    }).join('') + '\n      </ol>\n      ',
  };
}

// Library credits for the colophon, with the versions the build actually used.
export function libraryRows(f) {
  return f.libraries.map((l) => `\n          <tr><th scope="row">${esc(l.name)} ${esc(l.version)}</th><td>${esc(l.credit)}</td></tr>`).join('');
}

