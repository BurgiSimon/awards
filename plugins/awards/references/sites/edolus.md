# EDOLUS — https://edolus.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | campaign — a studio showcase dressed as the launch of an AI-infrastructure brand. The closing credits link to vertex3d.asia under the line "Now imagine your own." [verified, __game-scripts.js `endingCredits`]; that EDOLUS is a fictional client is [inferred] from that line |
| Visitor mode | experience |
| Awards | none looked up this pass [unknown] |
| Corpus rating | D 7.5 / U 4.8 / C 7.5 / Co 6.0 → weighted 6.54, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Vertex3D, linked from the ending credits [verified, __game-scripts.js]. An asset named `Seedance2-0_r2v_…_lowbitrate.mp4` suggests one video plate came from a generative video model [inferred, config.json file name] |
| Stack (evidence level) | **PlayCanvas Engine v2.21.4** (license banner), shipped as a PlayCanvas Editor export: `__settings__.js`, `__modules__.js`, `__start__.js`, `__loading__.js`, `config.json` (303 assets), scene `2509662.json`, and all 107 scripts concatenated into one `__game-scripts.js` of 1,001,509 bytes [verified, fetched files]. `deviceTypes: webgl2, webgl1`, `antialias: true`, `powerPreference: high-performance` [verified, __settings__.js]. **GSAP 3.12.5 core only**, injected from cdnjs by the loading screen. No ScrollTrigger, SplitText, CustomEase, Lenis or Howler [verified, __loading__.js; absent from __game-scripts.js]. Audio is PlayCanvas `sound.slot` [verified, __game-scripts.js]. Basis transcoder as a WASM module, `preload: false`; no Draco module [verified, __settings__.js]. Fonts: Fontshare General Sans 200–700 + Google Fonts JetBrains Mono [verified, __loading__.js] |
| Palette | page ground `#1d292c` [verified, styles.css] under a camera clear of `[0.118,0.118,0.118]`, which is `#1E1E1E` [verified, scene.json]; white type, body grey `#C4C7C7` [verified, __game-scripts.js `DiamondLabel`]; logo flips to `#1F1F1F` [verified, __game-scripts.js `OverlayManager`] past progress .72 for the light late scenes. The strategy is a **material world per scene**: blue orbital night, then warm sand-gold over the map, then near-black over gold for the UI cards [verified, captures]. No accent token |
| Type | grotesque display + mono HUD (General Sans + JetBrains Mono) [verified, __loading__.js]. Thin wide caps on the gate, heavy caps in-scene ("ORBITAL INTELLIGENCE"), tracked uppercase mono for captions [verified, walk/desktop-state-entered.png]. Six General Sans cuts are also PlayCanvas font assets (OTF to PNG atlas) for GL text [verified, config.json] |
| WebGL dosage | 100 % canvas: one `#application-canvas`, 250 DOM nodes, every chapter drawn in GL. The DOM carries only the gate, the logo, the audio control, the cursor hint and the ending credits [verified, manifest.json; __game-scripts.js] |
| Scroll model | virtual float: `overflow: hidden` body; the wheel, touch and arrow / PageUp / PageDown keys drive a 0–1 progress with lerp .1, frame-rate corrected; 32,000 px of wheel per full run, 4,000 px of finger travel on touch; idle snap to seven points [verified, styles.css; scene.json `scrollManager`] |
| Narrative model | chaptered journey — seven scene windows on one progress line: satellite → diamond map → datacenter → chip → UI cards → car → ending [verified, __game-scripts.js `SceneManager.SEGMENTS`] |

## 1. Concept and narrative
One continuous camera descent tells where "planetary intelligence" lives: from orbit, down to a city grid, into a server corridor, onto a chip, out through product UI and into an autonomous car, then a credits roll. Each chapter is a scene window on one progress value, not a page section. The register is aerospace keynote: big claims in caps, telemetry in mono, "Experience with headphones" on the gate [verified, desktop-s50.png]. The copy is category-generic ("Orchestrating the foundation of artificial intelligence…" [verified, desktop-s50.png]). It sells the studio's craft more than any product.

## 2. Structure and components
- **Load gate:** the logo, a progress band, then a CTA that builds from a 1 px line and scrambles in its label; hovering it pushes the Earth video in [verified, __loading__.js]. Only a click opens the gate: the CTA is a `div` with no `tabindex` or key handler [verified, __loading__.js].
- **Warm-up behind the gate:** before the CTA appears, the scene manager walks every chapter (see Tech lens). Mid-walk frames leak through the gate in the reduced-motion capture [verified, desktop-rm-s00.png].
- **Intro hold:** after the click the timeline stays at 0 while 1,200 px of scroll flies the satellite in. A "SCROLL TO BEGIN ↓" hint scrambles in beside the cursor [verified, scene.json `scrollManager`, `cursorManager`; walk/desktop-state-entered.png].
- **Chrome:** a centred logo whose O redraws in a loop, and an AUDIO control top right (a clickable `div`, label hidden on coarse pointers) [verified, __game-scripts.js `OverlayManager`].
- **Map chapter:** a bracketed HUD frame over a relief map with a glowing street grid. Scrambled glyph rows act as the loading text [verified, walk/desktop-state-p20-map.png].
- **Cursor:** a text hint at the start, then an orbit ring labelled "DRAG TO ROTATE" for progress .44–.466 [verified, scene.json `cursorManager`].
- **UI cards:** glass cards with headline, kicker and bullet list over a gold horizon arc [verified, desktop-rm-s00.png leak frame].
- **Close:** credits with the studio logo, a tagline, an email link and a replay. The replay sets a `sessionStorage` flag and reloads [verified, __game-scripts.js `endingCredits`; __loading__.js].

## 3. Visual language
Each chapter owns a material world under one camera: photographic orbital night with spectral lens flare, a sun-bleached relief map, a dark corridor, gold-on-black cards [verified, captures]. Dirt comes from film grain (intensity .02 at 24 fps) and a heavy chromatic smear on the scene change [verified, scene.json]. The type contract holds across chapters, and the HUD brackets frame each beat. Tone mapping is set to `4` in the scene with `gamma_correction 1`, skybox intensity .8 [verified, scene.json]. That 4 means ACES2 is [inferred, PlayCanvas constant order]. The viewport meta sets `user-scalable=no` [verified, index.html].

## 4. Motion and effects
- **Scroll:** lerp `1 − (1 − .1)^(60·dt)`; arrow-key step .12 of progress; snap to `[.44, .52, .145, .205, .06, .61, 1]` within ± .014 after 1 s idle [verified, scene.json; __game-scripts.js].
- **Stretch bands:** five progress ranges cost more scroll, so dense beats get time without re-timing the scene: satellite .06–.085 ×1.5, map .205–.28 ×1.6, chip .545–.57 ×2.5, UI .57–.705 ×1.5, car .715–.84 ×1.5. The bands are folded into one piecewise-linear raw ↔ progress map [verified, scene.json; `ScrollManager._recomputeStretch`].
- **Camera:** a keyframe table on progress, e.g. `t .75 → y −18, z 15, rx −20` and `t .8 → z 110` [verified, `CameraController.KEYFRAMES`]; tween defaults 1.2 s `power2.inOut` [verified, scene.json].
- **Eases:** `power1/2` in, out and inOut, `expo.out`, one `back.out(1.7)`; CSS `cubic-bezier(.4,0,.2,1)` and `(.65,0,.35,1)` on the loader [verified, __game-scripts.js; __loading__.js].
- **Text:** a hand-written TextScramble (per-glyph start 0–30 frames, end +0–40, glyph swap probability .28) [verified, __game-scripts.js prelude]. Typewriter and blur-reveal scripts exist [verified, script names].
- **Sound:** three music stems (melody, bass, instruments) are gain-mixed by nine progress bands, e.g. datacenter .28–.54 = .8 / 0 / .2. Stem fade-in 2 s, band fade 1.2 s, cross-fade 1.5 s. Fourteen one-shots are named per beat [verified, scene.json `audioManager`; config.json].

## 5. Tech and pipeline
- **Weight** [verified, config.json `file.size`]: GLB 23.5 MB in 12 files; the largest are a compute tray 7.5 MB, a car 7.3 MB and a satellite 3.7 MB. Also two MP4 plates of 6.0 MB and 5.7 MB, PNG 4.3 MB, WebP 4.3 MB (one 2.5 MB), Ogg 2.6 MB and a Basis WASM of 612 KB. Scripts are 1.0 MB unminified-per-file in one bundle. HEAD requests to Cloudflare returned no `content-length` [verified, curl -sI].
- **Bootstrap:** five classic scripts with no bundler and no code splitting. The engine is served without a length header [verified, index.html; curl -sI].
- **Resize:** `FILL_WINDOW` and `resolutionMode AUTO`, plus a 100 ms poll for iOS height changes [verified, config.json; __start__.js].
- **Quality:** `optimizeRetina`, an adaptive DPR between 1 and 2 (see WebGL lens). There is no static or no-WebGL tier [verified absent, __game-scripts.js].

### Tech lens: WebGL
- **Engine and canvas:** PlayCanvas 2.21.4, one canvas, WebGL2 with a WebGL1 fallback, clustered lighting on [verified, banner; __settings__.js; scene.json].
- **Programs:** 40-odd custom shaders, all named-uniform planes or point sets. They fall into five kinds [verified, uniform names in __game-scripts.js]:
  - fullscreen and backdrop fbm fields: `nebula`, `nebula2` (curl + fbm, `uSunMorph*`), `aurora` (`uOctaves`, `uMobile`), `cloudTransition`, `energyField`;
  - line and point fields: `dataLights`, `lightShot`, `plexus` (80 points, link distance .9, max 3 links), `matrix` (corridor 7 × 4, 14 side + 6 top lines × 22 particles), `dustLight` (300 particles, curl);
  - dissolves: `rackDissolve` (value noise, burn edge), `centerDissolve` (fbm), `chipDissolve`;
  - a grid-pulse system: `infraGrid`, about 60 uniforms with avenues, nodes and impact rings;
  - screen effects: `satelliteFeed` (scanlines, lens, chroma), `textblur`.
- **Pointer push is one shared uniform family:** `uMousePush / uMouseRadius / uPushAlong / uPushOut / uPushSwirl / uTrailAge`. Defaults .6 / 1.5 / 1 / .25 / .4 and trail .9 s are reused across matrix, dustLight and plexus [verified, attribute defaults].
- **Render targets:** four ping-pong pairs (`for i < 2`) at RGBA16F with an RGBA8 fallback. `pointerRipple` and `revealLightTrail` run at 512², `mapClouds` and `spacecloud` at 256². `screenRenderTarget` draws a scene into a monitor mesh, with depth [verified, __game-scripts.js]. The ripple runs as live config: brush .0515, decay .999, distortion .0442, chromatic .1, active only at progress .77–.98 [verified, scene.json].
- **Post, in camera script order:** film grain (.02, 24 fps) → bokeh (maxBlur .02) → bloom → `chromaticTransition` (displacement −.025, distort 2, pulse .15, dip .15 to white, 4 s) → `satelliteFeed` [verified, scene.json]. That this is the render order is [inferred, legacy post-effect queue]. Bloom is **disabled** in the scene, yet `PostFXManager` tweens bloom and vignette presets on every scene change, .9 s `power2.inOut` (e.g. Diamond threshold .2 / intensity 1.4) [verified, scene.json; `PostFXManager.PRESETS`]. Whether those presets have any effect is [inferred: none for bloom].
- **Scroll-banded focus pull:** depth of field ramps in from .40 to .46, holds to .50 and is gone by .556. Focus 20, maxBlur .01, falloff 4. The focus target switches to a second entity at .468 over a .0054 blend [verified, scene.json `bokehFocusRange`].
- **Warm-up walk:** before the gate opens, the scene manager emits progress at the 25 % and 75 % points of all seven windows. It holds each for 3 frames with frustum culling off, after a 5-frame delay, then settles for 2.5 s. The walk drives the loader bar (70 % walk, 30 % settle) [verified, `SceneManager`]. Its purpose, compiling shaders and uploading textures before the visitor sees them, is [inferred].
- **DPR governor:** median of 90 frame times; step down .25 above 21 ms after a 1.2 s cooldown; step up at ≤ 17 ms after 6 s, and only 1.5 s after scrolling stops. Pixel budget 4.6 MP desktop / 3 MP mobile. A failed step-up lowers the learned ceiling, which is stored in `localStorage` per `screen@dpr` for 24 h [verified, `OptimizeRetina`].
- **Text in GL:** canvas-2D textures (`worldText`, `textSatellite`, `CardDesign`, `intelligenceLayer`) with hover blur by pointer distance. No DOM mirror [verified, __game-scripts.js; manifest.json 250 nodes].

### Tech lens: 3D
- **Models:** 12 `.glb` containers, no Draco or meshopt module registered. Sizes: compute tray 7,507,724 B, car 7,325,056 B, satellite 3,652,756 B, three pods 1,535,080 B, diamond 1,450,272 B, map 456,348 B [verified, config.json; __settings__.js].
- **Textures:** 17 textures carry a `basis` variant beside their WebP or JPG source, mostly the material maps (solar panel, carpet, leather, wafer). Reflection and HDR-like maps ship as RGBM PNG with no variant [verified, config.json `variants`, `rgbm`].
- **Lighting:** a cubemap skybox (`Skybox.png`, rotated 90° on z, intensity .8) and an RGBM studio environment PNG. One directional and two warm spots (`newLight`, intensity 4 and 2) cast shadows; nine more spot and point lights have shadows off. There is a fake car shadow texture and a 2048 shadow atlas [verified, scene.json; config.json].
- **Materials:** 61 material assets [verified, config.json]. A `trueGlass` script sets refraction, IOR 1.5, thickness 1, roughness .35 and surface opacity .6. `emissiveFresnel` drives rim glow through `uCorePower`. A `chipTransform` implosion uses `uBlockSize / uScatter / uSpin / uStagger` [verified, __game-scripts.js].
- **Camera rig:** perspective, fov 45, keyframed on progress (see §4). Two pointer-look windows tilt the camera by cursor: .26–.40 at pitch 5° / yaw 6° / roll .8°, and .71–1 at 4° / 3° / 1°. Smoothing is .04 and the windows have faded edges [verified, scene.json `cameraController`].
- **Scene windows:** seven segments. A neighbour is enabled from half-way in by default; per-segment `preloadNextAt` and `dropPrevAt` overrides keep the datacenter → chip handoff live. Entities are toggled with `enabled`, never destroyed [verified, `SceneManager`]. 60 scripts carry destroy or `on('destroy')` handlers [verified, __game-scripts.js].
- **Animation:** one clip (`Take 001.glb`, 67 KB) through an anim state graph on the satellite [verified, config.json]. Everything else is progress-driven script.
- **Interaction:** a drag-to-rotate object with sensitivity .3, friction .95 and weight 6, on mouse and touch only. The ray hits are for the fluid sims, not picking. Physics is off [verified, `rotateObject`; config.json `use3dPhysics: false`].

## 6. Weaknesses
- Reduced motion: fail. No `prefers-reduced-motion` branch anywhere; the RM frames show the same gate [verified, __game-scripts.js; desktop-rm-s50.png].
- Keyboard: partial. Arrow and Page keys scroll, but the gate CTA, the audio toggle and drag-to-rotate are pointer-only `div`s [verified, __loading__.js; `OverlayManager`; `rotateObject`].
- DOM behind the canvas: fail. Chapter copy is GL texture only, `lang` is null and there are no headings [verified, manifest.json].
- Load gate: fail. Warm-up plus a click on every visit; only the replay flag skips it [verified, __loading__.js]. Headless frames timed out at 30 s [verified, manifest.json].
- Phone: the gate is laid out for the phone [verified, mobile-s25.png]. Touch maps 4,000 px of travel and the audio label hides; the 23.5 MB of GLB is not trimmed for mobile [verified, scene.json; config.json].
- Wayfinding and conversion: no chapter indicator and no jump control. The only action is an email in the credits after about 32,000 px [verified, __game-scripts.js].

The awards skills take the same descent but give the gate a real `<button>`, render one settled frame per chapter under reduced motion, keep each chapter's copy in a DOM twin, and add a chapter rail that also steps by keyboard.

## 7. Principles
1. One progress value can own a whole film: scene windows, camera keys, post presets, sound mix and cursor states all read it, so nothing drifts.
2. Spend scroll where the beat is dense: remap progress through stretch bands instead of re-timing the scenes.
3. Warm every scene before the visitor can see it, and let that walk be the loading bar.
4. Score the chapters, don't loop a bed: mix stems by chapter so the music changes register with the picture.
5. Bound the pointer's influence to the chapters that earn it; outside them the camera is still.
6. Learn the device once: persist the frame-time-tested resolution ceiling so a repeat visit starts right.

## 8. Take / Don't take
- **Take:** the stretch-band remap (piecewise-linear, overlapping bands discarded); seven-point idle snap after 1 s; the warm-up walk (25 % / 75 % of each window, 3 frames, culling off); progress-windowed pointer look with faded edges; the DPR governor's median-of-90, 21 / 17 ms thresholds and persisted ceiling; stems mixed per band with 1.2 s fades; one shared push-uniform family for every particle field.
- **Don't take:** the orbit → map → datacenter → chip → car order, the "planetary intelligence" lines, the satellite or car models, the spectral-flare orbital look as-is, the click-only gate, `user-scalable=no`, or these hexes:
  - `#1d292c` [verified, styles.css]
  - `#1E1E1E` [verified, scene.json clear colour]
  - `#C4C7C7` [verified, __game-scripts.js]
  - `#1F1F1F` [verified, __game-scripts.js]

## 9. Confidence and sources
Header, stack, scroll, sound, both lenses: high (literal values from the served engine banner, `config.json`, scene JSON and the script bundle) · narrative beats: high for order (segment table), medium for look (two post-gate frames plus one warm-up leak frame) · palette per scene: medium · rating: inferred.

**Live pass 2026-10-05: reachable (host resolves via Cloudflare).** First capture exit 2: every desktop and mobile frame shows the load gate; `desktop-s00`, `s25`, `s75` and `mobile-s00` timed out; scroll mode wheel; no console errors or failed requests [verified, manifest.json]. One retry (`walk/`) with a states plan: wait for `#custom-cta`, click it, then wheel. `entered` and `p20-map` rendered; the four later states timed out waiting for the CTA to become clickable under SwiftShader [verified, walk/manifest.json]. LCP figures are headless cold-cache artefacts, not performance claims. Sources: https://edolus.com/ (index.html, styles.css, manifest.json, `__settings__.js`, `__modules__.js`, `__start__.js`, `__loading__.js`, `config.json`, `2509662.json`, `__game-scripts.js`), the first 1.5 KB of `playcanvas-stable.min.js` for the banner. No models, textures, audio or video were fetched.
