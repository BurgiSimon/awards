// The tunnel's physics, kept free of the DOM so both renderers (GL and canvas 2D) draw the same flow.
// Units are CSS pixels of the section; the grid is a coarse raster of the obstacles.

// Two-pass chamfer distance (cells) from every cell to the nearest obstacle cell.
function chamfer(mask, w, h) {
  const d = new Float32Array(w * h);
  for (let i = 0; i < d.length; i++) d[i] = mask[i] ? 0 : 1e9;
  const E = Math.SQRT2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + 1);
      if (y > 0) {
        v = Math.min(v, d[i - w] + 1);
        if (x > 0) v = Math.min(v, d[i - w - 1] + E);
        if (x < w - 1) v = Math.min(v, d[i - w + 1] + E);
      }
      d[i] = v;
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      let v = d[i];
      if (x < w - 1) v = Math.min(v, d[i + 1] + 1);
      if (y < h - 1) {
        v = Math.min(v, d[i + w] + 1);
        if (x < w - 1) v = Math.min(v, d[i + w + 1] + E);
        if (x > 0) v = Math.min(v, d[i + w - 1] + E);
      }
      d[i] = v;
    }
  }
  return d;
}

// mask: Uint8Array (1 = obstacle) on a w×h grid, `cell` px per cell; `reach` px is how far the body bends the flow.
export function buildField(mask, w, h, cell, { reach = 60, wakeLength = 400 } = {}) {
  const dist = chamfer(mask, w, h);

  // Wake: obstacle presence carried downstream (left → right) with exponential decay, then softened vertically.
  const wake = new Float32Array(w * h);
  const decay = Math.exp(-cell / wakeLength);
  for (let y = 0; y < h; y++) {
    let v = 0;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      v = mask[i] ? 1 : v * decay;
      wake[i] = v;
    }
  }
  const soft = new Float32Array(w * h);
  const r = Math.max(1, Math.round(24 / cell));
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let s = 0, n = 0;
      for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) { s += wake[k * w + x]; n++; }
      soft[y * w + x] = s / n;
    }
  }

  // The steady part of the flow is baked per cell once, so a traced frame costs two lookups per sample.
  const vx = new Float32Array(w * h), vy = new Float32Array(w * h);
  // Normals come from a heavily blurred copy of the body, not from the raw distance: a blurred slab reads as a
  // rounded body, so the stream splits above and below its middle instead of stalling on a flat face.
  const body = blur(Float32Array.from(mask), w, h, Math.max(2, Math.round(reach / cell)));
  const clampI = (x, y) => Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (mask[i]) continue;
      const d = dist[i] * cell;
      // Rounded normal (blurred body) far out, the true surface normal (distance gradient) close in.
      let bx = body[clampI(x - 1, y)] - body[clampI(x + 1, y)], by = body[clampI(x, y - 1)] - body[clampI(x, y + 1)];
      const bl = Math.hypot(bx, by) || 1;
      bx /= bl; by /= bl;
      let tx = dist[clampI(x + 1, y)] - dist[clampI(x - 1, y)], ty = dist[clampI(x, y + 1)] - dist[clampI(x, y - 1)];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl; ty /= tl;
      const m = Math.min(1, Math.max(0, (d - cell) / (reach * 0.5)));
      let nx = tx + (bx - tx) * m, ny = ty + (by - ty) * m;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl; ny /= nl;
      // U = (1, 0). Full removal of the inflow within two cells of the surface, easing out over `reach`.
      const fall = Math.min(1, Math.exp(-(d - 2 * cell) / reach));
      const boost = 1 + 0.25 * fall;
      let u = (1 - nx * nx * fall) * boost, v = -ny * nx * fall * boost;
      if (Math.hypot(u, v) < 0.25) {
        // Stagnation on a flat leading face: slide up or down, whichever side of the body's middle this is.
        v += (by >= 0 ? 1 : -1) * 0.6;
      }
      vx[i] = u; vy[i] = v;
    }
  }
  return { w, h, cell, dist, vx, vy, wake: soft, reach };
}

// Three box passes per axis ≈ a gaussian of radius r (cells).
function blur(a, w, h, r) {
  const tmp = new Float32Array(a.length);
  const pass = (src, dst, n, stride, lines, lineStride) => {
    for (let l = 0; l < lines; l++) {
      const o = l * lineStride;
      let acc = 0;
      for (let k = -r; k <= r; k++) acc += src[o + Math.min(n - 1, Math.max(0, k)) * stride];
      for (let i = 0; i < n; i++) {
        dst[o + i * stride] = acc / (2 * r + 1);
        acc += src[o + Math.min(n - 1, i + r + 1) * stride] - src[o + Math.max(0, i - r) * stride];
      }
    }
  };
  for (let i = 0; i < 3; i++) { pass(a, tmp, w, 1, h, w); pass(tmp, a, h, w, w, 1); }
  return a;
}

function bilerp(a, f, x, y) {
  let gx = x / f.cell - 0.5, gy = y / f.cell - 0.5;
  gx = gx < 0 ? 0 : gx > f.w - 1.001 ? f.w - 1.001 : gx;
  gy = gy < 0 ? 0 : gy > f.h - 1.001 ? f.h - 1.001 : gy;
  const x0 = gx | 0, y0 = gy | 0, tx = gx - x0, ty = gy - y0;
  const i = y0 * f.w + x0;
  const top = a[i] + (a[i + 1] - a[i]) * tx;
  const bot = a[i + f.w] + (a[i + f.w + 1] - a[i + f.w]) * tx;
  return top + (bot - top) * ty;
}

// Divergence-free wobble: the curl of a moving stream function, so the wake swirls instead of compressing.
function psi(x, y, t) {
  return Math.sin(x * 0.021 - t * 2.1 + Math.sin(y * 0.013 + t * 0.7) * 1.7) * Math.cos(y * 0.027 + t * 1.3);
}

// Velocity at (x, y) px. state: { t, turb 0..1, probe: { x, y, r } | null }. Writes [vx, vy, sep] into out.
export function velocity(f, x, y, state, out) {
  let vx = bilerp(f.vx, f, x, y), vy = bilerp(f.vy, f, x, y);
  let sep = 0;
  if (state.turb > 0.001) {
    // Turbulence fades to nothing at the surface, so the wake can never push a line into the body.
    const wk = bilerp(f.wake, f, x, y) * Math.min(1, (bilerp(f.dist, f, x, y) * f.cell) / f.reach - 0.1);
    if (wk > 0.02) {
      const a = state.turb * wk * 70, h = 2;
      vx += a * (psi(x, y + h, state.t) - psi(x, y - h, state.t)) / (2 * h);
      vy -= a * (psi(x + h, y, state.t) - psi(x - h, y, state.t)) / (2 * h);
      sep = Math.min(1, state.turb * wk * 1.6);
    }
  }
  const p = state.probe;
  if (p) {
    // Uniform flow past a cylinder of radius r: the pointer is a probe the lines bend around.
    const dx = x - p.x, dy = y - p.y, rr = p.r * p.r, q = dx * dx + dy * dy;
    if (q < rr * 36) {
      if (q < rr) {
        const l = Math.sqrt(q) || 1;
        vx += (dx / l) * 1.5; vy += (dy / l) * 1.5;
      } else {
        const q2 = q * q;
        vx -= rr * (dx * dx - dy * dy) / q2;
        vy -= 2 * rr * dx * dy / q2;
      }
    }
  }
  out[0] = vx; out[1] = vy; out[2] = sep;
  return out;
}

// Trace one streamline per seed left → right with RK2 at a fixed step (px).
// Writes xyz per point (z = arc length) and sep per point; lines that end early repeat their last point.
export function trace(f, seeds, width, height, state, step, maxPts, pos, sep) {
  const a = [0, 0, 0], b = [0, 0, 0];
  for (let l = 0; l < seeds.length; l++) {
    let x = -step, y = seeds[l], s = 0, cs = 0, k = 0;
    const base = l * maxPts;
    for (; k < maxPts; k++) {
      const o = (base + k) * 3;
      pos[o] = x; pos[o + 1] = y; pos[o + 2] = s; sep[base + k] = cs;
      if (x > width + step || y < -step * 4 || y > height + step * 4) { k++; break; }
      velocity(f, x, y, state, a);
      const al = Math.hypot(a[0], a[1]);
      if (al < 1e-3) { k++; break; }
      velocity(f, x + (a[0] / al) * step * 0.5, y + (a[1] / al) * step * 0.5, state, b);
      const bl = Math.hypot(b[0], b[1]);
      if (bl < 1e-3) { k++; break; }
      x += (b[0] / bl) * step; y += (b[1] / bl) * step; s += step; cs = a[2] > b[2] ? a[2] : b[2];
    }
    const lo = (base + k - 1) * 3;
    for (; k < maxPts; k++) {
      const o = (base + k) * 3;
      pos[o] = pos[lo]; pos[o + 1] = pos[lo + 1]; pos[o + 2] = pos[lo + 2]; sep[base + k] = sep[base + k - 1];
    }
  }
}

export function seedsFor(count, height) {
  return Float32Array.from({ length: count }, (_, i) => ((i + 0.5) / count) * height);
}
