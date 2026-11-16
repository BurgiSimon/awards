// Koi pond: a small pond seen from above with three koi, one per scene paint. They wander, sidestep each other and
// turn back from the banks; a slow pointer draws them over, a fast one scatters them, a click drops a pellet.
const N = 10, SEG = 5.4;              // spine points and their spacing
const WID = [0.72, 0.95, 1, 0.97, 0.88, 0.72, 0.56, 0.42, 0.32, 0.26];   // half-width profile from nose to tail
const PELLETS = 6;                    // most pellets in the water; the oldest goes first
const START = [[0.2, 0.42, 0.3], [0.52, 0.64, 2.8], [0.8, 0.36, -0.4]];  // x, y as shares of the pond, heading in rad
const cl = (v, a, b) => Math.max(a, Math.min(b, v));

export default function pond({ g, col, still }) {
  const fish = col.tints.map((c, i) => ({ c, ph: i * 2.4, a: START[i][2], v: 0, scare: 0, x: 0, y: 0, sp: [] }));
  let W = 0, H = 0, S = 1;            // pond size and the scale every length below is multiplied by
  let t = 0;                          // the pond's own clock in seconds: it only runs while the loop does
  let ptr = null, pellets = [], rips = [], presses = 0;

  function step(dt) {
    t += dt;
    const m = 26 * S + 6;
    for (const f of fish) {
      let sx = Math.cos(f.a), sy = Math.sin(f.a), speed = 24 + 6 * Math.sin(t * 0.3 + f.ph), arc = 26;
      const dist = (p) => Math.hypot(p.x - f.x, p.y - f.y) || 1;
      const pull = (p, k) => { const d = dist(p); sx += ((p.x - f.x) / d) * k; sy += ((p.y - f.y) / d) * k; };
      const wob = Math.sin(t * 0.45 + f.ph) * 0.5 + Math.sin(t * 0.19 + f.ph * 1.7) * 0.4;   // wander: a slow pull to one side, then the other
      sx -= Math.sin(f.a) * wob; sy += Math.cos(f.a) * wob;
      for (const o of fish) {         // sidestep another fish: steer across the heading, away from its side
        const d = dist(o), k = (Math.cos(f.a) * (o.y - f.y) - Math.sin(f.a) * (o.x - f.x) > 0 ? -2.2 : 2.2) * (1 - d / (70 * S));
        if (o !== f && d < 70 * S) { sx -= Math.sin(f.a) * k; sy += Math.cos(f.a) * k; }
      }
      const food = pellets.reduce((b, p) => (!b || dist(p) < dist(b) ? p : b), null);
      // Banks: probe ahead, and once the probe leaves the safe box head for the pond's middle line. Pulling toward a
      // fixed point (not pushing back along the heading) keeps the turn direction stable, so a fish never runs into a bank.
      const px = f.x + Math.cos(f.a) * 40 * S, py = f.y + Math.sin(f.a) * 40 * S, out = Math.max(m - px, px - (W - m), m - py, py - (H - m), 0);
      if (out && !food) pull({ x: cl(f.x, H / 2, W - H / 2), y: H / 2 }, 3 * Math.min(1, out / (16 * S)));
      if (Math.min(f.x, f.y, W - f.x, H - f.y) < m) arc = 14;                                 // already at a bank: turn tightly
      if (food) { pull(food, 2.6); speed *= 2.2 + Math.min(3.3, dist(food) / 180); }          // quicker from far away, so a pellet never waits long
      else if (ptr) {
        const d = dist(ptr);
        if (t < ptr.fast && d < 90) f.scare = 0.7;                                            // a fast pointer startles nearby fish for a moment
        if (f.scare > 0) { pull(ptr, -3); speed *= 2.4; }
        else if (d < 170) { pull(ptr, d > 48 ? 2 : d < 34 ? -1.2 : 0); speed *= d < 70 ? 0.6 : 1.2; arc = 20; }   // curious: come over, then loiter
      }
      f.scare = Math.max(0, f.scare - dt);
      let da = Math.atan2(sy, sx) - f.a; da = Math.atan2(Math.sin(da), Math.cos(da));
      const close = food && dist(food) < 45;                                                  // turn on the spot near food, so a pellet is never orbited
      const turn = (close ? 3.2 : Math.max(f.v, 10) / (arc * S)) * dt;                        // otherwise a fixed turning circle keeps the body in a gentle arc
      f.a += cl(da, -turn, turn);
      f.v += (speed * S * (close ? 1 - 0.6 * Math.min(1, Math.abs(da) / 1.5) : 1) - f.v) * Math.min(1, dt * 2.5);
      f.x = cl(f.x + Math.cos(f.a) * f.v * dt, 6, W - 6); f.y = cl(f.y + Math.sin(f.a) * f.v * dt, 6, H - 6);
      f.sp[0].x = f.x; f.sp[0].y = f.y;
      for (let k = 1; k < N; k++) { const p = f.sp[k], q = f.sp[k - 1], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy) || 1; p.x = q.x + (dx / d) * SEG * S; p.y = q.y + (dy / d) * SEG * S; }
      if (food && dist(food) < 8) { pellets.splice(pellets.indexOf(food), 1); rips.push({ x: food.x, y: food.y, t, small: true }); }
    }
    rips = rips.filter((r) => t - r.t < (r.small ? 0.7 : 1.8));
  }

  // A closed smooth shape: the points are control points, the curve runs through their midpoints.
  const blob = (P, alpha) => {
    g.globalAlpha = alpha; g.beginPath();
    P.forEach(([x, y], i) => { const [nx, ny] = P[(i + 1) % P.length], mx = (x + nx) / 2, my = (y + ny) / 2; if (i) g.quadraticCurveTo(x, y, mx, my); else g.moveTo(mx, my); });
    g.quadraticCurveTo(P[0][0], P[0][1], (P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2); g.fill();
  };
  const drawFish = (f) => {
    const R = 7 * S, pts = f.sp.map((p, k) => {
      const a = f.sp[Math.max(k, 1) - 1], b = f.sp[Math.max(k, 1)], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const wig = Math.sin(t * 6 - k * 0.7 + f.ph) * (k / N) ** 2 * (2.4 + f.v / 30) * S;     // the swimming wave, growing toward the tail
      return { x: p.x - uy * wig, y: p.y + ux * wig, ux, uy };
    });
    const off = (p, fwd, lat) => [p.x + p.ux * fwd - p.uy * lat, p.y + p.uy * fwd + p.ux * lat];
    const sh = pts[2], e = pts[N - 1];
    g.fillStyle = f.c;
    for (const s of [1, -1]) blob([off(sh, 4 * S, s * R * 0.7), off(sh, -4 * S, s * (R + 10 * S)), off(sh, -11 * S, s * (R + 6 * S)), off(sh, -7 * S, s * R * 0.6)], 0.45);   // pectoral fins
    blob([off(e, 14 * S, 0), off(e, -21 * S, 9 * S), off(e, -14 * S, 0), off(e, -21 * S, -9 * S)], 0.65);   // tail fin with a shallow fork
    blob([off(pts[0], R * 1.15, 0), ...pts.map((p, k) => off(p, 0, WID[k] * R)), off(e, -2 * S, 0), ...pts.map((_, k) => off(pts[N - 1 - k], 0, -WID[N - 1 - k] * R))], 1);
  };
  function draw() {
    g.clearRect(0, 0, W, H);
    g.strokeStyle = g.fillStyle = col.muted; g.lineWidth = 1;
    for (const r of rips) {
      const age = t - r.t, life = r.small ? 0.7 : 1.8;
      for (let k = 0; k < (r.small ? 1 : 3); k++) { const rad = age * (r.small ? 18 : 42) - k * 9; if (rad > 0) { g.globalAlpha = (1 - age / life) * 0.45; g.beginPath(); g.arc(r.x, r.y, rad, 0, 7); g.stroke(); } }
    }
    g.globalAlpha = 0.75;
    for (const p of pellets) { g.beginPath(); g.arc(p.x, p.y, 2.2, 0, 7); g.fill(); }
    fish.forEach(drawFish);
    g.globalAlpha = 1;
  }

  return {
    cue: 'Feed the koi',
    resize(w, h) {
      const place = !W || still();
      W = w; H = h; S = cl(W / 900, 0.72, 1);
      if (place) fish.forEach((f, i) => {
        f.x = START[i][0] * W; f.y = START[i][1] * H; f.a = START[i][2];
        f.sp = Array.from({ length: N }, (_, k) => ({ x: f.x - Math.cos(f.a) * k * SEG * S, y: f.y - Math.sin(f.a) * k * SEG * S }));
      });
      // Without motion: settle into natural poses, then hold them.
      if (still()) { t = 0; pellets = []; rips = []; for (let i = 0; i < 20; i++) step(1 / 30); }
    },
    frame(dt) {
      if (dt) step(Math.min(0.05, dt));            // clamped: no jump after a background tab
      draw();
    },
    point(p) {
      if (still()) return;
      if (p) p.fast = ptr && Math.hypot(p.x - ptr.x, p.y - ptr.y) / Math.max(1, p.t - ptr.t) > 0.9 ? t + 0.2 : ptr ? ptr.fast : 0;
      ptr = p;
    },
    click(p) {
      if (still()) return { say: 'Reduced motion is on, so the koi stay where they are.' };
      const q = { x: cl(p.x, 12, W - 12), y: cl(p.y, 12, H - 12) };
      rips.push({ x: q.x, y: q.y, t });
      pellets.push(q); if (pellets.length > PELLETS) pellets.shift();
      return { say: 'A pellet is in the water.' };
    },
    // Where the cue button drops a pellet: it walks across the pond press by press.
    spot: () => ({ x: W * (0.2 + ((presses++ * 0.37) % 0.6)), y: H * (0.35 + ((presses * 0.23) % 0.3)) }),
    state: () => ({ fish: fish.map((f) => [Math.round(f.x), Math.round(f.y)]), pellets: pellets.length, ripples: rips.length }),
  };
}
