// The settled frame: same streaklines, drawn once to canvas 2D. Used under reduced motion, the low tier and no GL.
const LEVELS = 8; // opacity buckets: one path per bucket and colour keeps the draw to a handful of strokes

export function createCanvas2D(canvas) {
  const ctx = canvas.getContext('2d');
  let state = null;
  let ink = [0, 0, 0];
  let accent = [1, 0, 0];
  const rgba = (c, a) => `rgba(${c.map((v) => Math.round(v * 255)).join(',')},${a})`;

  return {
    kind: 'canvas2d',
    resize(width, height, pos, sep, lineCount, maxPts) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      state = { width, height, pos, sep, lineCount, maxPts, dpr };
    },
    colors(i, a) { ink = i; accent = a; },
    upload() {},
    draw({ reveal = Infinity } = {}) {
      if (!state) return;
      const { pos, sep, lineCount, maxPts, dpr } = state;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, state.width, state.height);
      ctx.lineWidth = dpr > 1.4 ? 0.75 : 1;
      const base = dpr > 1.4 ? 0.85 : 0.62;
      for (const separated of [false, true]) {
        for (let b = 1; b <= LEVELS; b++) {
          ctx.strokeStyle = rgba(separated ? accent : ink, Math.min(1, (base * b) / LEVELS));
          ctx.beginPath();
          for (let l = 0; l < lineCount; l++) {
            let pen = false;
            for (let k = 0; k < maxPts - 1; k++) {
              const i = l * maxPts + k;
              const x = pos[i * 3], y = pos[i * 3 + 1];
              const a = (pos[i * 3 + 2] + pos[i * 3 + 5]) * 0.5;
              const level = Math.round(a * LEVELS);
              if (x > reveal || level !== b || (sep[i] > 0.4) !== separated) { pen = false; continue; }
              if (!pen) { ctx.moveTo(x, y); pen = true; }
              ctx.lineTo(pos[i * 3 + 3], pos[i * 3 + 4]);
            }
          }
          ctx.stroke();
        }
      }
    },
    dispose() { state = null; },
  };
}
