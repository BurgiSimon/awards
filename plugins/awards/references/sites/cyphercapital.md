# Cypher Capital — https://www.cyphercapital.com/

| Field | Value |
|---|---|
| Class | B2B service (institutional asset manager and proprietary investor, Zurich / Dubai) |
| Visitor mode | persuade |
| Awards | none found; no award entry searched beyond the page itself [unknown] |
| Corpus rating | D 7.4 / U 7.3 / C 7.0 / Co 6.8 → weighted 7.23, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | no credit line in the served HTML or bundles [unknown] |
| Stack (evidence level) | **Next.js 16.3.4** (`version:"16.3.4"` in 2yvvgf40x1m_z.js; `/_next/static/immutable/`, Turbopack runtime chunk) [verified] · React 19.3 canary bundled by Next [verified, 1x-ns8xgajh0k.js] · **hand-written WebGL2**, four programs in four modules, no rendering library [verified, src/*.js: no three / ogl / gsap / lenis signature] · no animation or smooth-scroll library [verified absent] · CSS-module reveals on IntersectionObserver [verified, 0o58vscpmto9m.js `RevealGroup`] · Vercel hosting [verified, DNS answer `vercel-dns-016.com`] · Instrument Sans, self-hosted WOFF2 preload [verified, index.html + CSS] |
| Palette | Two tokens inverted by scroll theme, chroma only from shaders [verified, CSS + ThemeScroll in 017nsmwnqk5nu.js]. Ink and ground below; strategy: two tokens + iridescent material |
| Type | One family, Instrument Sans (with a metric-matched fallback face), display 5 / 4 / 3 / 2.5 rem at line-height 1–1.05, tracking −.016 to −.03 em; footer wordmark `clamp(… 24vw …)` [verified, 1p0sg1zbyknre.css tokens] |
| WebGL dosage | moments — chrome-symbol intro, liquid-metal hero pipes, a metallic swirl behind the dark chapters; one shared offscreen context for word sheens [verified, src/*.js; manifest.json 2 canvases at load] |
| Scroll model | native, no smoothing library; one IntersectionObserver flips `data-theme="dark"` at the 50 % line [verified, 017nsmwnqk5nu.js `ThemeScroll`; manifest scrollMode native] |
| Narrative model | specification — symbol intro → claim hero over chrome pipes → capabilities (asset management, proprietary, venture) → infrastructure on a dark swirl → values → link-heavy footer + wordmark |

Ink and ground hexes, for the record only:
`#181818` ink / dark ground [verified, 1p0sg1zbyknre.css `--base-color-ink`]
`#ffffff` light ground [verified, 1p0sg1zbyknre.css `--color-background-100`]
`#a8d2ff` swirl stripe colour A [verified, 017nsmwnqk5nu.js swirl preset]

## 1. Concept and narrative
One image carries the brand: capital as branching pipes of liquid chrome that merge into a single stream, a literal "bridge" drawn in material rather than in diagrams [verified, wait/desktop-s00.png, desktop-rm-s00.png]. The page opens on the brand symbol extruded in chrome between the two words of the name [verified, desktop-s00.png, mobile-s00.png], hands off to a left-set claim over the pipes, then reads as a quiet institutional specification: product lines with one-sentence summaries, an infrastructure chapter that turns the page dark, three values with pictograms, and a long regulatory footer [verified, desktop-rm-s25 … s75.png, desktop-s100.png]. Copy register is institutional and claim-light; the one playful note is a footer row inviting the visitor to ask four AI assistants about the firm [verified, desktop-s100.png, index.html].

## 2. Structure and components
- **Intro overlay**: the brand symbol rendered as raymarched chrome between the two name words; it holds through the first ≈ 2 s of a cold load (s00 and s25 identical in the default capture), the hero appears with a 6 s wait [verified, desktop-s00/s25.png, wait/desktop-s00.png]. Whether it is skipped on repeat visits [unknown].
- **Regional gate**: a UAE acknowledgement dialog behind `data-gated`, background set `inert`, a one-year cookie, an exit button to a search engine; not shown from the capture location [verified, 0e-7k729jbnm9.js; display condition inferred].
- **Nav**: logo + name left, a centred "Menu" label; a fullscreen menu with Escape handling [verified, desktop-rm-s00.png, 2yvvgf40x1m_z.js].
- **Capability rows**: hairline-ruled two-column lists with a centred section label sitting on the rule; one "Coming soon" chip [verified, desktop-rm-s25.png].
- **Theme flip**: the infrastructure chapter turns the whole document dark and the swirl canvas starts [verified, desktop-s50.png, 017nsmwnqk5nu.js].
- **Values**: three columns, each a filled pictogram over a rule, title and two lines [verified, desktop-rm-s75.png].
- **Footer**: five large route links, six small ones, the four AI-assistant links, a dense legal paragraph and a full-width split wordmark close [verified, desktop-s100.png, mobile-s100.png]. Skip link present [verified, index.html].

## 3. Visual language
Paper-white ground and near-black ink with mid-grey secondary copy; the only colour on the page is the thin-film iridescence on chrome (pink, cyan, amber fringes) and the pale blue of the swirl [verified, wait/desktop-s00.png, mobile-s25.png]. One grotesque throughout at tight negative tracking; display sizes step 80 / 64 / 48 / 40 px and the footer wordmark spans the measure [verified, CSS tokens, desktop-s100.png]. Layout is a two-column grid with 32 px gutters and hairline rules; section labels sit centred on the rule [verified, desktop-rm-s25.png]. Browser surfaces: `scrollbar-width: thin` with a 20 % ink thumb, `scrollbar-gutter: stable` [verified, CSS]. Pictograms in the values row are generic (pawn, shield, globe) [verified, desktop-rm-s75.png].

## 4. Motion and effects (with parameters)
- **Duration tokens**: instant 0, fast .1 s, normal .2 s, slow .3 s, slower .5 s, theme .4 s; curves include `cubic-bezier(.16, 1, .3, 1)` and `(.2, 0, 0, 1)` [verified, 1p0sg1zbyknre.css].
- **Text reveals**: CSS-module classes toggled once by IntersectionObserver at rootMargin `0 0 -7% 0`; reduced motion marks every group in view at once [verified, 0o58vscpmto9m.js `RevealGroup`]. The default desktop s50 / s75 frames catch headings mid-reveal [verified, desktop-s50.png, desktop-s75.png].
- **Hero pipes**: four branches revealed as trim paths, stagger .13 s, 2.5 s each, cubic in-out, then a liquid-metal flow at speed .48 [verified, 36q7q1rqyugz1.js]; see the lens.
- **Swirl**: no free-running time; its phase eases toward a target at rate 6 / s (`1 − e^(−6t)`) [verified, 017nsmwnqk5nu.js]; what sets the target (scroll) [inferred].
- No smooth scroll, no pin, no cursor effect, no sound [verified absent, src/*.js].

## 5. Tech and pipeline
Next 16 App Router build, CSS modules, no motion library: every moving thing is either a CSS transition or one of four raw WebGL2 programs [verified, src/*.js]. First-party text weight fetched: 891 KB across 17 JS and 4 CSS chunks; the four WebGL modules are 3–44 KB each [verified, file sizes]. **No texture, model or image is downloaded for any effect**: the hero mask is built at runtime in a module Worker from bezier branch paths, and the logo field from its SVG path [verified, 36q7q1rqyugz1.js `buildLiquidMask`, "mask worker failed"]. Every loop pauses on IntersectionObserver and `visibilitychange`, disposes its textures and calls `WEBGL_lose_context` on unmount, and handles `webglcontextlost` [verified, src/*.js]. Programs are linked asynchronously and polled each frame for completion before first draw (`isProgramComplete`) [verified; that this rides `KHR_parallel_shader_compile` is inferred]. CLS .0007 desktop [verified, manifest.json; headless].

### Tech lens: WebGL
- **Library**: none; four `getContext("webgl2")` sites, `antialias false, depth false, stencil false, premultipliedAlpha true` except the swirl (`antialias true`) [verified, src/*.js].
- **Canvas model**: one DOM canvas per effect (hero, intro symbol, swirl) plus one detached canvas shared by every sheen word, which `drawImage`s into per-word 2D canvases [verified, 0o58vscpmto9m.js]. The intro symbol renders in a Worker through `transferControlToOffscreen`, falling back to the main thread after a 1 200 ms hello timeout [verified, 36q7q1rqyugz1.js].
- **Hero pipes (fullscreen, one big triangle from `gl_VertexID`)**: samples three runtime textures — `u_image` RGBA8 linear (coverage and branch shade), `u_meta` RGBA8 nearest (branch id in R, 16-bit arc length across G/B), `u_edge` R16F (0 on the centreline, 1 at the sides, R32F fallback) read with a 4-tap bicubic B-spline [verified, 36q7q1rqyugz1.js]. Mask width 2048 when `max(vw, vh × 1.25) ≥ 1024`, else 1024; stroke 151.074 in a 1440 × 810 viewbox, overflow 1.25 [verified].
- **Trim-path reveal**: per-branch `u_branchReveal[4]`; `front = arcLength + feather × edge`, `visible = 1 − smoothstep(reveal − feather, reveal, front)`, so the tip rounds like a cap; feather .2, reveal driven to `ease × (1 + 2 × feather + .02)` [verified].
- **Liquid-metal stripes**: stripe phase from a rotated diagonal ramp bent by a radial bump and 2D simplex noise; three channels offset for dispersion. Values: repetition 1.79, softness 1, shiftRed .61, shiftBlue .33, shadowBlue .075, distortion .07, contour .97, angle 0, flow 1, speed .48 [verified, `HERO_LIQUID_EFFECT`]. The stripe helper and parameter names match Paper Design's liquid-metal shader [inferred].
- **Stripe anti-aliasing**: `fwidth` of the continuous phase, clamped at `.2 × blur` until it exceeds 4–12× that, then passed through; coverage re-thresholded as `(g − .5) / fwidth(g) + .5` [verified]. Interleaved gradient noise dither (`52.9829189`) in three of four programs [verified].
- **Chrome symbol (raymarched SDF)**: the SVG path rasterised to an R16F distance field at 384 px per unit, padding .28, band .09; extruded with depth .09, bevel .032 (from .112 / .044); 96 steps, hit 2e-4; 4-tap AO; procedural sky/ground environment with key light at elevation 34° and fill at azimuth 118° / elevation 8°; Schlick Fresnel on tint (.95, .955, .97); Narkowicz ACES fit, exposure 1.05, gamma 1/2.2 [verified, 3dd6fkxzk3diu.js `CHROME_SYMBOL_DEFAULTS`]. Intro: delay .12 s, depth .8 s `[0,0,0,1]`, blend 1.5 s `[.5,0,0,1]`, spin period 2 s from yaw −90° [verified, `CHROME_SYMBOL_INTRO`].
- **Metallic swirl (fullscreen quad)**: 12-iteration loop capped at 2 of sine-wave gradient advection (tangent .83, gradient .27, eps .14) in log-polar space with 5 beams, twist −.19, vortex −.55; colour by striped dispersion (repetition 3, shiftRed .3, shiftBlue .2) [verified, 017nsmwnqk5nu.js preset 0; three presets total].
- **Word sheen**: glyphs drawn with `fillText` into a 2D canvas as the mask; 3-octave 3D simplex fbm domain warp, unit 5 em, speed .75, warp .1, seed 204, `lit (.93, .96, 1)` chroma 1 on light, `(.82, .86, .95)` chroma .5 on dark [verified, 0o58vscpmto9m.js]. Not used on the home route [verified absent, index.html].
- **Render targets / post**: none; tone map, gamma and dither are inline [verified, no `createFramebuffer`].
- **DPR and budget**: hero DPR ≤ 2 and ≤ 12.5 MP total; symbol and sheen ≤ 2; swirl ≤ 1.5 [verified].
- **Fallback**: reduced motion or any WebGL failure shows three static SVG strokes (`#868383` / `#383838` / `#000000` [verified, 017nsmwnqk5nu.js]) and skips the symbol [verified, desktop-rm-s00.png].

## 6. Weaknesses
- **Reduced motion: pass.** Hero, copy and values read at rest; pipes become flat SVG bands [verified, desktop-rm-s00 … s75.png].
- **Keyboard: pass.** Skip link, Escape on the menu, inert background on the gate [verified, index.html, src/*.js].
- **DOM behind the canvas: pass.** All copy is real HTML; canvases are `aria-hidden` [verified, 017nsmwnqk5nu.js].
- **Load gate: partial.** The chrome intro holds the first ≈ 2 s before the claim; repeat-visit skip [unknown] [verified, desktop-s25.png].
- **The phone: pass.** Stacked symbol intro, single-column copy, the same chrome [verified, mobile-s00 … s100.png].
- **Wayfinding and conversion: partial.** No chapter indicator; contact sits only in the menu and footer [verified, captures].
- **Craft**: mid-reveal headings stay faint for a long beat at s50 / s75; stock pictograms in the values row [verified, desktop-s75.png, mobile-s75.png].

What the awards skills do differently: cap the intro at one beat and skip it from `sessionStorage`; give every chapter a visible index; commission the pictograms in the same chrome language as the hero.

## 7. Principles
1. Draw the business model as one material behaviour, so the hero argues before any copy does.
2. Generate masks and fields at runtime from vector paths: zero texture bytes, sharp at any DPR.
3. Encode order in the data, not in a timeline — an arc-length channel turns any path set into a trim-path reveal.
4. Keep the effect palette to one material and let the page stay two tokens.
5. A real fallback is a designed still in the same composition, not an empty canvas.

## 8. Take / Don't take
- **Take:** arc length packed into two 8-bit channels for per-branch reveals with a feathered, edge-bowed front; a bicubic read of a float edge field for smooth crease shading; coverage re-thresholded by `fwidth`; raymarching a 2D SDF extruded with a bevel for a logo object without a model file; a 12.5 MP pixel budget beside the DPR cap; one detached context shared by many small 2D canvases; Worker + OffscreenCanvas with a timed main-thread fallback.
- **Don't take:** the merging-pipe composition, the symbol-between-words intro, the liquid-metal parameter set as the signature, the ask-your-AI footer row, the two-token hexes (`#181818` [verified, CSS]) with iridescent chrome as a combination, the capability-row order or copy.

## 9. Confidence and sources
Header, stack and lens high (literal values from first-party bundles and CSS) · structure high from captures · motion medium (CSS reveal timings not traced) · awards unknown · rating inferred.

**Live pass 2026-10-05: reachable; robots.txt `Allow: /` with `Content-Signal: ai-input=yes, ai-train=no`, no AI-usage file (404); capture exit 0, native scroll, all states by scroll, plus a `--wait 6000` desktop rerun for the post-intro hero. Sources: index.html, 17 JS + 4 CSS first-party chunks, manifest.json, 18 captures.** LCP figures are headless cold-cache artefacts, not a performance claim.
