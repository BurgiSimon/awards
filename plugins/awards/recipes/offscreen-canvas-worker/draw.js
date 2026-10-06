// Draw code shared verbatim by the Worker and the main-thread fallback. No DOM access here:
// it only ever sees a 2D context, so it runs the same on an OffscreenCanvas or an HTMLCanvasElement.
const TAU = Math.PI * 2;
export const STILL_T = 2.2; // the settled frame used under reduced / static motion

export function drawFrame(ctx, t, { ground, ink, accent }) {
  const { width: w, height: h } = ctx.canvas;
  const s = Math.min(w, h) * 0.34, cx = w / 2, cy = h / 2;
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, w, h);

  // Ring of ticks: lengths ripple around the circle.
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1, s * 0.01);
  ctx.lineCap = 'butt';
  ctx.beginPath();
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * TAU;
    const r = s * 1.12;
    const len = s * (0.04 + 0.08 * (0.5 + 0.5 * Math.sin(a * 3 - t * 2.4)));
    ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a) * (r + len), cy + Math.sin(a) * (r + len));
  }
  ctx.stroke();

  // Pen: a Lissajous trail covering the last 1.6 s of its path.
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(2, s * 0.022);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let k = 0; k <= 120; k++) {
    const u = t - 1.6 * (1 - k / 120);
    const x = cx + s * Math.sin(u * 1.5 + 0.6);
    const y = cy + s * 0.82 * Math.sin(u * 2);
    k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
}

// One message handler for both threads. `clock(fn)` calls fn(dt) every frame and returns a stop function.
export function createHandler(clock) {
  let ctx = null, colors = null, animate = false, t = STILL_T, stop = null;
  const paint = () => ctx && drawFrame(ctx, t, colors);
  const tick = (dt) => { t += dt; paint(); };
  return (msg) => {
    if (msg.type === 'init') {
      ctx = msg.canvas.getContext('2d');
      colors = msg.colors;
      t = msg.animate ? 0 : STILL_T;
    }
    if ('animate' in msg) {
      animate = msg.animate;
      // A live switch to reduced settles on the still frame; init paints on its own size message.
      if (!animate && msg.type !== 'init') { t = STILL_T; paint(); }
    }
    if (msg.width) { ctx.canvas.width = msg.width; ctx.canvas.height = msg.height; paint(); }
    if ('run' in msg) {
      const on = msg.run && animate;
      if (on && !stop) stop = clock(tick);
      if (!on && stop) { stop(); stop = null; }
    }
  };
}
