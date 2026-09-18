# Igloo Inc — https://www.igloo.inc/

| Field | Value |
|---|---|
| Class | brand — a corporate monument for the parent company of Pudgy Penguins, OverpassIP and Abstract; the ventures appear as specimens, not as a portfolio grid [verified, app3d.js: a baked `cubes:[…]` array of three `PORTFOLIO_CO_0n` entries] |
| Visitor mode | experience |
| Awards | **Site of the Day, 23 Jul 2024** — the only award the entry page carries [verified, Awwwards entry read 2026-09-18: sole award `<h2>`]. Overall **7.92**; Design 8.05 · Usability 7.50 · Creativity 8.31 · Content 7.91. **DEV AWARD 7.66**, a score block, not a badge; its six criteria: semantics/SEO 6.60 · animations/transitions 9.60 · accessibility 6.60 · WPO 8.00 · responsive design 8.40 · markup/meta-data 6.40 [all verified, Awwwards entry read 2026-09-18]. Entry tags: Animation, Infinite Scroll, Transitions, 3D [verified, same]. **Site of the Year / Developer Site of the Year 2024 and Site of the Month Jul 2024: not shown on the entry** — the only "of the year" string on the page is the site-wide nav link to `/websites/sites_of_the_year/`, and "developer" occurs only as juror job titles [verified, same]. The prior card asserted SOTY + Dev SOTY from four secondary sources; treat as [recalled medium, contradicted by the entry page] until an annual-results page is read. FWA / CSSDA / Godly [unknown] |
| Studio / credits | **abeto** and **Bureaux**, credited on the entry itself [verified, Awwwards entry read 2026-09-18]; `abeto.studio` / `bureaux.studio` [recalled high]. Named individuals [unknown] — the personal names on the entry are the juror panel, not the build team |
| Stack (evidence level) | Vite [verified, index.html: `<script type="module" crossorigin src="/assets/index-2eb69c09.js">`, empty `<body>`] · **Svelte** [verified, entry-index.js: `$on`/`$destroy`/`__svelte_` keyframe helpers] · **Three.js r165** [verified, app3d.js: `const Aa="165"` under the Three.js licence banner] with DRACOLoader + KTX2Loader [verified, `draco_decoder.wasm`, `basis_transcoder.wasm`] · **postprocessing 6.35.5** (pmndrs) [verified, app3d.js licence banner] · **three-mesh-bvh** [verified, app3d.js: `MeshBVH:` error strings] · **GSAP 3.12.5 core + CustomEase + CustomWiggle + CustomBounce** [verified, app3d.js licence banners] · **ScrollTrigger is NOT bundled** [verified — see §4] · Threlte [unknown: no `threlte` string] · no CMS [verified, app3d.js: content is a literal object in the bundle] · **Vercel behind Cloudflare** [verified, response headers `x-vercel-id: fra1`, `server: cloudflare`] |
| Palette | Awwwards publishes exactly two: `#b6bac5` and `#383e4e` [verified, Awwwards entry read 2026-09-18]. Source theme tokens: title `#3C3C54`, text `#ffffff`, project title `#67707E`, project text `#A1AAB7` [verified, app3d.js]. Fog-gradient ground `#6A6F7D → #E1E6F1` and the rim accent `#83A1C5` [recalled medium, sampled dataset]. Strategy: one temperature, saturation ≈ 0, no ground image [verified, desktop-s00/25/50/75/100.png] |
| Type | single monospace contract — IBM Plex Mono Medium only, rendered in-canvas as MSDF glyphs; no DOM text [verified, app3d.js: `'../fonts/IBMPlexMono-Medium-datatexture.ktx2'` is the only font asset, loaded through a `new Worker("/assets/msdfworker-ac346fa7.js")` pool and drawn by a `float msdf(sampler2D tMap, vec2 uv)` median/`fwidth` shader] |
| WebGL dosage | 100 % canvas — and the canvas is **sealed in a closed shadow root** [verified, app3d.js: `document.createElement("div").attachShadow({mode:"closed"}).append(this.renderer.domElement)`; manifest.json reports `canvases: 0` with `domNodes: 27`] |
| Scroll model | virtual float — document scroll abolished; wheel, touch-drag and arrow keys drive a damped, snapping, modulo-wrapped scalar [verified, app3d.js + manifest.json `scrollMode: "wheel"` on all three profiles] |
| Narrative model | chaptered journey as a spatial descent, wrapping infinitely; three sections `entry`, `igloo`, `cubes` plus a `/portfolio/:project` route [verified, app3d.js] |

## 1. Concept and narrative
**One idea:** you descend into an arctic world; scroll drives a camera, not a document [verified, app3d.js scroll router + the five desktop frames].

Beats, read off the capture set [verified, file named per beat]:
1. `desktop-s00.png` — an intact ice igloo on a snow plain in overhead three-quarter view, overlaid by a field of thin white wireframe scaffolds; no HUD text yet.
2. `desktop-rm-s00.png` — the same object earlier in the intro: a dark technical model inside the wireframe field, tiny numeric tags scattered across it, ground flattened to fog.
3. `desktop-s25.png` — the igloo has burst into separated blocks, lit from within so the seams glow; HUD arrives (logo, two text panels, leader-line callouts with numeric labels, a bottom-left control). Chromatic fringing visible at the lower left.
4. `desktop-s50.png` — a single carved crystal shard hangs in fog with real refraction and a leader-line label; large faint background numerals.
5. `desktop-s75.png` — concentric ice arcs around a blown-out white ring: the abstract logo object.
6. `desktop-s100.png` — a top-down shaft with a glowing snow core at the bottom. No footer, no end card; the scalar wraps [verified, app3d.js: `targetY2 % this.scroll.total`].

**Tone and register:** expedition telemetry. Terse copy, slash rules, numeric callouts, a state-labelled sound control and a HUD copyright line. Verified strings [verified, app3d.js]: `Scroll down to discover.`, `////// Manifesto`, `////// Summary`, `/// Visit`, `/// Follow Us`, `/// Discover`, `Click to explore`, `Sound:`, `Close`, `// Copyright © 2026`. The mission line runs 19 words about consumer brands "at the intersection of Community, AI, and crypto" [verified copy fragment, app3d.js]. The coldness is functional: it stops a crypto-adjacent mission from reading as hype.

## 2. Structure and components
Routes: one document plus a `/portfolio/:project` pattern and per-specimen hashes `pudgy-penguins`, `overpass`, `abstract` [verified, app3d.js]; 404 [unknown].

| Component | What it does | Label |
|---|---|---|
| Preloader | a Svelte component whose visual is pure CSS: `.ascii:before` cycles `content:` strings through `@keyframes head`, 5 s, infinite, monospace, white with a soft text-shadow | [verified, entry-index.js] |
| Hero | snow plain + igloo, wireframe scaffold field | [verified, desktop-s00.png] |
| Manifesto | slash-ruled heading + one mission sentence, in-canvas MSDF type | [verified, app3d.js] |
| Interior scenes | camera dives inside; scenes cut between named modules (`sky`, `terrain`, `terrainpatches`, `introParticles`, `snowParticles`) | [verified, app3d.js] |
| Specimens | **three** ventures — Pudgy Penguins (01/02/2020), Overpass (06/01/2023), Abstract (06/28/2024) — each a named object in a carved cube with a summary panel, social list and one outbound link | [verified, app3d.js] |
| Social links | rendered as GPGPU particle clouds shaped by a VDB volume (`volumes/<name>.ktx2` bound to a `tVolume` uniform) | [verified, app3d.js] |
| Sound toggle | a `Sound:` label built as MSDF text, icon from `ui/sound-datatexture.ktx2` | [verified, app3d.js] |
| Nav / menu | no DOM nav; HUD chrome only, plus `Close` / `Back` affordances inside a specimen | [verified, app3d.js] |
| Cursor | — | [unknown] |
| Footer | HUD copyright text, not a DOM footer | [verified, app3d.js] |
| Mobile | a designed portrait layout, not a squeezed desktop: HUD panels restack into the narrow column, the camera reframes and the object sits lower and smaller | [verified, mobile-s00.png vs desktop-s25.png] |

## 3. Visual language
- **Palette roles**: near-monochrome blue-grey, no saturated colour in any frame [verified, all 15 captures]. `#383e4e` is the darkest ink, `#b6bac5` the mid ice tone [verified, Awwwards entry]; `#3C3C54` / `#67707E` / `#A1AAB7` are the three text ranks [verified, app3d.js].
- **Type**: one face, one weight, one size class per role; glyphs live in the scene as MSDF, so type has depth, parallax and obeys the post stack [verified, app3d.js]. UI icons are textures too: `ui/arrow-`, `ui/close-`, `ui/logo-`, `ui/sound-`, `ui/visit-datatexture.ktx2`, `scroll-datatexture.ktx2`, `igloo/numbers.ktx2` [verified, app3d.js].
- **Material vocabulary** from the live asset table [verified, app3d.js]: `frost-datatexture`, `caustics`, `bokeh`, `clouds_noise`, `wind_noise`, `perlin-datatexture`, `noises/blue-8-128-rgb` (blue noise for dithering), `mosaic`, `cubes/dot_pattern`, `igloo/triangles_tiling`, `shapes_blurred`, `igloo/ground_glow`, `cubes_env.exr`.
- **The "cheap ice" recipe**: the igloo blocks are not transmissive — rough matte surfaces read as ice because of optics. Bevelled edges catch light as a bright line; the key light sits inside so seams glow; fog; grain; DOF. Real refraction appears only on the later crystal shard [verified, desktop-s00/25/50.png].
- **Bloom is LOW-threshold, not high** — correcting the previous card. Live calls are `addBloom({levels:6, luminanceThreshold:.2, intensity:1, radius:.85})` for sky and background and `luminanceThreshold:0` for the ambient particles, against the library default of `.9` [verified, app3d.js]. The look is a soft global glow over a near-white scene, not a thresholded highlight pass.
- **Post stack** [verified, app3d.js pass names]: `BloomEffect` with mipmap downsampling, `DepthOfFieldEffect` + `BokehMaterial` + circle-of-confusion targets, chromatic aberration, grain, `godray`.
- **Grade**: a LUT rather than curves [verified, app3d.js: `LUT` appears across the effect chain; `ACESFilmic` / `AgX` are present only as Three.js constants].
- **Layout system**: none in CSS terms — composition is camera framing plus HUD anchors [verified, index.html ships an empty `<body>`].
- **Browser surfaces**: moot — no selectable text, no native scrollbar [verified, manifest.json `scrollMode: "wheel"`, `cls: 0`].

## 4. Motion and effects (with parameters)
- **Virtual scroll**, read verbatim from the router [verified, app3d.js]: `scrollMultiplier = 0.00075`; wheel and touch add `delta.y × multiplier` to `targetY2`; then `targetY1 = lerpFPSLimited(targetY1, targetY2, 0.075, 100 × multiplier)` and `y = lerpFPS(y, targetY1, 0.15)` — the **double lerp 0.075 → 0.15** the previous card recorded, confirmed exactly. `targetY2` is then clamped into a ±`750 × multiplier` band around `y`, a rubber band that stops the raw target outrunning the render. The input scale is **0.00075, not 0.1**; no `0.97` friction constant appears on the scroll path, though a `friction(i, ratio) = exp(log(i) × ratio)` helper exists and is used at `0.95`–`0.97` by the physics particles.
- **Framerate independence** [verified, app3d.js]: `damp(k, ratio) = 1 - Math.exp(Math.log(1 - k) × ratio)`, i.e. `1 - (1-k)^deltaRatio`, applied to every lerp through `lerpCoefFPS`.
- **Snap** [verified, app3d.js]: auto-centring fires only after the target has been still for **1.4 s** (`Fe.time - lastTime > 1.4`), then `gsap.to(this.scroll, {y: rounded, duration: <arg>, ease: "inOut3", overwrite: true})`. The 1.4 s is the idle dwell, **not** the tween duration; `inOut3` is a registered CustomEase name.
- **Wrap** [verified, app3d.js]: `targetY2 % this.scroll.total`, with the next section computed as `(index + 1) % total`.
- **Keyboard works** — correcting the previous card. A global `keydown`/`keyup` bridge feeds an event bus; the scroll router and the specimen view both subscribe, and `ArrowDown` / `ArrowUp` move the scalar by `±150 × multiplier` [verified, app3d.js: `onKeyDown(e){ … e.key==="ArrowDown" && (this.scroll.targetY2 += 150*this.scrollMultiplier) … }`].
- **Scroll → GSAP** — the `[contested]` ScrollTrigger claim is now **contradicted**. The only two `ScrollTrigger` occurrences are GSAP core's own plugin-missing guard (`As.ScrollTrigger || eg("scrollTrigger", e)`); there are zero occurrences of `scrollerProxy`, `pinSpacing`, `scrub`, `toggleActions`, `normalizeScroll` or `anticipatePin`, so the plugin is not in the bundle [verified, app3d.js]. The custom scalar drives paused GSAP timelines instead (`this.introTL = gsap.timeline({paused…})`) [verified, app3d.js].
- **Adaptive DPR** — a closed loop, not a static tier: frame times are pooled over a window, and when the mean falls below a floor the DPR multiplier is stepped down via `setDPRMultiplier`, stepped back up toward 1 when headroom returns; direction reversals are counted and the loop halts itself with `console.warn("Adaptive DPR stopped.")` [verified, app3d.js].
- **Text**: scramble-decode reveals via MSDF texture offsets — zero DOM reflow [recalled high]; a disabled-state placeholder string of question marks ships beside the click label [verified, app3d.js].
- **Simulation is playback**: `ceilingsmoke.drc`, `smoke_trail.drc`, `intro_particles.drc`, `shattered_ring_smoke.drc` are Draco *geometry* — simulated offline, replayed in the browser [verified, app3d.js].
- **Sound** [verified, app3d.js]: 18 `.ogg` files — a `music-highq` bed plus named event SFX `beeps`/`beeps2`/`beeps3`, `click-project`, `enter-project`, `leave-project`, `shard`, `wind`, `room`, `circles`, `logo`, `manifesto`, `particles`, `project-text`, `ui-short`, `ui-long`, `igloo`; decoded in `audioworker`.
- **Load sequence**: CSS ASCII loader inside a **16,546-byte** entry → the 3D app and textures stream behind it, decoded in workers [verified, measured on the served files].
- Pointer effects: a `mouseSim` render target is passed into the specimen views [verified, app3d.js]; its visible effect [unknown].

## 5. Tech and pipeline
- **Bundles, measured live** [verified, downloaded 2026-09-18]: `assets/index-2eb69c09.js` **16,546 B**; `assets/App3D-f554a111.js` **1,487,415 B**. The hashes are unchanged from the 2024 capture, so the site has not been rebuilt.
- **Assets referenced by the bundle** [verified, app3d.js string table]: **16 Draco `.drc`** (`igloo`, `igloo/igloo_cage`, `igloo/igloo_outline`, `igloo/patch`, `mountain`, `ground`, `floor`, `cubes/background_shapes`, `intro_particles`, `ceilingsmoke`, `smoke_trail`, `shattered_ring`, `shattered_ring2`, `shattered_ring_smoke`, `blurrytext`, `blurrytext_cylinder`); **31 KTX2**; one `cubes_env.exr`; **no glTF / GLB at all**. Per-specimen geometry (`pudgy`, `overpass_logo`, `abstractlogo`) and the `volumes/*.ktx2` are built from the content object at runtime, which is why a network capture lists more files than the string table.
- **Not quite zero raster**: four PNGs are referenced — `cubes/advect.png`, `cubes/bg.png`, `perlin-datatexture.png`, `uv/uvchecker-srgb.png` — alongside their KTX2 twins; `uvchecker` is plainly a debug asset [verified, app3d.js]. Everything shipped to the eye is KTX2/Basis.
- **Four dedicated workers** [verified, app3d.js `new Worker(...)`]: `audioworker-036a09db.js`, `bitmapworker-046527f8.js`, `exrworker-41cbee65.js`, `msdfworker-ac346fa7.js` — all decode off the main thread; the MSDF one runs behind a worker pool.
- **WebGL2 only** [verified, app3d.js: the renderer throws `THREE.WebGLRenderer: WebGL 1 is not supported`]; a `FD.isWebGLAvailable` / `isWebGL2Available` probe exists, but what it renders on failure is [unknown].
- **Head**: `lang="en"`, title, description, full Twitter and Open Graph sets, two PNG favicons; the viewport meta is injected at runtime with `viewport-fit=cover` [verified, index.html + entry-index.js]. No stylesheet link at all.
- **Authoring**: Houdini + Blender + Substance 3D Painter; DaVinci Resolve for sound [recalled medium, single source].
- Manifest LCP figures are a headless SwiftShader cold-cache artefact and are not a performance claim; the entry's WPO score is 8.00 [verified, Awwwards entry read 2026-09-18].

## 6. Weaknesses
- **The DOM is 27 nodes and the canvas is unreachable from it.** `document.querySelectorAll('canvas')` returns **0** because the renderer's element is appended into a shadow root opened in `closed` mode [verified, manifest.json + app3d.js]. That is a step beyond an empty DOM: no assistive technology, extension or audit tool can traverse into the render surface at all. It is the mechanism behind accessibility **6.60**, semantics/SEO **6.60** and markup/meta-data **6.40** on the winner's own entry [verified, Awwwards entry read 2026-09-18].
- **No reduced-motion path.** The string `prefers-reduced-motion` does not occur in either bundle [verified], and the five `desktop-rm-*.png` frames differ from one another exactly as the unthrottled ones do — the intro simply ran [verified, distinct md5s]. A camera flight with DOF, bloom and aberration is a vestibular trigger with no non-motion equivalent.
- **Zero ARIA.** No `aria-` attribute appears in either bundle [verified].
- **Keyboard: partial pass.** Arrow keys advance and reverse the scalar [verified, app3d.js] — better than the previous card credited — but there is no focus ring, no tab order, no visible key hint, and the sound toggle and specimen links are canvas objects with no focusable proxy [verified, index.html ships no interactive elements].
- **What the awards skills do differently:** the canvas is `aria-hidden` in the light DOM and a visually hidden semantic mirror carries landmarks, headings, the manifesto sentence and real links to each venture — never a closed shadow root, which forecloses the fix entirely; reduced motion becomes a stepped tier (cuts instead of flights, displacement off, one static frame per chapter); the arrow-key path Igloo already has gains PageDown, Space, Home/End, a visible focus state and a key hint; the sound toggle is a real focusable control with its state in the accessible name; the preloader resolves on `Promise.all(fonts, assets)` with `aria-live` and skips on repeat visits (≤ 2.5 s); a no-WebGL2 tier renders a still per chapter instead of a blank page. Keep Igloo's 16 KB staged entry, its adaptive-DPR loop and its honest sound switch — those three are the model.

## 7. Principles
1. **The bake step is the moat.** Cinematic scenes ship in a 1.45 MB app because simulation, volumes and glyphs are pre-computed into GPU-native formats; the spectacle is inseparable from the pipeline.
2. **Expense comes from optics, not materials.** Bevels, interior light, rim, DOF, fog and grain read as luxury; transmission is reserved for the one object that earns it.
3. **Discipline as luxury.** One face, one weight, one temperature, zero saturation — restraint is what makes a single cool accent land.
4. **Scroll can be a camera, but then it must behave like software** — framerate-independent damping, a rubber-band clamp, an idle-triggered snap, keys, and a predictable loop.
5. **Adapt, don't tier.** Measure frames and move the pixel budget continuously, with a reversal counter so the loop cannot oscillate forever.
6. **Sound is state.** Named SFX per interaction, a bed, and a switch that says what it is currently doing.
7. **Register commitment.** The micro-labels, the callouts and the copyright line all speak the same telemetry dialect as the hero.

## 8. Take / Don't take
- **Take:**
  - The virtual-scroll camera rig and its real numbers: input × ~0.00075 → `lerpFPSLimited(target1, target2, 0.075, cap)` → `lerpFPS(y, target1, 0.15)` → clamp the raw target into a band around the rendered value; snap after ~1.4 s of stillness with an ease-in-out-cubic tween; modulo wrap only when the story is a loop; damping as `1 - (1-k)^deltaRatio` so 60 Hz and 144 Hz feel identical. Decision: only when the page is a world, never for a document — and ship it with keys and a stepped reduced-motion tier (`[recipe:gl-virtual-scroll-camera]`).
  - The adaptive-DPR loop: pool frame times, step a DPR multiplier down and back up between a floor and 1, count direction reversals and stop the controller when it thrashes.
  - The cheap-ice checklist as an ordered effort-to-impact list: bevel every edge → light from inside → Fresnel rim → DOF → fog → fine grain → desaturate to near zero. No transmission until one hero object needs it. Choose the bloom threshold from the scene's own histogram — Igloo's near-white world runs at **0.2 and 0**, so copying a "high threshold" rule of thumb is the wrong move.
  - Offline bake for anything non-interactive: smoke, shatter and particle bursts simulated in a DCC and exported as Draco geometry or a KTX2 volume atlas; play back, never compute.
  - In-canvas MSDF type from a single KTX2 atlas decoded in a worker pool, always paired with a hidden DOM mirror — the fix for the 6.60 (`[recipe:gl-msdf-text]`).
  - Budget as a design constraint: entry < 20 KB; 3D app deferred; app bundle ≈ 1.45 MB raw; KTX2 and Draco for everything; decode in four dedicated workers.
  - Event-bound audio: rate-limited named SFX (enter / leave / click / shard), a bed, a visible toggle that states its current value.
  - Copy register as instrumentation: slash rules, monospace micro-labels, numeric readouts and leader lines turn corporate copy into readouts (compare [site:usavionix]).
  - A preloader that costs nothing — CSS `content:` keyframes, no framework work before first paint.
- **Don't take:**
  - The arctic world: snow plain, igloo, carved-crystal specimen cubes, the frozen mascot, the callout-line exhibit staging.
  - The descent-then-wrap chapter order and the flash / interference cut vocabulary as-is.
  - The hexes and the blue-grey monochrome — now this site's signature.
  - IBM Plex Mono-only as an identity; the slash-rule heading style; the copy lines `Scroll down to discover.`, `Sound:`, `Click to explore`, the mission sentence.
  - The asset names and files, the ASCII preloader glyph sequence, the aberration + godray + grain stack as a look.
  - **The closed shadow root.** It hides the canvas from tooling and assistive technology alike and makes a semantic mirror impossible; the 6.60 is a ceiling that was survived, not a licence.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Award level, date, all eleven scores, tags, credited studios | verified — the entry page itself |
| Site of the Year / Dev SOTY / Site of the Month | contradicted by the entry; [recalled medium] pending an annual-results page |
| Stack, versions, hosting, bundle sizes, asset table | verified — served files, measured |
| Scroll constants, snap, keyboard, adaptive DPR, bloom values | verified — read from `app3d.js` |
| Copy strings and content model | verified — the content object in `app3d.js` |
| Composition, beats, mobile, reduced motion | verified — the 15 captures, all with distinct md5s |
| Palette | two hexes verified from the entry, four theme tokens verified from source; fog/rim hexes [recalled medium] |
| Cheap-ice optics, scramble text, DCC toolchain | recalled — third-party teardowns |

**Live pass 2026-09-18: reachable, capture exit 0, scroll mode wheel (virtual scroll), sources `index.html` (1,410 B), `assets/index-2eb69c09.js` (16,546 B), `assets/App3D-f554a111.js` (1,487,415 B), Awwwards entry page.** All fifteen capture frames hash differently, so every state named above is a distinct rendered moment; because the page hijacks the wheel, the desktop and mobile frames are points along a camera path rather than document scroll offsets, and the `desktop-rm-*` frames are the same animation running unmodified. Earlier secondary sources retained for the recalled claims: `Vishagautam/igloo/captured_urls.txt` · `LAYTAT/igloo-reverse-engineering` · `swan4er/igloo` · `ryanonline1234/mediatastelibrary/families.json` · `vigchetan/Any-IDE` · `Venkata-Manoj/mere-human`. Batch-E desk research 2026-09-17, superseded where this pass contradicts it.
