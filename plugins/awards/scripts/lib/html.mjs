// Tolerant, dependency-free HTML helpers for the audit (regex-based on purpose: templates, JSX and Vue files still scan).
// Line numbers come from a newline index built once per text and binary-searched, so a large
// stylesheet costs one pass instead of one scan from the top for every rule block and finding.
const lineIndexes = [];
export function lineOf(text, index) {
  let entry = lineIndexes.find((e) => e.text === text);
  if (!entry) {
    const newlines = [];
    for (let i = text.indexOf('\n'); i !== -1; i = text.indexOf('\n', i + 1)) newlines.push(i);
    entry = { text, newlines };
    lineIndexes.unshift(entry);
    lineIndexes.length = Math.min(lineIndexes.length, 4);
  }
  const end = Math.min(index, text.length);
  let lo = 0;
  let hi = entry.newlines.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (entry.newlines[mid] < end) lo = mid + 1;
    else hi = mid;
  }
  return lo + 1;
}

export function tags(text, name) {
  const re = new RegExp(`<${name}\\b([^>]*)>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(text))) out.push({ raw: m[0], attrs: m[1] || '', index: m.index, line: lineOf(text, m.index) });
  return out;
}

export function attr(attrs, name) {
  const m = new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(attrs);
  if (!m) return null;
  return m[2] ?? m[3] ?? m[4] ?? '';
}

export function hasAttr(attrs, name) {
  return new RegExp(`(?:^|\\s)${name}(\\s|=|$)`, 'i').test(attrs);
}

export function headings(text) {
  const re = /<h([1-6])\b[^>]*>/gi;
  const out = [];
  let m;
  while ((m = re.exec(text))) out.push({ level: Number(m[1]), index: m.index, line: lineOf(text, m.index) });
  return out;
}

export function stripTags(text) {
  return text.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
}

export function classNames(text) {
  const re = /class(?:Name)?\s*=\s*["']([^"']+)["']/gi;
  const out = [];
  let m;
  while ((m = re.exec(text))) out.push({ classes: m[1].split(/\s+/).filter(Boolean), index: m.index, line: lineOf(text, m.index) });
  return out;
}
