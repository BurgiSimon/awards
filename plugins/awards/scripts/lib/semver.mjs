// Just enough semver for engine ranges and drift: "^22.19.0 || >=24", ">=18.13", "~1.2", "20.x".
export function parse(v) {
  const m = String(v).trim().replace(/^v/, '').match(/^(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?/);
  if (!m) return null;
  const part = (s) => (s === undefined || s === 'x' || s === '*' ? null : Number(s));
  return [Number(m[1]), part(m[2]), part(m[3])];
}

export function compare(a, b) {
  const x = parse(a), y = parse(b);
  for (let i = 0; i < 3; i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return Math.sign(d);
  }
  return 0;
}

// One comparator against a full version [major, minor, patch].
function test(v, comp) {
  const m = comp.match(/^(>=|<=|>|<|=|\^|~)?\s*(.+)$/);
  if (!m) return false;
  const op = m[1] ?? '=';
  const want = parse(m[2]);
  if (!want) return false;
  const [M, mi, p] = want;
  const at = (a) => compare(v.join('.'), a.map((n) => n ?? 0).join('.'));
  switch (op) {
    case '>=': return at(want) >= 0;
    case '>': return at(want) > 0;
    case '<=': return at(want) <= 0;
    case '<': return at(want) < 0;
    case '^': return v[0] === M && at(want) >= 0 && (M !== 0 || v[1] === (mi ?? v[1]));
    case '~': return v[0] === M && (mi === null || v[1] === mi) && at(want) >= 0;
    default: return v[0] === M && (mi === null || v[1] === mi) && (p === null || v[2] === p);
  }
}

// Does version satisfy range? Alternatives split on "||", comparators within one on spaces.
export function satisfies(version, range) {
  const v = parse(version)?.map((n) => n ?? 0);
  if (!v || !range || !String(range).trim() || String(range).trim() === '*') return true;
  return String(range).split('||').some((alt) => alt.trim().replace(/(>=|<=|>|<|=|\^|~)\s+/g, '$1').split(/\s+/).filter(Boolean).every((c) => test(v, c)));
}

// How far latest is from pinned: same, patch, minor, major, or ahead (the pin is newer than latest).
export function drift(pinned, latest) {
  const a = parse(pinned), b = parse(latest);
  if (!a || !b) return 'unknown';
  const c = compare(pinned, latest);
  if (c === 0) return 'same';
  if (c > 0) return 'ahead';
  // Below 1.0 a minor bump is breaking, and below 0.1 a patch bump, as npm's caret treats them.
  if (a[0] !== b[0] || (a[0] === 0 && (a[1] !== b[1] || (a[1] === 0 && a[2] !== b[2])))) return 'major';
  return a[1] !== b[1] ? 'minor' : 'patch';
}
