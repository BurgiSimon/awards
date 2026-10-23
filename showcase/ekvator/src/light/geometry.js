// Where the borrowed sun puts the window's light on the wall, and how the type's shadows fall.
// One function feeds both the CSS light (static tier, fallback) and the WebGL wall, so they never disagree.
import { kelvinAt, kelvinToRgb } from '../lib/sun.js';

const RAD = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// sRGB hex → linear rgb triple, and back.
export const hexToLinear = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
};
export const linearToCss = (rgb, alpha = 1) => {
  const c = rgb.map((v) => {
    const s = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.round(clamp(s, 0, 1) * 255);
  });
  return alpha < 1 ? `rgb(${c[0]} ${c[1]} ${c[2]} / ${alpha.toFixed(3)})` : `rgb(${c[0]} ${c[1]} ${c[2]})`;
};

// The unlit plaster under the borrowed sky: a cool dawn grey rising to the day plaster, and the
// polar-night blue. Day values never drop below the dawn floor DESIGN.md computes contrast against (#c9ccd3).
const DAWN = hexToLinear('#cfd2d8');
const DAY = hexToLinear('#e4e1da');
const NIGHT_LOW = hexToLinear('#192030');
const NIGHT_HIGH = hexToLinear('#2b3447');

export function ambient(elevation, nightMix) {
  const day = mix(DAWN, DAY, smooth(2, 30, elevation));
  const night = mix(NIGHT_LOW, NIGHT_HIGH, smooth(-14, -4, elevation));
  return mix(day, night, nightMix);
}

// sun: { elevation, azimuth, noonAzimuth }, size: { w, h }, on: 0–1 (switch-on and polar-night darkness).
export function lightState(sun, { w, h }, on = 1) {
  let rel = ((sun.azimuth - sun.noonAzimuth + 540) % 360) - 180; // −: morning side, +: evening side
  rel = clamp(rel, -76, 76);
  const e = clamp(sun.elevation, -2, 89);
  const sinRel = Math.sin(rel * RAD);
  const sinE = Math.sin(Math.max(0, e) * RAD);

  // The window is portrait, 2 : 3 like the panel; a grazing sun stretches it across the wall.
  const scale = Math.min(1, h / 900);
  // Sized from the shorter side, so a tall phone gets a window across its top half, not a lit screen.
  const base = Math.min(h, w * 1.25);
  const ph = base * 0.8 * (1 - 0.28 * sinE);
  const pw = ph * (2 / 3) * (1 + 0.85 * Math.abs(sinRel));
  const cx = w * (0.5 - 0.37 * sinRel);
  const top = h * (0.05 + 0.4 * sinE ** 0.85);
  const slope = -0.24 * sinRel * (1 - 0.45 * sinE); // the far side of the patch sits lower
  const soft = (5 + 15 * Math.abs(sinRel) + 9 * (1 - sinE)) * scale;

  const kelvin = kelvinAt(sun.elevation);
  const colour = kelvinToRgb(kelvin).map((s) => (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4)); // linear
  const intensity = smooth(-1.2, 5, sun.elevation) * (0.55 + 0.45 * smooth(5, 35, sun.elevation)) * on;

  // A raised letter on a wall, lit from the window: its shadow falls away from the light and down.
  const grazing = 1 - Math.cos(rel * RAD) * Math.cos(e * RAD);
  const len = 0.045 + 0.11 * grazing + 0.03 * (1 - sinE);
  const dx = sinRel * Math.cos(e * RAD);
  const dy = 0.25 + 0.75 * sinE;
  const n = Math.hypot(dx, dy) || 1;

  // The light's direction in wall space (x right, y up, z out of the wall), for the relief.
  const dir = [-sinRel * Math.cos(e * RAD) * 0.9, sinE * 0.6 + 0.15, Math.max(0.12, Math.cos(rel * RAD) * Math.cos(e * RAD) * 0.75)];
  const dn = Math.hypot(...dir);

  return {
    rel, kelvin, colour, intensity, soft,
    patch: { cx, top, pw, ph, slope },
    shadow: { x: (dx / n) * len, y: (dy / n) * len, blur: 0.025 + len * 0.45 },
    dir: dir.map((v) => v / dn),
    grazing,
  };
}

// Corners of the patch and of the mullion cross, as CSS polygon() strings in viewport pixels.
export function patchPolygons(p) {
  const x0 = p.cx - p.pw / 2;
  const x1 = p.cx + p.pw / 2;
  const yAt = (x, v) => p.top + (p.cx - x) * p.slope + v * p.ph;
  const pt = (x, v) => `${x.toFixed(1)}px ${yAt(x, v).toFixed(1)}px`;
  const vbar = p.pw * 0.022;
  const hbar = p.ph * 0.018;
  const mid = p.cx;
  const hv = 0.46;
  return {
    patch: `polygon(${pt(x0, 0)}, ${pt(x1, 0)}, ${pt(x1, 1)}, ${pt(x0, 1)})`,
    v: `polygon(${pt(mid - vbar, 0)}, ${pt(mid + vbar, 0)}, ${pt(mid + vbar, 1)}, ${pt(mid - vbar, 1)})`,
    h: `polygon(${pt(x0, hv)}, ${pt(x1, hv)}, ${(x1).toFixed(1)}px ${(yAt(x1, hv) + hbar).toFixed(1)}px, ${(x0).toFixed(1)}px ${(yAt(x0, hv) + hbar).toFixed(1)}px)`,
  };
}

// How much of a box (viewport rect) the patch covers, sampled on a 3 × 3 grid.
export function litFraction(rect, p) {
  let hit = 0;
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const x = rect.left + (rect.width * (i + 0.5)) / 3;
      const y = rect.top + (rect.height * (j + 0.5)) / 3;
      const u = (x - (p.cx - p.pw / 2)) / p.pw;
      const v = (y - (p.top + (p.cx - x) * p.slope)) / p.ph;
      if (u >= 0 && u <= 1 && v >= 0 && v <= 1) hit += 1;
    }
  }
  return hit / 9;
}
