# webcodecs-frame-scrub

Scroll through a day, one frame at a time, from a single encoded clip. The scroll asks for a frame and WebCodecs decodes exactly that frame: from the nearest keyframe on a jump, one decode for the next frame, nothing at all for a frame it decoded a moment ago. It does what `[recipe:image-sequence-scrub]` does with a folder of stills, from one file a fraction of the size.

The film (dawn to dusk over a standing stone, 120 frames) is drawn in code and encoded in the browser on load, because recipes ship no media; a real site fetches the packed file it built once. The film edge carries each frame's number as an edge code, which is how the verifier proves the frame on screen is the frame asked for.

## Why
- **Frame-exact, not "close enough".** `<video>` with `currentTime` lands on whatever the decoder can reach quickly and drops frames when the scroll moves fast. A scrub that is the story (a product turning, a day passing, an assembly) needs the frame the scroll names.
- **One file, no demuxer.** The encoded chunks sit back to back, then a JSON manifest of every frame's offset, length, timestamp and type (key or delta), then a four-byte little-endian pointer to the manifest. One `fetch`, one `ArrayBuffer`, views on it, no MP4 parser. The layout is the one `[site:son-daven]` ships in `ActiveFrame.js`, a WebCodecs frame decoder its pages load but never use [verified, `assets.sondaven.com/ActiveFrame.js` and `slater-55210.js`, 2026-10-28]; the site scrubs 120 WebP stills instead.
- **Seeks never reset the decoder.** ActiveFrame resets and reconfigures its decoder whenever a non-sequential seek arrives while chunks are still queued [verified, `ActiveFrame.js` `setFrame`], so a fast scroll can keep it from finishing a frame. Here a request made while a seek is decoding waits; when that seek's frame is out, only the newest request runs. A burst of 119 requests in one task costs 11 decodes and ends on the right frame.
- **Never decode more than the gap.** A target ahead of the decoder in the same group of pictures continues from where the decoder already is; anywhere else starts at the keyframe at or before it (ten frames at most here). The next frame forward is one decode.
- **Keep what a seek decoded on the way.** Every frame decoded, shown or passed, is kept as a bitmap at display width in a small cache, so scrubbing back through the group that was just decoded costs no decode at all. Every `VideoFrame` is closed once it is drawn or kept.

## Parameters
| | |
|---|---|
| Clip | 960 × 540, 30 fps, 120 frames; H.264 baseline (`avc1.42001f`) where the browser can encode and decode it, else VP9, else VP8 |
| Encode | 500 kbps (flat drawn frames need little; photographic footage wants two to four times this), a keyframe every 10 frames |
| Size, measured on load | about 255 KB as one stream (it varies by a few KB per encode) against 772 KB for the same frames as WebP stills at quality .8, in headless Chromium; drawn frames with flat colour are the best case for stills, so the gap on footage is wider |
| Cache | `keyEvery + 2` bitmaps at the screen's backing width, oldest dropped first |
| Scroll | a 420 svh track with the screen in a sticky stage; `scrub: 0.3` |
| Watchdog | a seek whose frame is not out after 1 s is flushed, then the decoder is reset and the newest request runs |

These are this recipe's own values. Son Daven's hero scrubs 120 WebP frames on a 2D canvas with `snap: 'frame'` and `scrub: .25`, on desktops only [verified, `slater-55210.js` `initScrollVideo`, 2026-10-28].

## Pack your own clip
Build the file once, offline, in any page that can run WebCodecs, and ship it:

```js
import { packClip, pickCodec } from './pack.js';
const video = Object.assign(document.createElement('video'), { src: '/raw/turn.mp4', muted: true });
await video.play(); video.pause();
const fps = 30, count = Math.round(video.duration * fps);
const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
const g = canvas.getContext('2d');
const config = await pickCodec({ width: canvas.width, height: canvas.height, bitrate: 1_500_000, fps });
const seekTo = (t) => new Promise((r) => { video.onseeked = r; video.currentTime = t; });
const frames = [];
for (let i = 0; i < count; i++) { await seekTo((i + 0.5) / fps); frames.push(await createImageBitmap(video)); }
const bin = await packClip({ count, canvas, config, fps, keyEvery: 10, draw: (i) => g.drawImage(frames[i], 0, 0) });
// Save `bin` (a Blob download, or write it from a headless run) and serve it as /film/turn.bin.
```

Then on the page: `const clip = readPack(await (await fetch('/film/turn.bin')).arrayBuffer())`, and hand it to `FrameScrubber`. Keep the clip short and the keyframes close: a jump decodes up to `keyEvery` frames.

## Tiers
- **Full, with WebCodecs:** the scrub as above.
- **Full, without WebCodecs** (or a decoder error): the frames are drawn directly, the stand-in for an image sequence or `<video>` `currentTime`. WebCodecs video is in Chromium-based browsers, Safari 16.4 and later and Firefox 130 and later on desktop [recalled].
- **Reduced and static:** one still at midday; the scroll moves the page, not the film.

`window.__scrub` exposes `go(p)` (scroll the track to a progress), `seek(i)`, `edge()` (read the frame number off the screen) and `stats` (decodes, keyframe seeks, sequential steps, cache hits, superseded requests, open frames) for verification.

## Accessibility
The canvas is `aria-hidden`; the figure's caption names the film and a visible readout gives the frame and the time of day it shows. The scroll is the only input, and every way of scrolling drives it.

## Adapters

### Webflow
- Designer: a tall Section (the track) holding a sticky Div (the stage) with an Embed `<canvas data-screen aria-hidden="true">` and a caption.
- Assets: upload the `.bin` as a file to the site's asset host or a CDN that serves it with CORS, and fetch it from a page-level module.
- Inject: the module from this recipe; GSAP's ScrollTrigger drives `seek()`.

Seen in: `[site:son-daven]` (ships the WebCodecs decoder and the packed-file reader, unused; the hero scrubs 120 WebP stills).
