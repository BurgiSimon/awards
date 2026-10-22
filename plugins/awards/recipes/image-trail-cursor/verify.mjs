// Desktop 1440 × 900: the hero runs from just under the top bar (y ≈ 57) to the fold, with its heading at the foot on
// the left and the copy on the right, so a pointer path at y 200 crosses only open ground. Playwright's mouse starts
// outside the hero; the first move into it only sets the origin, so a path of L px lays floor(L / 80) pictures.
// The probe first reads what is on screen (every visible picture's box, the heading's text box, the stills), then
// samples state() every frame until no picture has been alive for three frames (4 s cap). States that end with HOLD
// skip the wait, so their screenshot shows the trail in flight.
const AT = (x, y) => ({ type: 'move', x, y, steps: 1 });
const HOLD = { type: 'waitFor', fn: '(window.__hold = true)' };
const STATIC = { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" };
const PATH = [AT(100, 200), { type: 'move', x: 1300, y: 200, steps: 30 }]; // 1200 px in 40 px steps → 15 pictures
const slow = [AT(100, 260)];
for (let k = 1; k <= 40; k++) slow.push({ type: 'move', x: 100 + 20 * k, y: 260, steps: 1 }, { type: 'wait', ms: 25 });

export const states = [
  { name: 'top', settle: 600 },
  { name: 'path', settle: 300, actions: PATH },
  { name: 'cross', settle: 300, actions: [AT(1360, 140), { type: 'move', x: 80, y: 860, steps: 64 }, HOLD] },
  { name: 'slow', settle: 300, actions: slow },
  { name: 'fast', settle: 300, actions: [AT(100, 260), { type: 'wait', ms: 30 }, { type: 'move', x: 900, y: 260, steps: 4 }] },
  { name: 'focus', settle: 300, actions: [{ type: 'focus', selector: '.hero__cta' }, AT(100, 200), { type: 'move', x: 1300, y: 380, steps: 30 }, HOLD] },
  { name: 'offscreen', settle: 300, scroll: 1, actions: PATH },
  { name: 'rm', reducedMotion: true, settle: 300, actions: PATH },
  { name: 'static', settle: 300, actions: [STATIC, { type: 'wait', ms: 200 }, ...PATH] },
  { name: 'mobile', viewport: 'mobile', settle: 500, actions: [AT(30, 300), { type: 'move', x: 360, y: 300, steps: 12 }] },
];

export async function probe() {
  const hero = document.querySelector('[data-trail-hero]'), hr = hero.getBoundingClientRect();
  const local = (r) => ({ l: Math.round(r.left - hr.left), t: Math.round(r.top - hr.top), r: Math.round(r.right - hr.left), b: Math.round(r.bottom - hr.top) });
  const range = document.createRange();
  range.selectNodeContents(document.querySelector('[data-trail-hero] h1'));
  const heading = local(range.getBoundingClientRect());
  const layer = document.querySelector('[data-trail]');
  const items = [...layer.querySelectorAll('[data-trail-item]')];
  const shown = () => items.filter((el) => getComputedStyle(el).visibility === 'visible');
  const visible = shown().map((el) => local(el.getBoundingClientRect()));
  const stills = [...document.querySelectorAll('[data-stills] .still')].map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0).map(local);
  const samples = [];
  await new Promise((done) => {
    let quiet = 0;
    const t0 = performance.now();
    const f = () => {
      const st = window.__awards.state();
      samples.push({ live: st.live, shown: shown().length, ticking: st.ticking });
      quiet = st.live === 0 ? quiet + 1 : 0;
      if (!window.__hold && quiet < 3 && performance.now() - t0 < 4000) requestAnimationFrame(f); else done();
    };
    requestAnimationFrame(f);
  });
  return {
    heading, visible, stills, samples,
    final: { live: samples.at(-1)?.live, shown: shown().length, ticking: window.__awards.state().ticking, trailing: window.__awards.state().trailing, opacities: [...new Set(items.map((el) => getComputedStyle(el).opacity))] },
    layer: { ariaHidden: layer.getAttribute('aria-hidden'), inert: layer.inert, pointerEvents: getComputedStyle(layer).pointerEvents, focusables: layer.querySelectorAll('a, button, input, [tabindex]').length },
    active: document.activeElement?.className ?? null,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    scrollY: Math.round(scrollY),
  };
}

// The hero's accessibility tree: the heading, the copy and the link, and nothing from the trail or the stills.
export async function inspect(page, state) {
  if (!['top', 'focus', 'mobile'].includes(state.name)) return null;
  return { aria: await page.locator('[data-trail-hero]').ariaSnapshot() };
}

const overlaps = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
const box = (e, pic) => ({ l: e.x - (pic.w * e.s) / 2, r: e.x + (pic.w * e.s) / 2, t: e.y - (pic.h * e.s) / 2, b: e.y + (pic.h * e.s) / 2 });

export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.state || {};
  const P = (k) => r[k]?.probe || {};

  const t = S('top');
  out.push({ ok: t.armed === true && t.finePointer === true && t.spawns === 0 && t.live === 0 && t.ticking === false && t.pool === 12 && t.domItems === 12, message: `armed on a fine pointer, idle at rest: pool ${t.pool}, ${t.live} live, ticker ${t.ticking ? 'on' : 'off'}` });
  out.push({ ok: t.stills === 3 && t.stillsOpacity === 1 && t.trailing === false && P('top').stills?.every((q) => !overlaps(q, P('top').heading)), message: `rest frame: ${t.stills} still pictures at opacity ${t.stillsOpacity}, clear of the heading` });
  const aria = r.top?.inspect?.aria || '';
  out.push({ ok: /heading "Leave a trail of pictures\." \[level=1\]/.test(aria) && /link "Read the five rules"/.test(aria) && !/\bimg\b/.test(aria), message: 'accessibility tree: the heading, the copy and the link; no picture from the trail or the stills' });

  // Distance, not time: 1200 px of travel lays 15 pictures 80 px apart on the path; the pool of 12 recycles.
  const p = S('path'), pl = p.log || [];
  const xs = pl.map((e) => e.x);
  out.push({ ok: p.spawns === 15 && p.skipped === 0 && pl.length === 15 && pl.every((e) => Math.abs(e.y - pl[0].y) <= 1) && xs.every((x, i) => i === 0 || Math.abs(x - xs[i - 1] - 80) <= 1), message: `1200 px of travel lays ${p.spawns} pictures, ${xs.slice(1).map((x, i) => x - xs[i]).join('/')} px apart` });
  out.push({ ok: p.domItems === 12 && p.maxLive <= 12 && p.live <= 12 && p.recycled === 3 && new Set(pl.map((e) => e.slot)).size === 12, message: `pool never exceeded: ${p.domItems} elements, at most ${p.maxLive} alive, ${p.recycled} recycled oldest-first` });
  // Fade order: every picture starts to fade at least 60 ms after the one before it.
  out.push({ ok: pl.every((e, i) => i === 0 || e.fadeAt - pl[i - 1].fadeAt >= 59), message: `pictures fade in arrival order, ≥ 60 ms apart (${pl.slice(1, 6).map((e, i) => e.fadeAt - pl[i].fadeAt).join(', ')} ms …)` });
  const pp = P('path'), ps = pp.samples || [];
  out.push({ ok: pp.visible?.length > 0 && ps.length > 3 && ps.at(-1).live === 0 && pp.final?.shown === 0 && pp.final?.ticking === false && ps.every((x, i) => i === 0 || x.live <= ps[i - 1].live), message: `pictures fade back to the pool: ${pp.visible?.length} on screen at the end of the path → ${ps.at(-1)?.live} alive, ticker ${pp.final?.ticking ? 'on' : 'off'}` });
  out.push({ ok: p.trailing === true && pp.final?.trailing === false, message: `the stills step aside while the trail is alive (trailing ${p.trailing}) and return after it (${pp.final?.trailing})` });

  // The heading is never covered: a path across it skips the marks there, and no picture box touches its text.
  const c = S('cross'), cp = P('cross'), heading = cp.heading;
  const covered = (c.log || []).filter((e) => overlaps(box(e, c.pic), heading) || (e.x > heading.l && e.x < heading.r && e.y > heading.t && e.y < heading.b));
  out.push({ ok: c.spawns > 3 && c.skipped > 0 && !!heading && covered.length === 0 && (cp.visible || []).every((v) => !overlaps(v, heading)), message: `a path across the heading: ${c.spawns} pictures, ${c.skipped} skipped, ${covered.length} touching the heading's text (${heading?.l},${heading?.t})–(${heading?.r},${heading?.b})` });
  out.push({ ok: [p, c].every((st) => (st.log || []).every((e) => !(st.protect || []).some((q) => overlaps(box(e, st.pic), q)))), message: 'no picture box touches any protected area (heading and copy, padded)' });

  // Speed sets size and tilt within the clamp: a fast stroke lays larger, more tilted pictures than a slow one.
  const mean = (a) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
  const sl = S('slow').log || [], fl = S('fast').log || [];
  const all = [...sl, ...fl, ...pl];
  out.push({ ok: sl.length === 10 && fl.length === 10 && mean(fl.map((e) => e.s)) > mean(sl.map((e) => e.s)) + 0.1 && mean(fl.map((e) => e.rot)) > mean(sl.map((e) => e.rot)) + 2, message: `speed: slow stroke scale ${mean(sl.map((e) => e.s)).toFixed(2)} / tilt ${mean(sl.map((e) => e.rot)).toFixed(1)}°, fast ${mean(fl.map((e) => e.s)).toFixed(2)} / ${mean(fl.map((e) => e.rot)).toFixed(1)}°` });
  out.push({ ok: all.every((e) => e.s >= 0.8 - 1e-6 && e.s <= 1.25 + 1e-6 && Math.abs(e.rot) <= 11 + 1e-6), message: `every picture within the clamp: scale ${Math.min(...all.map((e) => e.s))}–${Math.max(...all.map((e) => e.s))}, tilt ${Math.min(...all.map((e) => e.rot))}–${Math.max(...all.map((e) => e.rot))}°` });

  // Never steals focus, never in the accessibility tree, never under the pointer.
  const f = S('focus'), fp = P('focus');
  out.push({ ok: f.spawns >= 14 && f.live > 6 && /hero__cta/.test(f.focused || '') && /hero__cta/.test(fp.active || '') && fp.layer?.ariaHidden === 'true' && fp.layer?.inert === true && fp.layer?.pointerEvents === 'none' && fp.layer?.focusables === 0 && !/\bimg\b/.test(r.focus?.inspect?.aria || ''), message: `focus stays on the link while ${f.spawns} pictures land; layer aria-hidden ${fp.layer?.ariaHidden}, inert ${fp.layer?.inert}, pointer-events ${fp.layer?.pointerEvents}` });

  // Off screen: the trail pauses, releases every picture and leaves the ticker.
  const o = S('offscreen');
  out.push({ ok: o.spawns === 15 && o.onScreen === false && o.paused === true && o.armed === false && o.live === 0 && o.ticking === false && P('offscreen').scrollY > 0, message: `hero off screen: paused, ${o.live} alive, ticker ${o.ticking ? 'on' : 'off'}` });

  // Reduced, static and coarse: no trail at all; three still pictures placed by the design, clear of the heading.
  for (const k of ['rm', 'static', 'mobile']) {
    const st = S(k), sp = P(k);
    const tier = k === 'rm' ? 'reduced' : k === 'static' ? 'static' : st.motion;
    out.push({ ok: st.motion === tier && st.armed === false && st.spawns === 0 && st.live === 0 && sp.visible?.length === 0 && st.stills === 3 && sp.stills?.length === 3 && sp.stills.every((q) => !overlaps(q, sp.heading)), message: `${k}: no trail (${st.spawns} pictures, armed ${st.armed}), ${sp.stills?.length} stills clear of the heading` });
  }
  const mb = S('mobile'), mp = P('mobile');
  out.push({ ok: mb.finePointer === false && mp.overflowX <= 0 && !/\bimg\b/.test(r.mobile?.inspect?.aria || ''), message: `phone: coarse pointer (fine ${mb.finePointer}), overflow ${mp.overflowX} px` });
  return out;
}
