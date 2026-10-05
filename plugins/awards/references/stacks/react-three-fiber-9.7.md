# React Three Fiber 9.7

<!-- Labels: [verified: Context7] = checked against Context7 `/pmndrs/react-three-fiber` (docs/API/canvas.mdx, docs/API/hooks.mdx, docs/API/objects.mdx, docs/advanced/pitfalls.mdx, docs/advanced/scaling-performance.mdx, docs/tutorials/v9-migration-guide.mdx), 2026-10 · [verified: npm] = `npm view @react-three/fiber`, 2026-10 · [recalled] · [unverified]. Pinned at 9.7.0 by `stacks/versions.md`; latest on npm is 9.8.1 (2026-09-24), whose peer range widens React to `<19.4` [verified: npm]. -->

## What it is for in this skill set
The React renderer for three: scene graph as JSX, a managed renderer, camera, resize and pointer events, and a frame loop hooks can join. Use it when the build is already React (Next) and the WebGL is a component among components: one fixed ambient canvas under every route [site:bethebuzz], a product scene with glTF and post [site:haoqi], several scroll-gated "moment" canvases [site:eugeniagrab], an interactive globe in one section [site:seasats]. It is not a reason to choose React; a Vite, Astro or Nuxt build stays on plain three [recipe:gl-dom-tethered-planes]. The shader, colour-space and disposal rules of `stacks/three-0.186.md` apply unchanged: R3F creates three objects, it does not replace them.

## Install (pinned)
```sh
npm i @react-three/fiber@9.7.0 three@0.186.0 react@19 react-dom@19
npm i @react-three/drei@10.7.8          # only when a helper is actually used
```
Peer range of 9.7.0: `react` and `react-dom` `>=19 <19.3`, `three >=0.156` [verified: npm]. v9 is the React 19 line; React 18 projects stay on v8 [recalled]. In Next, the canvas lives in a `'use client'` component, usually loaded with `next/dynamic` and `ssr: false` [recalled].

## The API surface we use
`<Canvas>` props [verified: Context7, canvas.mdx]:
| Prop | Default | Use |
|---|---|---|
| `frameloop` | `'always'` | `'always'`, `'demand'` (render only on prop changes or `invalidate()`), `'never'` (drive with `advance()`) |
| `dpr` | `[1, 2]` | number or `[min, max]`; the corpus caps lower: `[1, 1.35]` [site:eugeniagrab], `[1, 2]` [site:haoqi] |
| `gl` | `{}` | renderer props, or a sync/async callback `(defaults) => new Renderer(defaults)`; v9 passes constructor params, not the canvas [verified: v9 migration guide] |
| `camera` | `{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }` | props for the default camera or your own `THREE.Camera` |
| `flat` | `false` | `true` uses `NoToneMapping` instead of ACES Filmic; set it for image planes and graded art that must not shift |
| `linear` | `false` | switches off automatic sRGB output; leave off |
| `shadows`, `orthographic`, `scene`, `raycaster` | off / `{}` | as named |
| `resize` | `{ scroll: true, debounce: { scroll: 50, resize: 0 } }` | react-use-measure options |
| `eventSource`, `eventPrefix` | parent node, `'offset'` | point events at a wrapper so a fixed canvas behind DOM still receives pointers |
| `fallback` | — | DOM shown when WebGL is unavailable |
| `onCreated` | — | `(state) => …` after first render; warm-ups such as `gl.compile` go here |
| `performance` | `{ current: 1, min: 0.1, max: 1, debounce: 200 }` | `regress()` drops `current` to `min` until `debounce` passes [verified: scaling-performance.mdx] |

Hooks and state [verified: Context7, hooks.mdx]:
- `useFrame((state, delta) => …, priority?)`: per-frame callback; mutate refs, scale by `delta`. A numeric priority above 0 turns off automatic rendering: you call `gl.render` (or a composer) yourself; callbacks run in ascending priority.
- `useThree()` / `useThree((s) => s.x)`: `gl`, `scene`, `camera`, `size`, `viewport`, `pointer`, `clock`, `invalidate`, `advance(timestamp, runGlobalEffects?)`, `setDpr`, `setFrameloop`, `set`, `get`, `performance`.
- `useLoader(GLTFLoader, url, (loader) => …)` caches per URL; the third argument configures extensions (DRACOLoader); `useLoader.preload(Loader, url)` fetches before mount.
- `extend({ ... })` registers non-core classes as JSX elements; `extend(THREE)` from `three/webgpu` for the async WebGPU renderer.
- Unmounted objects are disposed automatically; `dispose={null}` on a parent opts a cached subtree out [verified: objects.mdx].
- `CanvasProps` replaces v8's `Props` type [verified: v9 migration guide].

## Integration with the others
```jsx
// One clock: GSAP's ticker drives Lenis and R3F [verified: frameloop never + advance, hooks.mdx; ticker wiring per stacks/lenis-1.3.md]
<Canvas frameloop="never" onCreated={({ advance }) => gsap.ticker.add((t) => advance(t * 1000))} />
```
- Scroll-gated moments, the [site:eugeniagrab] pattern: `setFrameloop('always')` while the section intersects, `'demand'` otherwise, and `invalidate()` from each ScrollTrigger update. Same pixels, no idle GPU.
- Lenis values (`scroll`, `velocity`) are read inside `useFrame` from a ref, never through React state [recipe:boot-lenis-gsap].
- A canvas that persists across routes sits in the Next root layout, outside the page that transitions [site:bethebuzz] (persistence [inferred] on that card).
- `window.__awards.ready` should wait for `onCreated` plus the first loaded glTF, or captures shoot an empty frame (the [site:seasats] blank globe frame).

## Reduced motion and accessibility hooks
Under `prefers-reduced-motion`, set `frameloop="demand"` and render a settled pose; ambient drift stops, the scene stays [recalled pattern]. The canvas is decorative unless it carries content: `aria-hidden` on its wrapper and a DOM equivalent for anything readable (the [site:seasats] filters are real `<button>`s). Keep `fallback` for no-WebGL, and a GPU-tier gate with a CSS fallback where the canvas is ambient [site:bethebuzz].

## Performance rules
- No `setState` in `useFrame`; mutate refs, use `delta` [verified: pitfalls.mdx].
- Pre-allocate vectors and reuse them in the loop [verified: pitfalls.mdx].
- Load through `useLoader`/drei, never a bare `TextureLoader` in `useEffect`: it re-fetches per instance [verified: pitfalls.mdx].
- `frameloop="demand"` for anything static between interactions, `invalidate()` from controls' `change` event [verified: scaling-performance.mdx].
- Cap `dpr` per tier; pair with `performance.regress()` during camera moves.
- Budget the bundle: three + R3F is several hundred KB gzipped ([site:haoqi] ships about 307 KB gzipped for that chunk, loaded up front); lazy-load the canvas below the fold.

## Gotchas
- Default `flat: false` means ACES tone mapping on everything: photos and brand colours shift unless `flat` is set.
- A positive `useFrame` priority anywhere silences the automatic render; one forgotten callback blacks out the canvas.
- `frameloop="never"` without an `advance` caller renders nothing; `invalidate()` does nothing outside `'demand'`.
- Multiple canvases each own a WebGL context; five on one page ([site:eugeniagrab]) is near the practical ceiling on mobile browsers [recalled].
- Custom `ShaderMaterial` still needs `#include <colorspace_fragment>` (see CLAUDE.md conventions).
- Peer range: 9.7.0 refuses React 19.3; upgrade R3F with React, not after [verified: npm].

## Where the corpus used it
[site:eugeniagrab] (R3F over three r148, React 18, so the v8 line [inferred]: several R3F canvases beside a hand-written WebGL1 hero, `frameloop` always while visible and demand plus `invalidate` otherwise, DPR `[1, 1.35]`), [site:haoqi] (R3F 9.6.1 on three r184 in Next 16, pmndrs postprocessing, `dpr [1, 2]`), [site:bethebuzz] (one fixed R3F cloth canvas in the Next 14 layout, three r162 + custom-shader-material), [site:seasats] (one interactive R3F globe in Next). Checked and absent: [site:oryzo], [site:floema], [site:lama-lama], [site:white-desert], [site:son-daven]; [site:usavionix] withdrew its R3F guess to [unknown].
