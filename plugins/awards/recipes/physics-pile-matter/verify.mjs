// The words in source order, as index.html writes them: the accessibility tree must list them this way whatever the pile looks like.
const WORDS = ['wood type', 'brass rule', 'quoins', 'furniture', 'leading', 'ink knife', 'composing stick', 'chase', 'tympan', 'brayer', 'galley', 'em quads', 'reglets', 'key'];

// Put the box's top edge 120 px below the viewport top, so the drag coordinates below are fixed and hover never scrolls.
const atBox = [
  { type: 'waitFor', fn: "(() => { const b = document.querySelector('[data-pile]'); window.scrollTo(0, b.getBoundingClientRect().top + scrollY - 120); return true; })()" },
];
const rest = (extra = 'true') => ({ type: 'waitFor', fn: `(() => { const s = window.__awards.state(); return s.started && s.sleeping && ${extra}; })()`, timeout: 20000 });
// Mark the piece whose centre is highest (nothing rests on it), optionally only among the left half or skipping some.
const markTop = (skip = '', leftHalf = false) => ({
  type: 'waitFor',
  fn: `(() => { const s = window.__awards.state(); const lis = [...document.querySelectorAll('[data-pile-list] > li')];
    lis.forEach((li) => li.removeAttribute('data-probe-top'));
    const done = new Set([${skip}, ...(s.nudges || []).map((n) => n.index)]);
    let best = -1;
    s.bodies.forEach((b, i) => { if (done.has(i) || (${leftHalf} && b.x > s.box.w / 2)) return; if (best < 0 || b.y < s.bodies[best].y) best = i; });
    lis[best].setAttribute('data-probe-top', ''); return true; })()`,
});
const top = '[data-probe-top] button';
// Desktop: the box spans x 60–1380 and y 120–692 with the pile along its floor. Grab the top piece and lift it towards the top middle.
const drag = [
  markTop(),
  { type: 'hover', selector: top },
  { type: 'down' },
  { type: 'wait', ms: 120 },
  { type: 'move', x: 720, y: 200, steps: 14 },
  { type: 'wait', ms: 450 },
  { type: 'up' },
  { type: 'wait', ms: 100 },
];
const key = (k, leftHalf = false) => [markTop('', leftHalf), { type: 'focus', selector: top }, { type: 'press', key: k }, { type: 'wait', ms: 220 }];

export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 'settled', settle: 200, actions: [...atBox, rest()] },
  { name: 'drag', settle: 200, actions: [...atBox, rest(), ...drag] },
  { name: 'key', settle: 200, actions: [...atBox, rest(), ...key('Enter'), ...key('Space'), ...key('ArrowRight', true)] },
  {
    name: 'resize', settle: 200, actions: [...atBox, rest(),
      { type: 'waitFor', fn: "(() => { document.querySelector('[data-pile]').style.width = '62%'; return true; })()" },
      rest('s.resizes >= 1')],
  },
  // Focus a piece while the box is still below the fold: the toy starts from the laid-out arrangement, so the
  // focused piece (and the scroll focus brings) is inside the box rather than waiting above the clip.
  { name: 'tab-in', settle: 200, actions: [{ type: 'focus', selector: '[data-pile-list] li:nth-child(4) button' }, rest()] },
  { name: 'rm', reducedMotion: true, settle: 200, actions: [...atBox, { type: 'wait', ms: 800 }] },
  { name: 'mobile', viewport: 'mobile', settle: 200, actions: [...atBox, rest()] },
  { name: 'mobile-tap', viewport: 'mobile', settle: 200, actions: [...atBox, rest(), markTop(), { type: 'click', selector: top }, { type: 'wait', ms: 220 }] },
];

// Read what renders: every piece's box against the frame, its drawn centre against its body, and whether the steps stop.
export async function probe() {
  const s0 = window.__awards.state();
  await new Promise((r) => setTimeout(r, 600));
  const s = window.__awards.state();
  const box = document.querySelector('[data-pile]').getBoundingClientRect();
  const frame = document.querySelector('[data-pile-list]').getBoundingClientRect();
  const lis = [...document.querySelectorAll('[data-pile-list] > li')];
  // The visible shape of each piece, not its rotated layout box: a rounded rectangle (pills and circles are the
  // extreme cases) of the unrotated size, turned by the drawn angle, centred where the layout box is centred.
  const outside = lis.filter((li) => {
    const r = li.getBoundingClientRect();
    const w = li.offsetWidth, h = li.offsetHeight;
    const m = new DOMMatrix(getComputedStyle(li).transform);
    const a = Math.atan2(m.b, m.a), c = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a));
    const rad = getComputedStyle(li).borderTopLeftRadius;
    const q = Math.min(rad.endsWith('%') ? Infinity : parseFloat(rad) || 0, Math.min(w, h) / 2);
    const ex = (w / 2 - q) * c + (h / 2 - q) * sn + q, ey = (w / 2 - q) * sn + (h / 2 - q) * c + q;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    return cx - ex < box.left - 1 || cx + ex > box.right + 1 || cy - ey < box.top - 1 || cy + ey > box.bottom + 1;
  }).map((li) => li.textContent.trim());
  const offBody = s.bodies ? lis.map((li, i) => {
    const r = li.getBoundingClientRect();
    const b = s.bodies[i];
    return b ? Math.hypot(r.left + r.width / 2 - frame.left - b.x, r.top + r.height / 2 - frame.top - b.y) : 0;
  }) : [];
  const a = document.activeElement;
  return {
    stepsBefore: s0.steps,
    stepsAfter: s.steps,
    outside,
    maxOffBody: offBody.length ? Number(Math.max(...offBody).toFixed(2)) : null,
    buttons: document.querySelectorAll('[data-pile-list] button').length,
    transforms: lis.filter((li) => li.style.transform).length,
    boxWidth: Math.round(frame.width),
    activeInView: (() => { const r = a.getBoundingClientRect(); return a !== document.body && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; })(),
    focusRing: a !== document.body && a.matches(':focus-visible') && getComputedStyle(a).outlineStyle !== 'none',
    boxTouch: getComputedStyle(document.querySelector('[data-pile-list]')).touchAction,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
}

// The accessibility tree of the list, read in Node: the names in the order assistive tech meets them.
export async function inspect(page) {
  const yaml = await page.locator('[data-pile-list]').ariaSnapshot();
  const names = [...yaml.matchAll(/- (?:button "([^"]+)"|listitem: (.+))$/gm)].map((m) => (m[1] ?? m[2]).trim());
  return { names, list: /^- list/.test(yaml.trim()) };
}

export function assert(r) {
  const out = [];
  const s = (k) => r[k]?.state ?? {};
  const p = (k) => r[k]?.probe ?? {};
  const same = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);

  out.push({ ok: s('top').started === false && s('top').engine === false && s('top').steps === 0 && s('top').running === false, message: `above the box nothing runs: no engine, no steps, off the ticker (steps ${s('top').steps})` });

  const st = s('settled');
  out.push({ ok: st.started === true && st.startedFrom === 'drop' && st.engines === 1, message: `the drop starts once the box enters the viewport (from ${st.startedFrom}, ${st.engines} engine)` });
  out.push({ ok: p('settled').outside?.length === 0 && st.bodies?.length === WORDS.length, message: `at rest every piece is inside the box (outside: ${JSON.stringify(p('settled').outside)})` });
  out.push({ ok: p('settled').maxOffBody !== null && p('settled').maxOffBody <= 1.5, message: `each piece is drawn where its body is (max ${p('settled').maxOffBody} px off)` });
  out.push({ ok: st.sleeping === true && st.running === false && p('settled').stepsAfter === p('settled').stepsBefore && st.steps > 30, message: `at rest the steps stop and the callback leaves the ticker (${p('settled').stepsBefore} → ${p('settled').stepsAfter} steps over 600 ms, forced sleeps ${st.forcedSleeps})` });
  out.push({ ok: st.lid === true && st.dragEnabled === true, message: 'the lid closes once every piece is in, and a fine pointer gets the drag' });

  const d = s('drag');
  out.push({ ok: !!d.drag?.word && d.drag.maxDist > 150 && !!d.drag.to && d.wakes >= 2, message: `a pointer drag carries one piece (${d.drag?.word}, up to ${Math.round(d.drag?.maxDist ?? 0)} px from where it rested, ${d.wakes} wakes)` });

  const k = s('key');
  const [enter, space, arrow] = k.nudges ?? [];
  const lift = (n) => (n ? Math.round(n.y0 - n.minY) : 0);
  out.push({ ok: enter?.via === 'keyboard' && enter.dir === 'up' && lift(enter) > 40, message: `Enter tosses the focused piece up (${enter?.word}: ${lift(enter)} px)` });
  out.push({ ok: space?.via === 'keyboard' && space.dir === 'up' && space.index !== enter?.index && lift(space) > 40, message: `Space does the same (${space?.word}: ${lift(space)} px)` });
  out.push({ ok: arrow?.via === 'keyboard' && arrow.dir === 'right' && arrow.maxX - arrow.x0 > 20, message: `the right arrow pushes a piece sideways (${arrow?.word}: ${Math.round((arrow?.maxX ?? 0) - (arrow?.x0 ?? 0))} px)` });
  out.push({ ok: p('key').focusRing === true, message: 'the focused piece shows its focus ring' });

  const ti = s('tab-in');
  out.push({ ok: ti.startedFrom === 'flow' && ti.sleeping === true && p('tab-in').outside?.length === 0 && p('tab-in').activeInView === true, message: `focus arriving before the drop starts the pile from the laid-out arrangement, the focused piece on screen (from ${ti.startedFrom})` });

  const rz = s('resize');
  out.push({ ok: rz.resizes >= 1 && rz.sleeping === true && Math.abs(rz.box?.w - p('resize').boxWidth) <= 1 && p('resize').boxWidth < p('settled').boxWidth * 0.7, message: `a narrower box rebuilds the walls (${p('settled').boxWidth} → ${rz.box?.w} px) and the pile wakes and settles again` });
  out.push({ ok: p('resize').outside?.length === 0, message: `after the resize every piece is inside the narrower box (outside: ${JSON.stringify(p('resize').outside)})` });

  const rm = s('rm');
  out.push({ ok: rm.motion === 'reduced' && rm.mode === 'flow' && rm.engines === 0 && rm.steps === 0 && p('rm').buttons === 0 && p('rm').transforms === 0, message: `reduced motion: no engine, no steps, the list laid out by CSS (engines ${rm.engines}, steps ${rm.steps})` });
  out.push({ ok: p('rm').outside?.length === 0, message: 'reduced motion: the arrangement sits inside the box' });

  for (const name of ['settled', 'rm', 'mobile']) {
    const names = r[name]?.inspect?.names;
    out.push({ ok: r[name]?.inspect?.list === true && same(names, WORDS), message: `${name}: the accessibility tree lists the ${WORDS.length} words in source order (${JSON.stringify(names?.slice(0, 4))}…)` });
  }

  const mb = s('mobile');
  out.push({ ok: mb.sleeping === true && mb.dragEnabled === false && p('mobile').outside?.length === 0 && p('mobile').overflow === false, message: `mobile: the pile settles inside the box, no drag constraint on a coarse pointer, no horizontal overflow` });
  out.push({ ok: p('mobile').boxTouch !== 'none', message: `mobile: the box leaves touch scrolling to the page (touch-action ${p('mobile').boxTouch})` });
  const tap = s('mobile-tap').nudges?.[0];
  out.push({ ok: tap?.via === 'pointer' && tap.dir === 'up' && lift(tap) > 40, message: `mobile: a tap tosses the piece (${tap?.word}: ${lift(tap)} px)` });
  return out;
}
