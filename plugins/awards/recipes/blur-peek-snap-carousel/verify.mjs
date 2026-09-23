// Desktop 1440 × 900 at scrollY 0: the centred card spans x 423–1017 and its art y ≈ 345–716, so (720, 500) is on it.
// `fast` drags 160 px left in one quick stroke and releases while moving; `slow` covers the same 160 px in 20 px steps
// 45 ms apart (≈ .4 px/ms). Both advance one card with the same distance left. The probe samples the track's computed
// transform on every frame until it reaches the page's target and reports when it came to rest, plus each card's
// computed filter, opacity, transition and box. `hold` / `band` drag 300 px right past the first card (the band
// resists); `band` rests 150 ms and lets go, so the spring returns from rest.
const AT = { type: 'move', x: 720, y: 500, steps: 1 };
const slowStroke = [];
for (let x = 700; x >= 560; x -= 20) slowStroke.push({ type: 'move', x, y: 500, steps: 1 }, { type: 'wait', ms: 45 });
slowStroke.pop();
const ACTIVE = '[data-track] .is-active a';

export const states = [
  { name: 'top', settle: 900 },
  { name: 'fast', settle: 400, actions: [AT, { type: 'down' }, { type: 'move', x: 560, y: 500, steps: 4 }, { type: 'up' }] },
  { name: 'slow', settle: 400, actions: [AT, { type: 'down' }, ...slowStroke, { type: 'up' }] },
  { name: 'keyed', settle: 400, actions: [{ type: 'focus', selector: ACTIVE }, { type: 'press', key: 'ArrowRight' }, { type: 'wait', ms: 900 }] },
  { name: 'hold', settle: 400, actions: [AT, { type: 'down' }, { type: 'move', x: 1020, y: 500, steps: 6 }, { type: 'wait', ms: 100 }] },
  { name: 'band', settle: 400, actions: [AT, { type: 'down' }, { type: 'move', x: 1020, y: 500, steps: 6 }, { type: 'wait', ms: 150 }, { type: 'up' }] },
  { name: 'rm', settle: 400, reducedMotion: true, actions: [{ type: 'focus', selector: ACTIVE }, { type: 'press', key: 'ArrowRight' }] },
  { name: 'mobile', settle: 400, viewport: 'mobile', actions: [{ type: 'click', selector: '[data-next]' }, { type: 'wait', ms: 900 }] },
];

export async function probe() {
  const track = document.querySelector('[data-track]');
  const items = [...track.children];
  const tx = () => new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
  const look = () => items.map((li) => {
    const cs = getComputedStyle(li), r = li.getBoundingClientRect();
    return { active: li.classList.contains('is-active'), filter: cs.filter, opacity: Number(cs.opacity), transition: cs.transitionDuration, left: Math.round(r.left), right: Math.round(r.right) };
  });
  const firstLook = look(); // before any transition can run: shows whether the change was instant
  // Sample the rendered transform every frame until it reaches the page's target (4 s cap). `clock` sums the frame
  // intervals clamped to 100 ms, the same clamp the shared ticker puts on dt, so a SwiftShader stall is not counted
  // as snap time; `wall` is plain elapsed time.
  const target = window.__awards.state().target;
  const samples = [];
  await new Promise((done) => {
    let t0 = 0, prev = 0, clock = 0, still = 0;
    const f = (now) => { // the frame timestamp, the same one the shared ticker turns into dt
      if (!t0) t0 = prev = now;
      clock += Math.min(100, now - prev); prev = now;
      const x = Number(tx().toFixed(2));
      samples.push({ wall: Math.round(now - t0), clock: Math.round(clock), x });
      still = Math.abs(x - target) < 0.01 ? still + 1 : 0;
      still < 3 && now - t0 < 4000 ? requestAnimationFrame(f) : done();
    };
    requestAnimationFrame(f);
  });
  const final = samples.at(-1).x;
  const restIdx = samples.findIndex((s) => Math.abs(s.x - target) < 0.01);
  const rest = samples[restIdx] || samples.at(-1);
  return {
    first: samples[0].x, final, restClock: rest.clock, restWall: rest.wall, moving: restIdx !== 0, frames: samples.length,
    xs: samples.map((s) => s.x), firstLook, items: look(), after: window.__awards.state(),
    width: document.querySelector('[data-viewport]').clientWidth,
    focusIndex: [...track.querySelectorAll('a')].indexOf(document.activeElement),
    tabStops: [...track.querySelectorAll('a')].filter((a) => a.tabIndex === 0).length,
    // Page-relative bottom of the Next button (a click may have scrolled it into view) against the first viewport.
    nextBottom: Math.round(document.querySelector('[data-next]').getBoundingClientRect().bottom + scrollY), vh: innerHeight,
  };
}

export function assert(r) {
  const out = [];
  const P = (n) => r[n]?.probe || {};
  const S = (n) => r[n]?.state || {};
  const blur = (f) => { const m = /blur\(([\d.]+)px\)/.exec(f || ''); return m ? Number(m[1]) : 0; };

  // Rest: the centred card is sharp and opaque, both neighbours on each side blurred and dimmed, and the peek is a
  // fixed slice of the width (10 %): the gap was computed from it.
  const top = P('top'), ti = top.items || [];
  out.push({ ok: ti[0]?.active && blur(ti[0].filter) === 0 && ti[0].opacity === 1 && blur(ti[1]?.filter) > 0 && ti[1]?.opacity < 0.5 && S('top').count === '1 of 6', message: `centred card blur ${blur(ti[0]?.filter)} / opacity ${ti[0]?.opacity}; neighbour blur ${blur(ti[1]?.filter)} / opacity ${ti[1]?.opacity}; "${S('top').count}"` });
  const slice = (top.width ?? 0) - (ti[1]?.left ?? 0);
  out.push({ ok: Math.abs(slice - 0.1 * top.width) < 2 && Math.abs(top.final - S('top').target) < 0.5, message: `neighbour peeks ${slice}px = 10 % of ${top.width}px; track at its target (${top.final} vs ${S('top').target})` });
  out.push({ ok: top.tabStops === 1, message: `one Tab stop in the carousel (${top.tabStops})` });

  // The gesture sets the duration: both drags advance one card, the fast release lands sooner, on the crisp curve.
  const fa = P('fast'), sl = P('slow'), fl = S('fast').last || {}, sll = S('slow').last || {};
  out.push({ ok: S('fast').index === 1 && S('slow').index === 1 && Math.abs(fa.final - S('fast').target) < 0.5 && Math.abs(sl.final - S('slow').target) < 0.5, message: `both drags advance one card (fast ${S('fast').index}, slow ${S('slow').index})` });
  out.push({ ok: fl.v > 1.2 && fl.curve === 'flick' && fl.ms === 320 && sll.v > 0.2 && sll.v < 0.6 && sll.curve === 'placed' && sll.ms >= 450 && sll.ms <= 600, message: `release speed picks the snap: fast ${fl.v} px/ms → ${fl.ms} ms ${fl.curve}, slow ${sll.v} px/ms → ${sll.ms} ms ${sll.curve}` });
  out.push({ ok: fa.moving && sl.moving && sl.restClock - fa.restClock > 100, message: `rendered track rests sooner after the fast release: ${fa.restClock} vs ${sl.restClock} ms of frame time from probe start (wall ${fa.restWall} vs ${sl.restWall} ms; release→rest ${fa.after?.last?.settledMs} vs ${sl.after?.last?.settledMs} ms)` });

  // Arrow keys step one card and focus follows.
  const k = P('keyed');
  out.push({ ok: S('keyed').index === 1 && S('keyed').count === '2 of 6' && k.focusIndex === 1 && Math.abs(k.final - S('keyed').target) < 0.5 && blur(k.items?.[1]?.filter) === 0 && blur(k.items?.[0]?.filter) > 0, message: `ArrowRight steps one card: index ${S('keyed').index}, "${S('keyed').count}", focus on ${k.focusIndex}` });

  // Rubber band: a 300 px pull past the first card moves the track less than 300 px; on release the critically damped
  // spring returns it to the edge without crossing it.
  const h = P('hold'), overHold = (h.final ?? 0) - (S('hold').target ?? 0);
  out.push({ ok: S('hold').mode === 'drag' && overHold > 40 && overHold < 0.7 * 300, message: `pull of 300 px past the end shows ${overHold.toFixed(1)} px` });
  const b = P('band'), bt = S('band').target ?? 0, overs = (b.xs || []).map((x) => x - bt);
  out.push({ ok: overs[0] > 5 && Math.abs(overs.at(-1)) < 0.5 && Math.min(...overs) > -0.5 && overs.every((o, i) => i === 0 || o <= overs[i - 1] + 0.5), message: `spring returns ${overs[0]?.toFixed(1)} → ${overs.at(-1)?.toFixed(1)} px, lowest ${Math.min(...overs).toFixed(2)} (no overshoot), rest after ${b.restClock} ms of frame time` });

  // Reduced motion: the blur state stays, the change is instant (no transition, no snap tween).
  const rm = P('rm'), rf = rm.firstLook || [];
  out.push({ ok: S('rm').motion === 'reduced' && S('rm').index === 1 && Math.abs(rm.first - S('rm').target) < 0.5 && !rm.moving && rf[1]?.opacity === 1 && blur(rf[1]?.filter) === 0 && blur(rf[0]?.filter) > 0 && rf.every((i) => i.transition.split(',').every((d) => parseFloat(d) === 0)), message: `reduced motion: instant snap (first frame ${rm.first} vs ${S('rm').target}), blur kept without transition (${rf[0]?.filter} / ${rf[1]?.filter}, ${rf[0]?.transition})` });

  // Phone: no blur, neighbours dimmed to .1, a 14 % peek, the Next button steps.
  const mb = P('mobile'), mi = mb.items || [], mslice = (mb.width ?? 0) - (mi[2]?.left ?? 0);
  out.push({ ok: S('mobile').index === 1 && S('mobile').count === '2 of 6' && mi.every((i) => blur(i.filter) === 0) && Math.abs(mi[2]?.opacity - 0.1) < 0.01 && Math.abs(mi[0]?.opacity - 0.1) < 0.01 && Math.abs(mslice - 0.14 * mb.width) < 2, message: `phone: Next steps ("${S('mobile').count}"), no blur, neighbours at ${mi[0]?.opacity}/${mi[2]?.opacity}, peek ${mslice}px of ${mb.width}px` });
  // The whole card (art, title, meta) and the controls fit the first viewport on desktop and on the phone.
  out.push({ ok: top.nextBottom > 0 && top.nextBottom <= top.vh && mb.nextBottom > 0 && mb.nextBottom <= mb.vh, message: `Next button inside the first viewport: bottom ${top.nextBottom}/${top.vh}px desktop, ${mb.nextBottom}/${mb.vh}px phone` });
  return out;
}
