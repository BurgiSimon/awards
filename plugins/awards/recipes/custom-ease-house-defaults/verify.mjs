export const states = [
  { name: 'default', scroll: 0, settle: 1400 },
  { name: 'played', scroll: 1, settle: 1400 },
  { name: 'reduced', scroll: 0, reducedMotion: true, settle: 600 },
  { name: 'mobile', scroll: 1, viewport: 'mobile', settle: 1400 },
];

// Runs in the page. Evaluates the CSS token's cubic-bezier at x = .5 independently of GSAP (bisection on x(t)).
export function probe() {
  const cs = getComputedStyle(document.documentElement);
  const raw = cs.getPropertyValue('--ease-house').trim();
  const pts = (raw.match(/-?\d*\.?\d+/g) || []).map(Number);
  const [x1, y1, x2, y2] = pts;
  const b = (a, c, t) => 3 * a * t * (1 - t) ** 2 + 3 * c * t * t * (1 - t) + t ** 3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (b(x1, x2, m) < 0.5) lo = m; else hi = m; }
  const bezierAtHalf = b(y1, y2, (lo + hi) / 2);
  const sample = window.__houseEase?.sampleDefault(0.5) ?? null;
  const cssDot = document.querySelector('[data-css-dot]');
  const durations = ['xs', 's', 'm', 'l'].map((k) => parseFloat(cs.getPropertyValue(`--dur-${k}`)) || 0);
  const overflow = document.documentElement.scrollWidth - window.innerWidth;
  return { raw, pts, bezierAtHalf, sample, cssTiming: getComputedStyle(cssDot).transitionTimingFunction, durations, overflow };
}

const near = (a, b, eps = 1e-3) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= eps;
const sameCurve = (timing, pts) => {
  const got = (String(timing).match(/-?\d*\.?\d+/g) || []).map(Number);
  return got.length === 4 && got.every((v, i) => near(v, pts[i], 1e-6));
};

export function assert(r) {
  const out = [];
  const d = r.default.probe || {};
  out.push({ ok: r.default.state?.defaults?.ease === 'house', message: `gsap.defaults().ease is the house token (${r.default.state?.defaults?.ease})` });
  out.push({ ok: near(r.default.state?.defaults?.duration, r.default.state?.tokens?.dur?.m, 1e-9) && r.default.state?.defaults?.duration > 0, message: `default duration is --dur-m (${r.default.state?.defaults?.duration})` });
  out.push({ ok: near(d.sample?.ease, d.bezierAtHalf), message: `parseEase(defaults.ease)(.5) ${d.sample?.ease} matches cubic-bezier ${d.bezierAtHalf}` });
  out.push({ ok: near(d.sample?.x, d.bezierAtHalf), message: `unannotated tween seeked to .5 sits at ${d.sample?.x} (curve ${d.bezierAtHalf})` });
  out.push({ ok: sameCurve(d.cssTiming, d.pts || []) && JSON.stringify(r.default.state?.tokens?.ease?.house) === JSON.stringify(d.pts), message: `CSS transition and GSAP use the same four points (${d.cssTiming})` });
  out.push({ ok: r.played.state?.playing === true && (r.played.state?.probeX ?? 0) > 100, message: `house lane played on the defaults (x ${r.played.state?.probeX})` });
  const rm = r.reduced;
  out.push({ ok: rm.state?.motion === 'reduced' && (rm.probe?.durations || [1]).every((v) => v === 0) && rm.state?.defaults?.duration === 0 && rm.state?.playing === false, message: `reduced: every duration token 0, defaults.duration 0, no autoplay (${rm.probe?.durations})` });
  out.push({ ok: (rm.state?.tokens?.dur?.fade ?? 0) > 0, message: 'reduced keeps the fade token for state changes' });
  const m = r.mobile.probe || {};
  out.push({ ok: near(m.sample?.x, m.bezierAtHalf) && (m.overflow ?? 1) <= 0, message: `mobile: default curve holds, no horizontal overflow (${m.overflow})` });
  return out;
}
