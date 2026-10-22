// Desktop 1440 × 900, phone 390 × 844. The probe reads real window.scrollY on every frame for 1.5 s after the state's
// actions and reports the samples; every assert below is about what the page actually did, not what it says it did.
const TOGGLE = '[data-auto]';
const AT = { type: 'move', x: 720, y: 450, steps: 1 };
// A synthetic finger on the page (as a phone sends it); the toggle is never the target.
const touch = {
  type: 'waitFor',
  fn: `(() => {
    const t = document.querySelector('.notes');
    const p = new Touch({ identifier: 1, target: t, clientX: innerWidth / 2, clientY: innerHeight / 2 });
    t.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [p], targetTouches: [p], changedTouches: [p] }));
    t.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], targetTouches: [], changedTouches: [p] }));
    return true;
  })()`,
};

export const states = [
  // Off by default: nothing moves on its own.
  { name: 'rest', settle: 800 },
  // AUTO on for a second: the page advances at the fixed rate, and keeps doing so while sampled.
  { name: 'auto', settle: 300, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 1000 }] },
  // One wheel hands back: the page travels the wheel's own 200 px and then holds.
  { name: 'takeover', settle: 300, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 1000 }, AT, { type: 'wheel', dx: 0, dy: 200 }] },
  // A key press with focus still on the toggle (ArrowDown is not one of its activation keys).
  { name: 'keyed', settle: 300, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 700 }, { type: 'press', key: 'ArrowDown' }] },
  // A drag on the page.
  { name: 'drag', settle: 300, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 700 }, AT, { type: 'down' }, { type: 'move', x: 720, y: 320, steps: 4 }, { type: 'up' }] },
  // A scroll written by something else (as a scrollbar drag or find-in-page would).
  { name: 'foreign', settle: 300, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 700 }, { type: 'waitFor', fn: '(window.scrollTo(0, window.scrollY + 400), true)' }] },
  // Keyboard only: Enter turns it on, Space on the same button turns it off, once, not off-and-on.
  { name: 'keyboard', settle: 300, actions: [{ type: 'focus', selector: TOGGLE }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 800 }, { type: 'press', key: 'Space' }] },
  // Started 50 px from the end: it reaches the end and stops by itself.
  { name: 'end', settle: 300, actions: [{ type: 'waitFor', fn: '(window.lenis.scrollTo(window.lenis.limit - 50, { immediate: true, force: true }), true)' }, { type: 'wait', ms: 200 }, { type: 'click', selector: TOGGLE }, { type: 'wait', ms: 1500 }] },
  // Reduced motion: the toggle is disabled with a reason and a press does nothing but say why. Playwright will not
  // click an aria-disabled button, so this is the keyboard path: the button keeps focus and Enter still reaches it.
  { name: 'rm', reducedMotion: true, settle: 300, actions: [{ type: 'focus', selector: TOGGLE }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 1000 }] },
  // Phone: tap on, then a touch hands back.
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 900 }, touch] },
];

export async function probe() {
  const samples = [];
  await new Promise((done) => {
    const t0 = performance.now();
    const f = (now) => {
      samples.push({ t: Math.round(now - t0), y: window.scrollY });
      now - t0 < 1500 ? requestAnimationFrame(f) : done();
    };
    requestAnimationFrame(f);
  });
  const btn = document.querySelector('[data-auto]').getBoundingClientRect();
  const dock = document.querySelector('.dock').getBoundingClientRect();
  return {
    samples,
    after: window.__awards.state(),
    toggle: { w: Math.round(btn.width), h: Math.round(btn.height) },
    dockInView: dock.top >= 0 && dock.bottom <= innerHeight && dock.left >= 0 && dock.right <= innerWidth,
    describedBy: document.getElementById(document.querySelector('[data-auto]').getAttribute('aria-describedby'))?.textContent || '',
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

export function assert(r) {
  const out = [];
  const P = (n) => r[n]?.probe || {};
  const S = (n) => r[n]?.state || {};
  const A = (n) => P(n).after || {};
  const ys = (n) => (P(n).samples || []).map((s) => s.y);
  const tail = (n) => (P(n).samples || []).filter((s) => s.t >= 1000).map((s) => s.y);
  const still = (a) => a.length >= 10 && Math.max(...a) - Math.min(...a) <= 1;
  const rate = (n) => { const s = P(n).samples || []; return s.length > 1 ? ((s.at(-1).y - s[0].y) * 1000) / (s.at(-1).t - s[0].t) : 0; };
  const span = (a) => (a.length ? `${Math.round(Math.min(...a))}–${Math.round(Math.max(...a))}` : 'none');

  const rest = S('rest');
  out.push({ ok: rest.pressed === 'false' && rest.on === false && rest.allowed === true && rest.disabled === 'false' && rest.status === '' && still(ys('rest')) && ys('rest')[0] === 0, message: `off by default: aria-pressed ${rest.pressed}, nothing announced, scroll held at ${span(ys('rest'))}` });

  // The technique: scroll increased over the first second, and the measured rate is the fixed one.
  const au = S('auto');
  out.push({ ok: au.on === true && au.pressed === 'true' && au.y >= 45 && /on/.test(au.status), message: `AUTO on for 1 s: scroll ${au.startedAt} → ${au.y} px, aria-pressed ${au.pressed}, status "${au.status}"` });
  out.push({ ok: Math.abs(rate('auto') - 90) <= 30 && A('auto').on === true, message: `advances at the fixed rate: ${rate('auto').toFixed(1)} px/s measured against 90` });

  // One wheel: aria-pressed false at once, then the wheel's own 200 px and nothing more.
  const tk = A('takeover');
  const tkFinal = ys('takeover').at(-1);
  out.push({ ok: S('takeover').pressed === 'false' && tk.reason === 'wheel' && tk.stops === 1 && /wheel/.test(tk.status), message: `wheel hands back: aria-pressed ${S('takeover').pressed}, reason ${tk.reason}, status "${tk.status}"` });
  out.push({ ok: still(tail('takeover')) && Math.abs(tkFinal - tk.stoppedAt - 200) <= 20, message: `after the wheel only its own travel: ${tk.stoppedAt} → ${tkFinal} px (200 expected), then still over the last 500 ms (${span(tail('takeover'))})` });

  for (const [n, why] of [['keyed', 'key'], ['drag', 'pointer'], ['foreign', 'scroll']]) {
    const a = A(n);
    out.push({ ok: a.on === false && a.reason === why && a.pressed === 'false' && still(tail(n)), message: `${n}: hands back on ${why} (reason ${a.reason}), page still after (${span(tail(n))})` });
  }

  const kb = A('keyboard');
  out.push({ ok: kb.on === false && kb.reason === 'button' && kb.starts === 1 && kb.stops === 1 && kb.stoppedAt > 20 && still(ys('keyboard')), message: `keyboard: Enter on, Space off on the same button, once (starts ${kb.starts}, stops ${kb.stops}, reason ${kb.reason}, ran to ${kb.stoppedAt} px)` });

  const en = A('end');
  out.push({ ok: en.on === false && en.reason === 'end' && Math.abs(en.y - en.limit) <= 1 && /end/.test(en.status) && still(ys('end')), message: `stops by itself at the end: y ${en.y} of ${en.limit}, status "${en.status}"` });

  const rm = A('rm');
  out.push({ ok: rm.motion === 'reduced' && rm.disabled === 'true' && rm.pressed === 'false' && rm.starts === 0 && still(ys('rm')) && ys('rm')[0] === 0 && /reduced motion/.test(P('rm').describedBy) && /unavailable/.test(rm.status), message: `reduced motion: aria-disabled ${rm.disabled}, never started, scroll ${span(ys('rm'))}, reason "${P('rm').describedBy}"` });

  const mb = A('mobile');
  out.push({ ok: mb.reason === 'touch' && mb.stoppedAt >= 40 && mb.on === false && still(ys('mobile')), message: `phone: tap on, a touch hands back (reason ${mb.reason}, ran to ${mb.stoppedAt} px)` });
  out.push({ ok: P('mobile').toggle?.h >= 44 && P('mobile').dockInView && (P('mobile').overflowX ?? 1) <= 0, message: `phone: toggle ${P('mobile').toggle?.w}×${P('mobile').toggle?.h} px, dock in view, overflow ${P('mobile').overflowX} px` });
  return out;
}
