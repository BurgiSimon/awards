# CUTOBOT — https://cutobot.byholm.co/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | campaign: a studio showcase. HOLM presents an experimental "webfilm" whose opening rail doubles as the service pitch (the stops are titled "WHAT IT SUITS" and "WHO MAKES IT") [verified, main.js `duraklar`] |
| Visitor mode | experience |
| Awards | none looked up this pass [unknown] |
| Corpus rating | D 7.8 / U 5.6 / C 8.0 / Co 7.4 → weighted 7.14, 2026-10-05 [inferred, from captures and source against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Canberk Polat (HOLM) per `og:site_name` [verified, index.html]. The opening copy says HOLM is one person who models, shades and ships the work [verified, main.js `duraklar`] |
| Stack (evidence level) | **Vite** build (`/assets/main-<hash>.js`, one 1,161,155 B module plus 6,625 B CSS) [verified, index.html; curl -sI]. **Three.js r180** (`REVISION "180"`) with GLTFLoader + DRACOLoader, EffectComposer, UnrealBloomPass, GTAOPass, Reflector, Sky and PMREMGenerator from the addons [verified, main.js]. **Lenis 1.3.26** (`lenisVersion`) [verified, main.js]. No GSAP, no ScrollTrigger, no audio library: WebAudio plus one `<audio>` loop [verified, main.js]. Hosting: Vercel DNS [verified, getent]. Fonts: Inter Variable + JetBrains Mono Variable, self-hosted WOFF2 [verified, main.css] |
| Palette | Two grounds: the film is black, `html` `#000` and `theme-color` `#000000` [verified, index.html]; the preloader is near-black `#08080a` with off-white line `#f6f5f2` [verified, index.html inline loader]; the opening is a pale grey noise paper `#e9e9e9` under a radial `#ffffff → #97979f` with ink `#0c101a` [verified, main.js `K0`]. The worlds are lit, not tokenised: magenta grass, pink key light and a blue fill in the first world (`mor` preset) [verified, main.js `ch`]; the share image is described as blue robots on magenta grass under a pink sky [verified, index.html `og:image:alt`]. The scrollbar thumb is themed `#9c2a63` [verified, index.html] |
| Type | grotesque + mono: Inter Variable for the opening headlines, JetBrains Mono at 11 px tracked caps for HUD, counter and buttons [verified, main.css; main.js `A0`] |
| WebGL dosage | 100 % canvas for the film: one fixed Three.js canvas marked `aria-hidden` and `role="presentation"`, plus the loader's 2D canvas [verified, main.js; manifest.json `canvases: 2`]. The opening rail and the setup dialog are DOM |
| Scroll model | native + Lenis: `body` is sized to `100 + 170 × film-seconds` vh, and Lenis 1.3.26 (duration .62, smoothWheel) is locked until BEGIN. Its progress feeds a speed-limited, forward-ratcheted film clock; an AUTO mode scrolls the document itself [verified, main.js `y_`] |
| Narrative model | chaptered journey, looping: one robot walk through named beats (walk, fall, grass, encounter, chase, mirror, world two, world three, meeting, lens, marble walk, skateboard ride, flip, mirror jump) that ends back at the start [verified, main.js `li`, `Th`; index.html synopsis] |

## 1. Concept and narrative
A "webfilm": a short film with no video file, computed in the browser while the visitor scrolls. The visitor holds the timeline: scroll and the robot walks; stop and the world waits. The page argues the medium before it shows it. A horizontal opening rail of about eight titled stops explains what a webfilm is, how it adapts to the machine, what it suits and who makes it [verified, main.js `duraklar`]. Then ENTER THE FILM opens a two-question setup (sound on or off, manual or auto scroll) before BEGIN [verified, main.js]. The film is a wordless sequence of beats: a small four-legged robot walks off a finite ground and crosses grass worlds, mirrors and a lens, rides a skateboard and returns to the start [verified, main.js beat table; index.html synopsis]. Register: plain, first-person craft prose with no superlatives [verified, main.js].

## 2. Structure and components
- **Preloader:** a 2D canvas draws the robot as a white line drawing, stroke by stroke, with a spaced three-digit counter at 87 % of the viewport height [verified, desktop-s00.png to desktop-s75.png; index.html inline loader]. It runs in a worker on an `OffscreenCanvas`, so shader compilation on the main thread never freezes the pen [verified, index.html comments]. Pen pace is capped (floor .16, ceiling .22) and a closing sweep catches up the remainder. The exit "tear" grows from the robot's body with exponent 4.5 [verified, index.html].
- **Opening:** the first stop sets a wordmark-scale CUTOBOT over the live-rendered blue robot on grey paper. A five-line mono column sits bottom left, the ENTER THE FILM ring bottom centre, SCROLL → bottom right, the H mark top left and a BOOK A CALL pill top right [verified, gated/desktop-state-opening.png]. The pill goes to a booking page; LinkedIn, e-mail and studio links are also listed [verified, main.js `baglantilar`].
- **Opening rail:** the robot stays centred and turns while titled text stops (Inter headline over a mono paragraph) slide past [verified, gated/desktop-state-rail-end.png]. The rail is a horizontal row of stops on grey paper, driven by wheel, touch and keys (arrows 120, PageDown and Space 380) [verified, main.js]. Words reveal through per-word masks, .55 s `cubic-bezier(.16,1,.3,1)` with .022 s stagger, and the transitions are switched off under reduced motion [verified, main.js].
- **Enter button:** offered on the first opening frame, so the rail is optional [verified, gated/desktop-state-opening.png]; a real `<button>` with a 104 px ring that floods with the film colour on hover. Its click scales the page from the button's centre into the film [verified, main.js `k0`].
- **Setup dialog (`.trc`):** SOUND ON/OFF, SCROLL MANUAL/AUTO with a one-line note, then BEGIN; all of them are buttons [verified, main.js].
- **HUD:** two text buttons, SOUND ON/OFF and AUTO ON/OFF. Any wheel or touchmove hands control back from AUTO [verified, main.js `F_`].
- **Phone gate:** a portrait phone in the film gets a full-screen "rotate your device" `alertdialog` with an animated handset [verified, index.html `#yatay`]. No portrait path was found [verified absent, index.html and main.js `dikizin`].
- **Skip:** `?film` or a `sessionStorage` flag jumps past the opening [verified, main.js].

## 3. Visual language
Two registers on purpose. The pitch is printed matter: grey noise paper, dark ink, tracked mono [verified, main.js `K0`]. On the opening the robot is a rendered blue object with a soft contact shadow on the paper [verified, gated/desktop-state-opening.png]. The film is black-framed and saturated: magenta-to-pink grass, a pink key, a blue fill and procedural skies with clouds [verified, main.js `ch`, `Li`]. A painterly filter, an ink contour pass, grain, vignette and dither give the render a drawn rather than photoreal surface [verified, main.js post chain; see Tech lens]. The robot's shell switches between an orange original and a blue `#65a4d8` per world [verified, main.js `av`, `turuncu`/`mavi`]. Grass, marble, travertine and tile carry triplanar PBR maps from WebP textures [verified, main.js `/doku/` paths]. The scrollbar is themed and `user-select` is off [verified, index.html].

## 4. Motion and effects
- **Scroll:** Lenis duration .62 with smoothWheel. Raw progress is clamped to move at most `3.8 × dt / filmSeconds` per frame (`f_ = 3.8`), so a flick cannot outrun the film. A floor (`tabanKoy`) is set on entering the grey world, so the visitor cannot scroll back into world one [verified, main.js `y_`, `Vx`]. The limiter is off on localhost [verified, main.js `L5`].
- **Camera:** a keyframe list on film progress, `{p, pos, hedef, takip, kontrol}`, with follow shots and quadratic control points [verified, main.js `mercekYolu`]. Smoothing defaults to 12 (`d_`) [verified, main.js]. Pointer look: yaw .08, pitch .046, smoothing 3.2 [verified, main.js `We`].
- **AUTO:** the page scrolls itself at a rate constant of 1.75 (`p_`) [verified, main.js `otoSur`].
- **Walk:** procedural, not keyframed (see 3D lens).
- **Sound:** off until chosen. Music loops at gain .5 and effects at .32; switching off ramps to 0 over .5 s [verified, main.js `Oa`, `Xh`].
- **Reduced motion:** the loader fade drops to .01 ms, the rotate-hint animation stops and the opening word reveal loses its transition [verified, index.html; main.js]. The film itself has no reduced-motion branch [verified, main.js `Iu` use].

## 5. Tech and pipeline
- **Weight** [verified, curl -sI content-length]: `cutebot.glb` 316,548 B, `dunya2.glb` 274,844 B, `oda.glb` 89,272 B, `kaykay.glb` 70,728 B (751 KB of geometry in total); `muzik.mp3` 2,593,018 B; a sample texture `rock051_color.webp` 287,970 B, one of 12 WebP material maps; JS 1.16 MB, uncompressed size as served.
- **Boot:** the loader steps are named (`sahne + cevre`, `robot`, `kabuk dokusu`, `cimen`, `kaykay`), with a shader warm-up (`isit`) before the gate [verified, main.js].
- **Quality:** a phone or coarse pointer gets a DPR cap of 1.4 against 1.75, grass at 45 %, no MSAA, bloom at .3 scale and the mirror at .25 scale. It also disables shadow maps, raises exposure (1.18 against 1.05) and cuts sky fbm to 2 octaves [verified, main.js `is`, `dv`]. Then a frame-time governor applies (see 3D lens). Console methods are silenced in production [verified, main.js].
- **Resize:** composer, GTAO, bloom and portal pass resized from the drawing buffer; `orientationchange` re-dispatches resize after two frames [verified, main.js].

### Tech lens: 3D
- **Intake:** four `.glb` totalling 751 KB through GLTFLoader with a **self-hosted Draco decoder** (`setDecoderPath("/draco/")`, `preload()` at boot) [verified, main.js; curl -sI]. Whether each file is Draco-compressed is [unknown]; no model body was fetched. Meshopt and KTX2 are bundled but not registered [verified, main.js].
- **Generated assets:** the robot is grown in Blender from a script, and the walk comes from a motion profile, not keyframes [verified, main.js opening copy]. The rig exposes `RIG_hip/knee/ankle_{LF,LB,RF,RB}` and eyelid bones [verified, main.js].
- **Procedural gait:** phase tables per leg: trot `{LF 0, RB 0, RF .5, LB .5}` cycle .6 and wave `{LB 0, LF .25, RB .5, RF .75}` cycle .75, with wave as default; walk cycle .6 s [verified, main.js `g1`, `L0`]. Feet meet the ground wherever the body is [verified, main.js copy]; that it is analytic IK on the three bones is [inferred].
- **Lighting:** a directional key casts PCF-soft shadows. Its map is 2048² for the near rig (frustum ±14, bias −.0008) and 4096² for world two (frustum ±120, 2048 on phones) [verified, main.js]. The environment is PMREM `fromScene` of a procedural sky, not an HDR file [verified, main.js]. Per-world light presets fix key, fill, rim and fog: `mor` key `#ff4f9a` at 13, fill `#2f5cff` at 7, fog 26–62; `gri` fog 18–90; `tus` fog 60–520 [verified, main.js `ch`]. NeutralToneMapping (constant 7) at exposure 1.05 in the film; the opening preset switches to ACES at .8 [verified, main.js].
- **Sky:** three's Sky shader extended with fbm clouds, a horizon band and gradient blend; four presets (`ilk`, `gri`, `tus`, `dunya2`), e.g. `ilk` elevation 4.3°, azimuth 28°, mie 5e-4, exposure .49 [verified, main.js `Li`].
- **Grass:** 380,000 instanced blades, radius 58, 2,600 clusters, wind .32 at speed 1.15, gust .6, translucency .68 [verified, main.js `ee`].
- **Mirrors:** Reflector surfaces act as doors between worlds (`aynaGec`, `aynaYuru`, `aynaZipla` beats) [verified, main.js].
- **Materials:** shell metalness .94, roughness .31–.41, env .55; procedural grain via `onBeforeCompile` hooks on stock materials; triplanar rock, travertine and tile [verified, main.js `n5`].
- **Camera:** perspective; the fov widens below the 16:9 design ratio so the frame's width is preserved [verified, main.js `X3`]. Keyframes on film progress with follow and control points; a WASD/QE free camera is kept as a debug path [verified, main.js].
- **Post, in order:** RenderPass → GTAO (half resolution, radius .35, 8 samples, off by default) → bloom composite (a separate bloom composer at .4 scale, UnrealBloom strength .55, radius .4, threshold .85) → depth-of-field (off) → OutputPass → painterly quadrant filter (radius 6, step 2, sharpness 18) → ink contour from GTAO depth and normals (colour `#101c26`, threshold .1, thickness 1.4) → grade (vignette, warm base `#f7c6a5`) → transition → lens shell (grain .045) → dither (desktop only) → portal lens (refraction .1, noise .035, chroma .006) [verified, main.js values]. The pass order is [verified]; reading the filter as Kuwahara is [inferred, four-quadrant mean and variance code].
- **Governor:** median of 22 frames after a 3 s warm-up. Above a 20 ms ceiling, with a 1.5 s cooldown, it steps down a one-way ladder. Desktop: DPR 1.45 → grass 55 % → DPR 1.2 → grass 30 % → DPR 1.0 with the painterly pass off. Phone: seven steps down to DPR .85 and grass 20 % [verified, main.js `ur`, `Rx`, `Cx`]. It never steps back up [verified].
- **Disposal:** 36 `dispose()` calls in the app code, including the temporary PMREM capture scene [verified, main.js]; the film is a single page with no route teardown [verified, main.js].

## 6. Weaknesses
- Reduced motion: partial. The DOM transitions honour it; the scroll-driven film and the loader drawing do not change [verified, main.js; desktop-rm-s00.png].
- Keyboard: pass for the gates. The rail takes arrow and Page keys, and the enter, setup and HUD controls are real buttons [verified, main.js]. Keyboard scroll in the film is [inferred] native through Lenis.
- DOM behind the canvas: partial. A visually hidden `main` holds an h1 and the synopsis; the beats have no text twin [verified, index.html].
- Load gate: fail. A drawn preloader, the opening, an enter button and a setup dialog stand before the first film frame. The rail itself is optional, because ENTER is on the first frame [verified, gated/desktop-state-opening.png]; `?film` or a session flag skips the opening [verified, main.js]. Headless, the loader had not finished after several minutes [verified, manifest.json].
- Phone: fail in portrait. The film is blocked by a rotate dialog with no portrait path [verified, index.html].
- Wayfinding and conversion: the opening shows BOOK A CALL from the first frame [verified, gated/desktop-state-opening.png]. The film has no chapter indicator or jump, and the floor ratchet stops the visitor revisiting world one [verified, main.js].

The awards skills keep the visitor-held timeline and the AUTO handover, but render a settled frame per beat under reduced motion. They give phones a portrait cut instead of a rotate wall, put the pitch after the film or behind a skip, and show progress with a chapter rail.

## 7. Principles
1. Explain the medium in the medium's own pacing, then hand over the clock: the visitor scrolls the time, not the page.
2. Cap how fast input can drive a timeline, so a flick cannot outrun the story.
3. Offer a self-driving mode that any manual input takes back, and say so in one line before it starts.
4. Keep the loader on its own thread: a frozen loader reads as a crash even when the work is just compiling.
5. Degrade in the order the eye notices least: density, then pixels, then the stylisation, and never the motion.
6. Generate the asset and its motion from rules, so one change of proportion carries through every shot.

## 8. Take / Don't take
- **Take:** the velocity cap on a progress clock (`max Δp = k × dt / duration`); a manual/auto choice with wheel takeover; a worker-side OffscreenCanvas loader with a capped pen pace; the one-way governor ladder (median of 22 frames, 20 ms ceiling, 1.5 s cooldown, 3 s warm-up); per-leg gait phase tables instead of walk clips; fov widened below the design aspect; a contour pass fed by the AO pass's depth and normals.
- **Don't take:** the robot, its line-drawing loader, the magenta-grass / pink-sky world, the "webfilm" opening stops and their copy, the beat order, the portrait rotate wall, the backward ratchet, or these hexes:
  - `#000000` [verified, index.html theme-color]
  - `#08080a` [verified, index.html loader]
  - `#f6f5f2` [verified, index.html loader]
  - `#e9e9e9` [verified, main.js `K0`]
  - `#0c101a` [verified, main.js `K0`]
  - `#9c2a63` [verified, index.html scrollbar]
  - `#ff4f9a` [verified, main.js `ch.mor`]
  - `#2f5cff` [verified, main.js `ch.mor`]
  - `#65a4d8` [verified, main.js `av`]
  - `#101c26` [verified, main.js contour colour]
  - `#f7c6a5` [verified, main.js grade base]

## 9. Confidence and sources
Header, stack, scroll, governor, 3D lens: high (literal values from the served bundle and inline loader) · opening: high (two rendered frames) · beats: high for order (beat table), low for look (no rendered film frame) · palette: high for declared values, medium for the worlds (light presets and share-image alt text, not seen rendered) · rating: inferred.

**Live pass 2026-10-05: reachable (Vercel).** First capture exit 2: every desktop, mobile and reduced-motion frame shows the line-drawing preloader (counter 048–086); all three s100 frames timed out; scroll mode native; no console errors or failed requests [verified, manifest.json]. One retry (`gated/`) used a states plan: wait for the loader class to clear, wheel the rail, click ENTER, then BEGIN and wheel. `opening` and `rail-end` rendered after a multi-minute SwiftShader load. `setup` and `film-in` failed because the canvas intercepted the click on the mid-rail ENTER button, so no film frame was seen [verified, gated/manifest.json]. LCP figures are headless cold-cache artefacts. Sources: https://cutobot.byholm.co/ (index.html with the inline loader worker, `/assets/main-DAE-nMk-.js`, `/assets/main-CoKKXZpN.css`), HEAD requests for the four GLBs, the MP3 and one texture. No models, textures, audio or fonts were fetched.
