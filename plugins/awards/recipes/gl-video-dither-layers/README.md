# gl-video-dither-layers

A close whose picture is footage woven into the section's own ink. Three short clips, each graded the way keyed footage for this effect is shot (the subject in light tones on pure black), are laid over one another on one canvas. Black is the key, so each clip lands as a cut-out; the rest is read cell by cell and redrawn as a vertical bar as wide as the cell is dark, or, with the toggle, as a glyph from an ASCII ramp. The levels develop from blank as the picture scrolls in, and the flock crosses on a loop.

The clips (a ridge in mist, reeds, a flock) are drawn in code and streamed into muted `<video>` elements, so the demo runs through the same path a filed clip takes and ships no media. Colours come from the close's own tokens (`--ground`, `--ink`).

## Why
- **One effect, every picture.** The weave turns photographs, renders and film into one texture in one ink, so a page with mixed sources reads as one hand. `[site:son-daven]` runs a single shader of this kind over its hero, chapters, a 404 and the footer, fifteen canvases on the home page [verified, `slater-55210.js`, 2026-10-28] (`[pattern:webgl-shaders#shader-beats-by-kind]`).
- **Black is the matte.** Shoot or grade each clip on black and drop near-black cells, and any number of clips composite as cut-outs with no alpha channel, no green screen and no second texture. Testing the key at the cell centre and four points inside it ends silhouettes on whole cells; thin strokes (the reeds) test the centre alone, or a coarse grid drops them whole.
- **The layer settings are the animation.** Each layer is a plain object (`x`, `y`, `w`, grid, black and white points, bar range, ground and ink opacity, `develop`); GSAP tweens those objects and the next frame reads them. A black point above the white point inverts the tone, which is how a light picture stays positive on a dark ground; sliding both points is how a layer develops, fades or swaps (`[pattern:webgl-architecture#effect-parameters]`).
- **Fill cost follows the footage.** Each layer draws a quad the size of its own box, not a full-canvas quad with a bounds test, so three layers over a footer cost about one footer of fragments.

## Parameters
| | |
|---|---|
| Grid | ridge 180 × 64, reeds 110 × 72, flock 84 × 48 cells, never under 5 CSS px a cell (9 for glyphs, at about 0.6 : 1); a phone coarsens instead of drawing sub-pixel bars |
| Levels | ridge black 225 / white 35, reeds 230 / 25 (both inverted, light ink on a dark ground), flock 255 / 0; gamma 1, threshold 255 |
| Bars | width from −2 % to 102 % of the cell (ridge), so no ink is truly empty and full ink closes the gap; coverage box-filtered over one device pixel, so widening bars do not shimmer and a zero-width bar draws nothing |
| Glyphs | ` .:-=+*%#@` measured in the system monospace face and sorted by ink before upload; the order differs by platform |
| Key | near-black at or below 0.04; centre plus four points at ±0.35 cell (centre only for the reeds) |
| Motion | develop scrubbed from 70 % of the picture at the viewport bottom (the ridge band, the lowest layer, entering) to the end of the page, so every layer develops on screen: ridge, then reeds (+.2), then flock (+.4); the flock crosses −0.65 → 1.02 of the width in 7 s, then rests 3 s |
| Budget | DPR ≤ 1.5; 30 fps at most; a render only when a clip frame, a tween value, the size, the theme or the mode changed; nothing allocated until the close is 60 % of a viewport away |
| Placement | art-directed per canvas shape (`PLACE.wide`, `PLACE.tall`), not scaled |

These are this recipe's own values, not a site's. Son Daven's scenes use 100 × 100 cells by default (up to 200 × 150), bars from −2 % to 102 %, sixty frames a second, and a five-by-five texel ring around each cell centre as its key; take the architecture and grade your own clips.

## Real footage
Replace a clip's stream with a file and keep everything else:

```js
const video = document.createElement('video');
video.muted = true; video.playsInline = true; video.loop = true; video.crossOrigin = 'anonymous';
video.src = '/footage/ridge-on-black.mp4';          // no alpha channel needed: black is the key
let frames = 0;                                      // bumped once per decoded frame, so each frame uploads once
video.requestVideoFrameCallback(function tick() { frames++; video.requestVideoFrameCallback(tick); });
const source = { el: video, kind: 'video', version: () => frames };
```

Grade the clip on true black (crush everything under about 4 %), keep it short and looped, and encode it small: the weave throws most of the detail away, so a 640-px clip at a low bitrate looks the same as a 4K one. Serve it from the same origin or with CORS, or the texture upload taints the context.

## Tiers
- **Full:** clips play while the close is on screen; levels scrub with the scroll; the flock loops; a **Pause footage** button stops the clips and the loop (moving content longer than five seconds needs one, WCAG 2.2.2).
- **Reduced and static:** one developed still from the canvases at a fixed time, the flock parked in frame, no clock, no pause button; re-rendered on resize, theme or texture change only.
- **No WebGL (or a lost context):** the canvas stays hidden, the stage keeps a quiet CSS bar texture under the caption, and the texture toggle and pause button stay hidden, since they act on the GL picture only.

`window.__dither.freeze(t)` pins the clips for verification, `measure(layer)` compares each cell's ink with the tone the levels give (and, on a clear-ground layer, checks part-covered pixels carry no ground colour), `seek(p)` scrolls the develop trigger to a progress, and `colours()` returns the tokens as the shader gets them.

## Accessibility
The canvas is `aria-hidden`; a visible caption names what the footage shows. Every word, link and control is DOM with 44 px targets; the texture toggle is a pair of `aria-pressed` buttons, and **Pause footage** keeps its label while `aria-pressed` carries the state (a toggle whose label also flips reads as "Play footage, pressed"). Nothing depends on the pointer.

## Adapters

### Webflow
- Designer: a Div with class `scene-stage` (`position: relative`, a height) inside the section; put an Embed holding `<canvas class="gl" data-gl aria-hidden="true">` in it, or let the module insert one. The caption stays a Webflow text element.
- Inject: a page-level `<script type="module">` that imports `dither.js` and this file once the section is near, from the site's own host (Son Daven keeps all of its logic in one module on Slater).
- Colours: read from the section's custom properties, so a Webflow variable mode on the section changes the ink without touching the script. Hex is read directly; any other CSS colour (`rgb()`, `hsl()`, `oklch()`, a named colour) is normalised by painting it into one pixel of a 2D canvas.
- Controls: a Button with `data-pause` and `aria-pressed="false"` (needed whenever footage loops past five seconds, WCAG 2.2.2) and, for the texture switch, a group with `data-mode-group` holding `data-mode="bars"` and `data-mode="glyphs"` buttons; both start `hidden` and the module shows them once WebGL runs. A page without them still draws.
- Don't add Webflow interactions to the stage; GSAP owns the layer settings.

### three.js / R3F
The fragment shader drops into a `ShaderMaterial` on a plane per layer; pass the levels as uniforms and the video as a `VideoTexture`. Without three.js the whole compositor is one program and about 250 lines.

Seen in: `[site:son-daven]` (layered keyed clips through one dither shader in the hero, chapters, the 404 and the footer).
