// Corpus card parsing shared by build-index, check-card, corpus-gaps and corpus-health: the H1 (site name and
// URL), the header table as a field map, the numbered sections, and the canonical values the index groups by.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const vocab = JSON.parse(fs.readFileSync(path.join(plugin, 'scripts/data/corpus-vocab.json'), 'utf8'));
export const pluginSites = path.join(plugin, 'references/sites');

export function cardFiles(dir = pluginSites) {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort().map((f) => path.join(dir, f));
}

// The first clause of a header cell: what comes before its evidence label, a colon, a dash or a full stop.
export function firstClause(cell) {
  if (!cell) return '';
  let s = cell.replace(/\*\*/g, '').split(/\s\[(?:verified|recalled|inferred|unknown)/)[0];
  s = s.split(/(?<=[a-z0-9)%])\s[—–]\s|:\s|;\s|\.\s/i)[0].trim();
  return s.length > 90 ? s.slice(0, 88).replace(/\s\S*$/, '') + ' …' : s;
}

export function canonicalClass(cell) {
  const m = String(cell ?? '').match(new RegExp(`^(${vocab.classes.map((c) => c.replace(/[-/]/g, '\\$&')).join('|')})\\b`, 'i'));
  return m ? vocab.classes.find((c) => c.toLowerCase() === m[1].toLowerCase()) : null;
}

export function parseCard(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const h1 = lines[0].replace(/^#\s*/, '');
  const url = h1.match(/https?:\/\/[^\s)`>|]+/)?.[0] ?? null;
  const header = {};
  for (const line of lines) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|(.*)\|\s*$/);
    if (!m || m[1] === 'Field' || /^-+$/.test(m[1])) continue;
    if (!(m[1] in header)) header[m[1]] = m[2].trim();
    if (/^## /.test(line)) break;
  }
  const sections = lines.filter((l) => /^## \d+\. /.test(l)).map((l) => Number(l.match(/^## (\d+)\./)[1]));
  let route = 'home';
  if (header['Routes read']) route = header['Routes read'];
  else if (url) {
    const p = new URL(url).pathname.replace(/\/$/, '');
    if (p && !/^\/[a-z]{2}(-[a-z]{2})?$/i.test(p)) route = `inner ${p}`;
  }
  return { file, slug: path.basename(file, '.md'), text, lines, site: h1.split(/\s[—–]\s/)[0].trim(), url, header, sections, route };
}
