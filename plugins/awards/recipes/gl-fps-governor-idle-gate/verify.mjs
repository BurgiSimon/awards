// SwiftShader's real frame rate is slow and uneven, so the governor states inject synthetic frame times through
// __governor.simulate(ms) (it restarts from the probe's ceiling). Every render-count check samples the counter
// repeatedly in the page; pixel ratio and drawing-buffer size are read back from the renderer and the GL context.
const SIM = (ms, restart = true) => ({ type: 'waitFor', fn: `(window.__governor.simulate(${ms}, { restart: ${restart} }), true)` });
// Keep the gate open with synthetic pointer input until a condition on the state holds.
const AWAKE_UNTIL = (cond) => ({ type: 'waitFor', timeout: 30000, fn: `(() => { dispatchEvent(new PointerEvent('pointermove', { clientX: 700, clientY: 450 })); const s = window.__awards.state(); return ${cond}; })()` });
const IDLE = { type: 'waitFor', timeout: 20000, fn: 'window.__awards.state().idle === true' };
const HIDE = { type: 'waitFor', fn: "(Object.defineProperty(document, 'hidden', { value: true, configurable: true }), Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }), document.dispatchEvent(new Event('visibilitychange')), true)" };
const STATIC = { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" };

export const states = [
  { name: 'top', settle: 300 },
  { name: 'throttle', settle: 100, actions: [SIM(40), AWAKE_UNTIL('s.steps.length >= 1')] },
  { name: 'recover', settle: 100, actions: [SIM(40), AWAKE_UNTIL('s.dpr === s.floor'), SIM(12, false), AWAKE_UNTIL('s.dpr === s.cap')] },
  { name: 'hold', settle: 100, actions: [SIM(19), AWAKE_UNTIL('s.windows >= 3')] },
  { name: 'idle', settle: 100, actions: [IDLE] },
  { name: 'wake', settle: 100, actions: [IDLE, { type: 'move', x: 900, y: 500, steps: 4 }] },
  { name: 'busy', settle: 100, actions: [IDLE, { type: 'click', selector: '[data-pulse]' }] },
  { name: 'hidden', settle: 100, actions: [IDLE, HIDE, { type: 'move', x: 900, y: 500, steps: 4 }, { type: 'wheel', dy: 200 }] },
  { name: 'rm', reducedMotion: true, settle: 100, actions: [SIM(40), AWAKE_UNTIL('s.steps.length >= 1'), IDLE] },
  { name: 'static', settle: 100, actions: [STATIC, { type: 'wait', ms: 300 }, { type: 'move', x: 900, y: 500, steps: 4 }, { type: 'wheel', dy: 300 }] },
  { name: 'mobile', viewport: 'mobile', settle: 100, actions: [SIM(40), AWAKE_UNTIL('s.steps.length >= 1')] },
];

export async function probe() {
  const s = () => window.__awards.state();
  const samples = [];
  const t0 = performance.now();
  const sampleFor = async (ms) => { while (performance.now() - t0 < ms) { const st = s(); samples.push({ t: Math.round(performance.now() - t0), renders: st.renders, idle: st.idle, busy: st.busy, since: st.sinceInput }); await new Promise((r) => setTimeout(r, 100)); } };
  // Long enough to see an awake loop fall asleep (1.5 s idle window) or a 3 s transition hold the gate open past it.
  await sampleFor(4500);
  const gov = window.__governor?.readback() ?? null;
  const buttons = [...document.querySelectorAll('.btn')].map((b) => Math.round(b.getBoundingClientRect().height));
  return { samples, gov, buttons, overflowX: document.documentElement.scrollWidth - innerWidth };
}

const q = (n) => Math.round(n * 1000) / 1000;
// What the renderer really holds (read in one task with the governor's value): pixel ratio equals the governor's, the buffer is the CSS size × that ratio.
const rendered = (st, gov) => !!gov && q(gov.pixelRatio) === q(gov.dpr) && gov.buffer[0] === Math.floor(gov.css[0] * gov.pixelRatio) && gov.buffer[1] === Math.floor(gov.css[1] * gov.pixelRatio);
const flat = (ss) => ss.length > 5 && ss.every((x) => x.renders === ss[0].renders);
const rising = (ss) => ss.length > 1 && ss[ss.length - 1].renders > ss[0].renders;

export function assert(r) {
  const out = [];
  const st = (k) => r[k]?.state || {};
  const P = (k) => r[k]?.probe || {};

  const t = st('top'), tg = P('top').gov;
  out.push({ ok: t.gl === true && ['high', 'mid', 'low'].includes(t.tier) && t.cap > 0 && t.floor === q(Math.max(0.5, t.cap / 2)) && t.dpr >= t.floor && t.dpr <= t.cap, message: `governor starts inside the probe's clamp (tier ${t.tier}, dpr ${t.dpr} in ${t.floor}–${t.cap})` });
  out.push({ ok: rendered(t, tg) && tg.inked > 0.01, message: `renderer pixel ratio ${tg?.pixelRatio} → buffer ${tg?.buffer?.join('×')} for ${tg?.css?.join('×')} CSS px; ${(tg?.inked * 100).toFixed(1)} % of the frame is drawn field` });

  // The key assertion: a throttled frame rate drops the renderer's pixel ratio by one step.
  const th = st('throttle'), s0 = th.steps?.[0];
  out.push({ ok: !!s0 && s0.fps === 25 && s0.from === th.cap && s0.to === q(Math.max(th.floor, th.cap - 0.25)) && rendered(th, P('throttle').gov) && P('throttle').gov.pixelRatio < th.cap - 0.2, message: `25 fps (simulated) steps the pixel ratio ${s0?.from} → ${s0?.to}; renderer reads ${P('throttle').gov?.pixelRatio}, buffer ${P('throttle').gov?.buffer?.join('×')}` });
  out.push({ ok: th.steps?.every((x) => x.to === q(Math.max(th.floor, x.from - 0.25)) && x.to >= th.floor), message: `every step is .25 and never below the floor ${th.floor} (${th.steps?.map((x) => x.to).join(' → ')})` });

  const rc = st('recover'), ups = (rc.steps || []).filter((x) => x.to > x.from);
  out.push({ ok: rc.dpr === rc.cap && ups.length >= 1 && ups.every((x) => x.fps >= 58 && x.to === q(Math.min(rc.cap, x.from + 0.25))) && rendered(rc, P('recover').gov), message: `83 fps (simulated) climbs back to the ceiling ${rc.cap} in .25 steps (${rc.steps?.map((x) => x.to).join(' → ')})` });
  const hd = st('hold');
  out.push({ ok: hd.windows >= 3 && hd.fps >= 50 && hd.fps <= 55 && hd.steps?.length === 0 && hd.dpr === hd.cap, message: `between 45 and 57 fps the ratio holds (${hd.fps} fps over ${hd.windows} windows, ${hd.steps?.length} steps, dpr ${hd.dpr})` });

  // Idle gate: the counter stops, a pointer move restarts it, and it stops again after the idle window.
  const id = P('idle').samples || [];
  out.push({ ok: st('idle').idle && !st('idle').looping && flat(id), message: `idle: the render counter holds at ${id[0]?.renders} over ${id.at(-1)?.t} ms` });
  const wk = P('wake').samples || [], wakeUp = wk.filter((x) => x.t <= 1000), wakeEnd = wk.filter((x) => x.t >= 3600);
  out.push({ ok: wk[0]?.idle === false && rising(wakeUp) && flat(wakeEnd) && wakeEnd[0]?.idle === true, message: `a pointer move restarts drawing (${wakeUp[0]?.renders} → ${wakeUp.at(-1)?.renders} in 1 s), then it stops again (held at ${wakeEnd[0]?.renders})` });
  const bz = P('busy').samples || [], late = bz.filter((x) => x.since >= 1900 && x.t <= 2900);
  out.push({ ok: late.length >= 3 && rising(late) && late.every((x) => x.busy && !x.idle), message: `a running transition keeps drawing ${late[0]?.since}–${late.at(-1)?.since} ms after the last input (${late[0]?.renders} → ${late.at(-1)?.renders})` });
  const hs = P('hidden').samples || [];
  out.push({ ok: flat(hs) && st('hidden').sinceInput < 5000, message: `hidden tab: input arrives but the counter holds at ${hs[0]?.renders}` });

  // Reduced motion: the governor and the gate are unchanged; the field is still.
  const rm = st('rm'), rs = rm.steps?.[0];
  out.push({ ok: rm.motion === 'reduced' && rs?.fps === 25 && rs?.to === q(Math.max(rm.floor, rm.cap - 0.25)) && rm.time === 0 && rm.idle && flat(P('rm').samples || []), message: `reduced motion: same step (${rs?.from} → ${rs?.to}), same idle stop, no drift (time ${rm.time})` });
  // Static: exactly one frame, and input never starts the loop.
  const sc = st('static');
  out.push({ ok: sc.motion === 'static' && sc.staticFrames === 1 && !sc.looping && flat(P('static').samples || []), message: `static: one frame (${sc.staticFrames}), no loop after pointer and wheel input` });

  const mb = st('mobile'), mg = P('mobile').gov;
  out.push({ ok: mb.steps?.[0]?.to === q(Math.max(mb.floor, mb.cap - 0.25)) && rendered(mb, mg) && mg.css[0] === 390, message: `mobile: ${mb.cap} → ${mb.steps?.[0]?.to}, buffer ${mg?.buffer?.join('×')} for ${mg?.css?.join('×')}` });
  out.push({ ok: P('mobile').buttons?.every((h) => h >= 44) && (P('mobile').overflowX ?? 1) <= 0, message: `mobile: buttons ${P('mobile').buttons?.join('/')} px tall, overflow ${P('mobile').overflowX}px` });
  return out;
}
