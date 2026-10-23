// Turns the collected facts into the page's markup at build time: `{{path.to.value}}` tokens and
// `<!-- facts:block -->` markers in the HTML. Everything printed here is escaped.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './collect.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
const longDate = (iso) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));

// The install lines are read from the repository README, so the page and the README cannot disagree.
function installLines() {
  const readme = readFileSync(resolve(repoRoot, 'README.md'), 'utf8');
  const claude = ['/plugin marketplace add burgisimon/awards', '/plugin install awards@awards'];
  const codex = ['codex plugin marketplace add burgisimon/awards', 'codex plugin add awards@awards'];
  for (const line of [...claude, ...codex]) if (!readme.includes(line)) throw new Error(`facts: README no longer says "${line}"`);
  return { claude, codex };
}

function install(id, f) {
  const lines = installLines();
  const panel = (key, label, cmds, then) => `
          <div class="install__panel" role="tabpanel" id="${id}-${key}" aria-labelledby="${id}-tab-${key}" data-panel="${key}">
            <p class="install__for">${label}</p>
            <pre class="install__code"><code>${cmds.map(esc).join('\n')}</code></pre>
            <p class="install__then">${then}</p>
          </div>`;
  return `<div class="install" data-install id="${id}">
          <div class="install__tabs" role="tablist" aria-label="Install for">
            <button type="button" role="tab" id="${id}-tab-claude" aria-selected="true" aria-controls="${id}-claude" data-tab="claude">Claude Code</button>
            <button type="button" role="tab" id="${id}-tab-codex" aria-selected="false" aria-controls="${id}-codex" data-tab="codex" tabindex="-1">Codex</button>
          </div>${panel('claude', 'Claude Code', lines.claude, 'Then start a site with <code>/awards:craft</code>, or one element with <code>/awards:component</code>.')}${panel('codex', 'Codex', lines.codex, 'Then start a site with <code>$awards:craft</code>, or one element with <code>$awards:component</code>.')}
          <button type="button" class="button button--primary install__copy" data-copy>Copy the install commands</button>
          <p class="install__note">Free and open source, ${esc(f.licence)} licence. Version ${esc(f.version)}.</p>
        </div>`;
}

function run(f) {
  const row = (p) => `
            <li class="run__row">
              <span class="run__n"><span class="run__solid" data-plate="y" aria-hidden="true"></span>${p.n}</span>
              <span class="run__phase">${esc(p.phase)}</span>
              <code class="run__skill">${esc(p.skill)}</code>
              <span class="run__line">${esc(p.line)}${p.skill === 'concept' ? ` <span class="run__seed">Ekvator's roll printed <code>SEED ${esc(f.ekvator.seed)}</code>, dealt worlds ${esc(f.ekvator.dealt)} of ${esc(f.ekvator.of)}.</span>` : ''}</span>
            </li>`;
  return `<ol class="run__list" start="0">${f.skills.run.map(row).join('')}
          </ol>`;
}

function outside(f) {
  return `<ul class="run__outside">${f.skills.outside.map((o) => `
            <li><code class="run__skill">${esc(o.skill)}</code> <span>${esc(o.line)}</span></li>`).join('')}
          </ul>`;
}

function bar(f) {
  const max = Math.max(...f.rules.families.map((x) => x.count));
  const patches = f.rules.families.map((x) => `<span class="bar__patch" style="--d:${(x.count / max).toFixed(3)}"></span>`).join('');
  const rows = f.rules.families.map((x) => `
            <div><dt>${esc(x.name)}</dt><dd>${x.count}</dd></div>`).join('');
  return `<div class="bar" data-plate="y" aria-hidden="true">${patches}</div>
          <dl class="bar__key">${rows}
          </dl>`;
}

function quoted(f) {
  return `<ul class="floor__quoted">${f.rules.quoted.map((q) => `
            <li><code>${esc(q.id)}</code> ${esc(q.message)}</li>`).join('')}
          </ul>`;
}

function verdict(f) {
  const j = f.ekvator.jury;
  const kind = j.kind === 'page' ? 'page round' : 'component pass on the first viewport';
  return `<p class="check__line"><code>disposition: ${esc(j.disposition)}</code> <span>${esc(j.scores)} → ${esc(j.result)}</span></p>
            <p class="check__meta">Ekvator's latest jury line, a ${kind}, ${esc(longDate(j.date))}; ${f.ekvator.rounds} jury ${f.ekvator.rounds === 1 ? 'pass' : 'passes'} logged in its AWARDS.md. ${f.ekvator.shipped ? 'Shipped.' : 'Not shipped yet: the build is still a proof.'}</p>`;
}

function stamp(f) {
  const j = f.ekvator.jury;
  const ok = f.ekvator.shipped;
  return `<p class="stamp" data-stamp data-plate="y"><span class="stamp__word">${ok ? 'OK to print' : 'Proof'}</span><span class="stamp__date">${ok ? esc(longDate(j.date)) : `${esc(j.disposition)} · ${esc(longDate(j.date))}`}</span></p>`;
}

function cases(f) {
  return f.recipes.groups.map((g) => `
          <section class="case__group" aria-labelledby="case-${g.id}">
            <h3 id="case-${g.id}"><span class="case__solid" data-plate="y" aria-hidden="true"></span>${esc(g.title)} <span class="case__count">${g.items.length}</span></h3>
            <ul>${g.items.map((r) => `
              <li><a href="https://github.com/burgisimon/awards/tree/main/plugins/awards/recipes/${esc(r.id)}">${esc(r.title)}</a></li>`).join('')}
            </ul>
          </section>`).join('');
}

const BLOCKS = { 'install-top': (f) => install('install-top', f), 'install-close': (f) => install('install-close', f), run, outside, bar, quoted, verdict, stamp, cases };

export function render(html, f) {
  const facts = { ...f, readLong: longDate(f.read) };
  return html
    .replace(/<!-- facts:([a-z-]+) -->/g, (m, name) => {
      if (!BLOCKS[name]) throw new Error(`facts: no block "${name}"`);
      return BLOCKS[name](facts);
    })
    .replace(/\{\{([a-zA-Z.]+)\}\}/g, (m, path) => {
      const v = get(facts, path);
      if (v === undefined || v === null) throw new Error(`facts: nothing at "${path}"`);
      return esc(v);
    });
}
