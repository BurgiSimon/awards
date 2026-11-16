// Star chart: stars on a faint graticule. Stars twinkle; pointing joins the nearest few into a constellation; a click
// holds that constellation for a few seconds and sends one shooting star.
const CELL = 30;                      // px: one star per cell of a jittered grid, a quarter of the cells left empty
const REACH = 100;                    // px the pointer reaches
const JOIN = 5;                       // most stars in one constellation
const LINGER = 5000, FADE = 2000;     // ms a clicked constellation stays, ms it fades
const SHOOT = 900;                    // ms a shooting star lasts
const EASE = 0.2;                     // s for a line to follow the pointer: lines fade, never snap
const rng = (a) => () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export default function sky({ g, col, still }) {
  let W = 0, H = 0;
  let stars = [];
  let ptr = null, shoot = null, presses = 0;
  const edges = new Map();            // "i-j" → strength, follows the pointer
  const sets = [];                    // clicked constellations: { keys, t0 }

  // The up to JOIN stars nearest a point, joined as a minimum spanning tree so the shape branches like a constellation.
  const near = (p) => {
    if (!p) return [];
    const pick = stars.map((s, i) => [Math.hypot(s.x - p.x, s.y - p.y), i]).filter(([d]) => d < REACH).sort((a, b) => a[0] - b[0]).slice(0, JOIN).map(([, i]) => i);
    const keys = [], tree = pick.slice(0, 1);
    while (tree.length < pick.length) {
      let best;
      for (const a of tree) for (const b of pick) if (!tree.includes(b)) { const d = Math.hypot(stars[a].x - stars[b].x, stars[a].y - stars[b].y); if (!best || d < best[0]) best = [d, a, b]; }
      keys.push(`${Math.min(best[1], best[2])}-${Math.max(best[1], best[2])}`); tree.push(best[2]);
    }
    return keys;
  };

  function draw(now, k) {
    const want = new Set(near(ptr)), glow = new Map();
    for (const key of want) if (!edges.has(key)) edges.set(key, 0);
    g.clearRect(0, 0, W, H);
    // Graticule: three arcs and a fan of meridians around a pole far above the band, so it reads as a chart, not as specks.
    const py = -2.5 * W, step = 120 / (H / 2 - py);
    g.lineWidth = 1; g.strokeStyle = col.line; g.beginPath();
    for (const f of [0.2, 0.55, 0.9]) { g.moveTo(W / 2 + f * H - py, py); g.arc(W / 2, py, f * H - py, 0, Math.PI); }
    for (let n = -Math.ceil(W / 240); n <= W / 240; n++) { g.moveTo(W / 2 + n * step * -py, 0); g.lineTo(W / 2 + n * step * (H - py), H); }
    g.stroke();
    g.strokeStyle = col.muted;
    const seg = (key, a) => {
      const [i, j] = key.split('-'), p = stars[i], q = stars[j];
      g.globalAlpha = a * 0.6; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
      for (const n of [+i, +j]) glow.set(n, Math.max(glow.get(n) || 0, a));
    };
    for (const [key, a] of edges) {
      const v = a + ((want.has(key) ? 1 : 0) - a) * k;
      if (v < 0.01) edges.delete(key); else { edges.set(key, v); seg(key, v); }
    }
    for (let n = sets.length; n--;) {
      const a = Math.min(1, (LINGER + FADE - (now - sets[n].t0)) / FADE);
      if (a <= 0) sets.splice(n, 1); else for (const key of sets[n].keys) seg(key, a);
    }
    stars.forEach((s, i) => {
      const lit = glow.get(i) || 0, tw = still() ? 0.85 : 0.78 + 0.22 * Math.sin((now / s.per) * 6.283 + s.ph);
      g.globalAlpha = Math.min(1, s.a * tw + lit * 0.45); g.fillStyle = s.c;
      g.beginPath(); g.arc(s.x, s.y, s.r + lit * 0.5, 0, 7); g.fill();
    });
    if (shoot) {
      const p = (now - shoot.t0) / SHOOT;
      if (p >= 1) shoot = null;
      else {
        const e = 1 - (1 - p) ** 3, tail = 0.2 * (1 - p) + 0.03;
        const hx = shoot.x + shoot.dx * e, hy = shoot.y + shoot.dy * e, tx = hx - shoot.dx * tail, ty = hy - shoot.dy * tail;
        const fade = g.createLinearGradient(tx, ty, hx, hy);
        fade.addColorStop(0, 'transparent'); fade.addColorStop(1, col.ink);
        g.globalAlpha = 0.9 * (1 - p); g.strokeStyle = fade; g.lineWidth = 1.4; g.lineCap = 'round';
        g.beginPath(); g.moveTo(tx, ty); g.lineTo(hx, hy); g.stroke(); g.lineCap = 'butt';
      }
    }
    g.globalAlpha = 1;
  }

  return {
    cue: 'Send a shooting star',
    // Same seed every time: one star per cell of a jittered grid.
    resize(w, h) {
      W = w; H = h;
      const r = rng(11), cols = Math.max(1, Math.round(W / CELL)), rows = Math.max(1, Math.round(H / CELL));
      stars = [];
      for (let i = 0; i < cols * rows; i++) {
        const m = r() ** 3, keep = r() > 0.25, tint = r() < 0.07;
        const s = { x: ((i % cols) + 0.08 + r() * 0.84) * (W / cols), y: (Math.floor(i / cols) + 0.08 + r() * 0.84) * (H / rows), r: 0.7 + m * 1.8, a: 0.4 + m * 0.55, per: 3000 + r() * 6000, ph: r() * 6.283, c: tint ? col.tints[i % 3] : col.ink };
        if (keep) stars.push(s);
      }
      edges.clear(); sets.length = 0;
    },
    frame(dt, now) { draw(now, still() ? 1 : Math.min(1, dt / EASE)); },
    point(p) { ptr = p; },
    click(p, now) {
      const keys = near(p);
      if (keys.length) { sets.push({ keys, t0: now }); if (sets.length > 4) sets.shift(); }
      const held = keys.length ? `A constellation of ${keys.length + 1} stars is held for ${LINGER / 1000} seconds.` : 'No stars within reach there.';
      // Without motion nothing flies; the held shape lets go on a single later redraw.
      if (still()) return { say: held, again: LINGER + FADE + 50 };
      const dir = p.x < W / 2 ? 1 : -1, len = Math.min(360, W * 0.5);
      shoot = { x: p.x + dir * 14, y: Math.max(6, p.y - 28), dx: dir * len, dy: len * 0.2, t0: now };
      return { say: held };
    },
    // Where the cue button clicks: a new place each press, from the same generator.
    spot: () => { const r = rng(97 + presses++); return { x: W * (0.15 + r() * 0.7), y: H * (0.3 + r() * 0.4) }; },
    state: () => ({ stars: stars.length, edges: edges.size, sets: sets.length, shooting: Boolean(shoot) }),
  };
}
