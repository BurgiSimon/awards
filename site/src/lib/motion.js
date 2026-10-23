// The house motion vocabulary, read once from tokens.css so GSAP and CSS share one hand (DESIGN.md ## Motion;
// [recipe:custom-ease-house-defaults]): two curves registered with CustomEase under the token names, and the four
// duration bands plus the stagger in seconds. Anything scrubbed by scroll stays on ease 'none'.
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

const seconds = (v) => {
  const s = String(v).trim();
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return 0;
  return s.endsWith('ms') ? n / 1000 : n;
};

export const EASE = { out: 'house-out', travel: 'house-travel' };
export const DUR = { feedback: 0.16, routine: 0.4, mark: 0.6, hero: 1.2, stagger: 0.12 };

// Read at boot and again whenever the tier changes (tokens.css shortens the bands under reduced motion).
export function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  for (const [name, token] of [[EASE.out, '--ease-out-expo'], [EASE.travel, '--ease-in-out-expo']]) {
    const pts = (cs.getPropertyValue(token).match(/-?\d*\.?\d+/g) || []).map(Number);
    if (pts.length === 4) CustomEase.create(name, pts.join(','));
  }
  DUR.feedback = seconds(cs.getPropertyValue('--dur-feedback'));
  DUR.routine = seconds(cs.getPropertyValue('--dur-routine'));
  DUR.mark = seconds(cs.getPropertyValue('--dur-mark'));
  DUR.hero = seconds(cs.getPropertyValue('--dur-hero'));
  DUR.stagger = seconds(cs.getPropertyValue('--stagger'));
  gsap.defaults({ ease: EASE.out });
  return { ease: EASE, dur: { ...DUR } };
}

// --- drawn strokes ---------------------------------------------------------------------------------------------------
// The marks and the grease rings are paths in a 0–100 box stretched over their frame or ticket
// (preserveAspectRatio="none") with a non-scaling stroke, so their dash pattern lives in screen pixels: pathLength
// cannot normalise it (measured in Chromium: a pathLength="1" dash covered 62 % of the ring). Each stroke is measured
// on screen, drawn by its dash offset, and cleared when it lands so a resize can never cut it.

export function screenLength(path) {
  const svg = path.ownerSVGElement;
  const box = svg?.getBoundingClientRect();
  const vb = svg?.viewBox?.baseVal;
  if (!box || !box.width || !box.height || !vb?.width) return 0;
  const sx = box.width / vb.width;
  const sy = box.height / vb.height;
  const total = path.getTotalLength();
  const n = 96;
  let len = 0;
  let prev = path.getPointAtLength(0);
  for (let i = 1; i <= n; i++) {
    const q = path.getPointAtLength((total * i) / n);
    len += Math.hypot((q.x - prev.x) * sx, (q.y - prev.y) * sy);
    prev = q;
  }
  return len;
}

export function hideStroke(path) {
  path.style.opacity = '0';
}

export function showStroke(path) {
  path.style.opacity = '';
  path.style.strokeDasharray = '';
  path.style.strokeDashoffset = '';
}

// One stroke of the hand, added to `tl` at `at`. A stroke whose box has no size (another width's list) lands drawn.
export function addStroke(tl, path, { duration, at = 0, ease = EASE.out }) {
  tl.fromTo(path, {
    // Measured when the stroke starts, not when the timeline is built: the frame may have moved or resized since.
    strokeDashoffset: () => {
      const len = screenLength(path);
      if (!len) return 0;
      // The gap is longer than the stroke, so a hidden stroke shows no round cap at either end.
      path.style.strokeDasharray = `${len} ${len + 8}`;
      path.style.opacity = '';
      return len + 4;
    },
  }, { strokeDashoffset: 0, duration, ease, immediateRender: false, onComplete: () => showStroke(path) }, at);
  return at + duration;
}
