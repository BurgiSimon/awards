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
  #keyNext = false;                         // after flush() the decoder accepts only a keyframe
  #closed = false;
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
    const w = Math.round(bitmapWidth);
    this.#bitmapWidth = w >= 1 ? Math.min(clip.width, w) : clip.width;   // a hidden canvas has no width yet
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
    // Continue from the decoder's own position when the target is ahead of it in the same group of pictures; after a
    // flush the decoder wants a keyframe, wherever it is.
    const at = this.#keyNext ? null : this.decoderAt;
    const from = at !== null && t > at && key <= at ? at + 1 : key;
    const next = at !== null && from === at + 1;
    if (t === from && next) this.stats.sequential++;          // the next frame: one decode
    else if (next) this.stats.continued++;                    // ahead in the same group: on from where the decoder is
    else this.stats.keySeeks++;                               // anywhere else: from the keyframe
    this.#keyNext = false;
    this.busy = true;
    this.target = t;
    const run = ++this.#run;
    try {
      for (let i = from; i <= t; i++) {
        const f = frames[i];
        this.#decoder.decode(new EncodedVideoChunk({ type: f.ty, timestamp: f.t, data: f.data }));
        this.stats.decodes++;
      }
    } catch (e) {
      // The decoder refused a chunk (closed, or not configured): hand over to the fallback rather than stay busy.
      this.busy = false;
      this.decoderAt = null;
      this.#onError?.(e);
      return;
    }
    // A decoder that holds its output back would leave the run busy for ever: flush once, then start clean.
    setTimeout(() => {
      if (!this.busy || run !== this.#run) return;
      this.stats.stalls++;
      this.#keyNext = true;
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
      .then((bmp) => {
        // Destroyed, or resized while the bitmap was made: it would be drawn at the wrong width.
        if (this.#closed || bmp.width !== this.#bitmapWidth) bmp.close();
        else this.#remember(i, bmp);
      })
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
  get bitmapWidth() { return this.#bitmapWidth; }

  // The screen's backing width changed: keep bitmaps at the new width from now on, and drop the ones at the old.
  resize(width) {
    const w = Math.min(this.#clip.width, Math.round(width));
    if (!(w >= 1) || w === this.#bitmapWidth) return;
    this.#bitmapWidth = w;
    for (const bmp of this.#cache.values()) bmp.close();
    this.#cache.clear();
  }

  // Draw the frame on screen again (after a resize cleared the canvas): from the cache, or by decoding it again. A run
  // in flight draws its own target when it lands, and a request waiting behind it is newer than the frame shown.
  refresh() {
    const t = this.shown;
    this.shown = null;
    if (t === null || this.busy) return;
    this.seek(t);
  }

  destroy() {
    this.#closed = true;
    this.#run++;
    try { this.#decoder?.close(); } catch {}
    for (const bmp of this.#cache.values()) bmp.close();
    this.#cache.clear();
    this.busy = false;
  }
}
