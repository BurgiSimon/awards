# Recipe proposals — corpus wave 4 (2026-10-05)

Wave 4 was the first lens wave (GSAP, WebGL, 3D). Candidates come from `### Techniques and stacks` under `## Wave 4` in `docs/handoff/corpus-ledger.md` and from the wave-4 additions to `references/patterns/gsap-choreography.md`, `webgl-shaders.md`, `webgl-3d-scenes.md` and `webgl-architecture.md#effect-parameters`. A candidate is listed only when no title or tag in `recipes/*/recipe.json` or `recipes/README.md` covers it. Only the 13 added cards count as "Seen in"; santionispirits and guillaumecolombel are blocked with no card, so their techniques are excluded unless an added card shows the same thing. Ranking is by the number of added sites that show the technique, then by how many skills would cite it (motion, webgl, system, structure, jury). Each entry generalises the technique; none copies one site's signature, values or copy. Every candidate builds under the recipe contract: headless SwiftShader, system fonts, procedural geometry or tiny generated assets only, and the pinned dependencies in `recipes/package.json`. Only rank 21 needs a new pin.

## 1. `custom-ease-house-defaults` — House easing: CustomEase tokens as GSAP defaults
- Seen in: abatable, aardvarkbookclub, a24-raviklaassens, bleibtgleich, why-zero, agrumeafarm
- Tier: P0 · Deps: gsap@3.15.0 (CustomEase)
- Overlap: `reduced-motion-switch` and `boot-lenis-gsap` set up the ticker and motion tiers but no ease vocabulary. This recipe adds a small named ease and duration token set (in, out, in-out, a "write" curve), registered once through `gsap.defaults({ ease, duration })` and `staggerDefault`, mirrored as CSS `cubic-bezier` custom properties so CSS transitions use the same curves.
- Verify idea: state `default` plays an unannotated tween on a probe element. Assert that `gsap.parseEase(defaults.ease)(.5)` matches the token's cubic-bezier evaluated at .5 to within 1e-3, that the probe's transform at a fixed seek equals that value, and that the CSS custom property contains the same four control points. State `reduced` asserts every duration token is 0.
- Lens: gsap

## 2. `gl-built-studio-environment` — Studio environment built at runtime, no HDR file
- Seen in: ascension-pegassi, a24-raviklaassens, eugeniagrab, cutobot-byholm
- Tier: P1 · Deps: three@0.186.0
- Overlap: `gl-hero-object-inertia` lights with a matcap. This recipe builds the reflection source in code, using emissive panels (or a painted canvas gradient with light strips) baked once through `PMREMGenerator.fromScene` / `fromEquirectangular`. It lights a chrome and a clearcoat `MeshPhysicalMaterial` with no downloaded environment, and offers a "panels" variant and a "painted" variant.
- Verify idea: state `lit` reads pixels across the chrome object and asserts that luminance standard deviation is above a threshold and at least one highlight pixel is above .85. State `no-env` (an action that sets `scene.environment = null`) asserts that mean luminance drops by at least 50 %. If the PMREM bake fails, both states render flat and the assertion fails.
- Lens: 3d

## 3. `gl-material-patch-reveal` — Patched stock material: grey-to-colour hand-off through a DOM-anchored circle
- Seen in: eugeniagrab, ascension-pegassi, agrumeafarm
- Tier: P1 · Deps: three@0.186.0, gsap@3.15.0, lenis@1.3.26
- Overlap: `gl-rtt-composite-transition` switches scenes through render targets. This recipe keeps one scene and patches a `MeshStandardMaterial` through `onBeforeCompile`: a luma mix at `map_fragment` for grey to colour, and a grained circular `discard` whose centre is read from a DOM element's rect, scrubbed by ScrollTrigger. A normal-wobble chunk is offered as a variant.
- Verify idea: state `mid` sits at scroll fraction .5. A pixel inside the circle (projected from the DOM anchor) has saturation above .2, and a pixel outside has saturation below .05. At state `end` the outer pixel is coloured too. A shader that fails to compile or a chunk replacement that misses its include leaves both pixels grey, so the assertion fails.
- Lens: 3d

## 4. `gl-one-context-many-canvases` — One WebGL renderer drawn into many 2D canvases
- Seen in: agrumeafarm, cyphercapital, a24-raviklaassens
- Tier: P1 · Deps: three@0.186.0
- Overlap: `gl-dom-tethered-planes` uses one full-screen canvas over DOM boxes. This recipe keeps the DOM layout intact: one offscreen renderer renders each item in turn and `drawImage`s the result into that item's own 2D canvas. Items re-render only when they change and are in view. A pixel budget sets DPR across all the canvases, and the renderer releases its context through `dispose()` + `forceContextLoss()` on teardown.
- Verify idea: state `grid` holds six item canvases. Assert that each canvas has non-background pixels at its centre, that exactly one WebGL context was created (counted by a `getContext` wrapper in the hook), and that the total backing pixels stay within the budget. State `teardown` asserts the context reports `isContextLost()`.
- Lens: 3d

## 5. `gl-uniform-tween-targets` — Shader uniforms and post presets as GSAP tween targets
- Seen in: why-zero, edolus
- Tier: P1 · Deps: gsap@3.15.0, three@0.186.0
- Overlap: `gl-postprocessing-presets` switches fixed presets and does not tween them. This recipe drives `material.uniforms.x` and post-preset values directly from GSAP timelines (with `killTweensOf` before each retarget), so shader states use the house eases and can be interrupted.
- Verify idea: state `hover` triggers a hover action and seeks the timeline halfway. Assert that the uniform equals the ease value at .5 and that the read-back pixel tint lies between the rest and target colours. State `interrupt` starts a second retarget mid-tween and asserts no jump: the uniform after the next frame differs from the previous value by less than one ease step.
- Lens: gsap

## 6. `clip-path-scrub-door` — Scrubbed clip-path doorway into a section
- Seen in: bleibtgleich, abatable
- Tier: P1 · Deps: gsap@3.15.0, lenis@1.3.26
- Overlap: `title-mask-tunnel` uses CSS-3D and `preloader-aperture-handoff` is a one-shot load. This recipe is a scroll-scrubbed `clip-path` door with two variants: a `polygon(evenodd, …)` hole that opens over the section, and a `circle(p × 150% at 50% 120%)` statement reveal. It includes a phone start/end and a reduced tier that shows the open state.
- Verify idea: at states `start`, `mid` and `end` (fractions of the trigger window), read the computed `clip-path`. Assert that the hole's width increases strictly from start to end and that `mid` lies between the two. Under `reducedMotion`, assert that the clip-path is `none` or fully open at `start`.
- Lens: gsap

## 7. `scrub-threshold-timelines` — Paused timelines fired at scrub-progress thresholds
- Seen in: aardvarkbookclub, stanzza
- Tier: P1 · Deps: gsap@3.15.0, lenis@1.3.26
- Overlap: `scroll-pin-scrub` scrubs everything. This recipe lets copy and step changes ride a scrubbed scene without being scrubbed. Paused timelines play at one threshold and reverse at a faster `timeScale` on the next threshold or when scrolling back. It also shows step changes inside a scrub done with near-zero-duration tweens.
- Verify idea: state `a` at a fraction past the first threshold waits 1 s and asserts that the copy timeline progress is 1. State `b` past the second threshold asserts progress 0 after the reverse. State `back` scrolls below the first threshold and asserts progress 0 again. A timeline scrubbed by mistake shows a fractional progress and fails.
- Lens: gsap

## 8. `gl-lathe-turned-object` — Procedural turned object from a lathe profile
- Seen in: agrumeafarm, a24-raviklaassens
- Tier: P1 · Deps: three@0.186.0
- Overlap: `gl-hero-object-inertia` shows one object, not a generated one. This recipe builds a profile from points (rippled by a cosine term), runs it through `LatheGeometry` plus `RingGeometry` faces, and generates maps in a Blob Worker with a same-thread fallback. A hover gives one quantised revolution on fine pointers only. No model is downloaded.
- Verify idea: state `rest` asserts that the centre pixel is non-background, that the corner pixel is background, and that the geometry vertex count equals segments × points. State `hover` dwells past the threshold and asserts that the rotation after 1.5 s is one full turn within 1e-3, and that `(pointer: coarse)` emulation leaves rotation at 0.
- Lens: 3d

## 9. `gl-spring-stepped-gallery` — Canvas gallery on a spring-snapped index, with a wheel step detector and accessible controls
- Seen in: a24-raviklaassens, agrumeafarm
- Tier: P1 · Deps: three@0.186.0
- Overlap: `blur-peek-snap-carousel` is DOM-based. This recipe uses a WebGL row whose float index is snapped by a frequency/damping spring, with depth and scale derived from position. It has drag with friction, and a wheel step detector (noise floor, envelope, threshold) so one trackpad flick moves one item. A DOM mirror provides `aria-roledescription="carousel"`, an `aria-live` announcer, arrow, Home and End keys, and a direct snap under reduced motion.
- Verify idea: state `key` presses ArrowRight twice and asserts that the settled index is 2 (±.01) and that the live region text names item 3. State `wheel` sends one burst of 20 small wheel events and asserts that the index advanced by exactly 1. State `reduced` asserts that the index is an integer on the next frame.
- Lens: 3d

## 10. `gl-progress-scene-windows` — One progress line: stretch bands, scene windows and a speed-capped clock
- Seen in: edolus, cutobot-byholm
- Tier: P2 · Deps: three@0.186.0, lenis@1.3.26
- Overlap: `gl-virtual-scroll-camera` maps scroll to a spline. This recipe adds a piecewise raw-to-progress map in which some bands cost more scroll, and scene windows that are enabled ahead of time and dropped behind (toggled, never destroyed). A per-frame cap of `k × dt / duration` on progress means a flick cannot skip a beat.
- Verify idea: state `band` measures progress change per 100 px inside a stretch band and outside it, and asserts a ratio equal to the band factor (±5 %). State `window` asserts that segment n+1 is enabled only past the half-way mark of n. State `flick` sends one large wheel delta and asserts that progress after one frame stays at or below the cap.
- Lens: 3d

## 11. `gl-ping-pong-grain-field` — GPU point field with float ping-pong state pushed by the pointer
- Seen in: aqualoqa, edolus
- Tier: P1 · Deps: three@0.186.0
- Overlap: `gl-fluid-wake-post` simulates a fluid as a post-process. This recipe keeps per-point state (displacement in RG, velocity in BA) in float ping-pong pairs, falling back from RGBA32F to RGBA16F to RGBA8. It applies a clamped pointer brush, damping, and a protect mask that scales the force. Points are coloured from a generated image, a second pass reveals an under-layer where grains moved, and a reset glide brings them home.
- Verify idea: state `drag` sends a pointer drag across the centre and asserts that read-back state texels along the path have |displacement| above a threshold, while texels inside the protect mask stay below one. State `reset` waits for the glide and asserts that all displacement is below epsilon. If the float target is unsupported and the fallback is missing, the field stays at zero and the assertion fails.
- Lens: shader

## 12. `offscreen-canvas-worker` — Canvas rendered in a Worker via OffscreenCanvas, with a timed main-thread fallback
- Seen in: cyphercapital, cutobot-byholm
- Tier: P2 · Deps: none
- Overlap: `quality-tiers` probes the device and does not move rendering off the main thread. This recipe uses `transferControlToOffscreen` to hand an animated canvas (a loader or a shader field) to a Worker. A hello handshake has a fixed timeout, and when it expires the same draw code runs on the main thread.
- Verify idea: state `worker` asserts `__awards.state.mode === 'worker'` and that canvas pixels change between two frames. State `fallback` blocks the Worker URL through an action, then asserts `mode === 'main'` within the timeout plus 300 ms and that pixels still change.
- Lens: none

## 13. `gl-arc-length-mask-reveal` — Ordered stroke reveal from a mask that stores arc length
- Seen in: cyphercapital
- Tier: P1 · Deps: none (raw WebGL2), or three@0.186.0
- Overlap: `scroll-drawn-svg-path` draws SVG strokes. This recipe draws Bézier branches into a generated mask at runtime, with the branch id in R and a 16-bit arc length across G and B. One uniform array of per-branch progress then reveals every branch, staggered, with a feathered head, all in one pass.
- Verify idea: state `half` seeks to progress .5 and asserts that the pixel at a branch's start is lit and the pixel at its end is dark. A branch whose stagger has not begun is fully dark. State `end` asserts both pixels are lit. If 16-bit decoding is wrong, the reveal order breaks and the start/end pair flips.
- Lens: shader

## 14. `gl-dispersion-stripes` — Liquid-metal stripes with channel dispersion and fwidth-gated anti-aliasing
- Seen in: cyphercapital
- Tier: P2 · Deps: none (raw WebGL2)
- Overlap: no stripe or dispersion shader exists. This recipe offsets stripe phases per channel and warps them with simplex noise. A coverage re-threshold `(g − .5) / max(fwidth(g), 1e-5) + .5` gives an anti-aliased edge, and interleaved gradient noise dithers the output. Tone mapping is inline, with no render target.
- Verify idea: state `still` (fixed time) reads a row across a stripe edge and asserts that R and B change at different x positions (offset of at least 1 px). It also asserts at least three intermediate values at the edge (anti-aliased, not stepped), and that no pixel row is fully opaque (the fwidth zero guard). State `reduced` asserts that time is frozen across two frames.
- Lens: shader

## 15. `gl-sdf-extruded-symbol` — Raymarched extruded 2D SDF with bevel, chrome shading and a static fallback
- Seen in: cyphercapital
- Tier: P2 · Deps: none (raw WebGL2)
- Overlap: `gl-hero-object-inertia` renders a mesh. This recipe extrudes a 2D signed-distance mark (procedural, or from an SDF baked at runtime) with a depth and bevel and raymarches it with a step budget. It shades with 4-tap AO, a Schlick tint and inline ACES, and shows an SVG stroke fallback under reduced motion or on failure.
- Verify idea: state `lit` asserts that the centre pixel alpha is 1, the corner alpha is 0, and the bevel ring has higher luminance than the face. State `fallback` (an action that forces context failure) asserts the SVG is visible and the canvas is hidden.
- Lens: shader

## 16. `two-phase-interruptible-timeline` — One paused timeline with an `addPause()` hinge, so close mid-open rewinds
- Seen in: why-zero
- Tier: P1 · Deps: gsap@3.15.0
- Overlap: `nav-overlay-fullscreen` builds separate open and close tweens. This recipe puts the open half, `addPause()` at time I and the close half in one timeline, then calls `close = tl.time() < I ? tl.reverse() : tl.play()`, so an interrupted toggle never jumps.
- Verify idea: state `interrupt` opens the timeline, closes it at 40 % of I, and samples the item transform for six frames. Assert that the samples move monotonically back toward the rest value (no jump larger than one frame step) and that `tl.time()` reaches 0. State `full` asserts that a close after the hinge plays forward to the end.
- Lens: gsap

## 17. `svg-goo-line-reveal` — Per-line SVG goo-filter text reveal
- Seen in: bleibtgleich
- Tier: P2 · Deps: gsap@3.15.0
- Overlap: `split-text-masked-reveal` uses a mask. This recipe gives each SplitText line its own `feGaussianBlur` + `feColorMatrix` alpha-threshold filter, tweens `stdDeviation` to 0 and the alpha amplitude back to identity, and clears the filter on complete. The filter must not stay on the text afterwards.
- Verify idea: state `mid` asserts a blur `stdDeviation` greater than 0 on the first line's filter. State `done` asserts that every line's computed `filter` is `none` and that the text is selectable, with an ARIA snapshot equal to the source sentence. State `reduced` asserts no filter at any time.
- Lens: gsap

## 18. `flip-scroll-path` — Element flown through layout slots by scroll-scrubbed Flip.fit
- Seen in: abatable
- Tier: P2 · Deps: gsap@3.15.0, lenis@1.3.26
- Overlap: `docked-media-grow` grows a card inside one section. This recipe chains `Flip.fit(target, nextSlot, { simple: true })` steps into a scrubbed timeline, so one element travels across several sections' layout slots, with a parallel radius change.
- Verify idea: at state `slot2` (the fraction where step 2 ends), assert that the target's bounding rect matches slot 2's rect to within 2 px. State `between` asserts that the rect lies strictly between slots 1 and 2. A layout change after refresh that breaks the fit fails the 2 px check.
- Lens: gsap

## 19. `gl-scrubbed-clip-timeline` — Scroll-scrubbed animation clips through mixer.setTime
- Seen in: eugeniagrab
- Tier: P2 · Deps: three@0.186.0, gsap@3.15.0, lenis@1.3.26
- Overlap: `image-sequence-scrub` scrubs pre-rendered frames. This recipe builds `AnimationClip`s in code from `KeyframeTrack`s on procedural meshes and scrubs `mixer.setTime` from one ScrollTrigger timeline, with slots and hand-offs. Rendering is on demand, invalidated on scroll updates.
- Verify idea: state `slot1` at a known fraction asserts that `mixer.time` equals the expected clip time (±.02) and that the animated mesh's scale read back from the scene matches the keyframe. State `idle` asserts that no frames render across 500 ms without scroll (render counter unchanged).
- Lens: 3d

## 20. `gl-noise-edge-theme-wipe` — Theme change as a full-screen shader wipe with a noise edge
- Seen in: bleibtgleich
- Tier: P2 · Deps: three@0.186.0, gsap@3.15.0
- Overlap: `persistent-mode-switch` and `theme-swap-tokens` re-skin through tokens. This recipe covers the swap with an orthographic quad (`uProgress`, `uCenter` from the click point, `uColor`, a hash-noise edge). Tokens flip under full cover, and the choice persists in sessionStorage.
- Verify idea: state `cover` seeks the wipe to .5 and asserts that the pixel at the click centre has the new colour and a far corner has the old one. State `done` asserts that `data-theme` changed, the canvas is hidden, and the body background matches the new token. State `reduced` asserts an instant swap with no canvas frame.
- Lens: shader

## 21. `physics-drop-loader` — Loader of SVG shapes dropped into a physics pile
- Seen in: agrumeafarm
- Tier: P2 · Deps: new pin matter-js@0.20.0 (already listed in `references/stacks/versions.md`). The pin is needed because a stable rigid-body pile with friction and restitution is not a few lines of code.
- Overlap: `throw-objects-css3d` throws with Draggable inertia and has no collision. This recipe drops simple procedural SVG shapes as convex bodies under strong gravity and drives a real-signal counter. Under reduced motion it shows a static arrangement, and it is torn down after hand-off.
- Verify idea: state `settled`, after 3 s, asserts that every body's `isSleeping` is true or its speed is below .05, that no body sits below the floor, and that the DOM shapes' transforms match the body positions to within 1 px. State `reduced` asserts that no engine was created.
- Lens: none

## 22. `auto-drive-manual-takeover` — Optional auto-scroll that any user input hands back
- Seen in: cutobot-byholm
- Tier: P2 · Deps: lenis@1.3.26
- Overlap: `idle-settle-snap` snaps after idle. This recipe adds an explicit AUTO toggle that advances Lenis at a fixed rate, stops on any wheel, touch or key input, reflects that in `aria-pressed`, and is never on by default.
- Verify idea: state `auto` turns AUTO on, waits 1 s and asserts that scroll increased. State `takeover` then sends one wheel event and asserts that `aria-pressed="false"` and scroll stays constant over the next 500 ms beyond the wheel's own travel.
- Lens: none
