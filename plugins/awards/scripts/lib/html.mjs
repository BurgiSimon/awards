// Tolerant, dependency-free HTML helpers for the audit (regex-based on purpose: templates, JSX and Vue files still scan).
export function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
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
