// The footer swarm: lazy GL, a loop that runs only on screen, a voxel field that really shadows, a pointer that pushes.
const sweep = [{ type: 'move', x: 260, y: 300, steps: 2 }, { type: 'wait', ms: 80 }, { type: 'move', x: 1180, y: 620, steps: 40 }, { type: 'wait', ms: 80 }, { type: 'move', x: 300, y: 560, steps: 40 }];
export const states = [
  { name: 'top', scroll: 0, settle: 900 },
  { name: 'footer', scroll: 1, settle: 3200 },
  { name: 'push', scroll: 1, settle: 1600, actions: [{ type: 'wheel', dy: 30000 }, { type: 'wait', ms: 2200 }, ...sweep, { type: 'wait', ms: 200 }] },
  { name: 'leave', scroll: 0, settle: 900, actions: [{ type: 'wheel', dy: 30000 }, { type: 'wait', ms: 2500 }] },
  { name: 'rm', scroll: 1, reducedMotion: true, settle: 2200 },
  { name: 'mobile', scroll: 1, viewport: 'mobile', settle: 2400 },
];

export async function probe() {
  const s = window.__awards.state();
  if (!s.gl || !window.__swarm) return { gl: false };
  return { gl: true, occupancy: window.__swarm.occupancy(), shading: window.__swarm.shading() };
}

export function assert(r) {
  const out = [];
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  out.push({ ok: st('top').loaded === false && st('top').gl === false, message: `top: three.js not fetched while the footer is far away (loaded ${st('top').loaded})` });
  out.push({ ok: st('footer').gl === true && st('footer').running === true && st('footer').beans === 1024 && st('footer').canvasAriaHidden && st('footer').footerText, message: `footer: GL running, 1024 seeds, canvas aria-hidden, footer copy in the DOM (beans ${st('footer').beans})` });
  out.push({ ok: (st('footer').simSteps ?? 0) > 4 && (st('footer').frames ?? 0) > 4, message: `footer: the simulation steps and renders (${st('footer').simSteps} steps, ${st('footer').frames} frames)` });
  const occ = pr('footer').occupancy || {};
  out.push({ ok: (occ.voxels ?? 0) > 40 && (occ.mean ?? 0) > 0.01, message: `voxel field marks the swarm (${occ.voxels} voxels lit, mean ${occ.mean?.toFixed?.(4)})` });
  const sh = pr('footer').shading || {};
  out.push({ ok: (sh.coverage ?? 0) > 0.004 && (sh.ratio ?? 1) < 0.95 && (sh.ratio ?? 0) > 0.2, message: `the field shadows the swarm without blacking it out: luma with field ${sh.lumaOn} vs without ${sh.lumaOff} (ratio ${sh.ratio}, coverage ${sh.coverage})` });
  out.push({ ok: (st('push').pushes ?? 0) > 0 && st('push').pointerSeen === true, message: `pointer pushes seeds (${st('push').pushes} contacts)` });
  const lx = st('push').light?.[0];
  out.push({ ok: typeof lx === 'number' && lx < 0, message: `light follows the pointer to the left half after the sweep ends at x 300 (light x ${lx})` });
  out.push({ ok: st('leave').gl === true && st('leave').running === false, message: `leave: loop paused once the footer is off screen (running ${st('leave').running})` });
  out.push({ ok: st('rm').motion === 'reduced' && st('rm').gl === true && st('rm').simSteps === 0 && (st('rm').frames ?? 9) <= 3, message: `reduced motion: one settled frame, no simulation (${st('rm').simSteps} steps, ${st('rm').frames} frames)` });
  out.push({ ok: (pr('rm').occupancy?.voxels ?? 0) > 40, message: `reduced motion: the settled frame is still shadowed (${pr('rm').occupancy?.voxels} voxels)` });
  out.push({ ok: st('mobile').gl === true && st('mobile').beans === 576, message: `mobile: 576 seeds (${st('mobile').beans})` });
  return out;
}
