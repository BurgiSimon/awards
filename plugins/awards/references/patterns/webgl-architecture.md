# WebGL architecture

What this file is for: how the corpus puts a canvas on a page without the canvas eating the page — how much GL to use, where the canvas sits, how scroll and pointer reach the shaders, what gets mounted and disposed, how colour stays in step with CSS, which shaders unify and which narrate, and the parameter values the cards actually publish. Read it before `[recipe:gl-dom-tethered-planes]` or any `gl-*` recipe; cite as `[pattern:webgl-architecture#section]`. Where a value comes from one clone or one third-party reconstruction, the row says so.

## Contents
1. [Dosage ladder](#dosage-ladder)
2. [HTML lays out, WebGL renders](#html-lays-out-webgl-renders)
3. [Canvas positioning](#canvas-positioning)
4. [Scroll and pointer as uniforms](#scroll-and-pointer-as-uniforms)
5. [Scene windows and disposal](#scene-windows-and-disposal)
6. [Colour parity](#colour-parity)
7. [Unifier versus narrative shaders](#unifier-versus-narrative-shaders)
8. [The depth ladder](#the-depth-ladder)
9. [Effect parameters](#effect-parameters)
10. [Post-processing](#post-processing)
11. [Text in WebGL](#text-in-webgl)
12. [Content fallback tiers](#content-fallback-tiers)
13. [Verify](#verify) · [Refuse](#refuse)

## Dosage ladder

Why: the corpus took Site of the Month with no canvas at all and Site of the Year with nothing but a canvas. Dosage is a budget decision, not a quality signal; it is fixed in the direction contract before a single mesh exists, because every rung below changes the DOM, the load gate and the accessibility work.

| Rung | What it means | Sites | Notes |
|---|---|---|---|
| 100 % canvas | the DOM is a shell; layout is camera framing | [site:igloo] [site:why-zero] | the winner's 6.6 accessibility and empty DOM live here [site:igloo] [recalled medium]; only with a full DOM mirror |
| Canvas-first | one canvas behind or over DOM content: tethered planes, a hero object, or a scene per section | [site:leo-parpeix] [site:oryzo] [site:slosh-seltzer] [site:lando-norris] [site:shopify-editions-w26] [site:floema-jewelry] [site:mont-fort] [site:united-carriers] [site:usavionix] | the corpus median; text stays in the DOM |
| Moments | flat planes or one demo, DOM-first | [site:the-line] [site:son-daven] [site:animejs] [site:lama-lama] | the scoping rule: pick one material behaviour and refuse every other 3D temptation [site:trevor-noah] [verified quote fragment — the studio's stated intent; the shipped site went canvas-first instead, see its card] |
| None | 3D by pre-render, vector runtime or photography | [site:white-desert] [site:seasats] [site:mindmarket] | Seasats reads as 3D with no runtime GL [site:seasats] [inferred medium] |

Rules: pick the lowest rung the thesis survives; every rung up costs an asset pipeline, a tier system and a mirror. "Make it 3D" without a beat that needs depth is refused at the floor.

## HTML lays out, WebGL renders

Why: when the DOM owns layout, semantics, responsiveness and CMS content survive, and the canvas only adds what shaders can do. Floema draws every image as an OGL plane exactly over an `<img data-src>` placeholder [site:floema-jewelry] [verified]; Lando registers HTML sprint markers against projected 3D coordinates so labels stay text while geometry stays canvas [site:lando-norris] [verified]; Trevor Noah keeps its photo cards in the DOM entirely and gives the canvas a modelled scene instead of planes [site:trevor-noah] [verified, live source 2026-09-18].

The tether [site:floema-jewelry] [verified in substance, clone]: read the element's rect, convert width and height to viewport units, place the plane at the rect's centre with y inverted, add any accumulated recycle offset. Floema caches the rect on resize and subtracts its lerped scroll each frame; with Lenis on the native document a fresh `getBoundingClientRect()` per frame is already viewport-relative, so nothing is subtracted — read it after Lenis has updated on the same tick (`stacks/three-0.186.md`, `[recipe:gl-dom-tethered-planes]`).

Rules:
- The placeholder keeps `alt`, dimensions and `loading`; the plane hides it with opacity or a `data-gl` class, never `display: none`, so a failed context leaves an image [A02] [A04].
- Anything the canvas draws that reads as content — headings, labels, captions — exists in the DOM first.
- One `Media` class per element; the scene is a list of tethers, not a hand-placed composition.

## Canvas positioning

Why: native scrolling and `requestAnimationFrame` do not share a clock, so a `position: fixed` canvas whose planes are placed from the scroll value can lag the DOM by a frame and the planes swim against their placeholders.

| Model | Mechanism | Cost | Site |
|---|---|---|---|
| Absolute, re-offset each rAF | the canvas is `position: absolute` and translated to the current scroll every frame, so it physically moves with the page; ≈ 25 % vertical over-render (or a framebuffer with edge fade) covers a fast scroll | extra pixels; the studio judged clipping worse than the render cost | Lusion's `WebGL-Scroll-Sync` README [verified]. **Not what `[site:oryzo]` ships** — its canvas is `position: fixed` and never repositioned; it tethers by mapping DOM rects into the scroll timeline instead [verified, live source 2026-09-18] |
| Fixed canvas + scroll uniform | canvas fixed; the smoothed scroll goes in as a uniform and every plane offsets itself | a frame of lag unless the scroll value is the same smoothed one the DOM moved with | [site:floema-jewelry] wrapper `translateY` from one lerp [verified]; [site:shopify-editions-w26] sibling [recalled high] |
| Sticky scene layer per section | a full-viewport sticky layer per chapter with static media beneath | one canvas re-targeted per section, never one context per section | [site:shopify-editions-w26] [recalled medium-low] |

Rules:
- One canvas per page: contexts cannot share resources and a page cannot open them without limit [site:oryzo] [verified README].
- Under Lenis on the document, a fixed canvas plus the tether above is stable, because DOM and planes read the same smoothed value on the same ticker.
- Never scroll-jack to cure drift; fix the clock.

## Scroll and pointer as uniforms

Why: a framework render per scroll event is the slowest possible path into a shader. The Shopify sibling release writes scroll to a ref and reads it inside the render loop for camera, transitions, offsets, point-cloud displacement and post parameters, so page and scene never drift [site:shopify-editions-w26] [recalled high for the sibling].

- Scroll → one number (`lenis.scroll`, or the virtual float) → uniforms and refs in the loop; framework state never sees it (`[pattern:motion-vocabulary#scrub-and-refresh-rules]`).
- The cheapest scrub is a multiplier: `rotation.y = scrollY × 0.00015` [site:leo-parpeix] [recalled medium]; Mont-fort maps scroll to a 0–1 progress per chapter that drives a camera path [site:mont-fort] [inferred high].
- Velocity is derived per frame from the smoothed value and lerped back to zero [site:floema-jewelry] [verified]; the pointer goes through `gsap.quickTo` or `damp()` into a vector uniform, never from raw events.
- The time uniform comes from the shared ticker's clamped `dt`, so a hidden tab does not jump.

## Scene windows and disposal

Why: a page with a scene per chapter cannot keep every scene alive, and a route change must leave nothing running.

- Mount the active scene and its immediate neighbours; composite between them in one canvas; unmount and dispose the rest [site:shopify-editions-w26] [recalled high for the sibling].
- Floema builds one scene class per template and destroys it on every route change [site:floema-jewelry] [verified]; Lando tears down and rebuilds Three per route on one GSAP timeline [site:lando-norris] [verified]. Dispose geometries, materials, textures and render targets separately, then the renderer when the canvas goes [P07] (`disposeScene` in `stacks/three-0.186.md`).
- One shared ticker for scroll, tweens and render (`_shared/raf.js` or `gsap.ticker`); pause it when hidden or off-screen [M08].
- DPR capped by tier and by an absolute pixel budget (`applyRendererBudget` in `_shared/quality-tiers.js`) [P06]. The only published cap is a third party's account of Shopify's tiers, DPR ≤ 2 at high [site:shopify-editions-w26] [recalled medium-low]; Igloo's policy is unknown [site:igloo]. The cap is plugin policy.
- Isolate failures per scene: one broken texture blanks one section, not the page [site:shopify-editions-w26] [recalled medium-low].

## Colour parity

Why: a theme swap that tweens CSS tokens while the clear colour stays behind, or a token that lands a different shade in GL, breaks the fiction that the canvas is part of the page.

- One source: `data-theme` on `<html>` feeds the CSS tokens and the renderer's clear colour in the same tween (`[recipe:theme-swap-tokens]`); the flavour-field family lerps the clear colour inside its ≈ 1 s repaint [site:slosh-seltzer] [verified at family level].
- Anime's Three adapter resolves CSS custom properties into scene colours — `utils.set(scene, { background: 'var(--bg-1)' })`, colour keyframes from `var(--…)` — one palette for DOM and GL [site:animejs] [verified]. Under GSAP, read the token with `getComputedStyle` once per swap and hand it to `new THREE.Color()`.
- Leave Three's colour management on; mark colour maps `SRGBColorSpace` only, data maps linear (`stacks/three-0.186.md`). Mont-fort duplicates its brand ink as `display-p3` in CSS [site:mont-fort] [verified]; the renderer draws sRGB by default, so sample the sRGB twin for the clear colour, or opt the whole canvas into P3 output — never one without the other [Three's P3 output unverified in this pass].
- Igloo grades with a no-tone-mapping 3D LUT [site:igloo] [verified]; a grade belongs in the post stack, not in the token values.

## Unifier versus narrative shaders

Why: shaders do two different jobs, and mixing them is how a page turns into a demo reel.

| Kind | What it does | Sites |
|---|---|---|
| Unifier | one global pass every pixel goes through, so DOM and scene share a physics: a fluid wake read as a velocity-driven hash blur [site:leo-parpeix] [verified, live bundle 2026-09-18] (no chromatic aberration — that was a clone's invention); a shared fluid field across scenes [site:shopify-editions-w26] sibling [recalled high]; a grade + grain stack [site:igloo] [recalled high] | one per site |
| Narrative | a shader that enacts a beat once: frost unlock, burning money, shredded certificates, tunnel pulse [site:why-zero] [verified, live bundle 2026-09-18] — the "hexagonal text blur" once listed here is not in the served build, which uses a `lensBlur` pass and a KTX2 sprite atlas for narrative type; a scanline over a wireframe helmet [site:lando-norris] [verified]; chapter wipes on a torn, deckled paper edge with fibrous tendrils — not the painted brushstroke this file used to claim; there is no brush, wipe or stroke-mask signature in the served source [site:shopify-editions-w26] [verified, live source 2026-09-18] | one per chapter, each tied to a sentence of the thesis |

Rules: one unifier, named in the direction contract; narrative shaders only where the story turns; an idle noise displacement that keeps a hero alive between beats [site:lando-norris] [verified] is seasoning, not a third kind.

## The depth ladder

Why: depth is bought by the rung, and each rung up costs an order of magnitude in assets and risk. Climb only as far as the beat demands.

| Rung | Technique | Cost | Site | Recipe |
|---|---|---|---|---|
| 1 | 2D-in-3D: flat planes with one material behaviour | subdivided quads, no scene | no corpus card demonstrates this tier as of the 2026-09-18 pass — `[site:trevor-noah]` was the source and its planes turned out to be DOM | `[recipe:gl-dom-tethered-planes]` |
| 2 | Depth-map 2.5D: source image + greyscale depth, parallax occlusion ray-marched with a forward pass and a backward refinement | image-file cost per scene | **no corpus card demonstrates this rung.** `[site:shopify-editions-w26]` was the source and ships real Blender geometry instead [verified, live source 2026-09-18] | `[recipe:gl-depth-map-parallax]` |
| 3 | Pre-rendered sequence scrubbed on scroll: C4D frames drawn to a 2D canvas | the frames' weight; zero runtime GL risk | [site:seasats] [inferred medium]; scrubbed scene sequence [site:united-carriers] [verified tags]; an `ImageSequenceCanvas` in the basement stack [site:usavionix] [verified repo] | `[recipe:image-sequence-scrub]` |
| 4 | Single hero object with inertia: one mesh, physical materials, drag momentum, lighting that answers motion | one Draco glb (≤ 300 KB in the recipe) plus an HDRI or matcap | [site:oryzo] [recalled high; parameters unknown] | `[recipe:gl-hero-object-inertia]` |
| 5 | Full scene with a camera rig: a spline the scroll drives, per-chapter scenes, a post stack | the whole pipeline, and a mirror for everything | [site:igloo] [site:mont-fort] [site:lando-norris] [site:why-zero] | `[recipe:gl-virtual-scroll-camera]` |

Rule: rung 2 smears at depth edges under large parallax offsets [inferred — no corpus card ships it]; rung 3 needs a poster and preloading; rung 5 needs `[recipe:quality-tiers]` before it needs anything else.

## Effect parameters

Every value below is a published or reconstructed number from one card. Take the architecture; design your own displacement.

| Effect | Parameters | Site | Confidence |
|---|---|---|---|
| Velocity bulge | vertex: `z -= (sin(y/H·π + π/2) + sin(x/W·π + π/2)) · abs(uSpeed)`; `uSpeed = scroll.current − scroll.last`, eased to 0; fragment is a plain lookup with `uAlpha` .4; camera at z = 5 | [site:floema-jewelry] | [verified], clone |
| Shared-element flight | source mesh lifted `z += .01`; scale, position and rotation tween 1.5 s `expo.inOut`; removed .2 s after | [site:floema-jewelry] | [verified], clone |
| Fluid wake | `mouse_force 80`, `resolution 0.2` of the viewport (not a fixed 128²), `cursor_size 40`, `dt 0.015`, `deltaFactor 1.75`, `dissipation 0.98`, `iterations_poisson 1`, viscosity off, BFECC advection behind a switch | [site:leo-parpeix] | [verified, live bundle 2026-09-18] |
| Wake post-pass | `fluidDistortionStrength 0.003`, `fluidVelocityBlurScale 15`, `aaType none`; a hash blur scaled by velocity, no colour fringing | [site:leo-parpeix] | [verified, live bundle 2026-09-18] |
| Scroll multiplier, cloud drift | `rotation.y = scrollY × 0.00015`; sprites on `sin(t × .15 + i) × .002` | [site:leo-parpeix] | [recalled medium] |
| Bloom presets | 1.5 / .5 / .25 intensity, chosen per scene; chain RenderPass → UnrealBloom → ShaderPass | [site:lando-norris] | [verified] |
| Scanline helmet | time-driven scanline over a wireframe; idle Perlin/Simplex displacement so nothing is static; a six-pass fluid with noise sampling | [site:lando-norris] | [verified]; no constants |
| Cheap ice | matte blocks, no transmission: bevelled edges → key light inside or below → Fresnel rim → bloom → DOF → fog → fine grain → saturation ≈ 0; refraction on one hero object only. **Bloom threshold comes from the scene's own histogram, not a rule of thumb**: on a near-white scene `[site:igloo]` runs `luminanceThreshold` at **.2** for sky and background and **0** for ambient particles, against the library default of .9, for a soft global glow rather than a thresholded highlight pass [verified, live bundle 2026-09-18] | [site:igloo] | render teardown; bloom values verified |
| Camera on a spline | wheel × .1 → friction .97 → lerp .075 then .15 → 1.4 s ease-in-out-cubic snap → modulo wrap; exponential damping | [site:igloo] | [recalled medium-high], one source |
| Procedural mountain | Perlin + Voronoi noise, rock diffuse + normal, a snow/rock mix mask, a baked lightmap, one EXR HDRI, KTX2 textures | [site:mont-fort] | [verified files]; shader use inferred |
| Render-to-texture composite | each section to a `WebGLRenderTarget`; a fullscreen plane's fragment blends them (wipe, warp, dissolve) | [site:slosh-seltzer] | [verified], Codrops |
| Depth-map parallax | JPG + greyscale depth; POM with forward and backward refinement | the recipe's own parameters — `[site:shopify-editions-w26]` does not use this technique [verified, live source 2026-09-18] | technique only |
| Baked simulation | smoke, shatter and particle bursts as Draco geometry; 32³ / 64³ volumes as KTX2 atlases | [site:igloo] | [verified manifest] |
| Polaroid curl | **not a shader.** Trevor Noah builds the curl and its shadow as generated SVG arc paths on a DOM wrapper, animated on their own rAF: fold 8° at rest, 55° on hover, 500 ms, one corner, with a scroll-driven mode | [site:trevor-noah] | [verified, live source 2026-09-18] — do not reach for geometry here |
| Hero inertia | drag momentum, motion-reactive lighting | [site:oryzo] | [recalled high]; damping, mass, light unknown |

## Post-processing

Why: a post stack is the fastest way to make six scenes read as one site, and the fastest way to lose the frame budget on a phone.

- Fixed presets, not per-scene guesses: three bloom intensities across six scenes [site:lando-norris] [verified]; a no-tone-mapping LUT for the grade [site:igloo] [verified]; one full-frame pass for the wake [site:leo-parpeix] [recalled medium-high].
- The plugin's composer is pmndrs `postprocessing` 6.39.5 with half-float buffers, an `EffectPass` merging bloom and SMAA, and `antialias: false` on the renderer (`stacks/three-0.186.md`); Lando's own chain is Three's `EffectComposer` [site:lando-norris] [verified]. Use one pipeline, never both. `[recipe:gl-postprocessing-presets]`.
- The step-down order differs by source: Why Zero's manager steps pixel ratio, then blur samples, then geometry detail from measured frame time [site:why-zero] [verified]; the Shopify reconstruction drops particles and post first and targets 30 fps at low [site:shopify-editions-w26] [recalled medium-low]; `_shared/quality-tiers.js` does both per tier.
- Bloom on a near-white scene needs a high threshold; a low one smears the frame [site:igloo] [recalled high].

## Text in WebGL

Why: type in the scene gets depth, parallax and the post stack; it also disappears from assistive tech, find-in-page and translation. The corpus renders headline type in-canvas twice and pushes type through a shader once.

- MSDF glyphs from a pre-built atlas: IBM Plex Mono as a KTX2 data texture with a JSON layout, decoded in a worker [site:igloo] [verified]; `three-msdf-text-utils` 1.5.0 with a word wrapper for headline type [site:lando-norris] [verified]. Scramble reveals offset glyphs inside the atlas so nothing reflows [site:igloo] [recalled high].
- Hexagonal text blur: type drawn through a shader at key moments [site:why-zero] [verified].
- Always mirrored: the same string in the DOM, visible or `.sr-only`, and the canvas `aria-hidden` [A04]. Whether Lando mirrors its MSDF headlines is unknown [site:lando-norris]; Igloo does not [site:igloo] [verified: empty DOM] — that is the 6.6.
- Reduced tier: the DOM string shows and the GL string sits still; static tier: DOM only. `[recipe:gl-msdf-text]` builds the field at runtime, so it ships no font file.

## Content fallback tiers

Why: WebGL fails — blocked contexts, lost contexts, old GPUs, a texture that 404s — and a page that goes blank has no jury score at all.

| Tier | Shows | Trigger |
|---|---|---|
| WebGL | the scene | a `webgl2` (or `webgl`) context, quality tier ≥ mid, motion tier full |
| Static media | a poster still or muted video per section — the DOM placeholders Floema and Trevor Noah already carry [site:floema-jewelry] [site:trevor-noah] | no context, low tier, `webglcontextlost`, a failed asset in that scene, or reduced motion |
| Text | headings, copy, links and cards alone | media failed too; always the base layer |

The three tiers with per-scene isolation are documented for Shopify by a third party [site:shopify-editions-w26] [recalled medium-low]; Seasats probes each media slot and reveals only what loads [site:seasats] [clone-described]. Rules: reduced motion renders one settled frame (the still, or the scene drawn once on demand); the canvas is `aria-hidden` with its content mirrored [A04]; the load gate waits only for the first scene's assets (`[pattern:preloaders-and-transitions#the-load-contract]`); a WebGL1-only device gets the still, since a WebGL2-only build like Igloo's would show it nothing [site:igloo] [verified WebGL2-only; consequence inferred].

## Verify

- [ ] Dosage rung named in the direction contract with the beat that justifies it.
- [ ] Every plane tethered to a DOM rect; placeholders keep `alt`, dimensions and `loading`; the canvas is `aria-hidden`.
- [ ] One canvas; absolute re-offset or fixed + uniform, chosen and written down; no drift under a fast scroll.
- [ ] Scroll and pointer reach shaders as uniforms from the shared ticker; no framework state in the loop.
- [ ] Active scene plus neighbours mounted; everything disposed on route change; `renderer.info` flat after three navigations.
- [ ] Clear colour tweened with the tokens; colour maps sRGB, data maps linear.
- [ ] One unifier pass; narrative shaders only at story turns; bloom and grade as fixed presets.
- [ ] Every GL string and image mirrored in the DOM; static and text tiers render with the context blocked (`capture.mjs --no-webgl`).
- [ ] DPR and pixel budget capped by tier; the loop pauses when hidden.

## Refuse

- A blob, particle field or floating shapes with no beat behind them; "make it 3D" as a brief.
- Text or images that exist only in the canvas.
- Two contexts on one page, or a canvas per section.
- Scroll written to framework state; raw wheel deltas as uniforms.
- Per-scene bloom values chosen by eye; both post pipelines at once.
- An uncapped `devicePixelRatio`; a scene that outlives its route.
- The Floema bulge, the Léo wake, the Igloo ice, the Mont-fort peak, the Lando visor, the Shopify paintings or the Slosh can as signatures.
