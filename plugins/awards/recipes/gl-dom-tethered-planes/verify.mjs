export const states = [
  { name: 'top', scroll: 0, settle: 1500 },
  { name: 'grid', scroll: 0.35, settle: 1200 },
  { name: 'wake', actions: [{ type: 'wheel', dy: 900 }, { type: 'wait', ms: 120 }], settle: 50 },
  { name: 'rm', scroll: 0.35, reducedMotion: true, settle: 800 },
  { name: 'mobile', scroll: 0.35, viewport: 'mobile', settle: 1500 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.gl === true && r.top.state?.planes === 6, message: `WebGL active with one plane per image (${r.top.state?.planes})` });
  out.push({ ok: r.top.state?.imagesInDom === 6 && r.top.state?.canvasAriaHidden === true && r.top.state?.imgVisibility === 'hidden', message: 'images stay in the DOM with alt text; canvas aria-hidden; sources visually hidden under the planes' });
  const fp = r.grid.state?.firstPlane;
  out.push({ ok: fp && fp.visible && Math.abs(fp.scaleX - fp.rectW) <= 1 && Math.abs(fp.meshCx - fp.rectCx) <= 1, message: `plane tethered to the image rect (scale ${fp?.scaleX} vs ${fp?.rectW}, cx ${fp?.meshCx} vs ${fp?.rectCx})` });
  out.push({ ok: Math.abs((r.grid.state?.canvasOffset ?? -1) - (r.grid.state?.scrollY ?? 0)) <= 1, message: `canvas re-offset to the scroll position (${r.grid.state?.canvasOffset} vs ${r.grid.state?.scrollY})` });
  const px = r.grid.state?.samplePixel || [0, 0, 0, 0];
  // The first image's centre is the bone disc #f9f1e7 (249, 241, 231): the plane must match it, which proves colour-space parity.
  const parity = Math.abs(px[0] - 249) <= 4 && Math.abs(px[1] - 241) <= 4 && Math.abs(px[2] - 231) <= 4 && px[3] > 0;
  out.push({ ok: parity, message: `plane renders the image texture in the DOM's colour space (centre pixel rgba ${px.join(',')}, expected ≈ 249,241,231)` });
  out.push({ ok: (r.wake.state?.maxSpeed ?? 0) > 0.5, message: `scroll velocity reaches the bulge uniform (max ${r.wake.state?.maxSpeed})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.gl === false && r.rm.state?.imgVisibility === 'visible', message: 'reduced motion: no WebGL, images shown as images' });
  out.push({ ok: r.mobile.state?.gl === true && r.mobile.state?.firstPlane?.visible === true, message: 'mobile: planes render' });
  return out;
}
