// The probe samples the reel every 40 ms for ~1.2 s (a bend is judged on its curve, not one frame), then reads back a
// fresh render: the viewport-centre pixel (which card is really in the middle) and the whole frame (every 8th pixel)
// drawn flat and force-bent in the same task (the vertex shader really reads the bend uniform).
const REST = { type: 'waitFor', fn: '(() => { const s = window.__awards.state(); return s.moving === false; })()', timeout: 25000 };
const JUMP = (p) => ({ type: 'waitFor', fn: `(() => { window.__awards.scrollTo(${p}); return true; })()` });
const CENTRE = { type: 'move', x: 720, y: 450, steps: 1 };

export const states = [
  { name: 'top', settle: 1200 },
  { name: 'last', scroll: 1, settle: 400 },
  // Wrap forward: from the last work, one step on lands on the first, moving on (target 8), not rewinding to 0.
  { name: 'wrap', settle: 300, actions: [JUMP(1), { type: 'wait', ms: 200 }, { type: 'press', key: 'ArrowRight' }, REST] },
  { name: 'back', settle: 300, actions: [{ type: 'press', key: 'ArrowLeft' }, REST] },
  { name: 'wheel', settle: 30, actions: [CENTRE, { type: 'wheel', dy: 600 }] },
  { name: 'rest', settle: 300, actions: [CENTRE, { type: 'wheel', dy: 600 }, { type: 'wait', ms: 200 }, REST] },
  // Reduced: two wheel events inside the cooldown are one step, a key is one more; flat sheets throughout.
  { name: 'rm', reducedMotion: true, settle: 30, actions: [CENTRE, { type: 'wheel', dy: 600 }, { type: 'wheel', dy: 600 }, { type: 'press', key: 'ArrowRight' }] },
  { name: 'mobile', viewport: 'mobile', scroll: 0.5, settle: 600 },
];

export async function probe() {
  const s = () => window.__awards.state();
  const samples = [];
  for (let i = 0; i < 30; i++) {
    const st = s();
    samples.push({ bend: st.bend, offset: st.offset, target: st.target, moving: st.moving, uniforms: window.__sheets?.().filter((x) => x.visible).map((x) => x.bend) });
    await new Promise((r) => setTimeout(r, 40));
  }
  const flat = window.__glBendGrid?.(0), bent = window.__glBendGrid?.(1);
  const changed = flat && bent ? flat.filter((p, i) => Math.abs(p[0] - bent[i][0]) + Math.abs(p[1] - bent[i][1]) + Math.abs(p[2] - bent[i][2]) > 30).length / flat.length : null;
  const buttons = [...document.querySelectorAll('[data-work]')].map((b) => Math.round(b.getBoundingClientRect().height));
  return {
    samples,
    centre: window.__glCentre?.() ?? null,
    bendChanged: changed,
    sheets: window.__sheets?.() ?? null,
    card: window.__card?.() ?? null,
    buttons,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    canvasDisplay: getComputedStyle(document.querySelector('[data-gl]')).display,
  };
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const near = (px, hex) => !!px && !!hex && rgb(hex).every((c, i) => Math.abs(c - px[i]) <= 6);

export function assert(r) {
  const out = [];
  const st = (k) => r[k]?.state || {};
  const P = (k) => r[k]?.probe || {};

  const t = st('top');
  out.push({ ok: t.gl === true && t.index === 0 && t.current === 0 && t.documentScroll === 0 && P('top').canvasDisplay === 'block', message: `reel drawn at work 1 (index ${t.index}, aria-current ${t.current}); the document does not scroll` });
  out.push({ ok: near(P('top').centre, t.field), message: `viewport centre renders work 1's field colour (rgb ${P('top').centre}, expected ${t.field})` });
  out.push({ ok: (P('top').bendChanged ?? 0) >= 0.04, message: `the vertex shader bends the sheets: ${((P('top').bendChanged ?? 0) * 100).toFixed(1)} % of the read-back frame changes between uBend 0 and 1` });
  out.push({ ok: P('top').samples?.every((s) => s.bend === 0 && s.uniforms.every((u) => u === 0)), message: 'at rest every visible sheet is flat (uBend 0)' });

  const l = st('last');
  out.push({ ok: l.index === 7 && near(P('last').centre, l.field) && /^08 \/ 08/.test(l.counter), message: `scrollTo(1) steps the virtual reel to the last work (${l.counter})` });

  // The wrap: past the last work the first reappears, reached going forward.
  const w = st('wrap'), ws = P('wrap').sheets || [], pitch = P('wrap').card?.pitch;
  out.push({ ok: w.index === 0 && w.target === 8 && w.keySteps === 1, message: `one step past work 8 lands on work 1 going forward (target ${w.target}, index ${w.index})` });
  out.push({ ok: near(P('wrap').centre, w.field) && ws[0]?.pos === 0 && ws[0]?.visible && ws[7]?.visible && Math.abs(ws[7].pos + pitch) <= 1, message: `after the wrap work 1 is drawn in the centre with work 8 one pitch behind it (rgb ${P('wrap').centre}; positions ${ws[0]?.pos} / ${ws[7]?.pos}, pitch ${pitch})` });
  const b = st('back');
  out.push({ ok: b.index === 7 && b.target === -1 && near(P('back').centre, b.field) && b.current === 7, message: `ArrowLeft from work 1 wraps back to work 8 (target ${b.target}, rgb ${P('back').centre})` });

  // In motion the bend uniform rises; at rest it returns to exactly 0.
  const ms = P('wheel').samples || [];
  const peak = Math.max(0, ...ms.map((s) => s.bend));
  out.push({ ok: st('wheel').bursts >= 1 && peak > 0.1 && ms.some((s) => s.uniforms.some((u) => Math.abs(u) > 0.05)), message: `a wheel burst bends the sheets in transit (peak uBend ${peak})` });
  const re = st('rest'), rs = P('rest').samples || [];
  out.push({ ok: re.moving === false && rs.every((s) => s.bend === 0 && s.uniforms.every((u) => u === 0)) && Number.isInteger(re.target) && re.offset === re.target && re.target >= 1, message: `after the wheel the reel snaps to a work (target ${re.target}) and every uBend is back to 0` });

  // Reduced motion: flat sheets and one snapped step per input.
  const m = st('rm'), mss = P('rm').samples || [];
  out.push({ ok: m.motion === 'reduced' && m.gl === true && m.target === 2 && m.index === 2 && m.wheelEvents === 2 && m.keySteps === 1, message: `reduced motion: two wheel events in one gesture step once, a key once more (target ${m.target})` });
  out.push({ ok: mss.length > 0 && mss.every((s) => s.offset === s.target && s.bend === 0 && s.uniforms.every((u) => u === 0)) && near(P('rm').centre, m.field), message: `reduced motion: no easing and flat sheets on every sample (centre rgb ${P('rm').centre})` });

  // Mobile: a vertical stack of full-width cards, same engine.
  const mb = st('mobile'), mp = P('mobile');
  out.push({ ok: mb.gl === true && mb.axis === 'y' && mb.index === 4 && near(mp.centre, mb.field) && mp.card?.w >= 350, message: `mobile: vertical reel, scrollTo(.5) centres work 5 (rgb ${mp.centre}, card ${mp.card?.w}×${mp.card?.h})` });
  out.push({ ok: mp.buttons?.every((h) => h >= 44) && (mp.overflowX ?? 1) <= 0, message: `mobile: index buttons ${mp.buttons?.join('/')} px tall, overflow ${mp.overflowX}px` });
  return out;
}
