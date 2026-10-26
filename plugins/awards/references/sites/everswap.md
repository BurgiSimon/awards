# EverSwap — https://everswap.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | brand — the pre-launch site of a DeFi protocol (trading, lending and borrowing on single-sided pools); every "Launch App" button only reveals "Coming soon" [verified, index.html + hoisted.D5QinsOB.js `start()`] |
| Industry | web3 |
| Visitor mode | experience — one scroll film through a painted landscape; the only outbound actions are Telegram and X at the close [verified, index.html] |
| Awards | TODO-ENTRY |
| Corpus rating | TODO-RATING |
| Studio / credits | **Lusion** — the production bundle prints "Created by Lusion: https://lusion.co" to the console and names its image export `Lusion_exported_image.png` [verified, hoisted.D5QinsOB.js]; the same in-house framework as [site:oryzo] (ScreenPaint, PostProfile, ScrollDomRange, `.buf`) [verified, class names] · TODO-ENTRY-CREDIT |
| Stack (evidence level) | **Astro**, one hoisted module and one stylesheet, static markup [verified, index.html `/_astro/`] · **three.js r148**, unmodified (`REVISION="148"`) [verified, hoisted.js] · Lusion's framework classes, plus `quick-loader`, `min-signal`, `normalize-wheel`, SplitType and an own `Tween` [verified, hoisted.js] · no GSAP, ScrollTrigger, Lenis or glTF / Draco / KTX2 loader [verified absent] · Cloudflare [verified, `server: cloudflare` response header] · fonts self-hosted WOFF2, `font-display: block` [verified, index.css] |
| Palette | CSS tokens and shader constants below; strategy: a painted landscape is the ground, dark forest green bookends it (preloader, footer), pale lime marks actions, off-white ink with a soft text-shadow [verified, index.css + hoisted.js + captures] |
| | `#203727` dark forest green: preloader, footer iris, button ink [verified, index.css `--color-dark-green`; hoisted.js `u_joinMaskColor`] |
| | `#e0ffab` pale lime: button pills, `::selection` [verified, index.css `--color-light-green`] |
| | `#fbfff4` off-white ink [verified, index.css `--color-white`] |
| | `#bccca2` active rail item [verified, index.css `--color-light-green2`] |
| | `#8a84d4` lavender the first scene cut dips through [verified, hoisted.js `u_evernetTransitionColor`] |
| | `#ADD8E6` → `#6495ED` sky of scenes 1 and 3 [verified, hoisted.js `SKY_COLOR_0/1`] |
| Type | **Feature Display** Extralight 200 / Regular 400 for headings, kickers and the preloader count; **Britti Sans** 300 / 400 / 600 for body and buttons [verified, index.css `@font-face`]. Sizes locked to a 1440 artboard (768 below 992 px): h1 `max(80px, 200u)`, h2 `max(65px, 110u)`, h3 `max(55px, 80u)`, body `max(16px, 20u)` [verified, index.css]. The visible h1 is a GL mesh in the same thin serif [verified, desktop-s25.png; face inferred] |
| WebGL dosage | canvas-first — one fixed WebGL2 canvas under every viewport, all copy but the h1 in the DOM, five Canvas-2D layers for the line work [verified, index.html + hoisted.js; manifest.json `canvases: 6`] |
| Scroll model | virtual float — `body` fixed with `overflow: hidden`; a wheel / touch / key integrator translates `#pages-container` (wheel clamped ±200 px per event, eased `1 − e^(−12·dt)`) [verified, index.css + hoisted.js; manifest.json `scrollMode: wheel`] |
| Narrative model | chaptered journey — a peak, a flight down the slopes, a river seen from above, three audiences, a cut into a lake, the close [verified, index.html + hoisted.js scene windows + captures] |
| Palette strategy | painted landscape as ground; forest green #203727 bookends, pale lime #e0ffab on actions |
| Type contract | extralight display serif + light grotesque (Feature Display + Britti Sans), headline drawn in GL |
| Awards / score | TODO-SHORT |
| Confidence | high (live source + captures + entry page) |
| Last verified | 2026-10-26 |

## 1. Concept and narrative
The kicker sets the idea: "DeFi at Peak." [verified, index.html]. The protocol is a landscape in which liquidity is literally water. The page opens on hand-painted peaks behind a thin outlined wordmark [verified, desktop-s25.png], flies down the slopes for "One Pool" [verified, desktop-s50/s75.png], turns to look straight down on a river for "Where liquidity Flows" [verified, desktop-s100.png], follows three lit trails through that valley for LPs, borrowers and traders, then cuts to a lake for "One Pool, Every Function" and closes on "Climb with EverSwap" [verified, index.html + hoisted.js]. The metaphor does two jobs: "pool" is both the product and the lake the film ends on. The copy register is short, protocol-generic claims ("Smoother execution, more efficient markets") [verified, index.html]; there are no numbers, no product screens and no app yet.

## 2. Structure and components
TODO-S2

## 3. Visual language
- **A painted world, not a rendered one.** The mountains read as gouache brushwork: lime and ochre planes, pale snow patches, flat violet shadow. The valley is a soft aerial river through tree clumps. Haze and bloom soften every frame [verified, desktop-s25/s75/s100.png]. Because no light is computed, the painting cannot be contradicted by a specular highlight (§5 lens).
- **One shape carries the identity**: a diamond (a square turned 45°). It is the logo mark, the preloader cut-out with hairline crosses, the rail items, the outline drawn around each chapter logo, the frosted squares behind them, and both GL scene irises [verified, desktop-s00/s50.png, index.css, hoisted.js].
- **Type**: an extralight display serif at poster scale ("One | Pool" split by a hairline, "Flows" centred) over a light grotesque body. Every DOM title carries a `0 0 .12em rgba(0,0,0,.3)` shadow to hold over the painting [verified, desktop-s50/s100.png, index.css]. The hero word is an outlined serif drawn in GL [verified, desktop-s25.png].
- **Chrome**: frosted-glass pills (`backdrop-filter: blur(8px)`, an inset highlight) for the header button and the phone header; a 6 px white scroll thumb on the right edge; the diamond rail on the left [verified, desktop-s50.png, index.css]. Grid: 16 columns (8 below 992 px), gutter .15 of a column [verified, index.css]. Selection is themed [verified]; no `theme-color` meta [verified absent].

## 4. Motion and effects (with parameters)
- **Scroll**: the transform-based virtual float in the header. Each section pins by counter-translating its content `translateY(−screenY)` while its CSS `padding-bottom` (100–500 vh) scrolls past, giving about 2,075 vh in all [verified, hoisted.js + index.css; sum inferred]. Keys: ArrowUp/Down ±100 px and PageUp/Down ± one viewport, the same `ScrollPane` as [site:oryzo] [verified].
- **Text**: no tween library. Lines (SplitType) and shuffled characters blur in as `opacity = r`, `filter: blur((1 − r) × .25em)` on overlapping windows. The closing title tilts back `rotate3d(−1, 0, 0, −25deg)` and recedes `translateZ(−300px)` in CSS 3D [verified, hoisted.js `TextBlurAnimation`, `HomePool`].
- **HERO** [verified, hoisted.js; desktop-s00/s25.png]:
  - the preloader is a Canvas-2D green field whose diamond cut-out grows from 7.5 % of the diagonal while the logo strokes fade in staggered (.05 apart, .5 long);
  - the GL camera dollies in over .2–2 s; the wordmark outline draws on over .75–2.75 s and the fill wipes in diagonally over 2–3.5 s;
  - kicker at 1.75–2.75 s, header at 2–3 s, rail after 2 s;
  - scrolling down the slopes adds radial and camera motion blur and a light trail [verified, desktop-s50.png].
- **NAV** [verified, hoisted.js `Navbar`, `Header`]: no GL. The rail items slide in from the middle out (stagger `|i − 2| × .06`, `cubicOut`) and hide over the hero on phones and over the footer. The active item closes its chevrons in `#bccca2` [verified, index.css]. "Launch App" swaps to "Coming soon" in .25 s on hover or tap.
- **FOOTER** [verified, hoisted.js `HomeJoin`, Final]: the frame zooms in while a diamond shuts onto the green ground, and the cursor paints an iridescent wake on that green. The DOM title, subtitle and link capsule blur and scale in on a time ratio (+1/s in, −2/s out) once the section is 95 % in view.
- **WHOLE PAGE**: three GL worlds on one scroll value. The hero runs from 0 to ≈ .35 of the page, the valley from ≈ .35 to .70, the lake from ≈ .72 [inferred, computed from CSS lengths and section `fit()` windows]. The cuts are a lavender blur dip and a diamond iris over a frozen frame (§5). Pointer channels ease through second-order springs (f 1.35, ζ .5, r 1.25) [verified]. There is no sound.

## 5. Tech and pipeline
- **Served weight** [verified, fetched files]: HTML 44,413 B, CSS 22,420 B, one entry module 748,781 B raw, about 185 KB gzipped locally (served brotli), about 107 KB of it three.js. There are no lazy chunks, workers or `import()` calls. Hashed `_astro` files and the models are sent `cache-control: max-age=0, must-revalidate` [verified, response headers]. DOM 438 nodes, CLS 0, no console errors [verified, manifest.json].
- **Intake** [verified, hoisted.js loader calls]: 23 `.buf` geometry files with quantised attributes, about 25 WebP textures with `mobile/` variants, two PNG logos, three framework textures (blue noise, SMAA area and search) and five WOFF2. Per-file bytes [unknown]: Cloudflare answers HEAD with no content-length, as on [site:oryzo].
- **Quality strategy** [verified]: DPR `min(1.5, dpr)`, a 2560 × 1440 render-pixel cap, phone textures, a phone camera track, bokeh quality 0 on phones, 8 instead of 12 lake clouds. There is no frame-time governor, no idle gate and no `visibilitychange` pause.
- **Load** [verified, hoisted.js `Preloader`]: assets → every material compiled one per frame on the fullscreen triangle (the last 15 % of the count) → a 1 s `quartInOut` exit → scroll locked until 1.5 s → header at 2–3 s.
- Lab blocking time (31 s headless, software GL) is a SwiftShader artefact, not a performance claim [verified, manifest.json].

### Tech lens: 3D
- **Intake**: as [site:oryzo], `.buf` only. Here the title, its outline, the camera tracks, the trail spline and the bird's path and bones are `.buf` too [verified, hoisted.js].
- **No run-time light**: zero lights, environment maps, PMREM or shadow casters in the app code [verified, counts in hoisted.js]. Every mesh is unlit painted WebP, decoded from sRGB by hand. It is fogged by distance (1800–2500) and by an analytic exponential height fog (`a .015`, `b .03`, camera height + 100) [verified, `skyAndFog`]. The brushwork is the lighting [verified, desktop-s25/s75.png].
- **Dimming swept by baked attributes**: per-vertex `shadowmask` and `trailRatio` move a dark front across the range as scroll passes each vertex's value [verified, `vert$3`]:
  - `min(dim, 1 − shadowmask × smoothstep(t − .1, t, uTrail))`
  - colour × `mix(1, .25, dim)`
  - sky lerped toward `#536970` / `#081733` [verified, hoisted.js]
- **A camera authored twice** [verified, `CameraControls`]:
  - baked tracks (`SC_01_CAMERA`, `SC_03_CAMERA`) carry position, quaternion, focal, a separate `mobileFocal` and focus distance per frame, lerped and slerped by section ratio;
  - fov comes from focal on aperture 41.4214 over a 2048 × 1024 gate, or a 1024 × 2048 portrait gate on phones;
  - the focus distance drives the bokeh, and the pointer pivots about half of it.
- **Camera seasoning** [verified]: load dolly z −200 → 0 and fov +5 → 0 over .2–2 s `cubicOut`; pointer look ±.01 rad eased .1 a frame; Brownian shake from 3-octave value-noise fbm (position .5 at .15, rotation .003 at .3).
- **Scene 2 camera**: straight down at height 150, panned along a 250 × 1500 strip of six tiles [verified].
- **Bones in textures, clocked by scroll** [verified, `Scene1Bird`, `vert$1`]:
  - 21 bones × 158 frames in two float textures (position, quaternion), two-bone skinning in the vertex shader;
  - wing frame `(scrollView × 2 + 2) × 30`, a flight path sampled over scene-1 ratio .042–.416;
  - depth rewritten to a chosen fraction of the focus distance (.6 → .35 → 1 → .8), so the bokeh pulls the bird in and out of focus on cue.
- **The GL title**: two meshes in camera space, scaled to the hidden DOM h1's rect, drawn from a camera frozen at track ratio .112. `pos.z *= endRatio` extrudes the flat letters as the shot moves on [verified, `Scene1Title`].
- **Windows**: scenes are toggled by `visible` and never disposed; the hero mountain is reused in scene 3. There is no physics and no raycast; OrbitControls is bundled but off [verified].
- **Counter-example**: the headline exists only in GL; its DOM twin is `visibility: hidden` and so absent from the accessibility tree [verified, index.css `#home-hero .title`].

### Tech lens: WebGL
- **Context**: one WebGL2 context (WebGL1 with float textures as fallback), antialias off, alpha off. There is no reduced-motion branch, no app-level `webglcontextlost` handler and no fallback content: without WebGL, `run()` throws and the green preloader stays [verified absent; outcome inferred from the code path].
- **Chain** [verified, `Postprocessing.addQueue`]: SMAA (.05) → half-res bokeh → bloom → radial blur → depth-reprojected motion blur (.35) → WaterPass → Final → paint distortion (`renderOrder 10`, after the grade). The framework parts are as in [site:oryzo]; new here are the radial blur, the WaterPass and the Final uniforms.
- **Selective bloom through alpha**: terrain writes `(1 − fog) × pow(1 − N·V, 5) × green` into alpha. The high-pass adds `alpha × selectiveStrength`, which rises 1 → 2.5 as the hero dims [verified, `frag$3`, `highPassFrag`, `Visuals`].
- **Scene profiles, rebuilt each frame** [verified, `Visuals.preUpdate`]:
  - hero: bloom 1.5663, threshold .72129, bokeh f/3 at focal 16; exit blur over ratio .85–.95;
  - valley: bokeh off; radial blur centred on whichever trail is lit, from (0, −2), (1, 1) or (−1, 1);
  - lake: bloom .95977, threshold .61101, f/10 at focal 100.
- **Cuts in the grade pass** [verified, `fragmentShader`, `HomePage`] — the model for [recipe:gl-grade-pass-scene-cuts]:
  - cut 1 blurs at full, half then quarter resolution into flat lavender;
  - cut 2 freezes the outgoing frame into a cache target and opens the lake inside a `sdRhombus` iris, while a 2D canvas draws the diamond's edge;
  - the footer zooms the frame up to about 3× and shuts a diamond onto `#203727` [verified, hoisted.js].
- **Authored 2:1 frame**: Final clamps uv.x to ±1/aspect and blue-noise-smears beyond it on ultra-wide screens [verified].
- **Water in post** [verified, `frag$7`]: two animated Worley layers foreshortened by `10 + 50·uv.y`, `#9370DB` → `#7447d1` [verified, hoisted.js]. A point light at (−2, 2, 25) shades it, scene refraction is .03, and the pointer's paint field advects the cells. It rises over the cut and sinks as the lake chapter arrives.
- **GPU spline trails**: 24 trails × 256 nodes. Each frame, one pass writes positions into a 256 × 24 float target, spiralling about one authored spline (3D simplex radius, spin 30–60). One instanced draw renders 3-sided tubes [verified, `Scene1Trails`, `positionFrag`].
- **Flow-mapped strip**: two-phase flow maps over six tiles that sample their neighbours across seams. Lit trail masks re-saturate the path ×1.35 and write alpha `trail × .35` for bloom. Smoke ribbons are widened by 4D simplex [verified, `frag$6`, `trailVert`].
- **Pointer**: the screen-paint field from [site:oryzo] / [recipe:gl-screen-paint-distortion] has three new readers:
  - the title: paint erases the fill (`1 − smoothstep(.2, .5, weight)`) and lights a travelling outline dash;
  - the water: the field advects its cells;
  - the footer: a `sin(vel × 40 + (0, 2, 4) × 10)` wake on the green [verified].
- **Noise**: 4D simplex with analytic derivatives (water warp, fog morph, cloud drift, smoke width), 3D simplex (trail radius), Worley (water), value-noise fbm on the CPU (shake), a 128² blue-noise texture for jitter and dither [verified].
- **Dead weight**: an FFT convolution bloom with a procedural eight-ray star kernel is built, then switched off by `USE_CONVOLUTION=!1;//!browser.isMobile` [verified].

## 6. Weaknesses
TODO-S6

## 7. Principles
1. **Let one metaphor carry the product's own nouns.** When the core term (here "pool", "flow", "liquidity") is a physical thing in the world, the scenery explains the product without a diagram.
2. **Paint the light into the asset.** Unlit, hand-textured geometry with only fog and grade keeps a strong illustrative style intact at every angle, and costs no light, shadow or environment work.
3. **Cut between worlds in the grade, not in the scene graph.** A frozen frame, a mask and a blur in the last pass cost a few texture reads and never render two worlds at once.
4. **Give the brand one shape and spend it everywhere.** The same diamond as mark, loader, rail, outline and transition mask makes a long scroll read as one object.
5. **Author the phone camera, don't crop the desktop one.** A separate portrait track keeps each shot composed on a narrow screen.

## 8. Take / Don't take
- **Take:**
  - the grade-pass cut family and its 2D edge layer `[recipe:gl-grade-pass-scene-cuts]`;
  - an authored portrait camera track beside the desktop one, and the authored focus distance driving the depth of field `[pattern:webgl-3d-scenes#camera-rigs]`;
  - bones baked into float textures, with an element's animation clock taken from scroll position rather than time;
  - baked per-vertex thresholds that let one scalar sweep a change across a mesh;
  - selective bloom written into the alpha channel by the material that knows where the glow belongs;
  - structurally: section beats sized by CSS padding with pinned content, so a chapter's length is a stylesheet value the DOM still owns;
  - typographically: one extralight serif at poster scale with a soft text shadow holding over busy imagery.
- **Don't take:**
  - the painted peaks, river and lake, the bird, or the summit metaphor for a finance product;
  - the diamond as identity, or the "One | Pool" split headline;
  - the forest green
    `#203727` [verified, index.css]
  - the pale lime
    `#e0ffab` [verified, index.css]
  - the lavender dip colour
    `#8a84d4` [verified, hoisted.js]
  - Feature Display with Britti Sans as a pairing;
  - the GL-only headline with a hidden DOM twin, the transform scroll without Home / End, the unnamed rail and the CTA without a destination.

## 9. Confidence and sources
TODO-S9
