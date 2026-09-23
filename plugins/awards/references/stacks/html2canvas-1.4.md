# html2canvas 1.4

<!-- Labels: [verified: Context7] = `/niklasvh/html2canvas` (docs/configuration.md, docs/features.md, docs/documentation.md, docs/faq.md, tests/reftests/options), 2026-09 · [verified: source] = read from `npm pack html2canvas@1.4.1` (dist/html2canvas.esm.js, dist/types/*.d.ts, package.json, README.md), 2026-09 · [verified: Context7 WICG] = `/wicg/html-in-canvas` (README IDL, Examples/webGL.html, security-privacy-questionnaire.md), 2026-09 · [verified: nodeck] = `.awards/research/nodeck/main-BqI5seD_.js` `_snapshot` · [inferred] = read off source behaviour, not documented · [recalled] · [unverified]. -->

## What it is for in this skill set
One job: rasterise a finished DOM node once, at the moment a transition starts, so a WebGL scene can take it over as a texture: crumple it, peel it, shatter it, drop it into a bin [site:nodeck]. The DOM stays the source of truth, the snapshot is a throwaway frame, and the effect always has a plain transition behind it [pattern:preloaders-and-transitions] [pattern:webgl-architecture]. It is not a live DOM-on-a-mesh technique (re-rendering per frame is far too slow, see Cost), not a screenshot tool for the jury (that is `scripts/capture.mjs`), and not for anything the user must read in the texture: the snapshot is decoration over a transition that already carries the content.

## Install (pinned)
```sh
npm i html2canvas@1.4.1
```
```js
// lazy: only when the effect first runs, never in the entry chunk
const { default: html2canvas } = await import('html2canvas');
```
`module` → `dist/html2canvas.esm.js`, typings in `dist/types/index.d.ts`; MIT; two runtime deps, `css-line-break` and `text-segmentation` [verified: source]. 1.4.1 was published 2022-01-22 and is still the latest release [verified: `npm view html2canvas time`]. The README calls the library "very experimental" and not recommended for production [verified: source README]; treat it as frozen. `html2canvas-pro` is a maintained fork [verified: Context7 listing]; its extra colour support is [unverified] here.

## The API surface we use
`html2canvas(element, options?) → Promise<HTMLCanvasElement>`; one call, no instance [verified: source index.d.ts].

Options that matter for a texture snapshot [verified: Context7 configuration.md; defaults re-checked in source `renderElement`]:
| Option | Default | Use |
|---|---|---|
| `scale` | `window.devicePixelRatio` | clamp: `Math.min(devicePixelRatio, 2)`, lower on the low quality tier. Canvas pixels are `width × scale` by `height × scale` |
| `backgroundColor` | `#ffffff` | `null` for transparent; otherwise the colour fills only when the DOM supplies none. `null` plus your own fill on a second canvas gives a controlled ground [verified: nodeck] |
| `useCORS` | `false` | `true` to try CORS loads for cross-origin `<img>`; each image still needs `Access-Control-Allow-Origin`, else it is skipped |
| `allowTaint` | `false` | keep `false`: a tainted canvas cannot be uploaded to WebGL [recalled: WebGL same-origin rule] |
| `ignoreElements` | `(el) => false` | predicate over each element while the document is cloned; `true` removes it from the render. `data-html2canvas-ignore` on the element does the same without a function [verified: source `IGNORE_ATTRIBUTE`]; `<script>` is always skipped |
| `onclone` | `null` | `(clonedDocument, clonedElement) => void` runs on the clone after fonts are ready; restyle for the snapshot (drop a pattern, set transparent grounds, finish a half-played reveal) without touching the live page |
| `imageTimeout` | `15000` | ms per image; lower it (2000–3000) so one stuck image cannot hold the transition for 15 s |
| `logging` | `true` | set `false`; it logs every stage to the console otherwise |
| `windowWidth`, `windowHeight` | `innerWidth`, `innerHeight` | viewport of the clone, which drives media queries; pass `documentElement.clientWidth/Height` to exclude the scrollbar [verified: nodeck] |
| `width`, `height`, `x`, `y` | element box | crop; rarely needed for a single node |
| `canvas` | `null` | draw into an existing canvas instead of allocating |
| `foreignObjectRendering` | `false` | SVG `foreignObject` path: the browser paints, so CSS fidelity is higher, but it inlines every image and copies every style [verified: source `inlineImages`, `copyStyles`]; Safari's canvas-taint behaviour on it is [unverified]; leave off unless a test shows it paints what the default cannot |
| `removeContainer` | `true` | keep; `false` leaves the clone iframe in the DOM |

## Integration with the others
```js
// DOM → CanvasTexture, once, with a way out [site:nodeck] shape, reduced to its parts
async function snapshot(node) {
  const { default: html2canvas } = await import('html2canvas');
  return html2canvas(node, {
    scale: Math.min(devicePixelRatio || 1, 2),
    backgroundColor: null,
    useCORS: true,
    logging: false,
    imageTimeout: 3000,
    ignoreElements: (el) => el.tagName === 'VIDEO' || el.tagName === 'IFRAME',
    onclone: (doc) => doc.documentElement.classList.add('is-snapshot'),  // CSS hook for snapshot-only styles
  });
}

let tex = null;
try {
  const canvas = await snapshot(slide);
  tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;   // colour map [recalled: three-0.186.md rule]
} catch { tex = null; }
if (!tex) return plainTransition();         // the page changes either way
```
- Three.js: the texture maps onto a segmented plane sized to the node's `getBoundingClientRect()` so the first GL frame lines up with the last DOM frame; hide the DOM node in the same frame the canvas appears [pattern:webgl-architecture]. `tex.dispose()` and drop the canvas when the effect ends.
- GSAP: start the timeline only after the promise settles; the snapshot is async and variable (see Cost). Preload the chunk (a `modulepreload` or an early `import()` on idle) so the first run does not also pay the download [verified: nodeck card].
- Nodeck's version: adds a `paper-transition-capture` class for the capture, snapshots at DPR ≤ 2 with `backgroundColor: null`, `useCORS: true`, `logging: false`, hides its background pattern and clears slide grounds in `onclone`, then paints the result over a fill of the slide colour on a second canvas [verified: nodeck].

## What it cannot render
It re-implements painting, not a screenshot: the browser lays out a cloned copy of the whole document in a hidden iframe, then html2canvas reads boxes and computed styles and redraws every box, border, background and text run with 2D canvas calls [verified: source `DocumentCloner.toIFrame`, `parseTree`, `CanvasRenderer`]. Whatever it has no painter for is dropped or approximated.
- Not supported per its own list: `filter`, `mix-blend-mode`, `background-blend-mode`, `object-fit`, `border-image`, `writing-mode`, `repeating-linear-gradient()`, `zoom`, `font-variant-ligatures`, `box-decoration-break` [verified: Context7 features.md]. The same list names `box-shadow`, but 1.4.1 paints it, inset and spread included, through canvas `shadowBlur` [verified: source `boxShadow` painter]; the doc is stale there, so hard offset shadows like nodeck's should survive [inferred].
- `background-clip: text` is not supported, `text-decoration-style` paints only `solid`, `transform` is "limited" [verified: Context7 features.md]. In source only `matrix()` and `matrix3d()` computed values parse, and `matrix3d` is flattened to its 2D terms: perspective and 3D rotation vanish [verified: source comment "doesn't support 3D transforms"].
- Absent from the supported list, so expect them missing: `clip-path`, `mask`, `backdrop-filter`, `conic-gradient()` [inferred: features.md]. `conic-gradient()` is worse than missing: an image function outside `linear-` / `radial-gradient` throws "unsupported image function" and rejects the whole render [verified: source `SUPPORTED_IMAGE_FUNCTIONS`].
- Colour functions: only `rgb()`, `rgba()`, `hsl()`, `hsla()` and hex parse; anything else throws "unsupported color function" and rejects the render [verified: source `SUPPORTED_COLOR_FUNCTIONS`]. Browsers keep `oklch()`, `lab()` and `color()` in computed values rather than converting to `rgb()` [recalled], so an award-style token set in OKLCH breaks it. The `html` and `body` backgrounds are parsed on every call whatever the target [verified: source `parseBackgroundColor`], so an OKLCH page ground rejects every snapshot. Snapshot targets need sRGB fallbacks, set in `onclone` if the live page keeps OKLCH.
- Cross-origin images without CORS headers are skipped; iframes render blank; other canvases are copied only if readable, and a WebGL canvas without `preserveDrawingBuffer: true` comes out empty [verified: source `createCanvasClone` warning]. Video contributes its current frame, or nothing if cross-origin [verified: source `createVideoClone`].
- Mid-animation state: the clone copies computed styles at call time, so a half-played SplitText reveal or a `will-change` layer is captured as it stands; settle the node (or restyle it in `onclone`) first [inferred].

## Cost
- The whole document is cloned, not just the target: `new DocumentCloner` starts from `ownerDocument.documentElement` and walks every node, then the iframe loads and waits for `document.fonts.ready` (and, on WebKit, every image) before anything paints [verified: source]. Cost scales with the page as well as the node; `ignoreElements` / `data-html2canvas-ignore` on heavy unrelated subtrees (a GL canvas, a long archive, video) cuts the clone. The predicate runs per element, so keep it a tag or attribute test.
- Parse and paint run on the main thread with no chunking [inferred: source flow]; a full-viewport slide at DPR 2 costs from tens to hundreds of milliseconds on a laptop and more on phones [unverified: not measured in this pass]. Never call it inside a frame loop or on scroll.
- Memory: the canvas is `width × height × scale²` × 4 bytes, and the texture upload doubles it on the GPU [recalled]. A 1440 × 900 node at scale 2 is about 20 MB before upload. Mobile Safari caps canvas area and GL textures (`MAX_TEXTURE_SIZE`, often 4096 on phones) [recalled]; clamp `scale` so `width × scale` stays under the cap.
- Bundle: `dist/html2canvas.min.js` is 199 KB raw, 46 KB gzipped [verified: source, measured]; nodeck's lazy chunk was 201 KB raw [verified: nodeck card]. Lazy-load only.

## Fallback when it throws
It rejects with strings as well as `Error`s ("Invalid element provided as first argument", "Unable to find element in cloned iframe", "Unable to find iframe window"; `Error`s for detached elements, unsupported colours, images and transform functions) [verified: source `renderElement`, parsers]. So:
- Catch everything and treat any failure as "no snapshot": run the plain transition, and the page still changes [verified: nodeck `catch` falls through to its callbacks].
- Race it: `Promise.race([snapshot(node), timeout(1500)])` so a slow device degrades to the plain transition instead of stalling the click [inferred].
- Reduced motion never calls it: the reduced and static tiers take the plain transition directly [pattern:motion-vocabulary]. No WebGL, low quality tier or a failed probe → the same.
- If the texture is built but the scene fails, dispose both before falling through, as nodeck's `_disposeThree()` does [verified: nodeck].

## The future path: WICG HTML-in-Canvas
The WICG proposal lets the browser paint real DOM into a canvas: children of a `<canvas layoutsubtree>` are laid out and stay interactive and accessible, a `paint` event fires when they change, `ctx.drawElementImage(el, x, y)` draws one into 2D and returns the transform to sync its hit-testing, `gl.texElementImage2D(target, internalformat, el)` uploads it to WebGL, `GPUQueue.copyElementImageToTexture` to WebGPU, and `captureElementImage()` hands a transferable `ElementImage` to a worker [verified: Context7 WICG README IDL, Examples/webGL.html]. Cross-origin content, visited-link state, spellcheck and autofill previews are never painted [verified: Context7 WICG security questionnaire]. It fixes each of html2canvas's limits (the browser's own painter, live per-frame updates, no clone), but it is a proposal behind a Chromium flag or origin trial with an IDL still changing (the WebGL example carries a shim for the old `texElementImage2D` signature) [verified: Context7 WICG Examples/webGL.html]; which browsers ship it today is [unverified]. Use it as progressive enhancement: feature-detect `'drawElementImage' in CanvasRenderingContext2D.prototype` (or `texElementImage2D` on the GL context), take it when present, html2canvas when not, the plain transition when both fail. The `html-in-canvas` skill covers the API in depth.

## Gotchas
- An OKLCH, `lab()` or `color()` token anywhere on the snapshot path, including the page ground, rejects the render (see above).
- `logging` defaults to `true`: production consoles fill with its debug lines.
- `scale` defaults to the raw DPR, so a DPR-3 phone allocates 9× the pixels; always clamp.
- Web fonts: the clone awaits `document.fonts.ready`, but a face never used on the page before the snapshot may still fall back [inferred]; snapshot after the real text has painted once.
- Scroll offset: the clone scrolls to `scrollX` / `scrollY`, which default to the page offset; with Lenis or a virtual scroller, snapshot a node whose box is on screen, or pass explicit values [verified: source `windowOptions`; Lenis interplay inferred].
- Fixed or transformed ancestors shift the crop; snapshot the transformed node's untransformed child, or neutralise the ancestor transform in `onclone` [inferred].
- The iOS scroll-restore warning ("Unable to restore scroll position for cloned document") means the clone scrolled differently; html2canvas adjusts for it, but check the crop on a real iPhone [verified: source].
- A canvas made with `allowTaint: true` throws on `texImage2D` [recalled].

## Where the corpus used it
[site:nodeck] only: html2canvas, version unread, imported with Three.js r185 in one `Promise.all` the first time the closing crumple runs, rasterising the outgoing slide at DPR ≤ 2 into a `CanvasTexture` on a 48 × 36-segment plane that crumples into a paper ball and falls into a bin; any failure falls through to the plain slide change [verified: nodeck card]. No other card in `references/sites/` names it (grep, 2026-09).
