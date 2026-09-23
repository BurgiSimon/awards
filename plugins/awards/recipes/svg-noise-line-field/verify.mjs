// A horizontal pointer sweep at client y 350, fast enough to register, slow enough to span several frames.
const Y = 350;
const sweep = [
  { type: 'move', x: 60, y: Y, steps: 2 },
  { type: 'wait', ms: 120 },
  ...Array.from({ length: 10 }, (_, i) => [{ type: 'move', x: 180 + i * 120, y: Y, steps: 3 }, { type: 'wait', ms: 16 }]).flat(),
];

export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'drawn', settle: 4200 },
  { name: 'sweep', settle: 4200, actions: sweep },
  { name: 'decay', settle: 4200, actions: [...sweep, { type: 'wait', ms: 2500 }] },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 600 },
  { name: 'static', settle: 600, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, { type: 'wait', ms: 300 }] },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 900 },
];

// Two samples of the rendered path data 300 ms apart: mean absolute change per coordinate.
// Only the tail is compared: the last line's end is drawn first, so its points line up even mid-intro.
export async function probe() {
  const path = document.querySelector('[data-field] path');
  const read = () => (path.getAttribute('d') || '').match(/-?\d+(\.\d+)?/g).map(Number).slice(-60);
  const a = read();
  await new Promise((r) => setTimeout(r, 300));
  const b = read();
  const delta = a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
  return {
    delta,
    ariaHidden: document.querySelector('[data-field]').getAttribute('aria-hidden'),
    h1: document.querySelectorAll('h1').length,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
}

export function assert(r) {
  const out = [];
  const s = (k) => r[k].state ?? {};
  const p = (k) => r[k].probe ?? {};

  out.push({ ok: p('top').delta > 0.2 && p('drawn').delta > 0.2, message: `noise drifts: sampled offsets change between frames (${p('top').delta?.toFixed(2)} / ${p('drawn').delta?.toFixed(2)} px mean over 300 ms)` });
  out.push({ ok: s('top').drawn === false && s('drawn').drawn === true, message: `lines draw in on load (drawing at 600 ms: ${!s('top').drawn}, complete by 4.2 s: ${s('drawn').drawn})` });

  const idle = s('drawn').push?.max ?? 99;
  const bands = s('sweep').push?.bands ?? [];
  const near = bands[Math.floor((Y - (s('sweep').fieldTop ?? 0)) / 100)] ?? 0;
  const far = Math.max(0, ...bands.slice(8));
  out.push({ ok: idle === 0 && near > 10 && far < 1, message: `pointer sweep pushes points near its path (idle ${idle}, near band ${near}, bands ≥ 800 px ${far})` });
  const peak = s('sweep').push?.max ?? 0, rest = s('decay').push?.max ?? 99;
  out.push({ ok: peak > 10 && rest < peak * 0.1, message: `the spring returns them (peak ${peak} px → ${rest} px 2.5 s later)` });

  out.push({ ok: s('rm').motion === 'reduced' && s('rm').ticking === false && s('rm').drawn === true && p('rm').delta === 0 && s('rm').pointerPush === false, message: `reduced motion: drawn and still (Δ ${p('rm').delta}), no ticker, no push` });
  out.push({ ok: s('static').motion === 'static' && s('static').ticking === false && s('static').drawn === true && p('static').delta === 0, message: `static tier: no ticker callback registered, field drawn and still (Δ ${p('static').delta})` });

  const m = s('mobile'), d = s('drawn');
  out.push({ ok: m.pointerPush === false && m.gapY > d.gapY && m.stepX > d.stepX && p('mobile').delta > 0.2, message: `mobile: no pointer push, sparser grid (${m.lines}×${m.pointsPerLine} at ${m.gapY}/${m.stepX} px vs ${d.gapY}/${d.stepX}), still drifting` });
  out.push({ ok: ['top', 'rm', 'mobile'].every((k) => p(k).ariaHidden === 'true' && p(k).h1 === 1), message: 'field is aria-hidden under one real <h1>' });
  out.push({ ok: ['top', 'mobile'].every((k) => p(k).overflow === false), message: 'no horizontal overflow' });
  return out;
}
