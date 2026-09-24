// The first card sits at (60, 286) 416 × 520 on the 1440 × 900 desktop viewport at scrollY 0.
// `tilt` hovers its top-left index label (Playwright's hover targets the label's centre, already in view, so nothing scrolls).
// `hold` and `unlock` aim top-left, wheel the page 120 px, then move the mouse to (430, 640), which after that scroll is
// the card's bottom-right quadrant: `hold` moves 50 ms after the wheel (inside the 140 ms lock), `unlock` 400 ms after.
// `unlock`'s state.pointer confirms the quadrant. The probe reads what renders, sampled every 40 ms: the face's computed
// matrix (rotations recovered from it, and the depth of its top-left corner), and the shine and shade layers' computed
// translate, opacity and display.
const TL = { type: 'hover', selector: '[data-tilt] .card__idx' };
const settle = { type: 'wait', ms: 800 };
export const states = [
  { name: 'top', scroll: 0, settle: 300 },
  { name: 'tilt', settle: 300, actions: [TL, settle] },
  { name: 'hold', settle: 300, actions: [TL, settle, { type: 'wheel', dy: 120 }, { type: 'wait', ms: 50 }, { type: 'move', x: 430, y: 640, steps: 1 }] },
  { name: 'unlock', settle: 300, actions: [TL, settle, { type: 'wheel', dy: 120 }, { type: 'wait', ms: 400 }, { type: 'move', x: 430, y: 640, steps: 2 }, settle] },
  { name: 'rm', settle: 300, reducedMotion: true, actions: [TL, settle] },
  { name: 'mobile', settle: 300, viewport: 'mobile', actions: [TL, settle] },
];

export async function probe() {
  const card = document.querySelector('[data-tilt]');
  const face = card.querySelector('[data-tilt-face]');
  const shine = card.querySelector('[data-tilt-shine]');
  const shade = card.querySelector('[data-tilt-shade]');
  const nums = (el) => {
    const t = getComputedStyle(el).transform;
    const m3 = /matrix3d\(([^)]*)\)/.exec(t);
    if (m3) return m3[1].split(',').map(Number);
    const m2 = /matrix\(([^)]*)\)/.exec(t);
    const [a, b, c, d, e, f] = m2 ? m2[1].split(',').map(Number) : [1, 0, 0, 1, 0, 0];
    return [a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, e, f, 0, 1];
  };
  const deg = (s) => Number(((Math.asin(Math.max(-1, Math.min(1, s))) * 180) / Math.PI).toFixed(2));
  const sample = () => {
    const m = nums(face); // column-major: m[2] = m31 = −sin(ry), m[9] = m23 = −sin(rx), m[6] = m32
    const w = face.offsetWidth, h = face.offsetHeight;
    const s = nums(shine), d = nums(shade);
    return {
      rx: deg(-m[9]), ry: deg(-m[2]),
      cornerZ: Number((m[2] * (-w / 2) + m[6] * (-h / 2)).toFixed(1)), // depth of the top-left corner, + toward the viewer
      shineX: Math.round(s[12]), shineY: Math.round(s[13]), shineOpacity: Number(getComputedStyle(shine).opacity),
      shadeX: Math.round(d[12]), shadeOpacity: Number(getComputedStyle(shade).opacity),
      scrollY: Math.round(scrollY),
    };
  };
  const samples = [];
  for (let i = 0; i < 6; i++) { samples.push(sample()); await new Promise((r) => setTimeout(r, 40)); }
  return {
    samples, last: samples.at(-1),
    shineDisplay: getComputedStyle(shine).display, shadeDisplay: getComputedStyle(shade).display,
    coarse: matchMedia('(pointer: coarse)').matches,
  };
}

export function assert(r) {
  const out = [];
  const P = (n) => r[n]?.probe || {};
  const S = (n) => r[n]?.state || {};
  const flat = (s) => !!s && Math.abs(s.rx) < 0.05 && Math.abs(s.ry) < 0.05 && Math.abs(s.cornerZ) < 0.5;
  const f = (s) => (s ? `rx ${s.rx}° ry ${s.ry}° corner z ${s.cornerZ}` : 'no sample');

  out.push({ ok: flat(P('top').last) && P('top').last.shineOpacity === 0, message: `at rest the face is flat and the shine hidden (${f(P('top').last)}, shine opacity ${P('top').last?.shineOpacity})` });

  // Tilt: pointer in the top-left quadrant → the face turns toward it (rotateX > 0, rotateY < 0, the top-left corner
  // recedes), by the mapped amount (7° × the normalised offset), and the shine sits toward the pointer, the shade opposite.
  const t = P('tilt').last, [nx, ny] = S('tilt').pointer || [0, 0];
  out.push({ ok: nx < -0.5 && ny < -0.5, message: `tilt pointer lands in the top-left quadrant (${nx}, ${ny})` });
  out.push({ ok: !!t && t.rx > 3 && t.ry < -3 && t.cornerZ < -10 && Math.abs(t.rx - -7 * ny) < 0.5 && Math.abs(t.ry - 7 * nx) < 0.5, message: `face turns toward a top-left pointer: ${f(t)} (expected rx ${(-7 * ny).toFixed(2)}, ry ${(7 * nx).toFixed(2)})` });
  out.push({ ok: !!t && t.shineX < -50 && t.shineY < -50 && t.shineOpacity > 0.9 && t.shadeX > 50 && t.shadeOpacity > 0.3, message: `shine follows the pointer (${t?.shineX}, ${t?.shineY}, opacity ${t?.shineOpacity}), shade opposite (x ${t?.shadeX}, opacity ${t?.shadeOpacity})` });

  // Hold: a move that arrives while the page is scrolling is ignored; the rotation stays where the top-left pointer put it.
  const hs = P('hold').samples || [];
  out.push({ ok: S('hold').heldMoves > 0 && hs.length > 0 && hs.every((s) => s.scrollY > 0 && Math.abs(s.rx - t?.rx) < 0.5 && Math.abs(s.ry - t?.ry) < 0.5), message: `rotation holds during the scroll (${S('hold').heldMoves} held moves, scrollY ${hs.at(-1)?.scrollY}, ${hs.map((s) => `${s.rx}/${s.ry}`).join(' ')})` });

  // Unlock: the same move after the 140 ms quiet period is taken; the pointer is now bottom-right and the tilt flips.
  const u = P('unlock').last, [ux, uy] = S('unlock').pointer || [0, 0];
  out.push({ ok: S('unlock').locked === false && ux > 0.5 && uy > 0.5 && !!u && u.rx < -3 && u.ry > 3 && u.cornerZ > 10, message: `the first move after the scroll settles unlocks: pointer (${ux}, ${uy}), ${f(u)}` });

  // Reduced motion: flat card, no layers, nothing armed.
  const rm = P('rm');
  out.push({ ok: S('rm').motion === 'reduced' && S('rm').armed === false && (rm.samples || []).every(flat) && rm.shineDisplay === 'none' && rm.shadeDisplay === 'none', message: `reduced motion: armed ${S('rm').armed}, ${f(rm.last)}, layers ${rm.shineDisplay}/${rm.shadeDisplay}` });

  // Phone (coarse pointer, mouse events still dispatched by the hover): never armed, flat, layers invisible.
  const mb = P('mobile');
  out.push({ ok: mb.coarse === true && S('mobile').armed === false && (mb.samples || []).every(flat) && mb.last?.shineOpacity === 0, message: `coarse pointer: armed ${S('mobile').armed}, ${f(mb.last)}, shine opacity ${mb.last?.shineOpacity}` });
  return out;
}
