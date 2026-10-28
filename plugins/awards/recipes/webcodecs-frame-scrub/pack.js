// One clip, one file: the encoded chunks back to back, then a JSON manifest, then a 4-byte little-endian offset of
// where the manifest starts. A browser reads it with one fetch and needs no MP4 demuxer: every frame's offset, length,
// timestamp and type (key or delta) are in the manifest. The layout is the one Son Daven's ActiveFrame.js reads.
//
// The manifest: { codec, width, height, fps, totalFrames, keyEvery, description (base64 or null), frames: [{ i, t, ty, o, l }] }

const b64 = (bytes) => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

// The codecs tried, in order: H.264 baseline decodes in hardware almost everywhere, VP9 and VP8 are the open fallbacks.
export const CODECS = ['avc1.42001f', 'vp09.00.10.08', 'vp8'];

export async function pickCodec({ width, height, bitrate, fps }) {
  for (const codec of CODECS) {
    const enc = { codec, width, height, bitrate, framerate: fps, ...(codec.startsWith('avc') ? { avc: { format: 'avc' } } : {}) };
    const dec = { codec, codedWidth: width, codedHeight: height };
    try {
      if ((await VideoEncoder.isConfigSupported(enc)).supported && (await VideoDecoder.isConfigSupported(dec)).supported) return enc;
    } catch { /* an unknown codec string throws in some engines; try the next */ }
  }
  return null;
}

// Encodes `count` frames, each drawn by `draw(i)` into a canvas, into one packed ArrayBuffer. Run it at build time
// (a page in a browser, or a headless one) and ship the result; here the demo runs it on load because recipes ship
// no media. A keyframe every `keyEvery` frames bounds the cost of a random seek.
export async function packClip({ count, draw, canvas, config, fps, keyEvery, onProgress }) {
  const chunks = [];
  let description = null;
  let failure = null;
  const encoder = new VideoEncoder({
    output(chunk, meta) {
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      chunks.push({ t: chunk.timestamp, ty: chunk.type, data });
      const d = meta?.decoderConfig?.description;
      if (d) description = (ArrayBuffer.isView(d) ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength) : new Uint8Array(d)).slice();
    },
    error(e) { failure = e; },
  });
  encoder.configure({ ...config, latencyMode: 'quality' });
  for (let i = 0; i < count; i++) {
    draw(i);
    const frame = new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / fps) });
    encoder.encode(frame, { keyFrame: i % keyEvery === 0 });
    frame.close();
    onProgress?.(i + 1, count);
    // Keep the queue short so frames are not all held in memory at once, and so the page can paint progress.
    while (encoder.encodeQueueSize > 2) await new Promise((r) => setTimeout(r, 0));
    if (failure) throw failure;
  }
  await encoder.flush();
  encoder.close();
  if (failure) throw failure;
  chunks.sort((a, b) => a.t - b.t);

  let offset = 0;
  const frames = chunks.map((c, i) => { const f = { i, t: c.t, ty: c.ty, o: offset, l: c.data.byteLength }; offset += c.data.byteLength; return f; });
  const manifest = {
    codec: config.codec, width: config.width, height: config.height, fps, totalFrames: frames.length, keyEvery,
    description: description ? b64(description) : null, frames,
  };
  const json = new TextEncoder().encode(JSON.stringify(manifest));
  const out = new Uint8Array(offset + json.byteLength + 4);
  for (const [k, c] of chunks.entries()) out.set(c.data, frames[k].o);
  out.set(json, offset);
  new DataView(out.buffer).setUint32(offset + json.byteLength, offset, true);
  return out.buffer;
}

// Reads a packed clip: the manifest, and a view on each chunk (no copies).
export function readPack(buffer) {
  const view = new DataView(buffer);
  const at = view.getUint32(buffer.byteLength - 4, true);
  const manifest = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, at, buffer.byteLength - 4 - at)));
  for (const f of manifest.frames) f.data = new Uint8Array(buffer, f.o, f.l);
  manifest.descriptionBytes = manifest.description ? unb64(manifest.description) : null;
  return manifest;
}
