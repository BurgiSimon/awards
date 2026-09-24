# lottie-web 5.13

<!-- Labels: [verified: Context7] = `/airbnb/lottie-web` (README, wiki loadAnimation-options and Renderer-Settings, rollup.config.js), 2026-09 · [verified: source] = read from `npm pack lottie-web@5.13.0` (player/js/animation/AnimationItem.js, AnimationManager.js, renderers/SVGRenderer.js, CanvasRenderer.js, CanvasRendererBase.js, utils/common.js, index.d.ts, package.json, build/player/), 2026-09 · [verified: Context7 dotlottie] = `/lottiefiles/dotlottie-web` (README, SKILL.md, wiki State-Machines), 2026-09 · [inferred] = read off source behaviour, not documented · [recalled] · [unverified]. -->

## What it is for in this skill set
Designer-authored vector motion exported from After Effects as Bodymovin JSON: a sticker, a mascot, a loader glyph, an icon that morphs. The designer draws the motion; the page decides *when* each frame shows. In this skill set Lottie is almost never "autoplay and loop": the build owns the clock and parks the animation on a frame, driven by scroll progress or pointer intent, on the same ticker as everything else [pattern:motion-vocabulary]. It is not a scene engine: a scroll story made of photographs belongs to [recipe:image-sequence-scrub], anything with depth belongs to WebGL.

## Install (pinned)
```sh
npm i lottie-web@5.13.0
```
```js
import lottie from 'lottie-web/build/player/lottie_light';          // SVG renderer only, no expressions
// import lottie from 'lottie-web/build/player/lottie_light_canvas'; // canvas renderer only, no expressions
// import lottie from 'lottie-web';                                  // full: svg + canvas + html + expressions
```
- `package.json` has `main: ./build/player/lottie.js` (UMD) and no `exports` map, so deep build paths import cleanly; `.d.ts` files ship for `lottie`, `lottie_light`, `lottie_light_canvas`, `lottie_svg`, `lottie_html`, `lottie_light_html` (none for `lottie_canvas`); ES-module copies sit in `build/player/esm/*.min.js` [verified: source].
- Builds per rollup config: `lottie_light` = SVG without expressions, `lottie_svg` = SVG with expressions, plus canvas and html variants each with a light twin [verified: Context7 rollup.config.js].
- Gzipped weight of the minified builds: full 76.6 kB, `lottie_light` 46.7 kB, `lottie_light_canvas` 54.6 kB [verified: source, `gzip -c | wc -c` on build/player]. Budget it as a lazy chunk loaded when the host section nears the viewport, not in the entry.
- Expressions run through `eval` in `ExpressionManager.js`; the full build contains that call, `lottie_light.js` contains none [verified: source]. A strict CSP without `'unsafe-eval'` needs a light build [inferred]. Ask the designer to bake expressions before export; a light build renders an expression-driven property without its expression [inferred].
- Runtime: `lottie.version === '5.13.0'`, which is how both corpus cards identified it [verified: [site:serotoninn], [site:runrobrun]].

## The API surface we use
`lottie.loadAnimation(params)` returns an `AnimationItem` [verified: Context7 README; source]:
| Param | Default | Use |
|---|---|---|
| `container` | — | the wrapper element; the renderer creates its `<svg>` or `<canvas>` inside |
| `renderer` | `'svg'` | `'svg' \| 'canvas' \| 'html'` — see the renderer choice below |
| `path` / `animationData` | — | URL of the JSON, or the parsed object; one or the other |
| `autoplay` | `true` | `'autoplay' in params ? params.autoplay : true` [verified: source]. Every scrubbed instance passes `false` |
| `loop` | `true` | `true`, `false` or a loop count [verified: source] |
| `name` | `''` | lets the global `lottie.play(name)` etc. target one instance |
| `initialSegment` | full range | `[ip, op]` subset; becomes `firstFrame` / `totalFrames` [verified: source] |
| `assetsPath` | — | base URL for image assets |

`rendererSettings` [verified: source, constructor defaults; Context7 README]:
- both: `preserveAspectRatio` (`'xMidYMid meet'`), `imagePreserveAspectRatio` (`'xMidYMid slice'`), `className`, `id`, `runExpressions` (`true`), `contentVisibility`, `progressiveLoad` (`false`).
- svg only: `title`, `description` (written as `<title>` / `<desc>` and wired with `aria-labelledby`), `hideOnTransparent` (`true`), `viewBoxOnly`, `viewBoxSize`, `focusable`, `filterSize`.
- canvas only: `context` (a 2D context you own), `clearCanvas` (`true`), `dpr` (defaults to `window.devicePixelRatio` whenever a `container` is given, `1` otherwise) [verified: source].

Instance API:
- `goToAndStop(value, isFrame)`: `isFrame: true` → a frame number **relative to the current segment's `firstFrame`**; omitted or `false` → **milliseconds** (`value * fr / 1000`); a non-numeric string is looked up as a marker name. Always pauses [verified: source]. The frame draws synchronously inside the call once `isLoaded`; before that the value is kept and drawn on load [verified: source].
- `goToAndPlay(value, isFrame)`: same addressing, then plays.
- `playSegments(segments, forceFlag)`: `[a, b]` or `[[a, b], [c, d]]` queued in order; `forceFlag` clears the queue and starts the first segment now; `b < a` plays backwards by flipping direction; calls `play()` if paused [verified: source]. It **rewrites `firstFrame` and `totalFrames`** to the segment; `resetSegments(true)` restores the full range [verified: source]. Whether the last queued segment loops under `loop: true` [unverified].
- `setSubframe(flag)`: subframe rendering is on by default (global `subframeEnabled = true`); `false` floors every frame to an integer [verified: source]. On for smooth scrubs; off for pixel or stepped art where in-betweens look wrong [inferred].
- `totalFrames`, `currentFrame`, `firstFrame`, `frameRate`, `isLoaded`; `getDuration(true)` frames, `getDuration(false)` seconds [verified: index.d.ts; source].
- `play()`, `pause()`, `stop()`, `setSpeed(n)`, `setDirection(1 | -1)`, `resize(width?, height?)` (numbers optional; a passed event object is ignored), `destroy()` [verified: source].
- Events via `addEventListener`: `data_ready`, `DOMLoaded` (fired in a `setTimeout(0)` after load), `enterFrame`, `drawnFrame`, `segmentStart`, `loopComplete`, `complete`, `destroy` [verified: Context7 README; source].
- Globals: `lottie.freeze()` / `unfreeze()` stop and restart the shared loop; `setIDPrefix`, `setQuality`, `setSubframeRendering`, `resize()` [verified: source modules/main.js].

The clock: `AnimationManager` runs one `requestAnimationFrame` loop only while at least one instance is playing, and stops it when none is [verified: source]. An instance that is only ever moved with `goToAndStop` never starts that loop, so scrubbing adds no second clock.

## Scrubbing by frame
Tween a proxy on GSAP's ticker and park the frame; do not call `play()` on anything scroll- or pointer-driven.
```js
// scroll: frame follows progress, smoothing comes from Lenis plus a numeric scrub [recipe:boot-lenis-gsap]
const anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay: false,
  path: '/lottie/mark.json', rendererSettings: { title: 'Studio mark' } });
anim.addEventListener('DOMLoaded', () => {
  const last = anim.totalFrames - 1;                       // op is the out point, frames run 0..totalFrames-1 [inferred]
  const p = { f: 0 };
  gsap.to(p, { f: last, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 20%', scrub: 0.6 },
    onUpdate: () => anim.goToAndStop(p.f, true) });
});
```
```js
// hover intent, the Serotoninn sticker shape: half on reveal, full on hover, back on leave [site:serotoninn]
const p = { f: 0 };
const to = (f, duration) => gsap.to(p, { f, duration, ease: 'power2.out', overwrite: true,
  onUpdate: () => anim.goToAndStop(p.f, true) });           // power2 = cubic in GSAP's naming
const last = anim.totalFrames - 1;
ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => to(last * 0.5, 0.9) });
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  el.addEventListener('pointerenter', () => to(last, 0.6));
  el.addEventListener('pointerleave', () => to(last * 0.5, 0.6));
} else {
  /* touch: play through on reveal instead of parking at half */
}
```
- The proxy tween can ease, reverse mid-flight and be overwritten; `playSegments` runs at the authored frame rate, linear, and moves the frame origin. Keep `playSegments` for event-shaped one-shots (an intro segment, a burst on click) where the authored timing is the point.
- Mixing both: after any `playSegments`, frame numbers passed to `goToAndStop` are segment-relative; call `resetSegments(true)` before scrubbing again [verified: source].
- Keep the scrub `ease: 'none'` and put feel in `scrub: <seconds>`; the audit's M03 judges the tween that owns the scrub.

## Canvas or SVG
- **svg** (default): the wiki calls it the most feature-complete renderer [verified: Context7 wiki]. Crisp at any size, scales with CSS through its viewBox, can take `title` / `description`, and sits in the page's compositing (blend modes, CSS filters on the wrapper). Cost grows with node count: every shape, mask and matte is a live DOM node repainted per frame [recalled]. Pick it for marks, icons and stickers with few layers, and when the element's size is fluid.
- **canvas**: one bitmap, resolution `container size × dpr` [verified: source CanvasRendererBase]. Cheaper for many shapes or heavy masking [recalled]; blurry if the container resizes without `anim.resize()` [inferred]; waits for image assets before `isLoaded`, which SVG does not [verified: source `checkLoaded`]. The default `dpr` is the device's (3 on many phones); pass `rendererSettings.dpr` from the quality tier [recipe:quality-tiers]. No title or desc: label the wrapper. Serotoninn's peeling sticker uses canvas [site:serotoninn].
- **html**: renders 3D layers [verified: Context7 wiki]; unused in the corpus; skip it.

## Reduced motion and accessibility
lottie-web has no reduced-motion handling of its own: `reduced` appears nowhere in the player source except an unrelated text-selector comment [verified: source]. Wire it to the shared switch [recipe:reduced-motion-switch] [pattern:accessibility-and-reduced-motion]:
- full: scrub or hover as above.
- reduced: `autoplay: false`, one `goToAndStop` to a meaningful poster frame (the end state, or the parked half for a sticker), no scrub and no hover tween; one-shot loaders show the final frame.
- static: skip the library; ship the poster frame as an inline SVG or image.
- Anything that loops or plays longer than five seconds unasked needs a pause control [recalled: WCAG 2.2.2].
- Decorative: `aria-hidden="true"` on the wrapper. Meaningful: SVG `title` / `description`, or `role="img"` plus `aria-label` on a canvas wrapper.

## When to prefer @lottiefiles/dotlottie-web
Pinned at 0.80.0 in `references/stacks/versions.md`. It draws to a `<canvas>` you pass in (`new DotLottie({ canvas, src, autoplay, loop })`), loads `.lottie` archives as well as JSON, pauses itself offscreen (`renderConfig.freezeOnOffscreen`, on by default), takes `renderConfig.devicePixelRatio` (full retina only when set explicitly), can move rendering to a worker (`DotLottieWorker`), and exposes `setFrame(n)`, `setSegment(a, b)`, `totalFrames`, `isLoaded` and a `load` event, plus state machines authored into the file [verified: Context7 dotlottie]. It renders through a WebAssembly module fetched at runtime [recalled].
- Prefer dotlottie-web for a heavy file (long, many shapes, big mattes), several instances on one page, a designer who ships `.lottie` with themes or state machines, or when the main thread is already busy with GL.
- Prefer lottie-web for a small mark that must stay crisp SVG, carry `title` / `desc` or take CSS, when no WASM request is wanted on the critical path, or when the file relies on After Effects expressions (dotlottie-web's expression support [unverified]).
- Ship one of the two, never both. Scrubbing reads the same with either: the proxy tween calls `setFrame` instead of `goToAndStop`.

## Pitfalls
- `autoplay` defaults to `true`: a scrubbed instance that forgets `autoplay: false` plays once on load and starts lottie's own rAF loop.
- `goToAndStop(n)` without `true` treats `n` as milliseconds; at 60 fps `goToAndStop(30)` lands near frame 2, not 30 [verified: source frame math].
- `playSegments` changes `firstFrame` / `totalFrames`; later scrubs are offset until `resetSegments(true)`.
- Calling `goToAndStop` before load is not lost, but reading `totalFrames` before `data_ready` is 0; build the scrub in `DOMLoaded`.
- The player does not pause offscreen and has no `visibilitychange` handling (neither appears in the source) [verified: source]. For anything that genuinely plays, `pause()` it from an IntersectionObserver.
- Canvas `dpr` defaults to the device ratio; cap it. After a container size change, call `anim.resize()` on canvas instances [inferred].
- Reusing one `animationData` object for several instances with repeaters: the README says to deep-clone it per instance [verified: Context7 README].
- Text layers pull fonts at runtime; recipes ship no font files, so have the designer convert text to shapes before export [recalled].
- Page transitions: `destroy()` each instance on leave; it tears down the renderer and its listeners [verified: source].
- Stripping a light build down only to find the file used expressions or the html renderer's 3D layers: check the export before choosing the build.

## Where the corpus used it
[site:serotoninn] (lottie-web 5.13.0, canvas renderer: the footer's "discount" sticker parks at half on reveal over .9 s, peels fully on hover over .6 s, returns on leave, fine pointers only; touch plays through) and [site:runrobrun] (lottie-web 5.13.0 for the running-man inside the grid preloader, JSON preloaded from `index.html`). No recipe in the catalogue wraps Lottie yet; the two snippets above are the reference shape.
