// The signature: the microscope's stage follows the scroll down the paint cross-section. Depth is a piecewise-linear
// map from scroll position to micrometres, anchored on the plaques (a plaque 60 % down = its layer's middle) and on the
// held infrared stage; magnification eases between layers so each one about fills the height. The field renders only
// on a dirty frame and only while it can be seen. Every word stays in the DOM; the readout is decoration.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LAYERS } from '../data/pigments.js';
import { detectQualityTier } from '../lib/quality-tiers.js';

const mid = (l) => (l.top + l.bottom) / 2;
const UM_PER_CSS_PX = 264.6; // one CSS pixel is 1/96 inch
const nf = new Intl.NumberFormat('en-GB');

export function createMicroscope({ awards, announce, tier }) {
  const root = document.documentElement;
  const canvas = document.querySelector('.microscope');
  const taken = document.getElementById('taken');
  const irSection = document.getElementById('egyptian-blue');
  const visit = document.getElementById('visit');
  const toggle = irSection.querySelector('.ir__toggle');
  const stage = document.querySelector('.stage');
  const out = {
    depth: stage.querySelector('[data-stage-depth]'),
    layer: stage.querySelector('[data-stage-layer]'),
    mag: stage.querySelector('[data-stage-mag]'),
  };
  const now = document.querySelector('.museum__now');
  const links = new Map([...document.querySelectorAll('.museum__nav a[data-layer]')].map((a) => [Number(a.dataset.layer), a]));
  const plaques = [...document.querySelectorAll('article.plaque[data-layer-at]')];
  const still = () => tier() !== 'full';

  let vh = innerHeight;
  let anchors = [];   // [{ y, d }] strictly increasing in y
  let seen = [0, 0];  // the scroll range in which the field shows
  let readoutOn = [0, 0];
  const view = { ir: 0 };
  let irOn = false;
  let irZone = false;
  let field = null;
  let last = {};
  let shown = {};

  // Magnification: a layer's thickness about fills the viewport height; between layer middles it eases linearly.
  const umPerPx = (depth) => {
    const pts = LAYERS.map((l) => [mid(l), (l.bottom - l.top) / vh]);
    if (depth <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      if (depth <= pts[i][0]) {
        const t = (depth - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
        return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t;
      }
    }
    return pts[pts.length - 1][1];
  };
  const layerAt = (depth) => LAYERS.findIndex((l) => depth >= l.top && depth < l.bottom);
  const docTop = (el) => el.getBoundingClientRect().top + scrollY;

  function measure() {
    vh = innerHeight;
    const takenTop = docTop(taken);
    const u1 = umPerPx(0);
    const d0 = 0.25 * vh * u1; // the paint's surface a quarter down the screen, resin above it
    const list = [
      { y: takenTop - vh, d: d0 - vh * u1 },
      { y: takenTop, d: d0 },
      // A layer's middle is under the stage when its plaque's top is 60 % down the screen, so the pigment arrives
      // with its plaque (the crossing falls half way between two plaques, before the second one enters).
      ...plaques.map((p) => {
        const r = p.getBoundingClientRect();
        return { y: r.top + scrollY - vh * 0.6, d: mid(LAYERS[Number(p.dataset.layerAt) - 1]), layer: Number(p.dataset.layerAt) };
      }),
    ];
    const irTop = docTop(irSection);
    const irEnd = irTop + irSection.offsetHeight - vh;
    const d7 = mid(LAYERS[6]);
    list.push({ y: irTop, d: d7, layer: 7 }, { y: irEnd, d: d7, layer: 7 }, { y: irEnd + vh, d: d7 + vh * umPerPx(d7) });
    anchors = [];
    for (const a of list) if (!anchors.length || a.y > anchors[anchors.length - 1].y) anchors.push(a);
    const visitTop = docTop(visit);
    seen = [takenTop - vh, visitTop];
    readoutOn = [takenTop - vh * 0.5, visitTop - vh * 0.5];
    last = {};
  }

  function depthFor(y) {
    if (still()) {
      // Reduced and static tiers: cut to the layer of the nearest plaque, no travel.
      let best = null;
      for (const a of anchors) if (a.layer && (!best || Math.abs(a.y - y) < Math.abs(best.y - y))) best = a;
      return best ? best.d : 0;
    }
    if (y <= anchors[0].y) return anchors[0].d;
    for (let i = 1; i < anchors.length; i++) {
      const a = anchors[i - 1];
      const b = anchors[i];
      if (y <= b.y) return a.d + (b.d - a.d) * ((y - a.y) / (b.y - a.y));
    }
    return anchors[anchors.length - 1].d;
  }

  function write(depth, u, on) {
    const k = layerAt(depth);
    const text = {
      depth: `${nf.format(Math.max(0, Math.round(depth)))} µm`,
      layer: k < 0 ? (depth < 0 ? 'mounting resin, above the paint' : 'mounting resin, below the paint') : `${LAYERS[k].name}, ${LAYERS[k].ended}`,
      mag: nf.format(Math.round(UM_PER_CSS_PX / u / 10) * 10),
    };
    for (const key of Object.keys(text)) if (shown[key] !== text[key]) out[key].textContent = shown[key] = text[key];
    const current = on ? k + 1 : 0; // over the block and the drawer room no colour is current
    if (shown.current !== current) {
      shown.current = current;
      links.forEach((a, n) => (n === current ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
      // On phones the Colours toggle carries the current pigment's chip: where the visitor is, in the line itself.
      if (now) {
        now.hidden = current === 0;
        if (current) now.style.setProperty('--chip', LAYERS[current - 1].hex);
      }
    }
    return k;
  }

  let state = { depth: 0, layer: -1, mag: 0 };
  function frame() {
    const y = scrollY;
    const on = y >= readoutOn[0] && y < readoutOn[1];
    root.classList.toggle('on-layers', on);
    const depth = depthFor(y);
    // In the still tiers depth is a layer's middle, so this is that layer's own magnification. The infrared camera
    // sees a wider field than the eyepiece, so the glowing crystals read as specks in the dark.
    const u = umPerPx(depth) * (1 + 1.6 * view.ir);
    const k = write(depth, u, on);
    state = { depth: Math.round(depth), layer: k, mag: Math.round(UM_PER_CSS_PX / u) };
    if (!field || y < seen[0] || y > seen[1]) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (last.depth === depth && last.u === u && last.ir === view.ir && last.w === w && last.h === h) return;
    if (field.render({ depth, umPerPx: u, ir: view.ir })) last = { depth, u, ir: view.ir, w, h };
    else lose();
  }

  // The interruption: visible light off, infrared on. Scroll crosses the threshold, the button toggles the same state.
  function setIR(on, { spoken = false } = {}) {
    if (on === irOn) return;
    irOn = on;
    toggle.setAttribute('aria-pressed', String(on));
    irSection.dataset.theme = on ? 'ir' : 'lab';
    stage.dataset.theme = on ? 'ir' : 'lab';
    gsap.killTweensOf(view);
    if (still()) view.ir = on ? 1 : 0;
    else gsap.to(view, { ir: on ? 1 : 0, duration: 1.2, ease: 'expo.inOut' });
    if (spoken) announce(on ? 'Infrared view on: only the Egyptian blue glows.' : 'Visible light back on.');
  }
  const onToggle = () => setIR(!irOn, { spoken: true });
  toggle.addEventListener('click', onToggle);
  const irTrigger = ScrollTrigger.create({
    trigger: irSection,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      const p = self.progress;
      if (!irZone && p > 0.25 && p < 0.85) { irZone = true; setIR(true); }
      else if (irZone && (p < 0.15 || p > 0.85)) { irZone = false; setIR(false); }
    },
    onLeave() { if (irZone) { irZone = false; setIR(false); } },
    onLeaveBack() { if (irZone) { irZone = false; setIR(false); } },
  });

  function lose() {
    field = null;
    root.classList.remove('has-gl');
  }

  // The GL starts behind the page after first paint, lazily; the stills stay until its first frame has drawn.
  async function start() {
    if (!('WebGL2RenderingContext' in window)) return;
    // One context, the field's own: the tier is read from it, and a low tier gives it back rather than opening a second.
    const ctx = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!ctx) return;
    const profile = await detectQualityTier({ sampleMs: 400, gl: ctx });
    // `?tier=high|mid|low` overrides the probe, so a reviewer on a software renderer can see the tier it would refuse.
    const forced = new URLSearchParams(location.search).get('tier');
    if (['high', 'mid', 'low'].includes(forced)) {
      Object.assign(profile, { tier: forced, dpr: Math.min(devicePixelRatio || 1, forced === 'high' ? 2 : forced === 'mid' ? 1.5 : 1) });
      if (forced !== 'low') profile.maxPixels = forced === 'high' ? 2560 * 1440 : 1920 * 1080;
    }
    awards.addState(() => ({ quality: profile.tier }));
    if (!profile.probe.webgl2 || profile.tier === 'low') { // the contract's low tier is the stills
      ctx.getExtension('WEBGL_lose_context')?.loseContext();
      return;
    }
    const budget = () => {
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      const cap = Math.min(profile.dpr, 1.5, Math.sqrt(profile.maxPixels / (w * h)));
      return cap;
    };
    try {
      const { createField } = await import('../webgl/field.js');
      field = createField(canvas, { pixelRatio: budget() });
    } catch (err) {
      console.warn('[microscope] no field:', err);
      field = null;
    }
    if (!field) return;
    measure();
    const d = depthFor(scrollY);
    if (!field.render({ depth: d, umPerPx: umPerPx(d), ir: view.ir })) return lose();
    root.classList.add('has-gl');
    addEventListener('resize', () => field?.setPixelRatio(budget()));
  }

  ScrollTrigger.addEventListener('refresh', measure);
  measure();
  gsap.ticker.add(frame);
  awards.addState(() => ({ gl: !!field, ...state, ir: irOn }));

  // The field is behind the hero's opaque ground, so nothing GL happens until the visitor heads for the first layer
  // (or arrives already past the hero): a reader who stays on the block pays for no context at all.
  function arm() {
    const taken = document.getElementById('taken');
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      start();
    }, { rootMargin: '0px' }); // the stills hold the first layer until the field's first frame cross-fades in
    io.observe(taken);
  }

  return {
    start: arm,
    destroy() {
      gsap.ticker.remove(frame);
      ScrollTrigger.removeEventListener('refresh', measure);
      irTrigger.kill();
      toggle.removeEventListener('click', onToggle);
      field?.dispose();
      field = null;
    },
  };
}
