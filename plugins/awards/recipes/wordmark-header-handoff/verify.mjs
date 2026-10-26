// One link, two places: over the hero's reference box at the top, exactly in the header slot after the hand-off;
// the underline lands under the active chapter's link and stops writing styles; reduced motion never moves the mark.
export const states = [
  { name: 'top', scroll: 0, settle: 700 },
  { name: 'mid', scroll: 0.1, settle: 500 },
  { name: 'docked', scroll: 0.25, settle: 600 },
  { name: 'work', scroll: 0.65, settle: 1500 },
  { name: 'keys', scroll: 0, settle: 500, actions: [{ type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }] },
  { name: 'rm-top', scroll: 0, reducedMotion: true, settle: 500 },
  { name: 'rm-docked', scroll: 0.25, reducedMotion: true, settle: 600 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 700 },
];
export async function probe() {
  const a = document.activeElement;
  return { focusedMark: !!a?.hasAttribute?.('data-mark'), focusVisible: !!a?.matches?.(':focus-visible') };
}
const close = (a, b, tol) => Math.abs(a - b) <= tol;
export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const out = [];
  const t = st('top');
  out.push({ ok: t.p === 0 && close(t.mark?.w, t.ref?.w, t.ref?.w * 0.02) && close(t.mark?.x, t.ref?.x, 2) && close(t.mark?.y, t.ref?.y, 2), message: `top: the mark covers the hero reference box (mark ${JSON.stringify(t.mark)}, ref ${JSON.stringify(t.ref)})` });
  out.push({ ok: (st('mid').scale ?? 0) > 1.05 && st('mid').scale < (t.scale ?? 0), message: `mid: the mark is between sizes (scale ${st('mid').scale} < ${t.scale})` });
  const d = st('docked');
  out.push({ ok: d.p === 1 && d.scale === 1 && close(d.mark?.x, d.slot?.x, 1) && close(d.mark?.y, d.slot?.y, 1) && close(d.mark?.w, d.slot?.w, 1), message: `docked: the mark sits exactly in the header slot (mark ${JSON.stringify(d.mark)}, slot ${JSON.stringify(d.slot)})` });
  const w = st('work');
  out.push({ ok: w.active === 'work' && close(w.lineBox?.x, w.activeLink?.x, 1) && close(w.lineBox?.w, w.activeLink?.w, 1), message: `work: the underline landed under the Work link (line ${JSON.stringify(w.lineBox)}, link ${JSON.stringify(w.activeLink)})` });
  out.push({ ok: (w.settledFrames ?? 0) > 3, message: `work: the underline settled and stopped writing styles (${w.settledFrames} quiet frames)` });
  out.push({ ok: r.keys?.probe?.focusedMark === true && r.keys?.probe?.focusVisible === true && st('keys').markName?.length > 5, message: `keyboard: the second Tab lands on the mark with a visible focus and an accessible name ("${st('keys').markName}")` });
  out.push({ ok: st('rm-top').motion === 'reduced' && close(st('rm-top').mark?.x, st('rm-top').slot?.x, 1) && close(st('rm-top').mark?.w, st('rm-top').slot?.w, 1) && st('rm-top').copyGone === false, message: 'reduced motion: the link stays in the bar; a decorative copy fills the hero' });
  out.push({ ok: st('rm-docked').copyGone === true && close(st('rm-docked').mark?.y, st('rm-docked').slot?.y, 1), message: 'reduced motion: the hero copy fades out when the hero leaves; the mark never moved' });
  const m = st('mobile');
  out.push({ ok: close(m.mark?.w, m.ref?.w, m.ref?.w * 0.03) && close(m.mark?.x, m.ref?.x, 2), message: `mobile: the mark covers the hero reference box (mark ${JSON.stringify(m.mark)}, ref ${JSON.stringify(m.ref)})` });
  return out;
}
