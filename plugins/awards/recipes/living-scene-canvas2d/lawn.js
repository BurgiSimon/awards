// Lawn: a strip of grass on a ground line. A breeze when idle, blades lean away from the pointer on a spring and take
// its speed as a gust, a click plants a flower. Every size is authored for a 112 px band and scales with its height.
const BAND = 112;
const PITCH = 3;                       // px between blades
const REACH = 90;                      // px the pointer pushes
const SPRING = 0.012, DAMPING = 0.1;   // per 60 Hz frame
const GROW = 1100;                     // ms from seed to open flower
const CAP = 24;                        // most flowers; the oldest fades out over 600 ms
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Hash of an index, 0..1: the same lawn on every load and after every resize.
const rnd = (i) => { let t = Math.imul(i + 1, 0x9e3779b9); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export default function lawn({ g, col, still }) {
  const grass = [col.muted, col.ink, col.ink];
  // u is the position as a share of the width, so a flower keeps its place through a resize.
  const flowers = [0.17, 0.54, 0.82].map((u, c) => ({ u, c, h: 44 + c * 7, born: -1e9, o: 0, v: 0 }));
  let W = 0, H = 0, K = 1, G = 0;      // band size, its scale against BAND, the ground line's y
  let blades = [];
  let ptr = null, pv = 0;              // the pointer, and its horizontal speed in px per ms
  let planted = 3;

  // b.o is the sprung lean from the pointer; the rest is wind: a small ripple plus slow gusts that travel left to right.
  const lean = (b, x, t) => b.o + (still() ? 0 : 0.07 * Math.sin(x * 0.02 - t * 0.0012 + b.h) + 0.16 * Math.max(0, Math.sin(x * 0.005 - t * 0.0006)) ** 3);
  const stem = (x, h, a) => { g.moveTo(x, G); g.quadraticCurveTo(x + Math.sin(a) * h * 0.15, G - h * 0.6, x + Math.sin(a) * h, G - Math.cos(a) * h); };

  // Target: away from the pointer, plus the pointer's own speed as a gust. f is the frame time in 60 Hz frames.
  const spring = (b, x, f) => {
    let want = 0;
    if (ptr) {
      const near = Math.max(0, 1 - Math.hypot(x - ptr.x, G - 14 * K - ptr.y) / (REACH * K)) ** 2;
      want = near * clamp((Math.sign(x - ptr.x) || 1) * 0.55 + pv * 0.4, -0.9, 0.9);
    }
    b.v += ((want - b.o) * SPRING - b.v * DAMPING) * f;
    b.o += b.v * f;
  };

  function draw(t) {
    g.clearRect(0, 0, W, H);
    g.lineCap = 'round';
    g.globalAlpha = 1; g.strokeStyle = col.line; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, G + 0.5); g.lineTo(W, G + 0.5); g.stroke();
    [0.5, 0.4, 0.75].forEach((alpha, k) => {       // three depths of grass, one path each
      g.globalAlpha = alpha; g.strokeStyle = grass[k]; g.lineWidth = k === 2 ? 1.25 : 1;
      g.beginPath();
      for (const b of blades) if (b.k === k) stem(b.x, b.h * K, b.rest + lean(b, b.x, t));
      g.stroke();
    });
    for (const f of flowers) {
      const age = still() ? 1 : Math.min(1, (t - f.born) / GROW);
      const up = 1 - (1 - Math.min(1, age / 0.7)) ** 3;                    // the stem rises first
      const open = 1 - (1 - Math.max(0, (age - 0.6) / 0.4)) ** 2;          // then the petals open
      const fade = f.gone ? Math.max(0, 1 - (t - f.gone) / 600) : 1;
      const x = f.u * W, a = lean(f, x, t) * 0.6, h = f.h * K * up;
      const hx = x + Math.sin(a) * h, hy = G - Math.cos(a) * h;
      g.globalAlpha = 0.8 * fade; g.strokeStyle = grass[1]; g.lineWidth = 1.25;
      g.beginPath(); stem(x, h, a); g.stroke();
      if (!open) continue;
      g.globalAlpha = fade; g.fillStyle = col.tints[f.c];
      for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(hx + Math.cos(i * 1.047 + a) * 5 * K * open, hy + Math.sin(i * 1.047 + a) * 5 * K * open, 2.6 * K * open, 0, 7); g.fill(); }
      g.fillStyle = col.ground; g.beginPath(); g.arc(hx, hy, 2.2 * K * open, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }

  return {
    cue: 'Plant a flower',
    resize(w, h) {
      W = w; H = h; K = H / BAND; G = H - 10 * K;
      blades = Array.from({ length: Math.floor(W / PITCH) }, (_, i) => {
        const x = i * PITCH + rnd(i * 4) * 5;
        const tuft = 0.8 + 0.2 * Math.sin(x * 0.045 + 1.3) * Math.sin(x * 0.013 + 4);   // taller and shorter patches
        return { x, h: 10 + 24 * rnd(i * 4 + 1) ** 1.7 * tuft, rest: (rnd(i * 4 + 2) - 0.5) * 0.5, k: Math.floor(rnd(i * 4 + 3) * 3), o: 0, v: 0 };
      });
    },
    frame(dt, t) {
      const f = Math.min(2, dt * 60);              // clamped so a stalled tab does not fling the grass
      if (f) {
        pv *= 0.9 ** f;
        for (const b of blades) spring(b, b.x, f);
        for (let i = flowers.length; i--;) {
          const fl = flowers[i];
          if (fl.gone && t - fl.gone > 600) flowers.splice(i, 1); else spring(fl, fl.u * W, f);
        }
      }
      draw(t);
    },
    point(p) {
      if (p && ptr && p.t > ptr.t) pv = 0.7 * pv + 0.3 * clamp((p.x - ptr.x) / (p.t - ptr.t), -3, 3);
      ptr = p;
    },
    click(p, now) {
      const live = flowers.filter((f) => !f.gone);
      if (live.length >= CAP) { if (still()) flowers.splice(flowers.indexOf(live[0]), 1); else live[0].gone = now; }
      flowers.push({ u: clamp(p.x / W, 0.01, 0.99), c: planted % 3, h: 38 + rnd(planted * 7) * 22, born: now, o: 0, v: 0 });
      planted++;
      return { say: `Planted. ${Math.min(CAP, live.length + 1)} flowers on the lawn.` };
    },
    // Where the cue button plants: a new place each press, from the same hash.
    spot: () => ({ x: W * (0.06 + rnd(planted * 13) * 0.88), y: G - 20 * K }),
    state: () => ({
      blades: blades.length,
      flowers: flowers.filter((f) => !f.gone).length,
      lean: Number(blades.reduce((m, b) => Math.max(m, Math.abs(b.o)), 0).toFixed(3)),
    }),
  };
}
