import { createHandler } from './draw.js';

// The Worker's own frame clock: requestAnimationFrame exists in dedicated workers that own an OffscreenCanvas.
const clock = (fn) => {
  let last = 0, id = 0;
  const frame = (now) => {
    fn(last ? Math.min(0.1, (now - last) / 1000) : 1 / 60);
    last = now;
    id = requestAnimationFrame(frame);
  };
  id = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(id);
};

const handle = createHandler(clock);
self.onmessage = ({ data }) => (data.type === 'hello' ? self.postMessage({ type: 'hello' }) : handle(data));
