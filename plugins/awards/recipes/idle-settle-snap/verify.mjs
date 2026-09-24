// Desktop 1440 × 900: the settle zone is the first viewport (0–900). The mouse sits on the cover at (720, 450), away
// from any link. `near` wheels 360 px (40 %) and must come back to 0; `far` wheels 540 px (60 %) and must reach 900;
// `held` wheels 360 px with the button down and must stay; `release` lets go after 900 ms and must then settle to 0.
// `keyed` wheels 360 px (armed) and presses ArrowDown before the quiet window: a key disarms, so no settle.
// The probe reads real window.scrollY on every frame until 3 s of frame time has passed (each interval clamped to
// 100 ms like the shared ticker's dt, so a SwiftShader stall is not counted as quiet), and reports the peak and the tail.
const AT = { type: 'move', x: 720, y: 450, steps: 1 };
const MOBILE_AT = { type: 'move', x: 195, y: 420, steps: 1 };

export const states = [
  { name: 'top', settle: 600 },
  { name: 'near', actions: [AT, { type: 'wheel', dx: 0, dy: 360 }] },
  { name: 'far', actions: [AT, { type: 'wheel', dx: 0, dy: 540 }] },
  { name: 'held', actions: [AT, { type: 'down' }, { type: 'wheel', dx: 0, dy: 360 }] },
  { name: 'release', actions: [AT, { type: 'down' }, { type: 'wheel', dx: 0, dy: 360 }, { type: 'wait', ms: 900 }, { type: 'up' }] },
  { name: 'keyed', actions: [AT, { type: 'wheel', dx: 0, dy: 360 }, { type: 'press', key: 'ArrowDown' }, { type: 'press', key: 'ArrowDown' }] },
  { name: 'rm', reducedMotion: true, actions: [AT, { type: 'wheel', dx: 0, dy: 360 }] },
  { name: 'mobile', viewport: 'mobile', actions: [MOBILE_AT, { type: 'wheel', dx: 0, dy: 338 }] },
];

export async function probe() {
  const samples = [];
  await new Promise((done) => {
    let t0 = 0, prev = 0, clock = 0;
    const f = (now) => {
      if (!t0) t0 = prev = now;
      clock += Math.min(100, now - prev); prev = now;
      samples.push({ clock: Math.round(clock), y: window.scrollY });
      clock < 3000 && now - t0 < 10000 ? requestAnimationFrame(f) : done();
    };
    requestAnimationFrame(f);
  });
  const ys = samples.map((s) => s.y);
  return {
    peak: Math.max(...ys), final: ys.at(-1), tail: ys.slice(-15), frames: samples.length, clock: samples.at(-1).clock,
    vh: innerHeight, overflowX: document.documentElement.scrollWidth - innerWidth, after: window.__awards.state(),
  };
}

export function assert(r) {
  const out = [];
  const P = (n) => r[n]?.probe || {};
  const A = (n) => P(n).after || {};
  const rest = (n, y) => (P(n).tail || []).length >= 10 && P(n).tail.every((v) => Math.abs(v - y) <= 1);
  const still = (n) => { const t = P(n).tail || []; return t.length >= 10 && Math.max(...t) - Math.min(...t) <= 1; };
  const show = (n) => `peak ${P(n).peak}, tail ${JSON.stringify(P(n).tail?.slice(-4))}, ${P(n).frames} frames / ${P(n).clock} ms, last ${JSON.stringify(A(n).last)}`;

  out.push({ ok: r.top.state?.enabled === true && r.top.state?.fine === true && r.top.state?.y === 0 && r.top.state?.zone === 900 && r.top.state?.snaps === 0, message: `desktop: settle enabled on a fine pointer, zone ${r.top.state?.zone}px, at rest at 0 with no settle on load` });

  // The technique: a rest at 40 % goes back to 0, at 60 % on to one viewport, after the quiet window, as real scrollY.
  out.push({ ok: A('near').last?.from >= 330 && A('near').last?.from <= 380 && rest('near', 0) && A('near').snaps === 1 && A('near').last?.to === 0 && A('near').last?.quiet >= 160, message: `rest at 40 % settles back to 0: ${show('near')}` });
  out.push({ ok: A('far').last?.from >= 500 && A('far').last?.from <= 560 && rest('far', 900) && A('far').snaps === 1 && A('far').last?.to === 900 && A('far').last?.quiet >= 160, message: `rest at 60 % settles on to 900: ${show('far')}` });

  // Never fight the visitor: a held button holds it, the release restarts the quiet window, a key disarms it.
  out.push({ ok: P('held').peak >= 300 && rest('held', P('held').peak) && A('held').held === true && A('held').snaps === 0, message: `pointer held: stays at ${P('held').final}, no settle (${show('held')})` });
  out.push({ ok: rest('release', 0) && A('release').snaps === 1 && A('release').held === false, message: `after the release it settles to 0: ${show('release')}` });
  out.push({ ok: P('keyed').final > 300 && P('keyed').final < 846 && still('keyed') && A('keyed').snaps === 0 && A('keyed').source === 'key', message: `a key press disarms the settle: stays at ${P('keyed').final} (source ${A('keyed').source}, ${show('keyed')})` });

  // Reduced motion: no settle, the wheel lands where it lands.
  out.push({ ok: A('rm').motion === 'reduced' && A('rm').enabled === false && P('rm').final >= 300 && P('rm').final <= 420 && still('rm') && A('rm').snaps === 0, message: `reduced motion: no settle, stays at ${P('rm').final} (${show('rm')})` });

  // Phone (coarse pointer): no settle; the cover is the phone viewport and nothing overflows sideways.
  out.push({ ok: A('mobile').fine === false && A('mobile').enabled === false && A('mobile').snaps === 0 && still('mobile') && P('mobile').final > 0 && A('mobile').zone === P('mobile').vh && P('mobile').overflowX <= 0, message: `phone: coarse pointer, settle off, stays at ${P('mobile').final}, zone ${A('mobile').zone}/${P('mobile').vh}px, overflow-x ${P('mobile').overflowX}` });
  return out;
}
