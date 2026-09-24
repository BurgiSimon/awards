# Spline viewer 2.0 (`@splinetool/viewer`)

<!-- Labels: [verified: source] = read in the published 2.0.56 tarball (`build/spline-viewer.js`, `build/spline-viewer.d.ts`, `README.md`, `package.json`), 2026-09 · [verified: Context7] = `/websites/spline_design` (docs.spline.design export and play-settings pages), 2026-09 · [recalled] · [unverified] · [inferred]. -->

## What it is for in this skill set
The designer-authored 3D moment: one object or small scene built and animated in the Spline editor, exported as a `.splinecode` file and dropped into the page as a `<spline-viewer>` custom element. It suits a "moments" WebGL dosage where the art is made in Spline and the site only has to place it, mount it late and show a still before it arrives [pattern:webgl-architecture]. It is not the rendering layer for the "HTML lays out, WebGL renders" architecture: it brings its own canvas, its own render loop and a runtime of about a megabyte compressed, and none of it runs on the shared ticker. When the scene has to answer scroll, Lenis velocity or DOM rects, write it in Three.js instead (see the last section).

## Install (pinned)
```sh
npm i @splinetool/viewer@2.0.56
```
```js
// Import once, on demand, and only if nobody defined the tag first (see pitfalls).
if (!customElements.get('spline-viewer')) await import('@splinetool/viewer');
```
- The package is ESM (`"type": "module"`); `exports` maps only `"."` to `build/spline-viewer.js` (import) and `build/spline-viewer.cjs` (require), typings in `build/spline-viewer.d.ts` [verified: source, package.json].
- The build is self-contained: no bare imports at the top of `spline-viewer.js`; Lit is bundled [verified: source]. It declares `lit@2.6.0` as its one dependency [verified: source, package.json].
- CDN form from the README: `<script type="module" src="https://cdn.spline.design/@splinetool/viewer/build/spline-viewer.js">`, pinned by writing `@splinetool/viewer@<version>` [verified: source, README]. Unpinned CDN URLs are how a site ends up with two versions; always pin.
- Engine builds: `build/spline-viewer.js` carries WebGPU and WebGL and picks per browser; `build/spline-viewer.webgl.js` is WebGL only (README: about 34 % smaller); `build/spline-viewer.webgpu.js` is WebGPU only and shows a "requires WebGPU" notice with no WebGL fallback [verified: source, README]. The single-engine files are not in the `exports` map, so an exports-aware bundler will refuse `import '@splinetool/viewer/build/spline-viewer.webgl.js'` [inferred from package.json]; load that file from the pinned CDN URL or copy it into `public/` [unverified].

## The API surface we use
Attributes (Lit properties on the `SplineViewer` class) [verified: source, d.ts and README unless noted]:
| Attribute | Default | Use |
|---|---|---|
| `url` | `null` | the `.splinecode` export URL. Setting it loads; setting it to `null` after a load unloads and disposes the runtime [verified: source, `updated()`] |
| `loading` | `auto` | `auto` / `lazy` wait for the element's own observer; `eager` loads as soon as `url` is set [verified: source, `load()` guard; Context7] |
| `width`, `height` | unset | fixed pixel size; unset, the host fills its box (`:host` 100 % × 100 %, `display: block`), so size the element in CSS |
| `background` | scene colour | CSS colour overriding the editor background |
| `renderer` | `auto` | `auto` / `webgpu` / `webgl` (`webgl2` aliases `webgl`); only meaningful on the dual-engine build; changing it after load rebuilds the canvas and reloads |
| `unloadable` | `false` | dispose the scene when the element leaves the viewport, reload on return |
| `events-target` | export setting | `local` (canvas) or `global` (window) pointer events |
| `hint` | export setting | drag-hint overlay until the first pointer interaction |
| `loading-anim-type` | unset | `spinner-small-dark` / `-light`, `spinner-big-dark` / `-light`; `loading-anim` is the deprecated boolean |

Events on the element [verified: source]: `load-start` (`detail.url`), `load-complete` (`detail.url`), `unload`, `viewport-intersection` (`detail.intersection: boolean`), `context-loss`. After a lost context the next in-viewport load recreates the canvas [verified: source, `_wasContextLost` → `recreateCanvas()`].

Behaviour worth knowing [verified: source]:
- The element's own `IntersectionObserver` uses `rootMargin: '0px'`, `threshold: 1e-5`: with `loading="auto"` the scene only starts fetching once a pixel of it is on screen.
- The canvas stays `visibility: hidden` until the scene has loaded.
- Light-DOM children are rendered through a `<slot>` inside `#slot`, absolutely positioned over the full host at `z-index: 2` with `pointer-events: none`, and that wrapper is set to `display: none` on load. A child `<img>` is therefore a built-in placeholder that disappears exactly when the scene appears.
- The Spline logo link (bottom right, 137 × 36 px) shows unless the scene's publish settings turn it off; removing it needs a Starter, Professional or Team subscription [verified: Context7, play-settings "Branding"].
- `disconnectedCallback` only unobserves; removing the element does not dispose the runtime. Unload by clearing `url` first.
- The runtime `Application` sits on a private `_spline` field; there is no public API for variables, events or camera on the element [verified: source, d.ts]. Programmatic control is `@splinetool/runtime` (or `@splinetool/react-spline`) with a code export, not the viewer [recalled].

## Integration with the others
```html
<!-- Markup: the still is the placeholder, the no-JS path and the reduced-motion path in one element -->
<figure class="signpost">
  <spline-viewer data-scene="https://prod.spline.design/<id>/scene.splinecode" loading="eager"
                 role="img" aria-label="A wooden signpost pointing up the trail">
    <img src="/img/signpost.avif" alt="" width="1200" height="1200" decoding="async">
  </spline-viewer>
</figure>
```
```js
// Lazy mount: our observer decides when, with a lead margin; the viewer's own observer is bypassed by loading="eager".
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;   // or the shared switch [recipe:reduced-motion-switch]
const io = new IntersectionObserver(async (entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    io.unobserve(e.target);
    if (!customElements.get('spline-viewer')) await import('@splinetool/viewer');
    e.target.url = e.target.dataset.scene;          // assigning url starts the load
  }
}, { rootMargin: '600px 0px' });
if (!reduced) document.querySelectorAll('spline-viewer[data-scene]').forEach((el) => io.observe(el));
```
- The `url` lives in `data-scene` so the element cannot load itself; the import happens in the observer so the runtime is not in the entry chunk. One import, one observer, every breakpoint (the to-top fix) [site:to-top].
- The observer margin is the hand-off: [site:to-top] used `rootMargin: '1000px 0px'`, `threshold: 0` and unobserved after the first mount [verified: to-top card]. Size the margin to the fetch, about one viewport of lead on a phone connection [inferred].
- Size the host with the still's aspect ratio in CSS (`aspect-ratio` on `.signpost spline-viewer`) so the swap causes no layout shift.
- Route changes: `el.url = null; await el.updateComplete; el.remove();` disposes before removal (`updateComplete` is Lit's) [verified: source for the unload path; `updateComplete` recalled].
- `load-complete` is the ready signal for a preloader or for `window.__awards.ready`; captures should wait on it, because the canvas is hidden until then.
- Captures and the audit count canvases in the light DOM; the viewer's canvas is in an open shadow root, so a manifest reports `canvases: 0` for a page that renders Spline [site:to-top] [inferred].
- Lenis and GSAP do not drive it: the runtime runs its own frame loop and pauses off-screen by its own observer [inferred: an internal `IntersectionObserver` sets `isInview` on the runtime's DOM element, source]. Scroll-linked Spline states have to be authored as Spline events inside the editor [recalled].

## Reduced motion and accessibility hooks
The viewer bundle contains no `prefers-reduced-motion` check and no `matchMedia` call [verified: source grep]; an authored idle animation keeps playing. The site owns the switch: under reduced motion, or in the static quality tier, never set `url`, so the still stays and the runtime is never downloaded [recipe:reduced-motion-switch] [recipe:quality-tiers]. The canvas has no text alternative; put `role="img"` and an `aria-label` on the host when the scene carries meaning, or keep the still's `alt` empty and the meaning in adjacent copy [inferred]. Scene interactions are pointer-driven and not keyboard-reachable [inferred]; never put required content or navigation inside a Spline scene. `events-target="global"` listens on the window, so the scene reacts to pointer movement anywhere; keep it local unless a look-at effect needs it.

## Performance rules
Bundle weight, measured on 2.0.56 [verified: source, gzip -c of each file]:
| File | Raw | gzip |
|---|---|---|
| `spline-viewer.js` (WebGPU + WebGL) | 3.4 MB | ≈ 964 KB |
| `spline-viewer.webgpu.js` | 2.6 MB | ≈ 775 KB |
| `spline-viewer.webgl.js` | 2.3 MB | ≈ 643 KB |
| lazy chunks (`physics.js` + 1.5 MB `physics.wasm`, `navmesh.js` + 344 KB `.wasm`, `process.js` + 322 KB `.wasm`, `opentype.js`, `boolean.js` + 158 KB `.wasm`, `hana-ui.wasm` 3.2 MB) | | loaded by `import('./…')` / `new URL('….wasm', import.meta.url)` |

The chunks load only when a scene needs them [inferred]; the `.splinecode` file itself comes on top. Record the runtime against the GL-chunk budget in `AWARDS.md` and log an exception if it exceeds it; a still plus one lazy scene is the only shape that stays inside a mobile budget. Export with the Performance geometry setting and image compression (the docs cite textures up to 4× smaller) [verified: Context7, optimisation page]. `unloadable` frees GPU memory on long pages at the cost of a reload flash on return; use it when two or more scenes share a page. Two viewers means two runtimes' worth of canvases and loops; one scene per page is the working rule [inferred].

## Gotchas
- **Duplicate define.** The class registers through Lit's `customElement('spline-viewer')` decorator, which calls `customElements.define` with no `customElements.get` guard [verified: source]. A second copy of the viewer (a second version, a CDN tag beside the npm import, or a Webflow embed plus a custom script) throws on load and the page logs an error on every profile, which is what [site:to-top] shipped with 1.10.40 and 1.10.32. Import once, behind the `customElements.get` guard, from one pinned URL.
- `loading="auto"` inside our own lazy mount double-gates: our observer sets `url` early, then the viewer waits again until the element is on screen. Set `loading="eager"` on elements we mount ourselves.
- The fallback `<img>` must be a child of `<spline-viewer>` to be auto-hidden; a sibling still has to be hidden on `load-complete` by hand, and stays visible if the load fails (which is the right failure).
- Unpinned CDN URLs float to the latest release; a major bump (1.x to 2.0 added the WebGPU engine and the `renderer` attribute) can change rendering under a shipped site [verified: source for 2.0's `renderer`; the 1.x feature set is recalled].
- On WebGPU-capable browsers the dual build may render with WebGPU while SwiftShader headless renders WebGL; captures do not prove what visitors see. Pin `renderer="webgl"` when a capture must match [inferred].
- The dev server's dependency pre-bundling can move the `new URL('….wasm', import.meta.url)` chunks away from the file that references them; if a scene with physics or text fails in dev only, exclude the package from `optimizeDeps` [unverified].

## When to prefer Three.js directly
Use [Three.js 0.186](three-0.186.md) instead when any of these hold: the scene is scrubbed by scroll or reads Lenis velocity; it must share one canvas with DOM-tethered planes or post-processing [recipe:gl-dom-tethered-planes]; the camera follows a virtual scroll [recipe:gl-virtual-scroll-camera]; a hero object needs inertia tuned in code [recipe:gl-hero-object-inertia]; the GL budget is under about 600 KB gzip for the runtime; or the reduced-motion tier needs a specific frozen frame rather than a pre-rendered still. Three with only the modules in use and a Draco/KTX2 glTF sits well under the viewer's floor [inferred]. Keep Spline for a self-contained, editor-authored moment that the page places and waits for, and for teams whose 3D artist works in Spline and will iterate after launch.

## Where the corpus used it
[site:to-top] — Webflow site importing `@splinetool/viewer` 1.10.40 and 1.10.32; one signpost scene mounted lazily on desktop by an `IntersectionObserver` (`rootMargin: '1000px 0px'`), a second `<spline-viewer>` eager in the mobile block, an AVIF still of the signpost beside it; the double import raised the "already defined" page error on every capture profile, and whether the scene ever rendered in a frame is [unknown] [verified: to-top card]. No other card in `references/sites/` names Spline (grep, 2026-09).
