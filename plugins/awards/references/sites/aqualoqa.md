# Aqualoqa — https://aqualoqa.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | brand (pre-launch splash for a haircare label on a password-protected Shopify store; every route answers with the splash, served at `/password` and rewritten to `/`) [verified, index.html `pageType":"password"`, `history.replaceState`] |
| Visitor mode | experience: one screen to play with, socials as the only exit [verified, index.html + captures] |
| Awards | none found [unknown]; no award entry was looked up |
| Corpus rating | D 7.4 / U 5.6 / C 7.4 / Co 5.0 → weighted 6.62, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | [unknown]; the code credits its sand engine as a port after the open-source `johnrobinsn/sandtoy` [verified, index.html comment] |
| Stack (evidence level) | **Shopify** Horizon 4.1.5 theme with a custom Liquid splash section [verified, index.html `Shopify.theme`] · **hand-written WebGL** (WebGL2 with `EXT_color_buffer_float`, WebGL1 + `OES_texture_float` fallback), no library [verified, index.html] · canvas-2D for the ground and the film grain [verified, index.html] · CSS transitions only, no animation library [verified, index.html] · fonts self-hosted Playfair Display (instanced 400/700, subset) and DM Sans 400 [verified, index.html `@font-face`] |
| Palette | photographic: warm sand photograph as the ground, the TV reel as the only cool colour, white chrome, one orange accent on the loader counter (hexes in §3) [verified, index.html + desktop-s00.png] |
| Type | DM Sans for the counter, labels and copyright line; Playfair Display loaded for a commented-out "Coming Soon" line; the wordmark lives inside the video, not in type [verified, index.html + desktop-s00.png] |
| WebGL dosage | canvas-first: three fixed full-viewport canvases (2D ground, WebGL sand, 2D grain) around one masked `<video>`; the GL layer is transparent until a grain is moved [verified, index.html; manifest.json `canvases` 3] |
| Scroll model | none: `overflow: hidden`, `touch-action: none`, a single viewport [verified, index.html CSS] |
| Narrative model | single-object launch: an old television half-buried in sand, playing the brand reel; the visitor digs the sand around it [verified, desktop-s00.png + index.html] |

## 1. Concept and narrative
A brand that does not exist yet, shown as an object found on a beach. A top-down photograph of sand holds a buried cathode-ray television whose screen plays a looping seascape reel with the wordmark set into it; moving the pointer brushes the sand grain by grain, revealing a darker, smoother layer beneath, and the brushed grains slide off the set's raised bezel back onto flat ground [verified, desktop-s00.png, index.html sim comments]. There is no copy beyond the tagline in the meta description and the copyright line; the register is atmosphere, sound and touch [verified, index.html].

Beats [verified, index.html `beginReveal`]: an opaque black loader with a percentage counter → the counter fades → the scene zooms out from inside the TV screen to the whole beach → the reel starts with sound → header and footer chrome fade in → a hand icon invites a touch.

## 2. Structure and components
- **Loader**: black sheet, counter at 80 px with a "Loading" label; progress is 25 % scene images, 75 % video buffer, held at least 1.4 s and at most 6 s for the video; the images are a hard gate [verified, index.html `MIN_LOAD_MS`, `MAX_LOAD_MS`, `loaderTick`]. Runs on every visit [verified, no storage check in source].
- **Zoom-out reveal**: `#scene` starts scaled so the TV screen fills the viewport ×1.12, then transitions to scale 1 [verified, index.html].
- **TV box**: the `<video>` is absolutely placed over the photographed screen glass from measured coordinates and clipped by a PNG mask [verified, index.html `SCREEN`, `#tvbox` mask].
- **Header**: Reset-sand and Sound buttons left, three social links right; on phones the controls centre and the socials move to the footer [verified, index.html, mobile-s00.png].
- **Footer**: one uppercase copyright line [verified, desktop-s00.png].
- **Tap hint**: an animated hand icon below the TV until the first pointer move [verified, desktop-rm-s00.png + index.html].
- **Hidden password entry**: CSS for a discreet bottom-right link and a password panel exists, but neither element is in the served markup, so the inline script that opens it throws on load [verified, index.html; manifest.json `pageErrors` "Cannot read properties of null"].
- **Custom cursor**: an SVG cursor on `html, body` [verified, index.html CSS]. 404 [unknown] (every route serves the splash [inferred]).

## 3. Visual language
- **Ground**: black loader and backgrounds:
  `#000` [verified, index.html CSS]
- **Ink**: white chrome icons and footer text:
  `#fff` [verified, index.html CSS]
- **Accent**: the loader counter and the password submit button:
  `#F2643E` [verified, index.html CSS `#loadPct`]
- **Chrome gradients**: header and footer get a black 50 % → 0 % gradient after they settle [verified, index.html `#hdr::after`].
- **Imagery**: one golden-hour sand photograph (1849 × 2350 artboard) with a TV and three shells, a smoother "under-sand" twin, and a seascape reel; the wordmark colour changes between reel shots (blue, crimson) [verified, index.html `BG_W`, `BG_H`; desktop-s00.png, mobile-s00.png].
- **Grain**: a canvas of eight 192 px random tiles at half resolution, overlay blend at .07, re-drawn every third frame with jitter and strength .7–1 [verified, index.html `drawNoise`, `#noise`].
- **Layout**: width-fill on desktop; on portrait or under 768 px the scale fits the TV to 94 % of the width and the exposed bands are filled with mirrored strips of sand [verified, index.html `layout`, `drawFullBackground`; mobile-s00.png].
- **Surfaces**: `lang="en"`, no `theme-color`, no `<h1>` [verified, index.html].

## 4. Motion and effects (with parameters)
- **Reveal zoom**: 1.8 s `cubic-bezier(0.22, 1, 0.36, 1)` from the screen centre; counter fade .45 s, loader fade .6 s after .15 s [verified, index.html CSS].
- **Chrome entry**: .7 s opacity + 8 px translate, footer .15 s later; gradients fade .9 s a second after [verified, index.html CSS + `beginReveal`].
- **Sound**: the reel tries to start unmuted after the zoom; if refused, it plays muted and unmutes on the first pointer, key or touch [verified, index.html `startFootage`].
- **Reset**: the sand glides home (displacement × .86 per frame) for 2.6 s, then the buffers are cleared [verified, index.html `resetSand`, `MOTION_FS`].
- **Sand**: GPU particle sim, parameters in the lens below.
- **Reduced motion**: the zoom and chrome transitions are skipped and the tap-hint animation stops; the sand stays live (it only moves under the pointer) [verified, index.html; desktop-rm-s00.png].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Platform | Shopify, Horizon 4.1.5, store password-gated | [verified, index.html] |
| Rendering | raw WebGL, four programs, DPR `min(devicePixelRatio, 2)` | [verified, index.html] |
| Motion | CSS transitions + one rAF loop | [verified, index.html] |

Weights from response headers: reel MP4 15,133,172 B, sand photograph 572,439 B, under-sand 516,575 B, terrain map 8,923 B, protect mask 2,256 B, poster 16,910 B [verified, `curl -sI` 2026-10-05]. The splash is one 104 KB HTML file with every script inline [verified, index.html]. Manifest: 273 desktop DOM nodes, three canvases, WebGL on, CLS .0011 [verified, manifest.json].

### Tech lens: WebGL
- **Context**: WebGL2 RGBA32F targets when `EXT_color_buffer_float` exists, else WebGL1 with `OES_texture_float`; with neither the effect is skipped with a console warning and the photo and video stay [verified, index.html].
- **Particle grid**: `GRID 1102`, one grain per cell, ≈ 1.21 M points drawn twice a frame; the comment still says 512² and 668², so the count grew by hand [verified, index.html].
- **State**: two float ping-pong pairs at 1102²: a wake timer (R) and motion (RG displacement, BA velocity), nearest filtering, swapped every frame [verified, index.html `fbo`, `tick`].
- **Program 1, wake timer (fullscreen)**: uniforms `uTime uMotion uViewport uMouse uActive uRadius uWake`; grains inside the brush get `uWake 120` frames, others count down; only used if reassembly is turned on [verified].
- **Program 2, motion (fullscreen)**: uniforms `uTimeT uMotion uNoise uMask uViewport uMouse uDelta uActive uRadius uNoiseAmt uIntensity uDamping uReassemble uForceHome uTerrain uSlope uSteepLo uSteepHi` [verified]. Inside radius 40 px, velocity = (pointer delta × (1 − r³) + noise × 4) × mask × 1; pointer delta clamped to 26 px a frame [verified, `RADIUS`, `NOISE_AMT`, `INTENSITY`, `MAX_DELTA`].
- **Noise**: a 1102² RGBA texture of `Math.random()` bytes, one random vector per grain; no procedural noise family [verified, index.html].
- **Protect mask**: a PNG (white = sand, black = TV) through `smoothstep(.25, .75)` scales the brush to zero over the set, so the screen is never brushed [verified].
- **Terrain physics**: an artist height map, R/G = uphill gradient, B = height; engaged grains get `vel −= slope × 1.1`; the settle threshold `1 − .92 × smoothstep(.06, .45, |slope|)`, × `.65 + .7 × noise.b` per grain so no crisp contour forms; velocity under the threshold snaps to 0; damping .13 per frame; `REASSEMBLE 1.0` keeps the sand where it is left [verified, `SLOPE_FORCE`, `STEEP_LO`, `STEEP_HI`, `DAMPING`].
- **Program 3, hole pass (points)**: at each grain's home, a point of size `max(W, H)/1102 × DPR × 1.25` paints the under-sand image where displacement exceeds .75, alpha `smoothstep(.45, 2.5, disp)` [verified, `HOLE_FS`, `MIN_DISP`].
- **Program 4, grains (points)**: round points of `max(W, H)/512 × DPR × .79`, coloured from the cover-cropped photo at the grain's home UV, drawn only once moved [verified, `DRAW_FS`].
- **Texture prep**: photo and under-sand cropped through canvas-2D at 1024 wide, mask and terrain at 512 wide, re-uploaded on resize [verified, `updatePhoto`].
- **Post**: none in GL; grain is a separate 2D canvas overlay [verified].
- **Text in GL**: none [verified].
- **Quality tiers**: none beyond the DPR cap; the grid is fixed at 1102² on every device [verified]; continuous rAF with no idle gate [verified, `tick`] — screenshots under SwiftShader timed out at 30 s on the first capture run [verified, manifest-run1.json].

## 6. Weaknesses
- Reduced motion: **pass** for reading — the frame is complete at rest [verified, desktop-rm-s00.png]; the GL sim still runs every frame [verified, source].
- Keyboard: **fail for the toy, pass for chrome**. Reset and Sound are real `<button>`s with `aria-label`s and socials are links; the sand answers only `pointermove` [verified, index.html].
- DOM behind the canvas: **fail**. No heading, no product, no brand name in text except the copyright line; the wordmark is inside the video [verified, index.html + captures].
- Load gate: **fail for repeat visits**. A 1.4–6 s counter on every visit while a 15 MB reel buffers [verified, source + headers].
- Sound: autoplay with sound is attempted by default [verified, `startFootage`].
- Script error: the password-panel script throws on every load [verified, manifest.json].
- Cost: ≈ 1.21 M points × two passes every frame, no idle gate, no device tier [verified, source].
- Phone: **pass**. A designed portrait layout with the TV near full width and mirrored sand bands; `touch-action: none` lets a finger brush [verified, mobile-s00.png + index.html].
- Conversion: socials only, no email capture for a launch [verified, index.html].

**What the awards skills do differently**: the counter becomes once per session and waits on images only, never on a video [recipe:preloader-counter-hold]; sound is opt-in [recipe:sound-toggle-opt-in]; the sim sleeps when nothing moved and drops grid size by tier [recipe:gl-fps-governor-idle-gate] [recipe:quality-tiers]; a DOM `h1`, a sign-up and a keyboard brush path (arrow keys move a virtual brush) sit beside the toy.

## 7. Principles
1. **Make the ground the interface.** When a page has one screen, let its surface be the thing a visitor touches rather than a backdrop behind buttons.
2. **Give a particle field a terrain.** A painted height map with slope and a settle threshold turns noise-scatter into material that behaves like the thing in the photograph.
3. **Protect the signal with a mask.** A painted mask over the brush force keeps the message legible however hard the visitor plays.
4. **Reveal a second layer, not a hole.** Paint vacated cells with a prepared under-image so interaction exposes something designed.
5. **Persist what the visitor did, offer a reset.** Marks that stay make the toy feel owned; one control clears them.

## 8. Take / Don't take
- **Take:**
  - Float ping-pong state (displacement + velocity in one RGBA texel) for a photo-sampled point field.
  - A 1 − r³ brush falloff fed by clamped pointer delta plus per-grain noise.
  - Height-map slope forces with a slope-dependent, per-grain-jittered settle threshold.
  - A mask uniform that scales the force to zero over protected content.
  - A hole pass that draws an under-image at home positions of moved grains.
- **Don't take:**
  - The colours as literal values:
    `#000` [verified, index.html CSS]
    `#fff` [verified, index.html CSS]
    `#F2643E` [verified, index.html CSS]
  - The buried television on a beach, the seascape reel, the zoom out of the screen, the shells and the photography.
  - The 1102² grid and the exact constants as-is; a video-gated loader on every visit; sound on by default.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Stack, WebGL lens, motion parameters, tokens | high: index.html (all code inline) |
| Composition, phone, reduced motion | high: desktop, mobile and desktop-rm captures |
| Awards, credits, 404, the store behind the password | unknown |

**Live pass 2026-10-05: reachable; robots.txt allows `/`, its agent notes concern checkout only.** The first run (`--scroll 0,25,50,75,100 --mobile --reduced-motion --wait 6000`) exited 2 with every screenshot timing out, the continuous 1.21 M-point render stalling SwiftShader. One retry (`--scroll 0,100 --wheel 12000 --wait 6000 --timeout 90000`) exited 2 with all six frames; s00 and s100 are identical because the page does not scroll. The pointer was never moved, so no brushed state was captured; sand behaviour is read from source. Sources in `.awards/research/aqualoqa/`: `index.html`, `desktop-*`, `mobile-*`, `desktop-rm-*` frames, `manifest.json`, `manifest-run1.json`; asset sizes from `curl -sI` only.
