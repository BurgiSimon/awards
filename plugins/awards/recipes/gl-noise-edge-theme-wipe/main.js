import * as THREE from 'three';
import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

const html = document.documentElement;
const KEY = 'wipe:theme';  // the head script reads the same key before first paint
const COVER = 0.9;         // s, from the press point past the farthest corner
const REVEAL = 0.3;        // s, the full cover fades once the tokens have flipped under it
const EDGE = 56;           // CSS px, the width of the ragged band
const FORCE_CSS = new URLSearchParams(location.search).get('gl') === '0';

// sessionStorage throws in some private windows: a switch that cannot remember still has to switch.
const store = {
  get() { try { return sessionStorage.getItem(KEY); } catch { return null; } },
  set(v) { try { sessionStorage.setItem(KEY, v); } catch { /* not persisted */ } },
};
const toggle = document.querySelector('[data-mode]');
const canvas = document.querySelector('[data-wipe]');
const cssCover = document.querySelector('[data-cover-css]');
const meta = document.querySelector('meta[name="theme-color"]');

// Each theme's tokens, read once. Setting the attribute, reading and restoring it happen in one task, so nothing paints between.
const tokens = {};
{
  const prev = html.getAttribute('data-theme');
  for (const name of ['default', 'dark']) {
    html.setAttribute('data-theme', name);
    const cs = getComputedStyle(html);
    tokens[name] = Object.fromEntries(['--ground', '--ink', '--accent'].map((t) => [t.slice(2), cs.getPropertyValue(t).trim()]));
  }
  html.setAttribute('data-theme', prev || 'default');
}

const restored = store.get();
const S = { theme: html.dataset.theme === 'dark' ? 'dark' : 'default', phase: 'idle', target: null, wipes: 0, flips: 0, flipAt: null, renders: 0, shown: false, surface: 'none', origin: null, glFailed: false };
S.requested = S.theme;

// ── The GL cover: one orthographic quad, three uniforms that matter (progress, centre, colour) ─────────────
const vertexShader = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
// Drawing-buffer pixels throughout. The radius runs from -edge (nothing covered at 0) to the farthest corner + edge
// (everything covered at 1); the noise moves the rim by at most half the edge, so both ends are exact.
const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform vec2 uCenter;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uEdge;
  uniform float uTime;
  uniform float uSeed;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 px = gl_FragCoord.xy;
    float reach = length(max(uCenter, uResolution - uCenter));
    float radius = mix(-uEdge, reach + uEdge, uProgress);
    vec2 drift = vec2(uTime * 0.9, -uTime * 0.6) + uSeed;
    float n = vnoise(px / (uEdge * 1.6) + drift) * 0.7 + vnoise(px / (uEdge * 0.45) - drift) * 0.3;
    float rim = length(px - uCenter) + (n - 0.5) * uEdge;
    float inside = 1.0 - smoothstep(radius - 1.0, radius + 1.0, rim);
    gl_FragColor = vec4(uColor, inside);
    #include <colorspace_fragment>
    #include <premultiplied_alpha_fragment>
  }
`;

let gl = null;
function ensureGL() {
  if (gl || FORCE_CSS || S.glFailed) return gl;
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    const uniforms = {
      uProgress: { value: 0 }, uCenter: { value: new THREE.Vector2() }, uResolution: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color() }, uEdge: { value: EDGE }, uTime: { value: 0 }, uSeed: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, premultipliedAlpha: true, blending: THREE.NoBlending, depthTest: false, depthWrite: false });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const g = { renderer, uniforms, dpr: 1 };
    g.resize = () => {
      g.dpr = Math.min(window.devicePixelRatio || 1, 2); // a flat colour needs no more
      renderer.setPixelRatio(g.dpr);
      renderer.setSize(innerWidth, innerHeight, false);
      uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
      uniforms.uEdge.value = EDGE * g.dpr;
    };
    g.render = () => { renderer.render(scene, camera); S.renders++; };
    g.dispose = () => { geometry.dispose(); material.dispose(); renderer.dispose(); };
    g.resize();
    renderer.compile(scene, camera); // compile ahead, so the first press does not stall
    addEventListener('resize', () => { g.resize(); if (S.phase !== 'idle') paint(); });
    addEventListener('pagehide', () => g.dispose(), { once: true });
    gl = g;
  } catch (e) {
    S.glFailed = true;
    console.warn('theme wipe: WebGL unavailable, using the CSS cover', e);
  }
  return gl;
}

// ── One driver, two surfaces: proxy.p is the cover's progress whether the GL quad or the CSS circle draws it ──
const proxy = { p: 0 };
let tween = null, fade = null;
const surface = () => (S.surface === 'gl' ? canvas : cssCover);
const reachCss = (o) => Math.hypot(Math.max(o.x, innerWidth - o.x), Math.max(o.y, innerHeight - o.y));

function paint() {
  const o = S.origin;
  if (S.surface === 'gl') {
    const u = gl.uniforms;
    u.uProgress.value = proxy.p;
    u.uCenter.value.set(o.x * gl.dpr, (innerHeight - o.y) * gl.dpr);
    u.uTime.value = tween ? tween.time() : 0;
    gl.render();
  } else {
    cssCover.style.clipPath = `circle(${(proxy.p * (reachCss(o) + 2)).toFixed(1)}px at ${o.x}px ${o.y}px)`;
  }
}

function apply(theme) {
  html.setAttribute('data-theme', theme);
  meta.setAttribute('content', tokens[theme].ground);
  store.set(theme);
  S.theme = theme;
  S.flips++;
}

function idle() {
  surface().hidden = true;
  gsap.set(surface(), { opacity: 1 });
  tween = null; fade = null; proxy.p = 0;
  S.phase = 'idle'; S.target = null;
}

function startWipe(target, origin) {
  S.surface = ensureGL() ? 'gl' : 'css';
  S.origin = origin; S.target = target; S.phase = 'cover'; S.wipes++; S.shown = true;
  if (S.surface === 'gl') {
    gl.uniforms.uColor.value.setStyle(tokens[target].ground); // sRGB token → linear; colorspace_fragment converts back
    gl.uniforms.uSeed.value = Math.random() * 100;
  } else cssCover.style.background = tokens[target].ground;
  proxy.p = 0;
  const el = surface();
  gsap.set(el, { opacity: 1 });
  el.hidden = false;
  paint();
  tween = gsap.to(proxy, {
    p: 1, duration: COVER, ease: 'power2.inOut', onUpdate: paint,
    // Full cover: flip the tokens underneath it, then let the cover go.
    onComplete() {
      S.flipAt = proxy.p;
      apply(target);
      S.phase = 'reveal';
      fade = gsap.to(el, { opacity: 0, duration: REVEAL, ease: 'power1.out', onComplete: idle });
    },
    onReverseComplete: idle, // turned around mid-cover: nothing was swapped, nothing to undo
  });
}

function setPressed() { toggle.setAttribute('aria-pressed', String(S.requested === 'dark')); }

toggle.addEventListener('click', (e) => {
  S.requested = S.requested === 'dark' ? 'default' : 'dark';
  setPressed();
  // Reduced and static tiers: an instant swap, no canvas frame.
  if (motionTier() !== 'full') {
    if (tween || fade) { tween?.kill(); fade?.kill(); idle(); }
    if (S.requested !== S.theme) { S.flipAt = null; apply(S.requested); }
    return;
  }
  // A press during the cover turns the same edge around, or forward again.
  if (S.phase === 'cover') { S.requested === S.theme ? tween.reverse() : tween.play(); return; }
  if (S.phase === 'reveal') { fade.kill(); idle(); }
  // A pointer press starts at the pointer; a key press (detail 0) at the button's centre.
  const r = toggle.getBoundingClientRect();
  const origin = e.detail > 0 ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  startWipe(S.requested, { x: Math.round(origin.x), y: Math.round(origin.y) });
});

setPressed();
meta.setAttribute('content', tokens[S.theme].ground);
// Compile the cover ahead of the first press, off the critical path; never under reduced motion.
if (motionTier() === 'full') (window.requestIdleCallback || ((fn) => setTimeout(fn, 200)))(() => ensureGL());

// Test hooks: hold the cover at a progress, read a pixel of it right after a fresh render (same task, default framebuffer).
window.__wipe = {
  tokens,
  seek(p) { if (!tween) return false; tween.pause(); proxy.p = p; paint(); return true; },
  resume() { tween?.resume(); return true; },
  sample(x, y) {
    if (S.surface !== 'gl' || !gl) return null;
    paint();
    const c = gl.renderer.getContext(), w = c.drawingBufferWidth, h = c.drawingBufferHeight;
    const px = new Uint8Array(4);
    const gx = Math.min(w - 1, Math.max(0, Math.floor(x * gl.dpr))), gy = Math.min(h - 1, Math.max(0, h - 1 - Math.floor(y * gl.dpr)));
    c.readPixels(gx, gy, 1, 1, c.RGBA, c.UNSIGNED_BYTE, px);
    return Array.from(px);
  },
};

awards.addState(() => ({
  motion: motionTier(),
  theme: S.theme,
  requested: S.requested,
  rootTheme: html.dataset.theme,
  pressed: toggle.getAttribute('aria-pressed'),
  stored: store.get(),
  restored,
  phase: S.phase,
  p: Math.round(proxy.p * 1000) / 1000,
  wipes: S.wipes,
  flips: S.flips,
  flipAt: S.flipAt,
  renders: S.renders,
  glCreated: !!gl,
  surface: S.surface,
  shown: S.shown,
  canvasHidden: canvas.hidden,
  cssHidden: cssCover.hidden,
  origin: S.origin,
  themeColor: meta.getAttribute('content'),
  bodyBg: getComputedStyle(document.body).backgroundColor,
}));
awards.ready();
