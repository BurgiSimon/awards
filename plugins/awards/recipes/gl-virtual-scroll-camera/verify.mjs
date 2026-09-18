export const states = [
  { name: 'top', scroll: 0, settle: 1200 },
  { name: 'mid', scroll: 0.5, settle: 900 },
  { name: 'end', scroll: 1, settle: 900 },
  { name: 'wheel', actions: [{ type: 'move', x: 720, y: 450, steps: 1 }, { type: 'wheel', dy: 600 }, { type: 'wait', ms: 300 }], settle: 50 },
  // 900 ms of idle plus a 1.4 s tween is 2.3 s of FRAMES, not of wall clock: SwiftShader stalls rAF
  // and a fixed sleep leaves the snap part-way (this failed at float 0.97 on a loaded machine).
  { name: 'snap', actions: [
    { type: 'move', x: 720, y: 450, steps: 1 }, { type: 'wheel', dy: 300 },
    { type: 'waitFor', fn: '(() => { const s = window.__awards.state(); return s.float > 0.05 && s.snapping === false && Math.abs(s.float * 3 - Math.round(s.float * 3)) < 0.02; })()', timeout: 25000 },
  ], settle: 50 },
  { name: 'keys', actions: [
    { type: 'press', key: 'PageDown' }, { type: 'wait', ms: 200 }, { type: 'press', key: 'ArrowDown' },
    { type: 'waitFor', fn: '(() => { const s = window.__awards.state(); return s.keySteps === 2 && s.chapter === 2 && s.snapping === false; })()', timeout: 25000 },
  ], settle: 50 },
  { name: 'rm', scroll: 0.5, reducedMotion: true, settle: 600 },
  { name: 'mobile', scroll: 0.5, viewport: 'mobile', settle: 900 },
];
const far = (a, b) => (a && b ? Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) : 0);
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.gl === true && (r.top.state?.float ?? 1) < 0.01 && r.top.state?.documentScroll === 0, message: 'tour at chapter 1; the document itself does not scroll' });
  out.push({ ok: Math.abs((r.mid.state?.float ?? 0) - 0.5) < 0.02 && far(r.top.state?.camera, r.mid.state?.camera) > 3, message: `scrollTo(0.5) moves the camera along the spline (${far(r.top.state?.camera, r.mid.state?.camera).toFixed(1)} units)` });
  out.push({ ok: (r.end.state?.chapter ?? 0) === 3, message: 'scrollTo(1) reaches the last chapter' });
  out.push({ ok: (r.wheel.state?.wheelEvents ?? 0) > 0 && (r.wheel.state?.target ?? 0) > 0.02, message: `wheel adds velocity to the float (target ${r.wheel.state?.target})` });
  const snapped = Math.abs((r.snap.state?.float ?? 0.5) * 3 - Math.round((r.snap.state?.float ?? 0.5) * 3)) < 0.02;
  out.push({ ok: snapped && r.snap.state?.snapping === false, message: `idle float snaps to a chapter (${r.snap.state?.float})` });
  out.push({ ok: r.keys.state?.keySteps === 2 && r.keys.state?.chapter === 2, message: `PageDown and ArrowDown advance by chapter (${r.keys.state?.chapter})` });
  // A key step used to set `snapping` with no target to tween towards, which left the flag stuck true
  // and killed idle snapping for the rest of the visit — invisible to a mouse, permanent for a keyboard.
  out.push({ ok: r.keys.state?.snapping === false, message: 'the keyboard snap finishes and releases the flag' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && Math.abs((r.rm.state?.float ?? 0) * 3 - Math.round((r.rm.state?.float ?? 0) * 3)) < 0.01, message: 'reduced motion: stepped to a chapter, no easing' });
  out.push({ ok: (r.mid.state?.visibleTags ?? 0) >= 1, message: `DOM labels anchored on screen (${r.mid.state?.visibleTags})` });
  out.push({ ok: r.mobile.state?.gl === true, message: 'mobile renders' });
  return out;
}
