// The verify idea: read the veil's computed clip-path at fractions of the door's trigger window and measure the hole
// (the polygon's second ring). Width must grow strictly start → mid → end. The circle variant is read the same way.
const at = (key, f) => `(() => { const g = window.__awards.state()['${key}']; if (!g) return true; window.lenis.scrollTo(Math.round(g[0] + (g[1] - g[0]) * ${f}), { immediate: true, force: true }); return true; })()`;
const go = (key, f) => [{ type: 'waitFor', fn: at(key, f) }, { type: 'wait', ms: 600 }];

// Reduced and static have no trigger window: scroll so the stage is stuck at the top.
const toDoor = [{ type: 'waitFor', fn: "(() => { const s = document.querySelector('[data-door]'); window.lenis.scrollTo(s.offsetTop + 2, { immediate: true, force: true }); return true; })()" }, { type: 'wait', ms: 400 }];

export const states = [
  { name: 'start', settle: 300, actions: go('door', 0) },
  { name: 'mid', settle: 300, actions: go('door', 0.5) },
  { name: 'end', settle: 300, actions: go('door', 1) },
  { name: 'cstart', settle: 300, actions: go('circle', 0) },
  { name: 'cend', settle: 300, actions: go('circle', 1) },
  { name: 'rm', reducedMotion: true, settle: 500, actions: toDoor },
  { name: 'static', settle: 300, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, ...toDoor] },
  { name: 'mobile', viewport: 'mobile', settle: 500, actions: go('door', 0.5) },
  { name: 'mobile-circle', viewport: 'mobile', settle: 500, actions: go('circle', 1) },
];

export async function probe() {
  const veil = document.querySelector('[data-veil]');
  const stage = veil.parentElement;
  const circle = document.querySelector('[data-circle]');
  const clip = getComputedStyle(veil).clipPath;
  const nums = (clip.match(/-?[\d.]+%/g) || []).map(parseFloat);
  // 5 outer points (10 numbers), then the hole: L T, R T, R B, L B, L T.
  const hole = nums.length === 20 ? { w: nums[12] - nums[10], h: nums[15] - nums[11] } : null;
  const sr = stage.getBoundingClientRect();
  const hit = document.elementFromPoint(Math.round(sr.left + sr.width / 2), Math.round(innerHeight / 2));
  const cclip = getComputedStyle(circle).clipPath;
  const radius = /circle\(([\d.]+)%/.exec(cclip);
  const [l, rr] = [document.querySelector('[data-label-l]'), document.querySelector('[data-label-r]')].map((e) => e.getBoundingClientRect());
  return {
    clip,
    evenodd: clip.includes('evenodd'),
    hole,
    stageTop: Math.round(sr.top),
    centreIsRoom: !!hit && !!hit.closest('.door__room'),
    labelsGap: Math.round(rr.left - l.right),
    veilVisible: getComputedStyle(veil).visibility,
    circleClip: cclip,
    radius: radius ? parseFloat(radius[1]) : null,
    vw: document.documentElement.clientWidth,
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.state || {};
  const hw = (k) => P(k).hole?.w ?? NaN;

  // The verify idea: an even-odd polygon whose hole widens strictly from start to end, with mid between.
  out.push({ ok: ['start', 'mid', 'end'].every((k) => P(k).evenodd && P(k).hole), message: `door: even-odd polygon with a hole in all three states (${P('mid').clip})` });
  out.push({ ok: hw('start') < hw('mid') && hw('mid') < hw('end') && hw('start') <= 22 && hw('end') >= 99, message: `door: hole width ${hw('start')}% < ${hw('mid')}% < ${hw('end')}% (start ≤ 22, end ≥ 99)` });
  out.push({ ok: Math.abs(P('start').stageTop) <= 2 && Math.abs(P('end').stageTop) <= 2, message: `door: stage stays stuck (top ${P('start').stageTop} / ${P('end').stageTop})` });
  out.push({ ok: P('end').labelsGap > P('start').labelsGap + 0.5 * P('end').vw, message: `door: labels part (${P('start').labelsGap} → ${P('end').labelsGap} px)` });
  out.push({ ok: P('start').centreIsRoom && P('mid').centreIsRoom, message: `door: the room shows through the hole at the centre` });

  // Circle variant: radius from ~0 to 150 %, centred below the box.
  out.push({ ok: P('cstart').radius !== null && P('cstart').radius <= 3 && P('cend').radius >= 147 && /at 50% 120%/.test(P('cend').circleClip), message: `circle: radius ${P('cstart').radius}% → ${P('cend').radius}% (${P('cend').circleClip})` });

  // Reduced and static: no clip at all, the door stands open over a visible room; the statement is unclipped.
  for (const k of ['rm', 'static']) {
    const p = P(k);
    out.push({ ok: S(k).motion === (k === 'rm' ? 'reduced' : 'static') && p.clip === 'none' && p.circleClip === 'none' && p.veilVisible === 'hidden' && p.centreIsRoom, message: `${k}: tier ${S(k).motion}, veil clip ${p.clip} (${p.veilVisible}), circle ${p.circleClip}, room at centre ${p.centreIsRoom}` });
  }

  // Phone: the door scrubs the same way, the circle uses the phone window and ends fully open, nothing overflows.
  const m = P('mobile');
  out.push({ ok: m.hole && m.hole.w > hw('start') && m.hole.w < hw('end') && P('mobile-circle').radius >= 147 && m.overflowX <= 0 && (P('start').overflowX ?? 1) <= 0, message: `mobile: hole ${m.hole?.w}%, circle ${P('mobile-circle').radius}%, overflow ${m.overflowX}px` });
  return out;
}
