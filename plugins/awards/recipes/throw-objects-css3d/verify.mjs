// Put the stage's top edge at the viewport top so the drag coordinates below are fixed (hover then does not scroll).
const atStage = [
  { type: 'waitFor', fn: "(() => { window.scrollTo(0, document.querySelector('[data-stage]').getBoundingClientRect().top + scrollY); return true; })()" },
  { type: 'wait', ms: 200 },
];
// Desktop: block 01 rests at ≈ (348, 211) with the tray starting ≈ 630 px. A short fast flick of ≈ 170 px leaves it
// in the shelf column at pointerup; only the release velocity can carry it on into the tray.
const flick = [
  { type: 'hover', selector: '[data-obj]' },
  { type: 'down' },
  { type: 'move', x: 440, y: 220, steps: 2 },
  { type: 'move', x: 520, y: 230, steps: 2 },
  { type: 'up' },
];
const pressThrow = (n) => [{ type: 'focus', selector: `[data-throw="${n}"]` }, { type: 'press', key: 'Enter' }];

export const states = [
  { name: 'top', settle: 300, actions: atStage },
  { name: 'drag', settle: 100, actions: [...atStage, ...flick, { type: 'wait', ms: 2600 }] },
  { name: 'key', settle: 100, actions: [...atStage, ...pressThrow(0), { type: 'wait', ms: 1400 }] },
  { name: 'rm', reducedMotion: true, settle: 100, actions: [...atStage, ...flick, { type: 'wait', ms: 400 }, ...pressThrow(1), { type: 'wait', ms: 50 }] },
  { name: 'mobile', viewport: 'mobile', settle: 100, actions: [...atStage, { type: 'click', selector: '[data-throw="2"]' }, { type: 'wait', ms: 1400 }] },
];

export function probe() {
  const a = document.activeElement;
  const cs = getComputedStyle(a);
  return {
    focusThrow: a?.dataset?.throw ?? null,
    focusRing: a !== document.body && a.matches(':focus-visible') && cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2,
    stageTouch: getComputedStyle(document.querySelector('[data-stage]')).touchAction,
    objTouch: getComputedStyle(document.querySelector('[data-obj]')).touchAction,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    status: document.querySelector('[data-status]').textContent,
  };
}

export function assert(r) {
  const out = [];
  const s = (k) => r[k].state ?? {};
  const p = (k) => r[k].probe ?? {};
  const at = (o, t) => !!o && !!t && Math.abs(o.x - t.x) <= 1 && Math.abs(o.y - t.y) <= 1;
  const dist = (a, b) => (a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0);

  out.push({ ok: s('top').inertia === true && s('top').caught?.length === 0 && s('top').objects?.every((o) => o.x === 0 && o.y === 0), message: 'at rest every block is on the shelf and inertia is on' });

  const d = s('drag');
  out.push({ ok: d.lastPath === 'drag' && d.throwFrames >= 5 && dist(d.landedAt, d.releasedAt) > 100, message: `after pointerup the block keeps moving (${d.throwFrames} throw frames, ${Math.round(dist(d.landedAt, d.releasedAt))} px travelled after release from ${JSON.stringify(d.releasedAt)})` });
  out.push({ ok: d.caught?.includes(0) && at(d.objects?.[0], d.slots?.[0]), message: `the throw lands block 01 in its tray slot (${JSON.stringify(d.objects?.[0])} vs slot ${JSON.stringify(d.slots?.[0])})` });

  const k = s('key');
  out.push({ ok: k.lastPath === 'button' && k.caught?.includes(0) && at(k.objects?.[0], d.objects?.[0]), message: `the keyboard throw button reaches the same end state as the drag (${JSON.stringify(k.objects?.[0])})` });
  out.push({ ok: p('key').focusThrow === '0' && p('key').focusRing === true, message: 'the throw button keeps a visible focus ring' });

  const m = s('rm');
  out.push({ ok: m.motion === 'reduced' && m.inertia === false && m.throwFrames === 0 && dist(m.landedAt, m.releasedAt) === 0 && m.objects?.[0]?.x > 100 && !m.caught?.includes(0), message: `reduced motion: the block settles where it is let go, no inertia (${m.throwFrames} throw frames, at ${JSON.stringify(m.objects?.[0])})` });
  out.push({ ok: m.caught?.includes(1) && at(m.objects?.[1], m.slots?.[1]), message: 'reduced motion: the throw button places block 02 in its slot at once' });

  const mb = s('mobile');
  out.push({ ok: mb.caught?.includes(2) && at(mb.objects?.[2], mb.slots?.[2]) && p('mobile').overflow === false, message: `mobile: a tap on the throw button lands block 03 in the tray, no horizontal overflow (${JSON.stringify(mb.objects?.[2])})` });
  out.push({ ok: p('mobile').objTouch === 'none' && p('mobile').stageTouch !== 'none', message: `touch: only the blocks take the gesture (block ${p('mobile').objTouch}, stage ${p('mobile').stageTouch})` });
  return out;
}
