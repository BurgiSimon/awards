// Screens that lean back while they leave and the page is moving. Every angle here is measured from the computed
// matrix3d of the screen (rotateX(θ)·scale(s) gives m22 = s·cos θ, m23 = s·sin θ), sampled over eight frames, never
// read from the script. A steady scroll is driven by Lenis at a known speed, so the states are repeatable.
const park = (k, p) => `(() => { const it = document.querySelectorAll('.screens__item')[${k}]; const y = it.getBoundingClientRect().top + scrollY + ${p} * it.offsetHeight; window.lenis.scrollTo(Math.round(y), { immediate: true, force: true }); return true; })()`;
const drive = (px, s) => `(() => { window.lenis.scrollTo(window.scrollY + ${px}, { duration: ${s}, easing: (t) => t, force: true }); return true; })()`;
const run = (k, p, px, s, after) => [{ type: 'waitFor', fn: park(k, p) }, { type: 'wait', ms: 2200 }, { type: 'waitFor', fn: drive(px, s) }, { type: 'wait', ms: after }];

export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  // Screen 2's top at the viewport's top, then the page scrolls 800 px in 1 s (800 px/s); read 0.4 s in, mid-exit and mid-scroll.
  { name: 'scrolling', settle: 500, actions: run(1, 0, 800, 1, 400) },
  // Screen 2's top 350 px under the viewport's, 700 px of scroll in 0.9 s, read 0.12 s after it stops: halfway out and
  // still leaning, but less with every frame.
  { name: 'easing', frame: true, settle: 500, actions: [{ type: 'waitFor', fn: park(1, -0.5) }, { type: 'wait', ms: 2200 }, { type: 'waitFor', fn: drive(700, 0.9) }, { type: 'wait', ms: 1020 }] },
  // The same screen parked 45 % out with nothing moving: position alone does not lean it.
  { name: 'parked', settle: 500, actions: [{ type: 'waitFor', fn: park(1, 0.45) }, { type: 'wait', ms: 2600 }] },
  // The same scroll, then quiet: everything relaxes to flat and the ticker removes itself.
  { name: 'relax', settle: 500, actions: run(1, 0.1, 800, 1, 3400) },
  // Three hard wheel flicks through Lenis: whatever the speed, no screen passes the cap.
  { name: 'fling', settle: 500, actions: [{ type: 'waitFor', fn: park(0, 0) }, { type: 'wait', ms: 1500 }, { type: 'wheel', dy: 1600 }, { type: 'wait', ms: 40 }, { type: 'wheel', dy: 1600 }, { type: 'wait', ms: 40 }, { type: 'wheel', dy: 1600 }, { type: 'wait', ms: 160 }] },
  // Keyboard: Tab from the first screen to the second, then the same scroll as `scrolling`: the focused screen stays flat.
  { name: 'focus', settle: 500, actions: [{ type: 'focus', selector: '.screens__item:nth-child(1) [data-screen]' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 300 }, ...run(1, 0, 800, 1, 400)] },
  { name: 'rm', reducedMotion: true, settle: 500, actions: run(1, 0, 800, 1, 400) },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: run(1, 0.1, 600, 0.8, 380) },
];

export async function probe() {
  const els = [...document.querySelectorAll('[data-screen]')];
  const matrix = (el) => { const t = getComputedStyle(el).transform; return t === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(t); };
  const angle = (el) => { const m = matrix(el); return (Math.atan2(m.m23, m.m22) * 180) / Math.PI; };
  const r2 = (v) => Math.round(v * 100) / 100;
  const s0 = window.__awards.state();
  const angles = els.map(angle);
  const scales = els.map((el) => { const m = matrix(el); return Math.hypot(m.m11, m.m12, m.m13); });
  const shades = els.map((el) => Number(getComputedStyle(el.querySelector('.screen__shade')).opacity));
  const peak = angles.map(Math.abs);
  const track1 = [angles[1]];
  for (let i = 0; i < 8; i++) {
    await new Promise((r) => requestAnimationFrame(r));
    els.forEach((el, k) => { peak[k] = Math.max(peak[k], Math.abs(angle(el))); });
    track1.push(angle(els[1]));
  }
  const s1 = window.__awards.state();
  const focused = document.activeElement;
  return {
    angles: angles.map(r2),
    peak: peak.map(r2),
    track1: track1.map(r2),
    scales: scales.map((v) => Math.round(v * 10000) / 10000),
    shades,
    progress: s0.progress,
    originY: Math.round((parseFloat(getComputedStyle(els[0]).transformOrigin.split(' ')[1]) / els[0].offsetHeight) * 100),
    perspective: getComputedStyle(els[0].parentElement).perspective,
    frames: [s0.frames, s1.frames],
    running: [s0.running, s1.running],
    focusedIndex: els.indexOf(focused),
    ring: focused?.matches?.(':focus-visible') ? `${getComputedStyle(focused).outlineStyle} ${getComputedStyle(focused).outlineWidth}` : null,
    links: els.every((el) => el.tagName === 'A' && !!document.getElementById(el.getAttribute('href').slice(1)) && !!el.querySelector('h3')),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

const MAX = 34;

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.state || {};
  const flat = (k) => (P(k).peak || [1]).every((a) => a < 0.05);
  const list = (a) => (a || []).join(' / ');

  const t = P('top');
  out.push({ ok: S('top').motion === 'full' && flat('top') && t.running?.every((x) => x === false) && t.links && t.originY === 100 && t.perspective !== 'none', message: `top: at rest every screen is flat (${list(t.angles)}°), the ticker idle (${t.running?.join('/')}); screens are links with headings, turning about the bottom edge (origin at ${t.originY} % of the height) under perspective ${t.perspective}` });

  const s = P('scrolling'), ss = S('scrolling');
  const a1 = s.angles?.[1] ?? 0;
  out.push({ ok: a1 > 4 && a1 <= MAX && (s.progress?.[1] ?? 0) > 0.2 && (s.progress?.[1] ?? 1) < 0.9 && ss.running && ss.energy > 0.2, message: `scrolling: screen 2 mid-exit (progress ${s.progress?.[1]}) leans back ${a1}° (matrix3d) at ${ss.velocity} px/s, energy ${ss.energy}` });
  out.push({ ok: s.scales?.[1] < 1 && s.scales?.[1] >= 1 - 0.05 - 1e-4 && s.shades?.[1] > 0.05 && s.angles.every((a, i) => i === 1 || i === 0 || Math.abs(a) < 0.05), message: `scrolling: the lean brings a slight scale (${s.scales?.[1]}) and shade (${s.shades?.[1]}); screens still below the top stay flat (${list(s.angles)}°)` });

  const e = P('easing'), es = S('easing');
  const eSamples = e.track1 || [];
  out.push({ ok: (es.progress?.[1] ?? 0) > 0.3 && (es.progress?.[1] ?? 1) < 0.7 && es.velocity === 0 && (e.angles?.[1] ?? 0) > 2 && eSamples.every((a, i) => i === 0 || a <= eSamples[i - 1] + 1e-3) && eSamples.at(-1) < eSamples[0], message: `easing: the scroll has stopped (${es.velocity} px/s) with screen 2 halfway out (progress ${es.progress?.[1]}); it still leans ${e.angles?.[1]}° and relaxes every frame (${eSamples.map((a) => a.toFixed(1)).join(' → ')}°)` });

  const pk = P('parked');
  out.push({ ok: (S('parked').progress?.[1] ?? 0) > 0.35 && flat('parked') && pk.running?.[1] === false, message: `parked: screen 2 sits ${Math.round((S('parked').progress?.[1] ?? 0) * 100)} % out with the page still, and is flat (${list(pk.peak)}°): the lean answers motion, not position` });

  const rx = P('relax');
  out.push({ ok: flat('relax') && rx.running?.every((x) => x === false) && rx.frames?.[0] === rx.frames?.[1] && S('relax').wakes >= 1, message: `relax: once the scroll goes quiet every screen returns to flat (${list(rx.peak)}°) and the ticker stops (frames ${rx.frames?.join(' → ')} over eight frames)` });

  const fl = P('fling');
  const flMax = Math.max(...(fl.peak || [0]));
  out.push({ ok: flMax > 6 && flMax <= MAX + 0.01, message: `fling: three 1,600 px wheel flicks lean the leaving screen to ${flMax}°, never past the ${MAX}° cap (no spin)` });

  const fo = P('focus'), fs = S('focus');
  out.push({ ok: fo.focusedIndex === 1 && fs.focused === 1 && /solid 3px/.test(fo.ring || '') && (fo.peak?.[1] ?? 1) < 0.01 && (fs.progress?.[1] ?? 0) > 0.2 && fs.energy > 0.2, message: `keyboard: the focused second screen (ring ${fo.ring}) stays flat (${fo.peak?.[1]}°) through the same scroll that leans it ${a1}° unfocused (progress ${fs.progress?.[1]}, energy ${fs.energy})` });

  const rm = P('rm'), rms = S('rm');
  out.push({ ok: rms.motion === 'reduced' && flat('rm') && rms.frames === 0 && rms.running === false && (rms.progress?.[1] ?? 0) > 0.2, message: `reduced motion: the same scroll leaves every screen flat (${list(rm.peak)}°), the ticker never runs (${rms.frames} frames)` });

  const mo = P('mobile');
  const mMax = Math.max(...(mo.peak || [0]));
  out.push({ ok: mMax > 3 && mMax <= MAX && mo.overflowX <= 0 && (P('top').overflowX ?? 1) <= 0, message: `mobile: a 750 px/s scroll leans the leaving screen ${mMax}° inside the column, no sideways overflow (${mo.overflowX}px)` });
  return out;
}
