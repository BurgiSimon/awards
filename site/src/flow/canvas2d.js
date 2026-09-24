// The settled frame: same streamlines, drawn once to canvas 2D. Used under reduced motion, the low tier and no GL.
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
      ctx.lineWidth = 1;
      for (const separated of [false, true]) {
        ctx.strokeStyle = separated ? rgba(accent, 0.85) : rgba(ink, 0.5);
        ctx.beginPath();
        for (let l = 0; l < lineCount; l++) {
          let pen = false;
          for (let k = 0; k < maxPts; k++) {
            const i = l * maxPts + k;
            const x = pos[i * 3], y = pos[i * 3 + 1];
            if (x > reveal || (sep[i] > 0.5) !== separated) { pen = false; continue; }
            if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; }
          }
        }
        ctx.stroke();
      }
    },
    dispose() { state = null; },
  };
}
