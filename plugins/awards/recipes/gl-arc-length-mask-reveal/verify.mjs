// Seek the chapter (not the page) to a progress, then wait until the eased progress has arrived.
const seek = (p) => [
  { type: 'waitFor', fn: `(() => { const r = document.querySelector('[data-route]'); scrollTo(0, r.offsetTop + ${p} * (r.offsetHeight - innerHeight)); return true; })()` },
  { type: 'waitFor', fn: `Math.abs(window.__awards.state().progress - ${p}) < 0.002` },
  { type: 'wait', ms: 200 },
];

export const states = [
  { name: 'top', settle: 400 },
  { name: 'half', settle: 400, actions: seek(0.5) },
  { name: 'end', settle: 400, actions: seek(1) },
  { name: 'rm', reducedMotion: true, settle: 400 },
  { name: 'mobile', viewport: 'mobile', settle: 400, actions: seek(0.5) },
];

const LIT = 200, DARK = 10;
const fmt = (s) => (s || []).map((b, i) => `${i}:${b.start}/${b.end}`).join(' ') + ` · branch 2 [${s?.[2]?.ladder?.join(',')}]`;
const allLit = (s) => s?.length === 4 && s.every((b) => b.start > LIT && b.end > LIT);
// The key check: with progress .5 and stagger .2, branch 0 is complete, branch 2 is mid-way (start lit, end dark), branch 3 has not begun.
// Along branch 2 the lit samples must form one prefix (lit up to the head, dark after it): a wrong 16-bit decode scrambles the order.
const prefix = (l) => { const lit = l.map((a) => a > LIT); const n = lit.indexOf(false); return n >= 2 && n <= 9 && lit.slice(n).every((v, i) => !v && l[n + i] < (i ? DARK : 256)); };
const halfway = (s) => s?.length === 4 && s[0].start > LIT && s[0].end > LIT && s[2].start > LIT && s[2].end < DARK && prefix(s[2].ladder) && s[3].start < DARK && s[3].end < DARK;

export function assert(r) {
  const out = [];
  const t = r.top.state || {};
  out.push({ ok: t.gl === true && t.canvasAriaHidden === true && t.progress === 0 && t.samples?.every((b) => b.start < DARK && b.end < DARK), message: `top: nothing revealed (${fmt(t.samples)})` });
  const h = r.half.state || {};
  out.push({ ok: h.gl === true && halfway(h.samples), message: `half: branch 0 drawn, branch 2 start lit / end dark, branch 3 dark (${fmt(h.samples)})` });
  const e = r.end.state || {};
  out.push({ ok: e.progress === 1 && allLit(e.samples), message: `end: every start and end lit (${fmt(e.samples)})` });
  const rm = r.rm.state || {};
  out.push({ ok: rm.motion === 'reduced' && rm.progress === 1 && allLit(rm.samples), message: `reduced motion: drawn complete without scrolling (${fmt(rm.samples)})` });
  const m = r.mobile.state || {};
  out.push({ ok: m.gl === true && m.size?.[1] > m.size?.[0] && halfway(m.samples), message: `mobile: portrait ${m.size?.join('×')} stage, staggered at .5 (${fmt(m.samples)})` });
  return out;
}
