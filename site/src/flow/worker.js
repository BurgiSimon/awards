// The tunnel runs off the main thread, so the air and the smoke never compete with scrolling.
// init → settle and prefill, step → advance; every reply carries one frame, written into buffers the page lends back.
import { createTunnel } from './field.js';

let tunnel = null;

onmessage = ({ data }) => {
  if (data.type === 'init') {
    tunnel = createTunnel(data.config);
    tunnel.settle(data.idle);
    tunnel.prefill(data.idle);
  } else if (tunnel) {
    tunnel.step(data.dt, data.params);
  }
  if (!tunnel) return;
  const size = tunnel.lines * tunnel.cap;
  const pos = data.pos?.length === size * 3 ? data.pos : new Float32Array(size * 3);
  const sep = data.sep?.length === size ? data.sep : new Float32Array(size);
  tunnel.write(pos, sep);
  postMessage({ gen: data.gen, lines: tunnel.lines, cap: tunnel.cap, pos, sep }, [pos.buffer, sep.buffer]);
};
