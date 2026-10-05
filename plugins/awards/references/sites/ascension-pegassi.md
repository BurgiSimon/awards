# Ascension — Pegassi — https://ascension.pegassi.be/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | campaign (release site for a four-track debut EP by a Belgian electronic artist; routes `/`, `/about`, a sequencer route, legal pages) [verified, index.html JSON-LD `MusicAlbum` + nav] |
| Visitor mode | experience, with a persuade tail: listen, read the track notes, then Spotify or Buy [verified, index.html + captures] |
| Awards | none found [unknown]; no award entry was looked up |
| Corpus rating | D 7.6 / U 6.8 / C 7.6 / Co 7.4 → weighted 7.34, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | a "Site Credits" footer link and two credit audio files exist [verified, index.html + CKimS5rj.js `/credits/*.mp3`]; names [unknown] |
| Stack (evidence level) | **Nuxt** (Vue SSR, `/_nuxt/` chunks, `#entry` import map) [verified, index.html] · **Three.js r185** [verified, CZEyUk1w.js `data-engine` "three.js r185"] · GLTFLoader + DRACOLoader, KTX2 and meshopt support in the lazy chunk [verified, CWrLAvN0.js, Df7Aa2yW.js] · **GSAP 3.15.0** with ScrollTrigger [verified, CKimS5rj.js + Co8Gqqe3.js version strings] · **Lenis** (1.3-era options: `autoRaf`, `autoToggle`, `respectReducedMotion`), version [unknown] [verified, CKimS5rj.js] · Tailwind-style utilities [verified, entry.mTHQBrhg.css] · hosting Netlify [verified, DNS CNAME ascension-pegassi.netlify.app] · fonts self-hosted PP Neue Montreal + Mono [verified, entry CSS] |
| Palette | near-black ground, one mid-grey ink, white for the lit word; a chrome wordmark and a film grain carry the rest; blue and green tokens exist but are rare (hexes in §3) [verified, entry.mTHQBrhg.css + captures] |
| Type | one grotesque in four weights aliased `sans` (PP Neue Montreal Book / Medium / Semibold / Bold) + PP Neue Montreal Mono Medium as `mono` [verified, entry.mTHQBrhg.css `@font-face`]; root size `clamp(5px, 12px, 100vw / 1500 × 10)`, 402-wide design on phones [verified, entry CSS] |
| WebGL dosage | canvas-first: one fixed canvas draws the chrome wordmark, the record sleeve, every image and video plane, and GL text layers for links and lit lines, over SSR DOM on desktop; the phone gets no canvas and a baked wordmark [verified, CKimS5rj.js plane manager; gated/manifest.json `canvases` 1 desktop, 0 mobile] |
| Scroll model | native + Lenis (lerp .125, lerp 1 under reduced motion, own rAF loop) feeding `ScrollTrigger.update()`; two scrubbed triggers, no pin [verified, CKimS5rj.js `scroll` plugin, dgVLAbKl.js] |
| Narrative model | single-object launch: the record is the object — sleeve at the gate, chrome title over a doorway, liner notes, tracklist, a festival clip, the artist, the credits [verified, gated/desktop-state-*.png + index.html] |

## 1. Concept and narrative
An EP release built as the record itself. The visitor meets the sleeve, alone on a grained black field, and clicks to enter; the sleeve is thrown aside and the title arrives as a chrome, inflated wordmark that flips up out of depth above a photographed doorway at the top of a staircase, with star glints on its facets that brighten as the pointer tilts it [verified, mobile-s00.png, gated/desktop-state-entered.png, CKimS5rj.js `appear`]. The rest is liner notes in the artist's first person, set huge, with side letters (A1, A2, B1, B2) and footnote numerals, then the tracklist with durations, a festival clip, a biography and a sparse footer [verified, gated/desktop-state-w15/w35/w60.png]. The register is conversational and specific: track-by-track notes rather than adjectives [verified, index.html].

Beats [verified, gated/ captures]: gate (sleeve + cursor label) → chrome title over the stair photograph with a release-spec block top-right → liner-note paragraphs in a stepped indent → the four tracks in a two-column A/B list → clip with an unmute control → biography paragraph → two numbered "A: / B:" history notes → footer.

## 2. Structure and components
- **Gate**: a full-screen `<button>` that holds until fonts are ready and the texture queue has been settled for four checks, capped at 3 s; with WebGL it shows the 3D sleeve and a cursor-following "Click to enter" label, without it a flat sleeve image; it runs on `/` and `/about` on every visit [verified, DJkZBDaV.js `SiteEnter`]. The click is also what unlocks audio [inferred].
- **Header**: wordmark, Listen, Sequencer, About, Buy on a six-column grid; a release spec block (sides, date, producer) in the hero [verified, gated/desktop-state-entered.png + DJkZBDaV.js].
- **Player pill**: a fixed bottom-right track chip with a level glyph and a Play button; four MP3s (about 6 MB each) are requested at load [verified, captures + manifest failedRequests + `curl -sI` 6,057,892 B].
- **Liner notes**: paragraphs at `25% + .25rem` indent steps, side letters in the gutter, superscript footnotes [verified, index.html scoped CSS `.indent-half/.indent-full`].
- **Tracklist**: hover shows a dot mark and shifts the row 2 rem over .15 s [verified, index.html scoped CSS `.row:hover .shift`].
- **Clip**: a looping festival video plane with an Unmute control; 28,635,110 B MP4 [verified, `curl -sI`].
- **Sequencer route**: a step sequencer whose patterns and kits persist in `localStorage` [verified, CKimS5rj.js]; not captured.
- **Idle easter egg**: after 10 s without input, one of eight GIFs appears at the cursor; skipped under reduced motion and on hidden tabs [verified, DJkZBDaV.js `lt=1e4`, `ut=8`].
- **Grain**: a fixed `noise-2.png` layer over everything [verified, index.html + CKimS5rj.js].
- **Transition mask**: a fixed black `data-transition-mask` sheet for route changes [verified, DJkZBDaV.js].
- 404 [unknown].

## 3. Visual language
- **Ground and surfaces**:
  `#000` [verified, entry.mTHQBrhg.css `--color-black`]
  `#121314` [verified, entry.mTHQBrhg.css `--color-surface`]
- **Ink**: copy sits in one mid grey; the lit word or active line goes white; a near-black dim ink for unlit cue text:
  `#7d7d7d` [verified, entry.mTHQBrhg.css `--color-ink`]
  `#fff` [verified, entry.mTHQBrhg.css `--color-white`]
  `#232323` [verified, entry.mTHQBrhg.css `--color-ink-dim`]
- **Rules**: a white hairline at 10 % alpha and two dark rules:
  `#ffffff1a` [verified, entry CSS `--color-hairline`]
  `#272727` [verified, entry CSS `--color-rule`]
  `#313233` [verified, entry CSS `--color-line`]
- **Rare accents**:
  `#3b9aff` [verified, entry CSS `--color-blue`]
  `#96ff1e` [verified, entry CSS `--color-green`]
- **Chrome**: the wordmark's material colour and its blue-white haze tint:
  `#f2f3f6` [verified, CKimS5rj.js material `color`]
  `#dfe6ff` [verified, CKimS5rj.js haze `tint`]
- **Type**: one grotesque, bold, at display size for running copy; mono only for labels; no italic, no second family [verified, entry CSS + captures].
- **Layout**: six columns with stepped indents; the page width scales by root font size up to 1500 px [verified, entry CSS].
- **Eases as CSS tokens**: `--ease-out-quad`, `--ease-out-quart`, `--ease-out`, and three `linear()` spring curves named flip, reveal and snappy [verified, entry CSS].
- **Surfaces**: `theme-color #000000`, `og:type music.album`, JSON-LD MusicAlbum with tracks [verified, index.html].

## 4. Motion and effects (with parameters)
- **Smooth scroll**: Lenis `lerp .125`, `autoResize: false`; under reduced motion `lerp 1` and programmatic scrolls jump `immediate`; programmatic scrolls otherwise use an expo in-out curve; GSAP `autoSleep 0`, `lagSmoothing(0)` [verified, CKimS5rj.js `scroll` plugin].
- **One loop**: a single `requestAnimationFrame` ticks Lenis and emits `pre-tick` / `tick` with a 60 fps frame ratio; the GL core draws only when a layer reports a change [verified, CKimS5rj.js; CZEyUk1w.js `frame()`].
- **Wordmark arrival**: progress 0 → 1 over 1.5 s `expo.out`; the pivot starts flipped by π and pushed back 2 × the camera distance, alpha rising on the same curve [verified, CKimS5rj.js `ih`].
- **Pointer tilt**: target from the pointer in −1…1, lerp .08 per 60 fps frame, snap below .002, lean .15 rad; scroll adds a turn of .08 π and .3 depth [verified, CKimS5rj.js `Qm`, `$m`, `Zm`, `ah`].
- **Plane scroll parallax**: a scrubbed ScrollTrigger from `clamp(top bottom)` to `clamp(bottom top)` per image plane [verified, CKimS5rj.js].
- **Text in GL**: a hover lights a link with a backlight lamp (glow in .35 s `power2.out`, out .6 s) and grows a ● mark in place of the first glyph [verified, CKimS5rj.js `onEnter` and shader comments].
- **Glyphs as curves in GL**: text layers fetch `/glyphs/<face>.json` + `.bin` and shade each glyph from its quadratic Bézier curves in a 1,024-wide float texture, counting ray crossings in x and y per pixel — no MSDF atlas [verified, CKimS5rj.js `Zp`, `am`]. Per-element rect, progress, mode and colour live in rows of a data texture (`u_el`) [verified].
- **Backlight lamp**: a pass marches 28 steps from each pixel toward the pointer through the text mask, weight × .93 per step, skipping the first four steps so glyphs get rays rather than an outline; the core goes white, the falloff takes the tint [verified, CKimS5rj.js `nm`, `em=28`].
- **Gate exit**: label and sheet fade .5 s `power1`, the sleeve thrown with a .55 s delay and .15 s trail [verified, DJkZBDaV.js `tt`, `at`, `ot`].
- **Eases in JS**: `power1.out` ×8, `power2.out` ×5, `expo.inOut` ×2, plus `expo.out`, `power4` [verified, CKimS5rj.js counts].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | Nuxt, SSR with full text in the HTML | [verified, index.html] |
| 3D | Three.js r185, one WebGLRenderer (`alpha`, `antialias`, no depth or stencil), DPR `min(2, devicePixelRatio)` | [verified, CZEyUk1w.js] |
| Motion | GSAP 3.15.0 + ScrollTrigger; Lenis | [verified, CKimS5rj.js] |
| Hosting | Netlify | [verified, DNS] |

Weights from response headers: wordmark GLB 151,636 B, its data texture 661,335 B, hero wordmark WebP 565,226 B, stairs 50,320 B, cover 161,756 B, record 41,112 B, Draco WASM 192,420 B self-hosted, festival MP4 28,635,110 B, each track MP3 about 6 MB [verified, `curl -sI` 2026-10-05]. The three.js core chunk is 342.6 KB raw, the app entry 262.9 KB raw, GLTF and Draco loaders prefetched separately [verified, fetched files]. Textures stream through an upload queue with an 8 ms work budget per frame and a 192 MB LRU budget, preferring KTX2 variants for images 1,200 px and wider [verified, CZEyUk1w.js `hi`, `mi`, `_i`]. `navigator.connection.saveData` skips image preloads [verified, DJkZBDaV.js]. Manifest: 451 desktop DOM nodes, one canvas, no console errors, CLS 0 [verified, manifest.json].

### Tech lens: 3D
- **Model intake:** one Draco-compressed GLB wordmark, 151,636 B, decoder self-hosted under `/wordmark/draco/` (WASM 192,420 B, wrapper 58,456 B) and disposed after load [verified, CKimS5rj.js `xm`, `Sm`; `curl -sI`]. Every mesh is merged to one geometry keeping only position, normal and uv, centred and scaled to unit width [verified, CKimS5rj.js `Cm`]. The loaders sit in two lazily imported chunks [verified, `__vite__mapDeps`].
- **Lighting by a built studio, not an HDR file:** a scene of emissive planes — one blue-tinted face panel (8.2 × 5.2, value .95), four crest bars (values 5–6), four thin sparkle strips (5–9) and three dark bars (.06–.1) around a background of `[.2, .21, .27]` — rendered once through `PMREMGenerator.fromScene` at 1,024 px into the env map; optional horizon bands and a core disc can be tuned in [verified, CKimS5rj.js `Om`, `Dm`, `Am`, `Gm`]. The sleeve scene uses a copy of three's RoomEnvironment instead [verified, Dv6o1hQR.js].
- **Chrome material:** MeshPhysicalMaterial, colour `#f2f3f6` (labelled in §3), metalness 1, roughness .11, clearcoat .25, clearcoat roughness .3, env intensity 1.15, double-sided [verified, CKimS5rj.js `Xm`]. `onBeforeCompile` adds a two-sine normal wobble (amount .03, scale .09) so reflections ripple like inflated foil [verified, CKimS5rj.js `nh`].
- **Haze and glints:** a back plane tinted `#dfe6ff` (labelled in §3) at strength .5 reads a channel of `data.png`; star sprites on a radial canvas texture, additive, each with a facet normal, light up by a Gaussian ring (at .5, width .14) as the tilt points the facet at the viewer, attack .45, decay .08, stretched up to .9 [verified, CKimS5rj.js `Fm`, `Im`, `Vm`].
- **Offscreen pass, DOM placement:** the wordmark renders with ACES tone mapping (constant 4) into a render target with 8 MSAA samples, sized to its DOM box × DPR, then lands on a DOM-tethered plane whose fragment samples red and blue a hair apart (`u_split`) for dispersion [verified, CKimS5rj.js `dh`, `draw`, `Jm`]. It redraws only when tilt, scroll or a glint changes [verified, `changed`].
- **Camera:** perspective, fov 32, distance solved so the artboard width fills the box (`width / 2 / (tan(fov/2) × aspect)`) [verified, CKimS5rj.js].
- **Record sleeve:** a box of 2 × 2 × 0.019 with front and back cover textures (roughness .8, env .5) and an edge material `0xD8D4CB`, plus a disc plane [verified, 9Gf3pYfE.js `g`, `_`]. A procedural 1,024² normal map draws 80 grooves at amplitude .35 [verified, Dv6o1hQR.js]. Progress pulls the disc out of the sleeve (smoothstep 0–.58, split .5), rolls it −120°, and turns the sleeve π, with `T −7°`, `E −13°` lean [verified, 9Gf3pYfE.js]. It renders in a scissored viewport over its DOM rect, camera at z 1800 with fov fitted to the rect height [verified, 9Gf3pYfE.js `draw`].
- **Disposal:** geometry, materials, textures and the environment are disposed on unmount; PMREM generators are disposed after each bake [verified, 9Gf3pYfE.js `dispose`, CKimS5rj.js `jm`].
- Animation clips, physics and raycasting: none found [verified as absence in fetched chunks].

## 6. Weaknesses
- Reduced motion: **pass**. Lenis jumps, the gate skips the thrown sleeve and the idle GIFs stop [verified, source]; the reduced-motion frames read at rest, wordmark and copy present [verified, gated/desktop-rm-state-entered/w15/w60.png]. The wordmark still renders in GL rather than as a still [verified, same frames].
- Keyboard: **partial pass**. The gate is a real `<button>`, nav items are links and buttons with `aria-expanded` [verified, index.html]; hover-only effects (glow, row shift) have no focus equivalent in the CSS read [verified, scoped CSS `@media (hover:hover)` only].
- DOM behind the canvas: **pass**. All copy is in the SSR HTML with an `sr-only` `h1` [verified, index.html + DuiYNknX.js].
- Load gate: **fail for repeat visits**. A click gate plus up to 3 s hold on every visit to `/` and `/about` [verified, DJkZBDaV.js].
- Weight: four ~6 MB tracks are requested at load, and a 28.6 MB clip [verified, manifest + headers].
- Contrast: running copy is `#7d7d7d` on black, about 5.1:1 [inferred, computed from the two tokens] — passes AA but lowers the page's energy.
- Phone: **pass**. A designed portrait layout: full-height stair hero with the wordmark as an image, spec block stacked above, a bottom bar holding the player pill and a Menu button within thumb reach [verified, gated/mobile-state-entered/w15/w60.png; manifest `canvases: 0`].
- Wayfinding: no chapter indicator; the page is short, so it costs little [verified, captures].

**What the awards skills do differently**: the gate becomes a once-per-session hand-off that the hero can skip [recipe:preloader-aperture-handoff]; audio loads on first play, not at page load [recipe:sound-toggle-opt-in]; every hover state gets a `:focus-visible` twin; the clip ships a poster and a smaller rendition.

## 7. Principles
1. **Make the product's own object the entrance.** When the thing being launched has a physical form, let the visitor handle it first; the gate becomes a ritual instead of a wait.
2. **Light a material with a built studio.** A handful of emissive panels baked once into an environment gives a reflective object exactly the highlights the composition wants, at no file cost.
3. **Render the hero object offscreen, place it like an image.** A render target sized to a DOM box keeps the 3D in the layout grid and lets one composite shader add the finish.
4. **Draw only when something changed.** A per-layer dirty test turns a canvas-first page into one that is idle most of the time.
5. **Let the notes carry the page.** Specific first-person liner notes at display size do more than a feature row of adjectives.

## 8. Take / Don't take
- **Take:**
  - A PMREM bake of an emissive-panel scene as the only light for a metallic hero; panel sizes and values as tuning knobs.
  - Glints keyed to facet normals and pointer tilt, with separate attack and decay so they flare and settle.
  - Offscreen MSAA render target per hero object, composited onto a DOM-tethered plane [recipe:gl-dom-tethered-planes].
  - A texture upload queue with a per-frame work budget, and a gate that waits on it with a hard cap.
  - Lenis lerp 1 and instant programmatic scrolls as the reduced-motion branch [recipe:boot-lenis-gsap].
- **Don't take:**
  - The token values as literal colours:
    `#000` [verified, CSS]
    `#121314` [verified, CSS]
    `#7d7d7d` [verified, CSS]
    `#fff` [verified, CSS]
    `#232323` [verified, CSS]
    `#ffffff1a` [verified, CSS]
    `#272727` [verified, CSS]
    `#313233` [verified, CSS]
    `#3b9aff` [verified, CSS]
    `#96ff1e` [verified, CSS]
    `#f2f3f6` [verified, CKimS5rj.js]
    `#dfe6ff` [verified, CKimS5rj.js]
  - The inflated chrome wordmark with star glints over a lit doorway, the thrown sleeve at the gate, the A/B side-letter liner notes as laid out.
  - The section order, the copy, the cover art and photography.
  - A gate on every visit and audio fetched before anyone presses play: things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Stack, 3D lens, motion parameters, tokens | high: index.html, entry CSS and nine named chunks |
| Composition, phone, reduced motion | high: gated captures (desktop, mobile, desktop-rm) |
| Awards, credits, the sequencer route, 404 | unknown |

**Live pass 2026-10-05: reachable; first capture exit 2.** The plain run (`--scroll 0,25,50,75,100 --mobile --reduced-motion`) produced identical frames per viewport: every scroll state shows the click gate, because the page does not scroll until the gate is clicked, and desktop s00 timed out. A second run used `--states` (`states.json` plan: click `button.fixed.inset-0`, wait 4 s, then wheel 1,500–14,000 px or press End) to reach the page; that run exited 0 with no page or console errors, and the page bottoms out by about 6,000 px of wheel. Sources in `.awards/research/ascension-pegassi/`: `desktop-*` / `mobile-*` / `desktop-rm-*` gate frames and `manifest.json`; `gated/` state frames and manifest; `index.html`; `src/` with `entry.mTHQBrhg.css`, `CKimS5rj.js`, `CZEyUk1w.js`, `9Gf3pYfE.js`, `Dv6o1hQR.js`, `DJkZBDaV.js`, `Co8Gqqe3.js`, `CWrLAvN0.js`, `Df7Aa2yW.js`, `dgVLAbKl.js`; asset sizes from `curl -sI` only.
