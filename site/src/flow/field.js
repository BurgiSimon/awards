// The tunnel's physics, kept free of the DOM so both renderers (GL and canvas 2D) draw the same flow.
// A coarse incompressible fluid (semi-Lagrangian advection, pressure projection, vorticity confinement) carries
// smoke streaklines released from a rake of nozzles at the inlet, the way a smoke tunnel shows its air.
// Units: CSS px and seconds. Grid values sit at cell centres; `cell` px per cell.

// Two-pass chamfer distance (cells) from every cell to the nearest cell where mask is set.
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

// Three box passes per axis ≈ a gaussian of radius r (cells).
export function blur(a, w, h, r) {
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

const hash = (n) => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---------- pressure: geometric multigrid ----------
// One level of the Poisson problem Σ(p_n − p) / hs² = f over fluid cells. Solid neighbours, the inlet and the
// walls are Neumann (left out of the stencil); beyond the outlet p = 0 (counted in the stencil, adds nothing).
function level(w, h, hs, solid = new Uint8Array(w * h), p = new Float32Array(w * h), f = new Float32Array(w * h)) {
  const n = w * h;
  return {
    w, h, n, hs, solid, p, f, r: new Float32Array(n),
    kL: new Float32Array(n), kR: new Float32Array(n), kT: new Float32Array(n), kB: new Float32Array(n), kc: new Float32Array(n),
  };
}

function stencil(L) {
  const { w, h, solid, kL, kR, kT, kB, kc } = L;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (solid[i]) { kL[i] = kR[i] = kT[i] = kB[i] = kc[i] = 0; continue; }
      kL[i] = x > 0 && !solid[i - 1] ? 1 : 0;
      kR[i] = x < w - 1 && !solid[i + 1] ? 1 : 0;
      kT[i] = y > 0 && !solid[i - w] ? 1 : 0;
      kB[i] = y < h - 1 && !solid[i + w] ? 1 : 0;
      const c = kL[i] + kR[i] + kT[i] + kB[i] + (x === w - 1 ? 1 : 0);
      kc[i] = c ? 1 / c : 0;
    }
  }
}

// Gauss-Seidel sweeps (omega > 1 over-relaxes).
function relaxP(L, iters, omega = 1) {
  const { w, n, p, f, kL, kR, kT, kB, kc } = L, h2 = L.hs * L.hs, last = n - 1;
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < n; i++) {
      const c = kc[i];
      if (c === 0) continue;
      const s = kL[i] * p[i > 0 ? i - 1 : 0] + kR[i] * p[i < last ? i + 1 : last]
        + kT[i] * p[i >= w ? i - w : i] + kB[i] * p[i < n - w ? i + w : i];
      p[i] += omega * ((s - f[i] * h2) * c - p[i]);
    }
  }
}

// V-cycle: smooth, hand the residual to a grid half the size, correct with its answer, smooth again.
function vcycle(levels, l) {
  const L = levels[l];
  if (l === levels.length - 1) { relaxP(L, 60, 1.7); return; }
  relaxP(L, 2);
  const { w, h, n, p, f, r, kL, kR, kT, kB, kc } = L, ih2 = 1 / (L.hs * L.hs), last = n - 1;
  for (let i = 0; i < n; i++) {
    const c = kc[i];
    r[i] = c === 0 ? 0 : f[i] - (kL[i] * p[i > 0 ? i - 1 : 0] + kR[i] * p[i < last ? i + 1 : last]
      + kT[i] * p[i >= w ? i - w : i] + kB[i] * p[i < n - w ? i + w : i] - p[i] / c) * ih2;
  }
  const C = levels[l + 1];
  C.f.fill(0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) C.f[(y >> 1) * C.w + (x >> 1)] += r[y * w + x] * 0.25;
  C.p.fill(0);
  vcycle(levels, l + 1);
  // Bilinear prolongation from the four nearest coarse centres, using only the fluid ones.
  const cw = C.w, ch = C.h, cp = C.p, cs = C.solid;
  for (let y = 0; y < h; y++) {
    const gy = y * 0.5 - 0.25, y0 = Math.max(0, Math.floor(gy)), y1 = Math.min(ch - 1, y0 + 1), ty = Math.min(1, Math.max(0, gy - y0));
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (kc[i] === 0) continue;
      const gx = x * 0.5 - 0.25, x0 = Math.max(0, Math.floor(gx)), x1 = Math.min(cw - 1, x0 + 1), tx = Math.min(1, Math.max(0, gx - x0));
      const a = y0 * cw + x0, b = y0 * cw + x1, c = y1 * cw + x0, d = y1 * cw + x1;
      const wa = cs[a] ? 0 : (1 - tx) * (1 - ty), wb = cs[b] ? 0 : tx * (1 - ty), wc = cs[c] ? 0 : (1 - tx) * ty, wd = cs[d] ? 0 : tx * ty;
      const sum = wa + wb + wc + wd;
      if (sum > 0) p[i] += (wa * cp[a] + wb * cp[b] + wc * cp[c] + wd * cp[d]) / sum;
    }
  }
  relaxP(L, 2);
}

// mask: Uint8Array (1 = obstacle) on a fine fw×fh grid of `cell` px; veil: Float32Array 0..1 on the same grid,
// where text sits on the glass. The air runs on a grid `scale` times coarser; the smoke collides with the fine
// mask, so it still hugs the real letterforms. gap: px between rake nozzles; spacing: px between smoke particles
// at release; life: s a puff of smoke lasts.
export function createTunnel({ mask: fineMask, veil: fineVeil, w: fw, h: fh, cell: fcell, scale = 1, width, height, gap = 9, spacing = 6, life = 12 }) {
  const cell = fcell * scale, w = Math.ceil(fw / scale), h = Math.ceil(fh / scale);
  // Coarse body: solid where at least half the fine cells are. Coarse veil: the mean.
  const mask = new Uint8Array(w * h), veil = new Float32Array(w * h);
  {
    const hits = new Uint16Array(w * h), cnt = new Uint16Array(w * h);
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const c = ((y / scale) | 0) * w + ((x / scale) | 0), i = y * fw + x;
        hits[c] += fineMask[i]; veil[c] += fineVeil[i]; cnt[c]++;
      }
    }
    for (let c = 0; c < w * h; c++) { mask[c] = hits[c] * 2 >= cnt[c] && cnt[c] ? 1 : 0; veil[c] /= cnt[c] || 1; }
  }
  // Staggered (MAC) grid: u on vertical faces ((w+1)×h), v on horizontal faces (w×(h+1)), pressure at centres.
  // Unlike a collocated grid its projection is exact, so the field carries no grid-scale checkerboard.
  const n = w * h, W1 = w + 1, nu = W1 * h, nv = w * (h + 1);
  const u = new Float32Array(nu), v = new Float32Array(nv), u0 = new Float32Array(nu), v0 = new Float32Array(nv);
  const curl = new Float32Array(n);
  const solid = new Uint8Array(n); // 1 = the page's body, 2 = the pointer probe
  const p = new Float32Array(n), div = new Float32Array(n);
  // Pressure levels, finest first; a coarse cell is fluid if any child is. The finest level is the grid padded to
  // a multiple of 2^DEPTH with solid cells on the inlet side and below, so every level halves exactly and the
  // outlet (the one Dirichlet edge) stays on the same line at every level; misaligned, the cycle diverges.
  const DEPTH = 4, unit = 1 << DEPTH;
  const pw = Math.ceil(w / unit) * unit, pH = Math.ceil(h / unit) * unit, ox = pw - w;
  const levels = [level(pw, pH, cell)];
  for (let l = 0; l < DEPTH; l++) {
    const L = levels[l];
    levels.push(level(L.w >> 1, L.h >> 1, L.hs * 2));
  }
  const P0 = levels[0];
  // The smoke's collision field: inside a body, the distance (fine cells) to the nearest open air.
  const inside = chamfer(fineMask.map((m) => 1 - m), fw, fh);
  const inv = 1 / cell, inv2 = 1 / (2 * cell);

  function bilerp(a, stride, mx, my, gx, gy) {
    gx = gx < 0 ? 0 : gx > mx - 1.001 ? mx - 1.001 : gx;
    gy = gy < 0 ? 0 : gy > my - 1.001 ? my - 1.001 : gy;
    const x0 = gx | 0, y0 = gy | 0, tx = gx - x0, ty = gy - y0, i = y0 * stride + x0;
    const top = a[i] + (a[i + 1] - a[i]) * tx;
    const bot = a[i + stride] + (a[i + stride + 1] - a[i + stride]) * tx;
    return top + (bot - top) * ty;
  }
  // Velocity components at px (x, y), and any cell-centred grid.
  const velU = (a, x, y) => bilerp(a, W1, W1, h, x * inv, y * inv - 0.5);
  const velV = (a, x, y) => bilerp(a, w, w, h + 1, x * inv - 0.5, y * inv);
  const sample = (a, x, y) => bilerp(a, w, w, h, x * inv - 0.5, y * inv - 0.5);

  // Boundary conditions: the body is still, the probe moves with the pointer, the inlet blows U, the walls slip.
  function walls(U, probe) {
    solid.set(mask);
    if (probe) {
      const r = probe.r / cell, cx = probe.x / cell - 0.5, cy = probe.y / cell - 0.5;
      for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(h - 1, Math.ceil(cy + r)); y++) {
        for (let x = Math.max(1, Math.floor(cx - r)); x <= Math.min(w - 1, Math.ceil(cx + r)); x++) {
          if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r && !solid[y * w + x]) solid[y * w + x] = 2;
        }
      }
    }
    const pvx = probe ? probe.vx : 0, pvy = probe ? probe.vy : 0;
    for (let y = 0; y < h; y++) {
      const row = y * W1, c = y * w;
      u[row] = solid[c] ? 0 : U;
      for (let x = 1; x < w; x++) {
        const a = solid[c + x - 1], b = solid[c + x];
        if (a || b) u[row + x] = a === 2 || b === 2 ? pvx : 0;
      }
      if (solid[c + w - 1]) u[row + w] = 0;
    }
    for (let x = 0; x < w; x++) { v[x] = 0; v[h * w + x] = 0; }
    for (let y = 1; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const a = solid[(y - 1) * w + x], b = solid[y * w + x];
        if (a || b) v[y * w + x] = a === 2 || b === 2 ? pvy : 0;
      }
    }
    P0.solid.fill(1);
    for (let y = 0; y < h; y++) P0.solid.set(solid.subarray(y * w, y * w + w), y * pw + ox);
    stencil(P0);
    for (let l = 1; l < levels.length; l++) {
      const F = levels[l - 1], C = levels[l];
      C.solid.fill(1);
      for (let y = 0; y < F.h; y++) for (let x = 0; x < F.w; x++) if (!F.solid[y * F.w + x]) C.solid[(y >> 1) * C.w + (x >> 1)] = 0;
      stencil(C);
    }
  }

  // Make the velocity divergence-free: multigrid V-cycles, warm-started from the last frame's pressure.
  function project(cycles) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x, f = y * W1 + x;
        div[i] = solid[i] ? 0 : (u[f + 1] - u[f] + v[i + w] - v[i]) * inv;
      }
    }
    for (let y = 0; y < h; y++) P0.f.set(div.subarray(y * w, y * w + w), y * pw + ox);
    for (let c = 0; c < cycles; c++) vcycle(levels, 0);
    for (let y = 0; y < h; y++) p.set(P0.p.subarray(y * pw + ox, y * pw + ox + w), y * w);
    for (let y = 0; y < h; y++) {
      const row = y * W1, c = y * w;
      for (let x = 1; x < w; x++) {
        const a = c + x - 1, b = c + x;
        if (!solid[a] && !solid[b]) u[row + x] -= (p[b] - p[a]) * inv;
      }
      if (!solid[c + w - 1]) u[row + w] -= (0 - p[c + w - 1]) * inv;
    }
    for (let y = 1; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const a = (y - 1) * w + x, b = y * w + x;
        if (!solid[a] && !solid[b]) v[b] -= (p[b] - p[a]) * inv;
      }
    }
  }

  function advect(dt) {
    u0.set(u); v0.set(v);
    const back = (x, y, axis) => {
      // Midpoint back-trace: curved paths keep the vortices round.
      const mx = x - velU(u0, x, y) * dt * 0.5, my = y - velV(v0, x, y) * dt * 0.5;
      const bx = x - velU(u0, mx, my) * dt, by = y - velV(v0, mx, my) * dt;
      return axis ? velV(v0, bx, by) : velU(u0, bx, by);
    };
    for (let y = 0; y < h; y++) for (let x = 1; x <= w; x++) u[y * W1 + x] = back(x * cell, (y + 0.5) * cell, 0);
    for (let y = 1; y < h; y++) for (let x = 0; x < w; x++) v[y * w + x] = back((x + 0.5) * cell, y * cell, 1);
  }

  function vorticity() {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const vR = (v[i + 1] + v[i + 1 + w]) * 0.5, vL = (v[i - 1] + v[i - 1 + w]) * 0.5;
        const uB = (u[(y + 1) * W1 + x] + u[(y + 1) * W1 + x + 1]) * 0.5, uT = (u[(y - 1) * W1 + x] + u[(y - 1) * W1 + x + 1]) * 0.5;
        curl[i] = (vR - vL - uB + uT) * inv2;
      }
    }
  }

  // Vorticity confinement: puts back the swirls the coarse grid smears out. eps is in 1/s. Gated to vortices
  // that are really there (|curl| above c0), or it would grow the grid's own noise into zigzags everywhere.
  function confine(eps, dt, c0) {
    for (let y = 2; y < h - 2; y++) {
      for (let x = 2; x < w - 2; x++) {
        const i = y * w + x;
        if (solid[i]) continue;
        const g = smooth(c0, c0 * 2.5, Math.abs(curl[i]));
        if (!g) continue;
        let nx = Math.abs(curl[i + 1]) - Math.abs(curl[i - 1]);
        let ny = Math.abs(curl[i + w]) - Math.abs(curl[i - w]);
        const l = Math.sqrt(nx * nx + ny * ny) + 1e-5;
        const f = (eps * cell * curl[i] * dt * g * 0.5) / l;
        // The force lives at the centre; half goes to each face around it.
        u[y * W1 + x] += ny * f; u[y * W1 + x + 1] += ny * f;
        v[i] -= nx * f; v[i + w] -= nx * f;
      }
    }
  }

  // Viscosity as one relaxation toward the neighbour mean; k 0..1. High k = low Reynolds number = laminar.
  function relax(a, a0, stride, rows, k) {
    a0.set(a);
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < stride - 1; x++) {
        const i = y * stride + x;
        a[i] += k * ((a0[i - 1] + a0[i + 1] + a0[i - stride] + a0[i + stride]) * 0.25 - a0[i]);
      }
    }
  }
  function viscous(k) {
    if (k <= 0) return;
    relax(u, u0, W1, h, k);
    relax(v, v0, w, h + 1, k);
  }

  // ---------- smoke ----------
  const lines = Math.max(4, Math.round(height / gap));
  const cap = Math.ceil((width * 2.4) / spacing) + 24;
  const nozzle = new Float32Array(lines), f1 = new Float32Array(lines), f2 = new Float32Array(lines), ph = new Float32Array(lines);
  for (let l = 0; l < lines; l++) {
    // A little irregularity in the rake, so the field never reads as ruled paper.
    nozzle[l] = Math.min(height - 1, Math.max(1, ((l + 0.5 + (hash(l) - 0.5) * 0.45) / lines) * height));
    f1[l] = 0.9 + hash(l + 101) * 2.6;
    f2[l] = 2.2 + hash(l + 211) * 3.4;
    ph[l] = hash(l + 307) * 6.283;
  }
  // Each nozzle's smoke density drifts on its own, so puffs travel along the lines and show the air moving.
  const density = (l, t) => 0.66 + 0.2 * Math.sin(t * f1[l] + ph[l]) + 0.14 * Math.sin(t * f2[l] + ph[l] * 1.7);
  let X = new Float32Array(lines * cap), Y = new Float32Array(lines * cap), A = new Float32Array(lines * cap);
  let D = new Float32Array(lines * cap), S = new Float32Array(lines * cap), W = new Float32Array(lines * cap);
  let X2 = new Float32Array(lines * cap), Y2 = new Float32Array(lines * cap), A2 = new Float32Array(lines * cap);
  let D2 = new Float32Array(lines * cap), S2 = new Float32Array(lines * cap), W2 = new Float32Array(lines * cap);
  const count = new Int32Array(lines), acc = new Float32Array(lines);
  let time = 0, airClock = 0;
  const out = width + cell * 3;

  // Keep a particle out of the bodies: slide it up the distance field, or radially out of the probe.
  function pushOut(j, probe) {
    const gx = Math.min(fw - 1, Math.max(0, (X[j] / fcell) | 0)), gy = Math.min(fh - 1, Math.max(0, (Y[j] / fcell) | 0));
    const i = gy * fw + gx, fn = fw * fh;
    if (fineMask[i]) {
      // Down the inside distance, all the way out to the surface.
      const dx = inside[Math.max(i - 1, 0)] - inside[Math.min(i + 1, fn - 1)], dy = inside[Math.max(i - fw, 0)] - inside[Math.min(i + fw, fn - 1)];
      const l = Math.sqrt(dx * dx + dy * dy) || 1, d = (inside[i] + 0.5) * fcell;
      X[j] += (dx / l) * d; Y[j] += (dy / l) * d;
    } else if (probe) {
      const dx = X[j] - probe.x, dy = Y[j] - probe.y, q = Math.sqrt(dx * dx + dy * dy);
      if (q < probe.r) { const s = (probe.r + 0.5) / (q || 1); X[j] = probe.x + dx * s; Y[j] = probe.y + dy * s; }
    }
    Y[j] = Y[j] < 0.5 ? 0.5 : Y[j] > height - 0.5 ? height - 0.5 : Y[j];
  }

  // Smoke caught in dead air (separation bubbles, letter gaps) diffuses into haze instead of piling up as lines.
  const dwell = (vx, vy, U) => Math.max(0, 1 - Math.sqrt(vx * vx + vy * vy) / (0.3 * U));

  function moveSmoke(dt, U, turb, probe) {
    const sepDecay = Math.exp(-dt / 1.6);
    // Sub-steps keep every move under ~1.5 fine cells, so smoke cannot tunnel through a thin stem on a slow frame.
    const sub = Math.min(6, Math.ceil((dt * U * 1.6) / (fcell * 1.5))), h1 = dt / sub;
    for (let l = 0; l < lines; l++) {
      const base = l * cap;
      for (let k = 0; k < count[l]; k++) {
        const j = base + k;
        A[j] += dt;
        if (X[j] > out) continue;
        for (let q = 0; q < sub; q++) {
          const x = X[j], y = Y[j];
          const ax = velU(u, x, y), ay = velV(v, x, y);
          const mx = x + ax * h1 * 0.5, my = y + ay * h1 * 0.5;
          X[j] = x + velU(u, mx, my) * h1;
          Y[j] = y + velV(v, mx, my) * h1;
          W[j] += dwell(ax, ay, U) * h1;
          pushOut(j, probe);
        }
        if (turb > 0.01) {
          // Smoke that passes through the separated wake carries the warning colour downstream.
          const c = Math.abs(sample(curl, X[j], Y[j])) * 36 / Math.max(U, 60);
          S[j] = Math.max(S[j] * sepDecay, turb * smooth(1.3, 3.2, c));
        } else S[j] *= sepDecay;
      }
      acc[l] += U * dt;
      while (acc[l] >= spacing && count[l] < cap) {
        acc[l] -= spacing;
        const j = base + count[l]++;
        // Released part-way through the step: carry it for the time it has already been flowing.
        const age = acc[l] / U, y0 = nozzle[l];
        X[j] = velU(u, 0, y0) * age; Y[j] = y0 + velV(v, 0, y0) * age;
        A[j] = age; D[j] = density(l, time - age); S[j] = 0; W[j] = 0;
      }
    }
  }

  // Rebuild every line oldest-first: drop smoke that left or burnt out, split stretched segments, merge piled-up ones.
  function compact() {
    const maxSeg = spacing * 2.5, minSeg = spacing * 0.3, room = cap - 32;
    for (let l = 0; l < lines; l++) {
      const base = l * cap, c = count[l];
      let k = 0;
      while (k < c - 1 && (X[base + k] > out || A[base + k] > life)) k++;
      k = Math.max(k, c - room);
      let m = 0;
      for (; k < c; k++) {
        const j = base + k;
        if (m > 0) {
          const o = base + m - 1, dx = X[j] - X2[o], dy = Y[j] - Y2[o], q = dx * dx + dy * dy;
          if (q < minSeg * minSeg && k < c - 1) continue;
          if (q > maxSeg * maxSeg && m < room) {
            const t = base + m++;
            X2[t] = (X[j] + X2[o]) * 0.5; Y2[t] = (Y[j] + Y2[o]) * 0.5; A2[t] = (A[j] + A2[o]) * 0.5;
            D2[t] = (D[j] + D2[o]) * 0.5; S2[t] = (S[j] + S2[o]) * 0.5; W2[t] = (W[j] + W2[o]) * 0.5;
          }
        }
        const t = base + m++;
        X2[t] = X[j]; Y2[t] = Y[j]; A2[t] = A[j]; D2[t] = D[j]; S2[t] = S[j]; W2[t] = W[j];
      }
      count[l] = m;
    }
    [X, X2] = [X2, X]; [Y, Y2] = [Y2, Y]; [A, A2] = [A2, A]; [D, D2] = [D2, D]; [S, S2] = [S2, S]; [W, W2] = [W2, W];
  }

  return {
    lines, cap,

    // Steady potential flow around the bodies (uniform inflow, projected hard). The settled frame starts here.
    settle(U, cycles = 12) {
      u.fill(U); v.fill(0); P0.p.fill(0);
      walls(U, null);
      project(cycles);
      vorticity();
    },

    // In steady flow a streakline is a streamline: trace each nozzle's smoke as if it had been flowing for `life`.
    prefill(U) {
      const dt = spacing / U;
      for (let l = 0; l < lines; l++) {
        const base = l * cap, pts = [];
        let x = 0, y = nozzle[l], age = 0, still = 0;
        while (age < life && x < out && pts.length / 4 < cap - 40) {
          pts.push(x, y, age, still);
          const ax = velU(u, x, y), ay = velV(v, x, y);
          still += dwell(ax, ay, U) * dt;
          const mx = x + ax * dt * 0.5, my = y + ay * dt * 0.5;
          X[base] = x + velU(u, mx, my) * dt; Y[base] = y + velV(v, mx, my) * dt;
          pushOut(base, null);
          x = X[base]; y = Y[base]; age += dt;
        }
        const m = pts.length / 4;
        for (let k = 0; k < m; k++) {
          const s = (m - 1 - k) * 4, j = base + k;
          X[j] = pts[s]; Y[j] = pts[s + 1]; A[j] = pts[s + 2]; W[j] = pts[s + 3]; D[j] = density(l, -A[j]); S[j] = 0;
        }
        count[l] = m;
        acc[l] = 0;
      }
      compact();
    },

    // One step of air and smoke. U: inflow px/s; eps: confinement 1/s; visc: 0..1; turb: 0..1 tint; probe or null.
    // The air steps at most 30 times a second (it changes slowly at this scale); the smoke moves every frame.
    step(dt, { U, eps = 0, visc = 0, turb = 0, probe = null, cycles = 2 }) {
      time += dt;
      airClock += dt;
      if (airClock >= 1 / 31) {
        const da = Math.min(airClock, 1 / 20);
        airClock = 0;
        walls(U, probe);
        vorticity();
        if (eps > 0) confine(eps, da, (0.12 * U) / cell);
        advect(da);
        walls(U, probe);
        viscous(visc);
        project(cycles);
        vorticity();
      }
      moveSmoke(dt, U, turb, probe);
      compact();
    },

    // Fill the renderers' arrays: xyz per point (z = opacity 0..1) and the separation tint per point.
    // Unused slots repeat the line's last point at zero opacity, so they draw nothing.
    write(pos, sep) {
      const tear = spacing * 5;
      for (let l = 0; l < lines; l++) {
        const base = l * cap, c = count[l];
        for (let k = 0; k < cap; k++) {
          const j = base + k, o = j * 3;
          if (k >= c) {
            const last = base + Math.max(0, c - 1);
            pos[o] = X[last]; pos[o + 1] = Y[last]; pos[o + 2] = 0; sep[j] = 0;
            continue;
          }
          const x = X[j], y = Y[j];
          // Stretched smoke thins; old smoke diffuses; text on the glass dims what passes behind it.
          const dp = k > 0 ? Math.sqrt((X[j - 1] - x) ** 2 + (Y[j - 1] - y) ** 2) : 0;
          const dn = k < c - 1 ? Math.sqrt((X[j + 1] - x) ** 2 + (Y[j + 1] - y) ** 2) : 0;
          // A filament torn wider than tear px is drawn broken, never as a straight chord across the gap.
          const torn = Math.max(dp, dn) > tear;
          const seg = (dp + dn) / ((dp ? 1 : 0) + (dn ? 1 : 0) || 1) || spacing;
          const stretch = torn ? 0 : Math.min(1, Math.max(0.12, (spacing * 1.2) / seg)) ** 0.75;
          const age = 1 - 0.6 * smooth(0, life, A[j]);
          const inlet = smooth(0, 40, x);
          const behind = 1 - 0.82 * sample(veil, x, y);
          const haze = Math.exp(-W[j] / 0.9);
          pos[o] = x; pos[o + 1] = y; pos[o + 2] = D[j] * stretch * age * inlet * behind * haze;
          sep[j] = S[j];
        }
      }
    },
  };
}
