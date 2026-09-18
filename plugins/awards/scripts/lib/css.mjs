// Tolerant CSS helpers: strip comments, find declarations, blocks and custom properties.
export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

export function declarations(css, prop) {
  const re = new RegExp(`(?:^|[;{\\s])(${prop})\\s*:\\s*([^;}]+)`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(css))) out.push({ prop: m[1], value: m[2].trim(), index: m.index });
  return out;
}

export function customProperties(css) {
  const re = /--([a-z0-9-]+)\s*:\s*([^;}]+)/gi;
  const out = {};
  let m;
  while ((m = re.exec(css))) if (!(m[1] in out)) out[m[1]] = m[2].trim();
  return out;
}

export function blocks(css, atRuleRe) {
  // Returns the bodies of @rules matching atRuleRe (e.g. /@font-face/ or /@media[^{]*prefers-reduced-motion/)
  const out = [];
  const re = new RegExp(atRuleRe.source, 'gi');
  let m;
  while ((m = re.exec(css))) {
    let i = css.indexOf('{', m.index);
    if (i < 0) break;
    let depth = 0;
    let j = i;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    out.push({ index: m.index, body: css.slice(i + 1, j) });
    re.lastIndex = j;
  }
  return out;
}

export function firstFamily(value) {
  const first = value.split(',')[0].trim().replace(/^["']|["']$/g, '');
  return first;
}
