// Stand-in footage, drawn in code so the recipe ships no video file. Each clip is graded the way keyed footage for
// this effect is shot: the subject in light tones on pure black, because black is the key. Swap any of them for a
// <video> (README, "Real footage"); the compositor reads either.

const TAU = Math.PI * 2;
// Deterministic ridge profile: a few sines, no random state, so a frozen frame is the same frame on every run.
const profile = (u, seeds) => seeds.reduce((y, [a, f, p]) => y + a * Math.sin(u * f * TAU + p), 0);

function ridge(g, w, h, t) {
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  const far = (u) => h * (0.4 + profile(u, [[0.08, 1.3, 0.4], [0.035, 3.1, 1.9], [0.012, 9.0, 0.3]]));
  const near = (u) => h * (0.62 + profile(u, [[0.1, 0.9, 2.2], [0.04, 2.6, 0.8], [0.015, 7.5, 1.1]]));
  const body = (line, top, bottom) => {
    g.beginPath();
    g.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) g.lineTo(x, line(x / w));
    g.lineTo(w, h);
    g.closePath();
    const grad = g.createLinearGradient(0, h * 0.25, 0, h);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    g.fillStyle = grad;
    g.fill();
  };
  body(far, 'rgb(150,150,150)', 'rgb(70,70,70)');
  // Mist drifts through the valley between the ridges, never into the sky, so the sky stays pure key.
  for (let i = 0; i < 3; i++) {
    const x = ((t * (0.018 + i * 0.007) + i * 0.37) % 1.4 - 0.2) * w;
    const y = h * (0.6 + i * 0.07);
    const m = g.createRadialGradient(x, y, 0, x, y, w * 0.22);
    m.addColorStop(0, 'rgba(235,235,235,0.55)');
    m.addColorStop(1, 'rgba(235,235,235,0)');
    g.fillStyle = m;
    g.fillRect(x - w * 0.25, y - h * 0.2, w * 0.5, h * 0.4);
  }
  body(near, 'rgb(225,225,225)', 'rgb(55,55,55)');
  // A lit rim along the near ridge.
  g.beginPath();
  for (let x = 0; x <= w; x += 4) g[x ? 'lineTo' : 'moveTo'](x, near(x / w) + 1.5);
  g.strokeStyle = 'rgb(255,255,255)';
  g.lineWidth = Math.max(2, h * 0.012);
  g.stroke();
}

function reeds(g, w, h, t) {
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  const n = 15;
  for (let i = 0; i < n; i++) {
    const base = w * (0.06 + 0.88 * (i / (n - 1))) + Math.sin(i * 12.9) * w * 0.02;
    const len = h * (0.55 + 0.4 * (0.5 + 0.5 * Math.sin(i * 7.3)));
    const sway = Math.sin(t * 1.25 + i * 0.7) * 0.07 * len + Math.sin(t * 0.4 + i) * 0.02 * len;
    const tip = [base + sway, h - len];
    const tone = 165 + Math.round(70 * (0.5 + 0.5 * Math.sin(i * 3.7)));
    g.beginPath();
    g.moveTo(base, h);
    g.quadraticCurveTo(base + sway * 0.35, h - len * 0.55, tip[0], tip[1]);
    g.strokeStyle = `rgb(${tone},${tone},${tone})`;
    g.lineWidth = Math.max(1.5, w * (0.006 + 0.004 * ((i * 5) % 3)));
    g.stroke();
    const ang = Math.atan2(tip[1] - (h - len * 0.55), tip[0] - (base + sway * 0.35));
    g.save();
    g.translate(tip[0], tip[1]);
    g.rotate(ang);
    g.beginPath();
    g.ellipse(0, 0, h * 0.06, h * 0.018, 0, 0, TAU);
    g.fillStyle = 'rgb(245,245,245)';
    g.fill();
    g.restore();
  }
}

function flock(g, w, h, t) {
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  const s = h * 0.09;
  for (let i = 0; i < 9; i++) {
    const row = Math.ceil(i / 2), side = i % 2 ? -1 : 1;
    const x = w * 0.62 - row * s * 2.1 + Math.sin(t * 0.9 + i) * s * 0.3;
    const y = h * 0.5 + side * row * s * 0.95 + Math.sin(t * 1.7 + i * 1.3) * s * 0.35;
    const flap = Math.sin(t * 8.5 + i * 1.1);
    g.beginPath();
    g.moveTo(x - s, y - flap * s * 0.65);
    g.quadraticCurveTo(x - s * 0.45, y - s * 0.35 - flap * s * 0.2, x, y);
    g.quadraticCurveTo(x + s * 0.45, y - s * 0.35 - flap * s * 0.2, x + s, y - flap * s * 0.65);
    g.strokeStyle = 'rgb(245,245,245)';
    g.lineWidth = Math.max(2, s * 0.32);
    g.lineCap = 'round';
    g.stroke();
  }
}

const CLIPS = {
  ridge: { draw: ridge, size: [640, 260] },
  reeds: { draw: reeds, size: [360, 240] },
  flock: { draw: flock, size: [320, 180] },
};

// A clip: a canvas plus its own clock. `version` changes only when a new frame is drawn, which is what the
// compositor's upload check reads.
export function createClip(name, fps = 24) {
  const { draw, size } = CLIPS[name];
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = size;
  const g = canvas.getContext('2d');
  let version = 0, last = -1;
  const clip = {
    name, canvas, aspect: size[0] / size[1],
    // Draw the frame for time t (seconds); repeated calls within one frame period are free.
    at(t) {
      const frame = Math.floor(t * fps);
      if (frame === last) return false;
      last = frame;
      draw(g, size[0], size[1], frame / fps);
      version++;
      return true;
    },
    version: () => version,
  };
  clip.at(0);
  return clip;
}
