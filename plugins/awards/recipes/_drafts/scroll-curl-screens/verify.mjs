// Screens that lean back while they leave and the page is moving. Every angle here is measured from the computed
// matrix3d of the screen (rotateX(θ)·scale(s) gives m22 = s·cos θ, m23 = s·sin θ), never read from the script.
// Steady scrolls are driven by Lenis at a known speed, so the states are repeatable; where the fastest moment would
// fall between the actions and the probe (a fling, a key jump, a touch drag) a sampler reads the matrices every frame.
const park = (k, p) => `(() => { const it = document.querySelectorAll('.screens__item')[${k}]; const y = it.getBoundingClientRect().top + scrollY + ${p} * it.offsetHeight; window.lenis.scrollTo(Math.round(y), { immediate: true, force: true }); return true; })()`;
const drive = (px, s) => `(() => { window.lenis.scrollTo(window.scrollY + ${px}, { duration: ${s}, easing: (t) => t, force: true }); return true; })()`;
const run = (k, p, px, s, after) => [{ type: 'waitFor', fn: park(k, p) }, { type: 'wait', ms: 2200 }, { type: 'waitFor', fn: drive(px, s) }, { type: 'wait', ms: after }];
// Every frame from here on: the largest angle each screen reaches (from its matrix), the largest speed and energy the
// script reports, and whether Lenis saw a native scroll.
const SAMPLE = `(() => { const els = [...document.querySelectorAll('[data-screen]')]; const s = window.__curlSampled = { peak: els.map(() => 0), maxV: 0, maxE: 0, native: false, frames: 0 }; const ang = (el) => { const t = getComputedStyle(el).transform; if (t === 'none') return 0; const m = new DOMMatrixReadOnly(t); return Math.abs((Math.atan2(m.m23, m.m22) * 180) / Math.PI); }; const f = () => { els.forEach((el, k) => { s.peak[k] = Math.max(s.peak[k], ang(el)); }); const st = window.__awards.state(); s.maxV = Math.max(s.maxV, Math.abs(st.velocity)); s.maxE = Math.max(s.maxE, st.energy); if (window.lenis.isScrolling === 'native') s.native = true; s.frames++; requestAnimationFrame(f); }; requestAnimationFrame(f); return true; })()`;
const sample = { type: 'waitFor', fn: SAMPLE };
const record = (at) => ({ type: 'waitFor', fn: `(() => { const a = document.activeElement; (window.__walk ||= []).push({ at: '${at}', id: a.id || null, cls: typeof a.className === 'string' ? a.className : a.tagName, href: a.getAttribute('href'), hash: location.hash, top: Math.round(a.getBoundingClientRect().top) }); return true; })()` });

export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  // Screen 2's top at the viewport's top, then 800 px in 1 s (800 px/s); read 0.4 s in, mid-exit and mid-scroll.
  { name: 'scrolling', settle: 500, actions: run(1, 0, 800, 1, 400) },
  // The same screen near the same progress, at a quarter of the speed: 240 px in 1.2 s (200 px/s), read 0.6 s in.
  { name: 'slow', settle: 500, actions: run(1, 0.3, 240, 1.2, 600) },
  // A flick at 1,600 px/s, read 80 ms after it stops: screen 2 about 40 % out and leaning hard. The explorer's frame.
  { name: 'flick', frame: true, settle: 500, actions: run(1, -0.58, 700, 0.4375, 517) },
  // 700 px in 0.9 s, read 1.1 s later with screen 2 halfway out: still leaning, but less with every frame.
  { name: 'easing', settle: 500, actions: run(1, -0.5, 700, 0.9, 1100) },
  // The same screen parked 45 % out with nothing moving: position alone does not lean it.
  { name: 'parked', settle: 500, actions: [{ type: 'waitFor', fn: park(1, 0.45) }, { type: 'wait', ms: 2600 }] },
  // The same scroll, then quiet: everything relaxes to flat and the curl's callback leaves the ticker. At 60 fps that
  // takes about 1.9 s after the stop (energy .57 × e^(−3.2 t) under the .05° threshold); the read comes 3.4 s after,
  // because a loaded SwiftShader run drops frames and raf.js caps each step at 0.1 s, which slows the relax's clock.
  { name: 'relax', settle: 500, actions: run(1, 0.1, 800, 1, 4400) },
  // Three hard wheel flicks through Lenis, sampled every frame: whatever the speed, no screen passes the cap.
  { name: 'fling', settle: 500, actions: [{ type: 'waitFor', fn: park(0, 0) }, { type: 'wait', ms: 1500 }, sample, { type: 'wheel', dy: 1600 }, { type: 'wait', ms: 40 }, { type: 'wheel', dy: 1600 }, { type: 'wait', ms: 40 }, { type: 'wheel', dy: 1600 }, { type: 'wait', ms: 160 }] },
  // End from mid-run: Chromium animates the jump natively at thousands of px/s, and no screen leans on the way.
  { name: 'key-end', settle: 500, actions: [{ type: 'waitFor', fn: park(1, 0.1) }, { type: 'wait', ms: 2200 }, sample, { type: 'press', key: 'End' }, { type: 'wait', ms: 1500 }] },
  // PageDown from the same place is scrolling, not a jump: it leans like any scroll of its speed.
  { name: 'key-pagedown', settle: 500, actions: [{ type: 'waitFor', fn: park(1, 0.1) }, { type: 'wait', ms: 2200 }, sample, { type: 'press', key: 'PageDown' }, { type: 'wait', ms: 700 }] },
  // Keyboard: Tab from the first screen to the second, then the same scroll as `scrolling`: the focused screen stays flat.
  { name: 'focus', settle: 500, actions: [{ type: 'focus', selector: '.screens__item:nth-child(1) [data-screen]' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 300 }, ...run(1, 0, 800, 1, 400)] },
  // Keyboard walk: Enter on a screen lands focus on its note, Tab reaches the way back, Enter returns to the screen.
  { name: 'walk', settle: 500, actions: [{ type: 'focus', selector: '#screen-tern' }, { type: 'wait', ms: 300 }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 400 }, record('enter'), { type: 'press', key: 'Tab' }, record('tab'), { type: 'press', key: 'Enter' }, { type: 'wait', ms: 400 }, record('back'), { type: 'wait', ms: 600 }] },
  { name: 'rm', reducedMotion: true, settle: 500, actions: run(1, 0, 800, 1, 400) },
  // The static tier, forced on the root before any scroll: the same scroll never starts the curl.
  { name: 'static', settle: 500, actions: [{ type: 'waitFor', fn: `(() => { document.documentElement.dataset.motion = 'static'; return true; })()` }, { type: 'wait', ms: 100 }, ...run(1, 0, 800, 1, 400)] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: run(1, 0.1, 600, 0.8, 380) },
  // A real touch drag (CDP touch events, so the browser scrolls natively and Lenis only reports it), run in inspect().
  { name: 'touch', viewport: 'mobile', settle: 600, actions: [{ type: 'waitFor', fn: park(1, 0.05) }, { type: 'wait', ms: 1500 }, sample] },
  // A phone on its side: 740 × 360 and 667 × 375, then the same with every text 40 % longer at 844 × 390 and 740 × 360.
  { name: 'landscape', viewport: 'mobile', settle: 600 },
  { name: 'landscape-long', viewport: 'mobile', settle: 600 },
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
  const sampled = window.__curlSampled ? { ...window.__curlSampled, peak: window.__curlSampled.peak.map(r2), maxV: Math.round(window.__curlSampled.maxV) } : null;
  return {
    angles: angles.map(r2),
    peak: peak.map(r2),
    track1: track1.map(r2),
    scales: scales.map((v) => Math.round(v * 10000) / 10000),
    shades,
    // Read in the same task as the angles, so they describe the same frame.
    progress: s0.progress,
    energy: s0.energy,
    velocity: s0.velocity,
    scroll: s0.scroll,
    sampled,
    walk: window.__walk || null,
    originY: Math.round((parseFloat(getComputedStyle(els[0]).transformOrigin.split(' ')[1]) / els[0].offsetHeight) * 100),
    perspective: getComputedStyle(els[0].parentElement).perspective,
    shadeImage: getComputedStyle(els[0].querySelector('.screen__shade')).backgroundImage.slice(0, 40),
    frames: [s0.frames, s1.frames],
    running: [s0.running, s1.running],
    focusedIndex: els.indexOf(focused),
    ring: focused?.matches?.(':focus-visible') ? `${getComputedStyle(focused).outlineStyle} ${getComputedStyle(focused).outlineWidth}` : null,
    links: els.every((el) => el.tagName === 'A' && !!document.getElementById(el.getAttribute('href').slice(1)) && !!el.querySelector('h3')),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Runs in the page: each screen's text and picture against the screen's own rectangle.
function measure() {
  const screens = [...document.querySelectorAll('[data-screen]')].map((s, i) => {
    const r = s.getBoundingClientRect();
    const parts = ['.screen__title', '.screen__line', '.screen__meta', '.screen__art'].map((sel) => s.querySelector(sel));
    const spill = Math.max(...parts.map((el) => { const b = el.getBoundingClientRect(); return Math.max(0, r.top - b.top, b.bottom - r.bottom, r.left - b.left, b.right - r.right); }));
    const clipped = parts.slice(0, 3).filter((el) => el.scrollWidth > el.clientWidth + 1).length;
    const t = s.querySelector('.screen__text').getBoundingClientRect();
    const a = s.querySelector('.screen__art').getBoundingClientRect();
    const overlap = Math.max(0, Math.min(t.right, a.right) - Math.max(t.left, a.left)) * Math.max(0, Math.min(t.bottom, a.bottom) - Math.max(t.top, a.top));
    return { i, h: Math.round(r.height), art: Math.round(a.height), spill: Math.round(spill), clipped, overlap: Math.round(overlap), flat: getComputedStyle(s).transform === 'none' };
  });
  return { size: `${innerWidth}x${innerHeight}`, screens, overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth };
}

// The pseudo-locale lengthening verify-recipes applies on its own phone pass: every word about 40 % longer.
function lengthen() {
  const map = { a: 'á', e: 'ë', i: 'ï', o: 'ö', u: 'ü', c: 'ç', n: 'ñ', A: 'Å', E: 'É', O: 'Ø', U: 'Û' };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement?.closest('script,style,svg') ? NodeFilter.FILTER_REJECT : n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) n.textContent = n.textContent.replace(/[A-Za-z]{2,}/g, (w) => w.replace(/[aeioucnAEOU]/g, (c) => map[c] ?? c) + 'ẍ'.repeat(Math.ceil(w.length * 0.4)));
  return nodes.length;
}

export async function inspect(page, state) {
  const settle = () => page.waitForTimeout(500);
  if (state.name === 'landscape' || state.name === 'landscape-long') {
    const sizes = state.name === 'landscape' ? [[667, 375], [740, 360]] : [[844, 390], [740, 360]];
    const texts = state.name === 'landscape-long' ? await page.evaluate(lengthen) : 0;
    const out = [];
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await settle();
      out.push(await page.evaluate(measure));
    }
    // For the screenshot: the second screen at the top of the short window (an instant jump, so nothing leans).
    await page.evaluate(() => { const it = document.querySelectorAll('.screens__item')[1]; window.lenis.scrollTo(Math.round(it.getBoundingClientRect().top + scrollY - 16), { immediate: true, force: true }); });
    await page.waitForTimeout(300);
    return { texts, sizes: out };
  }
  if (state.name === 'touch') {
    // One finger from y 700 to y 200 in 20 steps, then lifted: the browser scrolls natively and may fling a little.
    const cdp = await page.context().newCDPSession(page);
    const y0 = await page.evaluate(() => scrollY);
    const t0 = Date.now();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 700 }] });
    for (let i = 1; i <= 20; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 700 - i * 25 }] });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const ms = Date.now() - t0;
    await page.waitForTimeout(120);
    const after = await page.evaluate(() => ({ y: scrollY, sampled: window.__curlSampled }));
    await cdp.detach().catch(() => {});
    return { moved: Math.round(after.y - y0), ms, sampled: { ...after.sampled, peak: after.sampled.peak.map((v) => Math.round(v * 100) / 100), maxV: Math.round(after.sampled.maxV) } };
  }
  return null;
}

const MAX = 34;
const FULL_AT = 0.65;
const V_FULL = 1400;
const smooth = (p) => { const t = Math.min(1, Math.max(0, p / FULL_AT)); return t * t * (3 - 2 * t); };

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.state || {};
  const I = (k) => r[k]?.inspect || {};
  const flat = (k) => (P(k).peak || [1]).every((a) => a < 0.05);
  const list = (a) => (a || []).join(' / ');
  const near = (a, b, rel, abs) => Math.abs(a - b) <= Math.max(rel * Math.abs(b), abs);

  const t = P('top');
  out.push({ ok: S('top').motion === 'full' && flat('top') && t.running?.every((x) => x === false) && t.links && t.originY === 100 && t.perspective !== 'none' && /gradient/.test(t.shadeImage || ''), message: `top: at rest every screen is flat (${list(t.angles)}°), the curl off the ticker (${t.running?.join('/')}); screens are links with headings, turning about the bottom edge (origin at ${t.originY} % of the height) under perspective ${t.perspective}; the shade is a gradient (${t.shadeImage}…)` });

  // The lean is the product of position and speed: screen 1 is fully out (progress 1), so its angle is the energy's
  // full share; screen 2, mid-exit, takes the smoothstep's part of it; a quarter of the speed gives about a quarter of
  // the energy and of the lean.
  const s = P('scrolling');
  const a0 = s.angles?.[0] ?? 0, a1 = s.angles?.[1] ?? 0, p1 = s.progress?.[1] ?? 0, e = s.energy ?? 0;
  out.push({ ok: S('scrolling').running && p1 > 0.3 && p1 < 0.6 && near(e, 800 / V_FULL, 0, 0.08) && near(a0, MAX * e, 0.15, 1), message: `scrolling: at 800 px/s (measured ${s.velocity}) the energy is ${e}, against ${(800 / V_FULL).toFixed(3)} for 800 / 1,400; screen 1, fully out, leans ${a0}° = ${(MAX * e).toFixed(2)}° expected (34° × energy)` });
  const goal1 = MAX * smooth(p1) * e;
  out.push({ ok: a1 > 4 && a1 < 0.9 * a0 && a1 >= 0.55 * goal1 && a1 <= 1.05 * goal1, message: `scrolling: screen 2 at progress ${p1} leans ${a1}°, less than screen 1 (${a0}°) and within the damped follow of its goal 34° × smoothstep(0, .65, ${p1}) × ${e} = ${goal1.toFixed(2)}°` });
  out.push({ ok: s.scales?.[1] < 1 && s.scales?.[1] >= 1 - 0.05 - 1e-4 && s.shades?.[1] > 0.05 && s.angles.every((a, i) => i <= 1 || Math.abs(a) < 0.05), message: `scrolling: the lean brings a slight scale (${s.scales?.[1]}) and shade (${s.shades?.[1]}); screens still below the top stay flat (${list(s.angles)}°)` });

  const sl = P('slow');
  const sa0 = sl.angles?.[0] ?? 0, sa1 = sl.angles?.[1] ?? 0, se = sl.energy ?? 0, sp1 = sl.progress?.[1] ?? 0;
  out.push({ ok: Math.abs(sp1 - p1) < 0.1 && near(se, 200 / V_FULL, 0, 0.05) && near(se / Math.max(e, 1e-3), 0.25, 0, 0.1) && near(sa0, MAX * se, 0.15, 1), message: `slow: at 200 px/s (measured ${sl.velocity}) the energy is ${se} (expected ${(200 / V_FULL).toFixed(3)}; ${(se / Math.max(e, 1e-3)).toFixed(2)} of the 800 px/s energy) and screen 1 leans ${sa0}° = ${(MAX * se).toFixed(2)}° expected` });
  out.push({ ok: sa1 > 0.3 && sa1 < 0.4 * a1, message: `slow: screen 2 at progress ${sp1} leans ${sa1}°, under 0.4 × the ${a1}° it leans at 800 px/s near the same progress (${p1})` });

  const f = P('flick');
  const f1 = f.angles?.[1] ?? 0, fp1 = f.progress?.[1] ?? 0;
  out.push({ ok: fp1 > 0.3 && fp1 < 0.55 && f1 > 10 && (f.energy ?? 0) > 0.5 && (f.angles?.[0] ?? 0) > f1, message: `flick: 80 ms after a 1,600 px/s flick, screen 2 (progress ${fp1}) leans ${f1}° with energy ${f.energy}; screen 1, further out, leans more (${f.angles?.[0]}°)` });

  const ea = P('easing');
  const eSamples = ea.track1 || [];
  out.push({ ok: (ea.progress?.[1] ?? 0) > 0.3 && (ea.progress?.[1] ?? 1) < 0.7 && ea.velocity === 0 && (ea.angles?.[1] ?? 0) > 2 && eSamples.every((a, i) => i === 0 || a <= eSamples[i - 1] + 1e-3) && eSamples.at(-1) < eSamples[0], message: `easing: the scroll has stopped (${ea.velocity} px/s) with screen 2 halfway out (progress ${ea.progress?.[1]}); it still leans ${ea.angles?.[1]}° and relaxes every frame (${eSamples.map((a) => a.toFixed(1)).join(' → ')}°)` });

  const pk = P('parked');
  out.push({ ok: (pk.progress?.[1] ?? 0) > 0.35 && flat('parked') && pk.running?.[1] === false, message: `parked: screen 2 sits ${Math.round((pk.progress?.[1] ?? 0) * 100)} % out with the page still, and is flat (${list(pk.peak)}°): the lean answers motion, not position` });

  const rx = P('relax');
  out.push({ ok: flat('relax') && rx.running?.every((x) => x === false) && rx.frames?.[0] === rx.frames?.[1] && S('relax').wakes >= 1, message: `relax: once the scroll goes quiet every screen returns to flat (${list(rx.peak)}°) and the curl's callback is off the ticker (its frames ${rx.frames?.join(' → ')} over eight frames)` });

  const fl = P('fling').sampled || {};
  const flMax = Math.max(...(fl.peak || [0]));
  out.push({ ok: flMax > 6 && flMax <= MAX + 0.01 && fl.maxV > V_FULL && fl.maxE > 0.9 && fl.frames > 10, message: `fling: sampled every frame (${fl.frames}), three 1,600 px wheel flicks reach ${fl.maxV} px/s and energy ${fl.maxE}, and the leaning screens peak at ${flMax}° (${list(fl.peak)}), never past the ${MAX}° cap` });

  const ke = P('key-end'), keS = ke.sampled || {};
  out.push({ ok: (ke.scroll ?? 0) > 0.99 && (keS.peak || [1]).every((a) => a < 0.05) && keS.maxV === 0 && S('key-end').wakes >= 2, message: `End: the page jumps to the end (scroll ${ke.scroll}) through Chromium's own animation, the curl wakes for it (${S('key-end').wakes} wakes) and no screen leans on the way (sampled peaks ${list(keS.peak)}°, speed read ${keS.maxV} px/s)` });
  const kp = P('key-pagedown').sampled || {};
  out.push({ ok: Math.max(...(kp.peak || [0])) > 5 && kp.maxV > 400, message: `PageDown: paging is scrolling, and leans like it (sampled peaks ${list(kp.peak)}°, speed up to ${kp.maxV} px/s)` });

  const fo = P('focus'), fs = S('focus');
  out.push({ ok: fo.focusedIndex === 1 && fs.focused === 1 && /solid 3px/.test(fo.ring || '') && (fo.peak?.[1] ?? 1) < 0.01 && (fo.progress?.[1] ?? 0) > 0.2 && (fo.energy ?? 0) > 0.2, message: `keyboard: the focused second screen (ring ${fo.ring}) stays flat (${fo.peak?.[1]}°) through the same scroll that leans it ${a1}° unfocused (progress ${fo.progress?.[1]}, energy ${fo.energy})` });

  const wk = P('walk').walk || [];
  const [w0, w1, w2] = wk;
  out.push({ ok: w0?.id === 'case-tern' && w0?.hash === '#case-tern' && /notes__back/.test(w1?.cls || '') && w1?.href === '#screen-tern' && w2?.id === 'screen-tern' && w2.top >= 0 && w2.top < 900 && P('walk').focusedIndex === 0 && (P('walk').peak?.[0] ?? 1) < 0.05, message: `walk: Enter on Tern moves focus to its note (${w0?.id}, ${w0?.hash}); Tab reaches ${w1?.cls} → ${w1?.href}; Enter puts focus back on the screen (${w2?.id}, top at ${w2?.top} px), flat (${P('walk').peak?.[0]}°)` });

  const rm = P('rm'), rms = S('rm');
  out.push({ ok: rms.motion === 'reduced' && flat('rm') && rms.frames === 0 && rms.running === false && (rm.progress?.[1] ?? 0) > 0.2, message: `reduced motion: the same scroll leaves every screen flat (${list(rm.peak)}°), the curl never runs (${rms.frames} frames)` });
  const st = P('static'), sts = S('static');
  out.push({ ok: sts.motion === 'static' && flat('static') && sts.frames === 0 && sts.running === false && (st.progress?.[1] ?? 0) > 0.2, message: `static: with data-motion="static" on the root the same scroll leaves every screen flat (${list(st.peak)}°), the curl never runs (${sts.frames} frames)` });

  const mo = P('mobile');
  const mMax = Math.max(...(mo.peak || [0]));
  out.push({ ok: mMax > 3 && mMax <= MAX && mo.overflowX <= 0 && (P('top').overflowX ?? 1) <= 0, message: `mobile: a 750 px/s scroll leans the leaving screen ${mMax}° inside the column, no sideways overflow (${mo.overflowX}px)` });
  const tc = I('touch'), tcs = tc.sampled || {};
  out.push({ ok: tc.moved > 300 && tcs.native === true && Math.max(...(tcs.peak || [0])) > 3 && tcs.maxV < 6000 && tcs.maxE < 0.95, message: `touch: a one-finger drag scrolls natively (${tc.moved} px in ${tc.ms} ms, Lenis saw a native scroll: ${tcs.native}) and leans the leaving screens (sampled ${list(tcs.peak)}°); the speed read stays under the clamp (${tcs.maxV} px/s, energy ${tcs.maxE})` });

  for (const name of ['landscape', 'landscape-long']) {
    const ls = I(name);
    for (const m of ls.sizes || [{}]) {
      const bad = (m.screens || []).filter((x) => x.spill > 1 || x.clipped || x.overlap > 1 || x.art < 100);
      out.push({ ok: !!m.screens?.length && !bad.length && m.overflowX <= 0, message: `${name} ${m.size}${ls.texts ? ` (${ls.texts} texts 40 % longer)` : ''}: every screen holds its text and picture (heights ${(m.screens || []).map((x) => x.h).join('/')} px, pictures ${(m.screens || []).map((x) => x.art).join('/')} px${bad.length ? `; failing ${bad.map((x) => `#${x.i} spill ${x.spill} clipped ${x.clipped} overlap ${x.overlap}`).join(', ')}` : ''}), no sideways overflow (${m.overflowX}px)` });
    }
  }
  return out;
}
