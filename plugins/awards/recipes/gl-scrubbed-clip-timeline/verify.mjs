// The timeline is nine units, a slot of three per form. Inside slot i (start s = 3i): hand-off [s − .5, s + .5]
// power2.inOut, growth [s + .25, s + 2] sine.inOut, tone [s + 1, s + 2.25]. These constants are restated here on purpose:
// the asserts compute the expected clip time from the scroll position, independently of main.js.
const UNITS = 9, SLOT = 3, GROW_AT = 0.25, GROW = 1.75, SETTLE = 2.25, GAP = 7;
const sineInOut = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
// Clip time the scroll should have set for form i at timeline time T.
const expectedClip = (i, T, D) => sineInOut(clamp01((T - (i * SLOT + GROW_AT)) / GROW)) * D;
// Linear keyframe interpolation of a VectorKeyframeTrack's x values at time t.
function keyframe({ times, x }, t) {
  if (t <= times[0]) return x[0];
  for (let k = 1; k < times.length; k++) if (t <= times[k]) return x[k - 1] + ((x[k] - x[k - 1]) * (t - times[k - 1])) / (times[k] - times[k - 1]);
  return x.at(-1);
}
const seek = (p) => ({ type: 'waitFor', fn: `window.__clips.seek(${p})` });

export const states = [
  { name: 'top', settle: 900 },
  // The first slot's settled pose (T = 2.25): Bloom fully open, nothing else started.
  { name: 'bloom', settle: 900, actions: [seek(0.25), { type: 'wait', ms: 1800 }] },
  // Mid-growth of the second form: T = .46 × 9 = 4.14, growth (4.14 − 3.25) / 1.75 ≈ .51 of the way through.
  { name: 'slot1', settle: 900, actions: [seek(0.46), { type: 'wait', ms: 1800 }] },
  // Render on demand: after the scrub has settled, nothing draws.
  { name: 'idle', scroll: 0.3, settle: 2200 },
  // Keyboard: the third form's link takes the page to its settled pose.
  { name: 'keys', settle: 900, actions: [{ type: 'focus', selector: '[data-seek="2"]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 2800 }] },
  // Reduced motion: no scrub, the slot the scroll is in is cut to its settled pose.
  { name: 'rm', reducedMotion: true, settle: 900, actions: [seek(0.46), { type: 'wait', ms: 500 }] },
  // Without WebGL2 (forced): a CSS still, and the timeline still drives the beats.
  { name: 'nogl', settle: 1400, actions: [{ type: 'waitFor', fn: "(history.replaceState(null, '', '?gl=0'), true)" }, { type: 'reload' }], scroll: 0.8 },
  { name: 'mobile', viewport: 'mobile', settle: 900, actions: [seek(0.8), { type: 'wait', ms: 1400 }] },
];

export async function probe() {
  const r0 = window.__awards.state().renders;
  await new Promise((r) => setTimeout(r, 500));
  const r1 = window.__awards.state().renders;
  const px = window.__clips.sample(); // after the idle window: sample() draws a frame of its own
  const shown = (s) => { const el = document.querySelector(s); const b = el.getBoundingClientRect(); return getComputedStyle(el).display !== 'none' && b.width > 0 && b.height > 0; };
  return {
    idle: { r0, r1 },
    px,
    canvasShown: shown('[data-gl]'),
    stillShown: shown('[data-still]'),
    focused: document.activeElement?.getAttribute('data-seek') ?? null,
    activeText: document.querySelector('.beat[data-active] p')?.textContent ?? null,
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

// Node-side, reduced motion only: a scroll inside the slot must not draw; crossing into the next slot cuts once.
export async function inspect(page, st) {
  if (st.name !== 'rm') return null;
  return page.evaluate(async () => {
    const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const s = () => window.__awards.state();
    const before = s().renders;
    window.__clips.seek(0.55); await frames(); await frames();
    const within = s();
    window.__clips.seek(0.8); await frames(); await frames();
    const next = s();
    return { before, within: { renders: within.renders, cutSlot: within.cutSlot }, next: { renders: next.renders, cutSlot: next.cutSlot, mixerTime: next.mixerTime, tlTime: next.tlTime } };
  });
}

const near = (a, b, tol) => Math.abs(a - b) <= tol;
const lit = (px, corner) => Array.isArray(px) && Array.isArray(corner) && Math.abs(px[0] - corner[0]) + Math.abs(px[1] - corner[1]) + Math.abs(px[2] - corner[2]) > 40;

export function assert(r) {
  const out = [];
  const S = (n) => r[n]?.state || {};
  const P = (n) => r[n]?.probe || {};

  const t = S('top');
  out.push({ ok: t.gl === true && t.mixerTime?.every((x) => x === 0) && near(t.heartScale?.[0], t.heartTrack?.[0]?.x[0], 1e-3) && t.current === 0 && t.renders >= 1, message: `top: webgl2 · ${t.tier}, every clip at 0 (${t.mixerTime}), Bloom's heart at its first keyframe (${t.heartScale?.[0]}), aria-current on Bloom` });
  out.push({ ok: lit(P('top').px?.heart, P('top').px?.corner) && P('top').canvasShown && !P('top').stillShown, message: `top: the form is drawn (heart ${P('top').px?.heart} against ground ${P('top').px?.corner})` });

  const b = S('bloom');
  out.push({ ok: near(b.tlTime, SETTLE, 0.02) && near(b.mixerTime?.[0], b.durations?.[0], 1e-3) && b.mixerTime?.[1] === 0 && b.petal0?.every((v, i) => near(v, b.petal0End?.[i], 2e-3)) && b.current === 0 && lit(P('bloom').px?.heart, P('bloom').px?.corner), message: `bloom: settled at ${b.tlTime}, clip ${b.mixerTime?.[0]} / ${b.durations?.[0]}, petal pivot ${b.petal0} = last keyframe ${b.petal0End}` });

  // The verify idea: at a known fraction, mixer.time is the clip time the scroll implies, and the scene holds that keyframe.
  const s1 = S('slot1');
  const T = s1.progress * UNITS;
  const want = s1.durations ? expectedClip(1, T, s1.durations[1]) : NaN;
  out.push({ ok: near(s1.tlTime, T, 0.02) && near(s1.mixerTime?.[1], want, 0.02), message: `slot1: progress ${s1.progress} → timeline ${s1.tlTime} (expected ${T.toFixed(3)}); Stack mixer.time ${s1.mixerTime?.[1]} against ${want.toFixed(3)} (± .02)` });
  const wantScale = s1.heartTrack ? keyframe(s1.heartTrack[1], s1.mixerTime[1]) : NaN;
  out.push({ ok: near(s1.heartScale?.[1], wantScale, 0.005) && s1.heartScale?.[1] > 0.06 && s1.heartScale?.[1] < 0.99, message: `slot1: Stack's heart scale read from the scene ${s1.heartScale?.[1]} matches the keyframe at that time (${wantScale.toFixed(3)})` });
  out.push({ ok: near(s1.mixerTime?.[0], s1.durations?.[0], 1e-3) && s1.mixerTime?.[2] === 0 && near(s1.railX, -GAP, 0.001) && s1.visible?.join() === 'false,true,false' && s1.current === 1, message: `slot1: hand-off done (rail ${s1.railX}), Bloom held grown (${s1.mixerTime?.[0]}), Coil not started (${s1.mixerTime?.[2]}), aria-current on Stack (${s1.current})` });

  const id = P('idle').idle || {};
  out.push({ ok: S('idle').renders > S('top').renders && id.r0 === id.r1 && id.r0 > 0, message: `render on demand: ${id.r0} → ${id.r1} frames across 500 ms at rest (after ${S('idle').renders} frames for the scroll)` });

  const k = S('keys');
  out.push({ ok: k.current === 2 && P('keys').focused === '2' && near(k.tlTime, 2 * SLOT + SETTLE, 0.05) && near(k.mixerTime?.[2], k.durations?.[2], 0.001), message: `keys: Enter on Coil's link reaches its settled pose (timeline ${k.tlTime}, clip ${k.mixerTime?.[2]} / ${k.durations?.[2]}), focus kept on the link` });

  const rm = S('rm'), ri = r.rm?.inspect || {};
  out.push({ ok: rm.motion === 'reduced' && rm.cutSlot === 1 && rm.tlTime === SLOT + SETTLE && near(rm.mixerTime?.[1], rm.durations?.[1], 1e-3) && rm.mixerTime?.[2] === 0, message: `reduced motion: slot 1 cut to its settled pose (timeline ${rm.tlTime}, Stack ${rm.mixerTime?.[1]} / ${rm.durations?.[1]})` });
  out.push({ ok: ri.within?.renders === ri.before && ri.within?.cutSlot === 1 && ri.next?.cutSlot === 2 && ri.next?.renders === ri.before + 1 && near(ri.next?.mixerTime?.[2], rm.durations?.[2], 1e-3), message: `reduced motion: a scroll inside the slot draws nothing (${ri.before} → ${ri.within?.renders}); the next slot is one cut, one frame (→ ${ri.next?.renders}, Coil ${ri.next?.mixerTime?.[2]})` });

  const n = S('nogl');
  out.push({ ok: n.gl === false && n.renders === 0 && P('nogl').stillShown && !P('nogl').canvasShown && n.current === 2, message: `no WebGL2: CSS still shown, canvas hidden, ${n.renders} frames, the beats still follow the scroll (aria-current ${n.current})` });

  const m = S('mobile');
  const Tm = m.progress * UNITS;
  out.push({ ok: m.gl === true && m.lag === 0.3 && near(m.mixerTime?.[2], expectedClip(2, Tm, m.durations?.[2]), 0.02) && m.current === 2 && lit(P('mobile').px?.heart, P('mobile').px?.corner), message: `phone: scrub lag ${m.lag} s, Coil mixer.time ${m.mixerTime?.[2]} against ${expectedClip(2, Tm, m.durations?.[2] ?? 0).toFixed(3)}, form drawn` });
  out.push({ ok: (P('mobile').overflowX ?? 1) <= 0 && /helix/.test(P('mobile').activeText || ''), message: `phone: no overflow (${P('mobile').overflowX} px), the active line is Coil's ("${P('mobile').activeText}")` });
  return out;
}
