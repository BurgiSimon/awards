// Frame-exact scrubbing of one packed clip with WebCodecs. A seek decodes from the nearest keyframe at or before the
// target, or straight on from where the decoder already is when that is shorter; the next frame forward is one decode.
// While a seek is decoding, newer targets wait and the newest one runs next, so a fast scroll shows the frames the
// decoder can keep up with instead of resetting it on every event. Frames decoded on the way to a target are kept as
// small bitmaps (a bounded cache), so scrubbing back through the group that was just decoded costs nothing.

export class FrameScrubber {
  #decoder = null;
  #clip;
  #draw;
  #cache = new Map();                       // frame index → ImageBitmap, oldest first (LRU)
  #cacheSize;
  #bitmapWidth;
  #keyAtOrBefore;
  #run = 0;                                 // id of the decode run in flight, for the stall watchdog
  #onError;

  decoderAt = null;                         // the last frame the decoder output: where a delta can continue from
  shown = null;                             // the frame on screen
  target = null;                            // the frame the run in flight is decoding towards
  pending = null;                           // the newest frame asked for while a run was busy
  busy = false;
  stats = { decodes: 0, keySeeks: 0, continued: 0, sequential: 0, cacheHits: 0, shownCount: 0, superseded: 0, stalls: 0, openFrames: 0 };

  constructor(clip, { draw, cacheSize = clip.keyEvery + 2, bitmapWidth = clip.width, onError } = {}) {
    this.#clip = clip;
    this.#draw = draw;
    this.#cacheSize = cacheSize;
    this.#bitmapWidth = Math.min(clip.width, Math.max(1, Math.round(bitmapWidth)));
    this.#onError = onError;
    // For every frame, the index of the keyframe a seek to it must start from.
    let k = 0;
    this.#keyAtOrBefore = clip.frames.map((f) => (f.ty === 'key' ? (k = f.i) : k));
  }

  async init() {
    const c = this.#clip;
    const base = { codec: c.codec, codedWidth: c.width, codedHeight: c.height, ...(c.descriptionBytes ? { description: c.descriptionBytes } : {}) };
    const candidates = [
      { ...base, hardwareAcceleration: 'prefer-hardware', optimizeForLatency: true },
      { ...base, optimizeForLatency: true },
      base,
    ];
    let config = null;
    for (const candidate of candidates) {
      try { if ((await VideoDecoder.isConfigSupported(candidate)).supported) { config = candidate; break; } } catch {}
    }
    if (!config) throw new Error(`no decoder for ${c.codec}`);
    this.#decoder = new VideoDecoder({
      output: (frame) => this.#output(frame),
      error: (e) => { this.busy = false; this.#onError?.(e); },
    });
    this.#decoder.configure(config);
    this.config = config;
  }

  // Ask for a frame; the newest request always wins.
  seek(index) {
    const i = Math.max(0, Math.min(this.#clip.totalFrames - 1, Math.round(index)));
    if (this.busy) {
      if (this.pending !== null && this.pending !== i) this.stats.superseded++;
      this.pending = i;
      return;
    }
    this.#start(i);
  }

  #start(t) {
    this.pending = null;
    if (t === this.shown) return;
    const hit = this.#cache.get(t);
    if (hit) {
      this.#cache.delete(t);
      this.#cache.set(t, hit);              // most recently used last
      this.#draw(hit, t);
      this.shown = t;
      this.stats.cacheHits++;
      this.stats.shownCount++;
      return;
    }
    const frames = this.#clip.frames;
    const key = this.#keyAtOrBefore[t];
    // Continue from the decoder's own position when the target is ahead of it in the same group of pictures.
    const from = this.decoderAt !== null && t > this.decoderAt && key <= this.decoderAt ? this.decoderAt + 1 : key;
    const next = this.decoderAt !== null && from === this.decoderAt + 1;
    if (t === from && next) this.stats.sequential++;          // the next frame: one decode
    else if (next) this.stats.continued++;                    // ahead in the same group: on from where the decoder is
    else this.stats.keySeeks++;                               // anywhere else: from the keyframe
    this.busy = true;
    this.target = t;
    const run = ++this.#run;
    for (let i = from; i <= t; i++) {
      const f = frames[i];
      this.#decoder.decode(new EncodedVideoChunk({ type: f.ty, timestamp: f.t, data: f.data }));
      this.stats.decodes++;
    }
    // A decoder that holds its output back would leave the run busy for ever: flush once, then start clean.
    setTimeout(() => {
      if (!this.busy || run !== this.#run) return;
      this.stats.stalls++;
      this.#decoder.flush().catch(() => {}).then(() => {
        if (!this.busy || run !== this.#run) return;
        this.#decoder.reset();
        this.#decoder.configure(this.config);
        this.decoderAt = null;
        this.busy = false;
        this.#start(this.pending ?? t);
      });
    }, 1000);
  }

  #output(frame) {
    this.stats.openFrames++;
    const i = Math.round((frame.timestamp * this.#clip.fps) / 1e6);
    this.decoderAt = i;
    const done = () => { frame.close(); this.stats.openFrames--; };
    if (i === this.target && this.busy) {
      this.#draw(frame, i);
      this.shown = i;
      this.stats.shownCount++;
      this.busy = false;
    }
    // Every frame decoded, shown or passed on the way, goes into the cache as a bitmap at display width.
    const h = Math.round((this.#bitmapWidth * frame.displayHeight) / frame.displayWidth);
    createImageBitmap(frame, { resizeWidth: this.#bitmapWidth, resizeHeight: h })
      .then((bmp) => { this.#remember(i, bmp); })
      .catch(() => {})
      .finally(done);
    if (!this.busy && this.pending !== null) this.#start(this.pending);
  }

  #remember(i, bmp) {
    this.#cache.get(i)?.close();
    this.#cache.delete(i);
    this.#cache.set(i, bmp);
    while (this.#cache.size > this.#cacheSize) {
      const [oldest, old] = this.#cache.entries().next().value;
      old.close();
      this.#cache.delete(oldest);
    }
  }

  get cached() { return [...this.#cache.keys()]; }

  // Draw the frame on screen again (after a resize cleared the canvas): from the cache, or by decoding it again.
  refresh() {
    const t = this.shown;
    if (t === null) return;
    this.shown = null;
    this.seek(t);
  }

  destroy() {
    this.#run++;
    try { this.#decoder?.close(); } catch {}
    for (const bmp of this.#cache.values()) bmp.close();
    this.#cache.clear();
    this.busy = false;
  }
}
