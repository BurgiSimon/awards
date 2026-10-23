// Noon: the panel drawing comes apart along its depth while the chapter crosses the viewport.
// Each layer slides back along the drawing's own z axis; scrubbed, so the ease is 'none'.
import gsap from 'gsap';

const EZ = [-0.433, 0.25]; // the isometric depth axis, in SVG units per millimetre (see the drawing's generator)

export function createPanelExplode({ tier }) {
  const svg = document.querySelector('.panel-drawing');
  if (!svg) return () => {};
  const layers = [...svg.querySelectorAll('[data-layer-z]')].map((el) => ({ el, z: Number(el.dataset.layerZ) }));
  const callouts = svg.querySelector('.callouts');
  const set = (p) => {
    for (const { el, z } of layers) {
      const k = (1 - p) * z;
      el.setAttribute('transform', `translate(${(-EZ[0] * k).toFixed(1)} ${(-EZ[1] * k).toFixed(1)})`);
    }
    callouts?.setAttribute('opacity', String(Math.max(0, (p - 0.6) / 0.4).toFixed(2)));
  };
  if (tier !== 'full') { set(1); return () => {}; }

  const state = { p: 0 };
  set(0);
  const tween = gsap.to(state, {
    p: 1,
    ease: 'none',
    onUpdate: () => set(state.p),
    scrollTrigger: { trigger: '.chapter--noon', start: 'top 70%', end: 'center 45%', scrub: 0.5, invalidateOnRefresh: true },
  });
  return () => { tween.scrollTrigger?.kill(); tween.kill(); set(1); };
}
