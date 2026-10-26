# Daiki Fujita — Web & Interactive Designer — https://daikifujita.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio — a Tokyo web and interactive designer's own site, "Portfolio v2" in its own works list [verified, index.html] |
| Industry | creative-practice |
| Visitor mode | experience: the page reads "awake" and plays as "a 3D dream" behind a switch [verified, index.html meta description] |
| Awards | No award entry for this site turned up in one web search on 2026-10-26 [unknown]. The page lists 11 awards for the designer's **earlier** work: INCEPTURE (FWA of the Day; CSSDA Special Kudos, Best UI, Best UX, Best Innovation; CSS Winner Site of the Day) and Portfolio v1 (the same five CSSDA/CSS Winner titles), all 2025 [verified, index.html — the site's claim, not checked against the galleries] |
| Corpus rating | D 7.7 / U 6.2 / C 8.1 / Co 7.0 → weighted 7.26, 2026-10-26 [inferred, from captures against references/jury/rubric.md] |
| Studio / credits | Daiki Fujita; the role line for this site reads "Web Design / 3D / Motion / Interaction / Game Design / Development" [verified, index.html — the site's claim]; other credits [unknown] |
| Stack (evidence level) | Framer (`generator` "Framer 13ebf9e") with React 18.3.1 [verified, index.html, react chunk] · three 0.169.0 and lenis 1.1.13 imported at runtime from esm.sh, plus three's GLTFLoader, DRACOLoader, meshopt decoder, EffectComposer, UnrealBloomPass, ShaderPass, OutputPass, ConvexGeometry [verified, shared-lib.CTuRAKaB.mjs] · Framer's motion chunk for the switch springs [verified, shared-lib imports] · sound synthesised in WebAudio, no audio files [verified, shared-lib] · Google Fonts (Inter Tight, Instrument Serif, DM Mono, a `text=`-subset Noto Sans JP) [verified, index.html] · hosting Framer [verified, framerusercontent.com] |
| Palette | paper ground, ink, a scroll-driven night; cyan and pink live only in the dream (hexes in §3) [verified, index.html CSS + shared-lib] |
| Type | Inter Tight 400–600 for display and text (uppercase 600 at −.055em for titles), Instrument Serif italic for accents, DM Mono for labels [verified, index.html CSS] |
| WebGL dosage | canvas-first: one fixed full-viewport canvas over the DOM, a second engine for the dream, and up to four small contexts [verified, shared-lib; manifest.json `canvases: 3` behind the gate] |
| Scroll model | native + Lenis 1.1.13 (`lerp .085`, `wheelMultiplier .95`) with two sticky stages (works 370 vh, dream 300 vh) [verified, shared-lib + index.html] |
| Narrative model | chaptered journey, with a playable second reading of the same archive |
| Palette strategy | paper #ECEAE4 + ink #121212, turned to night by scroll; dream colours kept off the page |
| Type contract | grotesque display + italic serif accents + mono labels (Inter Tight, Instrument Serif, DM Mono) |
| Awards / score | none found for this site; the page lists 11 for earlier work |
| Confidence | high (served source read whole + gated captures) |
| Last verified | 2026-10-26 |

## 1. Concept and narrative
One shard of ice is the guide. The meta description promises a site read "awake" or floated through "in a 3D dream", and the work data calls the shard "a single shard of memory" [verified, index.html + shared-lib]. Awake, a carved crystal sits over a paper page and bends the page's own type through itself; it carries a work's picture or mark inside it and changes what it holds as you scroll. Asleep, the same three works become "memories" held inside a playable night world you win back.

Beats [verified, gated-desktop states]: a black preloader, a counter and a bracketed Enter → the hero, a huge one-line marquee behind the crystal, a ring of small caps orbiting it → hover breaks it into pieces around a violet window to the dream → about and six disciplines, the crystal stepping a sixth of a turn per row → three works on a pinned horizontal film, pieces passing behind the pictures → the dream section turns paper to dusk, then night → recognition on night → contact back on paper; a Wake | Dream switch floats at the bottom of every chapter. Copy register: short, poetic, bilingual (an English and a Japanese bio) [verified, index.html].

## 2. Structure and components
- **Gate** [verified, desktop-s00…s100, mobile and tablet frames, shared-lib `Rs`]: a near-black cover with a three-digit counter at the right edge, held at 090 while the dream engine prepares, then "[ ENTER ]" in the centre; no auto-advance, no repeat-visit skip, and the hero name stays hidden until it is passed.
- **NAV** [verified, gated-desktop entered + index.html + ARIA]: a fixed four-corner header (name, Work and About, a Sound on/off toggle, Contact) in white under `mix-blend-mode: difference`, so it inverts over paper, night and ice; the served markup carries a Tokyo clock in that slot, which the live header replaces with the sound toggle [verified, index.html + gated-desktop entered]; on phones a single "Menu" button opens Works / About / Contact and the sound toggle [verified, mobile-aria.yml + shared-lib `Wp`].
- **Cursor** [verified, gated-desktop hero-hover + shared-lib]: a difference-blended ring with contextual labels ("Hold to dream", "Enter the dream", "View project", "Open", "Write"); hidden on coarse pointers.
- **HERO** [verified, gated-desktop entered, hero-hover]: the name line "Sites for waking. Worlds for dreaming." as a two-copy marquee at about 30 % of the viewport height, the crystal centred over it, a hairline grid of twelve bays, four small label clusters along the bottom, a "Scroll to explore" button and an X link.
- **Works**: a pinned 370 vh film of three works, each a plate, a title in 600 caps, a role/year list and an "Open the memory" button; non-current works are `inert`; the counter reads "02 / 03" [verified, gated-desktop works + shared-lib]. A case overlay opens per work with a focus trap and Escape [verified, shared-lib `Pp`].
- **Dream section, recognition**: a 300 vh pin where the ground darkens and a window opens; then 11 award rows, each `tabindex=0`, previewing its certificate as a bent GL sheet on hover or focus [verified, gated-desktop night + shared-lib `Np`].
- **FOOTER** [verified, gated-desktop close + index.html]: (06) Contact with a huge "Say hello." in caps, a mailto link, X, "Still awake? Enter the dream →", then "© 2026 Daiki Fujita" and "Back to top ↑".
- **Mode switch**: a fixed bottom-centre glass pill reading WAKE | DREAM, `role="switch"` with `aria-checked`, draggable [verified, gated-desktop hero-hover + shared-lib `Jc`].
- **Dream**: a full-screen game — move with WASD or arrows (drag on touch), pause with Escape, open a work's live site with Enter, choose upgrades with 1–3; won memories persist in `localStorage` [verified, shared-lib]. A first visit opens on a 3D rules book, "Liber Somnii", one rule per spread in Japanese and English, with Start and page arrows in glass buttons [verified, gated-mobile dream].

## 3. Visual language
- Paper ground, the awake page's token:
  `#ECEAE4` [verified, index.html `--paper`]
- Ink:
  `#121212` [verified, index.html `--ink`]
- Night ground of the dark chapters:
  `#07081a` [verified, index.html `--night`]
- Scroll sky ramps — dusk, then night, then dawn on the way to the footer:
  `#776b9b` [verified, shared-lib `Rh.dusk`]
  `#e7a07a` [verified, shared-lib `Rh.dusk`]
  `#05061a` [verified, shared-lib `Rh.night`]
  `#0e0a26` [verified, shared-lib `Rh.night`]
  `#aaa6d0` [verified, shared-lib `Rh.dawn`]
  `#f1c2ad` [verified, shared-lib `Rh.dawn`]
- Dream accents, cyan and pink, kept out of the awake chrome:
  `#7DF9FF` [verified, layout props `accent`]
  `#FF4FA3` [verified, layout props `accent2`]
- Preloader cover:
  `#0b0b0c` [verified, index.html inline style]
- Type: display in Inter Tight 600 caps at tight tracking (works titles `clamp(46px, 5.4vw, 104px)`, line height .86); italic Instrument Serif for the dream lines and emphasis; DM Mono and 13 px caps for labels; the hero line fitted to `min(H·.29, V·.2)` on desktop [verified, index.html CSS + shared-lib].
- Layout: twelve equal bays margin to margin with no gutters (four on phones), drawn as 6 % hairlines with `difference` blending; margin `clamp(20px, 2.8vw, 48px)` [verified, index.html CSS].
- Materials: clear ice with rainbow fringes on paper; dark ice holding a violet starry night in the night chapters; a soft caustic streak under the crystal [verified, gated-desktop entered, night].
- Surfaces: favicons per colour scheme; no `theme-color`, no `color-scheme`, no `lang` on `<html>`; the scrollbar is hidden everywhere [verified, index.html, manifest.json].

## 4. Motion and effects (with parameters)
- **Smooth scroll** [verified, shared-lib `qc`]: Lenis `lerp .085`, `wheelMultiplier .95`, `syncTouch`, `syncTouchLerp .085`, `touchInertiaMultiplier 18`; anchor clicks scroll over `min(2.2, .9 + distance/2600)` s, ease in-out cubic; stopped behind the gate and in the dream.
- **WHOLE PAGE — one object, many anchors** [verified, shared-lib `Gp`]: every visible section proposes a target for the crystal (centre, radius, what it holds), weighted by its overlap with the middle half of the viewport; the crystal follows on a spring (k 46, damping 2√k·.94). Idle turn `.11` rad/s plus two slow sine tilts, pointer tilt ±.45/.5 rad, scroll velocity adds turn.
- **HERO** [verified, shared-lib]: hovering the crystal breaks it; three large pieces fan out at thirds of a turn with a dream window between them; holding for 1.25 s dives into the dream. The text ring is per glyph in two 2D canvases (front sharp, back blurred .75 px), tilted .28 and .42 rad, perspective 1500, spinning `.2 + 3.2·charge²` rad/s. The marquee is a WAAPI loop at `clamp(V·.05, 56, 118)` px/s, not started under reduced motion.
- **Display type in a fluid** [verified, shared-lib `Ap`, `fh`]: on fine pointers the cursor stirs a separate fluid that smears rasterised display type along its flow (details in the WebGL lens).
- **Reveals**: `[data-rv]` and `[data-frost]` lines fade up 24 px or unblur from 14 px over 1.1–1.6 s on `cubic-bezier(.19,1,.22,1)`, staggered by `--d` [verified, index.html CSS].
- **Mode change** [verified, shared-lib `Wt`, `Gt`]: entering the dream reveals it through a growing circle over 1.8 s; leaving takes 1.9 s and hands the won pieces back to the awake crystal; .5 s and .45 s under reduced motion.
- **Sound** [verified, shared-lib `Bp`, `Es`]: WebAudio only — compressor, a generated 2.6 s reverb, a pad at 110–329.63 Hz under a 650 Hz lowpass; it starts only after a user gesture.
- **NAV and FOOTER motion**: none of their own; the footer's crystal rests beside "Say hello." and opens the mailto on click, and the night fades through dawn to paper as the section rises [verified, shared-lib `Gp`].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Site | Framer, one route, React 18.3.1 | [verified, index.html, script_main.DBz04e2Y.mjs] |
| 3D | three 0.169.0 from esm.sh, not bundled; a `modulepreload` for it in the head | [verified, index.html, shared-lib] |
| Scroll | lenis 1.1.13 from esm.sh | [verified, shared-lib] |
| Code | three code components in one 1,199,563-byte shared chunk (awake page, dream, clock) | [verified, src/] |

Assets [verified, `curl -sI` content-length]: the ice block glb 646,312 B, the dream world kit 30,284 B, the dreamer figure 374,524 B; four WebP ice and block maps 1,013,558 B in total, no KTX2. The Draco decoder is fetched from gstatic (wasm 285,948 B) and the meshopt decoder from esm.sh, not self-hosted [verified, shared-lib + headers]. Manifest: 791 DOM nodes, 3 canvases on desktop and 2 on tablet and phone behind the gate, CLS .0144, no console errors; blocking time ≈ 30 s on desktop under SwiftShader is a software-GL artefact and is not a performance claim [verified, manifest.json].

### Tech lens: 3D
- **Model intake** [verified, shared-lib + `curl -sI`]: the awake crystal is carved from `tb_block.glb` (646,312 B) through `GLTFLoader` with the meshopt decoder registered, keeping only the first mesh's geometry; without it, an `IcosahedronGeometry(1, 6)` (5 on coarse pointers) with a value-noise skin, clipped by 21 planes — six axis planes jittered .26 at depth .56 / .62 / .54 plus fifteen seeded ones at .63–.73 — and hulled with `ConvexGeometry`. The dream loads two Draco glbs, a 30,284 B world kit with named nodes (`Torii`, `Gate`, `Soul` …) whose materials are swapped by name, and a 374,524 B figure; decoder from gstatic 1.5.7. Per-file compression [unknown].
- **Fracture at run time, not baked** [verified]: Voronoi pieces from at most ten seeds 80 ms after mount; alternative fracture sets are built in idle callbacks (more than 12 ms free, one piece every 250 ms, up to three), and a click picks the set whose seed direction best matches where it struck; the open case splits a piece into six sub-cells; a heal front runs along the seams as it closes.
- **Pieces on springs** [verified]: linear k `150/(.6 + 1.6m)`, damping `2√k·.72`; angular k `80/(.6 + 1.4m)`; mass `max(.08, size³)`; docked under .6 px, .015 rad and 10 px/s, or after 1.4 s; three passes of pairwise separation during a dive.
- **Camera** [verified]: `PerspectiveCamera` at z 1600 with fov solved as `2·atan(h/2/1600)`, near 10, far 60,000, so one unit is one CSS pixel and DOM rects map straight into the scene.
- **Light without lights** [verified]: an analytic studio in the shader — three soft-box lamps at 4×, 7× and 4×, the key drifting by `sin(t·.21)` "so highlights travel over the glass even when it is still" — and a shadow quad under the crystal with one colour-fringed caustic streak, its height found by projecting 96 Fibonacci-sphere support points.
- **WHOLE PAGE — scroll-driven placement** [verified, shared-lib `Gp`]: section anchors blended by visibility and followed on a spring; the disciplines turn the crystal π/3 per active row; in the works pin its three project pieces ride Catmull-Rom splines over seven keys of progress, each sized to clear the plate and the text; in the dream section all pieces settle in three rings round the window after twelve relaxation passes that avoid the headline, the button and the switch.
- **HERO interaction** [verified]: hover within .86 of the radius shatters it (fine pointers); a 1.25 s hold dives along a damped spring (ζ .68) into the dream; a drag over 7 px turns it; a raycast on a project piece sends a 2.6 s ripple through it. No keyboard path on the crystal itself — the switch and the links are the alternatives.
- **The dream world** [verified, shared-lib `Ls`]: ACES, `FogExp2(.0072)` on `#0c1036` [verified, shared-lib], a base fov of 60 (`clamp(60/aspect^.55, 60, 96)` in portrait) widened by speed and boost up to 118; PMREM `fromScene` of a painted sphere and three emissive 5 × 2 planes at ×4 (sigma .035), a hemisphere light at 1 and a directional at 1.6; the Soul in `MeshPhysicalMaterial` (transmission .9, IOR 1.5, iridescence 1 over 100–560 nm, clearcoat 1); 360 instanced shards, 360 lathe crystals, enemy sets of 30; no `AnimationMixer` — motion is procedural; low tier (coarse or under 760 px) at DPR ≤ 1.25 and 700 stars instead of 1,600.
- **Hand-off between renderers** [verified]: pieces won in the dream fly back to the awake crystal (and out of it on a dive) by screen position, scale, quaternion and velocity passed through `window` objects, then blended into place on a Hermite curve.
- **Disposal** [verified]: `destroy()` frees geometries, materials, targets, textures and both renderers; nothing listens for `webglcontextlost`.

### Tech lens: WebGL
- **WHOLE PAGE — canvas model** [verified, index.html CSS + shared-lib `ym`]: one `position: fixed`, `100lvh` canvas at z 8 with `pointer-events: none`, above the DOM and below the header (z 9, difference-blended); DPR `min(dpr, 2)`; antialias off only on HiDPI desktop Safari; a 12 ms frame floor; a governor (frame-time EMA at .05 plus a 60-frame record of frames over 20 ms) steps DPR by .25 between 1.25 and a learned ceiling, capped at 1.5 while the mode changes.
- **The page is the refraction source** [verified]: a custom painter redraws the DOM — glyphs and words from `Range` rects, cover-fitted images, pills, the twelve hairlines, even the orbiting ring's glyphs — into a 1024² (512² on coarse) 2D canvas, but only for the square round the crystal (48 px steps, at most .75 of the larger side), repainted when region, scroll, night or sky change. That `CanvasTexture` is what the ice bends [lens:webgl].
- **Two-surface refraction** [verified]: a BackSide pass writes normals into a target at .6 × DPR; the front shader reads it, then samples the page in 12 spectral taps (6 on coarse pointers) at LOD .9 with Gaussian channel weights centred .2 / .5 / .8, σ .19. The work's picture or mark is marched in 8 steps as "a solid block embedded in the ice"; fracture sheets 5 (3), air bubbles at 4 (2) depths, a night nebula marched in 9 steps of .17. The comments cite Igloo's ice as the reference [verified, shader text].
- **Noise** [verified]: sin-hash value noise with 4-octave fbm (`p·2.03 + 17`), Hoskins-hash 3D value noise, interleaved-gradient dither; Voronoi cells in a warped space.
- **DOM occlusion** [verified]: up to six picture rects in `uHideR[6]`; ice, splinters and glints `discard` inside them, so the ice passes behind the works' images (gated-desktop works).
- **Extras** [verified]: 64 instanced splinters (36) that refract the page with an RGB split of 14 px × 1.12 / 1 / .88; 160 point glints (90) with a star sprite; the shadow quad at render order −2.
- **HERO — fluid on the type** [verified, `Ap`, `fh`]: its own context on fine pointers, off under reduced motion: stable fluids with dye 512² and velocity, pressure, divergence and curl 128², all HalfFloat ping-pong, curl .1, 3 pressure iterations, dissipation .95 / .8891 / .925, fixed 60 Hz steps; display type rasterised per element is advected in 20 taps, skipped where it would move under half a pixel, with a pink leading and cyan trailing edge at .13 [lens:webgl].
- **HERO — the dream through the paper** [verified, `qc`]: the dream engine sits under the content at z 1; a pointer trail (≤ 140 points, 750 ms, radius `.095·min(V,H)` scaled by speed) painted into a 320 × 200 mask opens the page onto it; rendered every second frame at pixel-ratio cap .62 and scene scale .4–.6. A word-mask path for the headline exists but finds no target in this build.
- **Certificate sheet** [verified, `Np`]: an 18 × 26 plane bent by `sin(y·.0055 + t·.8)·v·7.5` with an RGB split by velocity; opens on hover and on keyboard focus; renders only while shown.
- **Dream post chain** [verified, `Ls`]: scene pass into HalfFloat with depth → `UnrealBloomPass(256², .58, .42, .4)` → a blur pass → `OutputPass` → a 31 KB final pass: liquid-glass UI from rounded-rect SDFs, an ink outline from the Laplacian of inverse depth outside the gate, an organic portal mask, halation with an anamorphic streak, grain, a squircle vignette that reddens at low life, cinemascope bars; eye adaptation in a 1 × 1 ping-pong (.2 / .05); scene render scale capped apart from the output DPR.
- **NAV and FOOTER**: no GL of their own; the header reads over the canvas by `mix-blend-mode: difference`; the footer shows the crystal's last anchor [verified].
- **Contexts** [verified source; manifest.json `canvases: 3` before the gate]: main, fluid and certificate at mount, a prewarmed case renderer at about 3.5 s, a paper renderer per open case, and the dream's own — up to six.

## 6. Weaknesses
- **Load gate: fail.** Every scroll frame of the ungated pass, at three widths and in reduced motion, shows only the near-black cover with "090" or "[ ENTER ]" [verified, desktop/tablet/mobile/desktop-rm s00–s100]. The counter waits on the dream engine's preparation (up to 11–15 s), then asks for a click or a key; nothing skips it on a repeat visit, and the hero name stays at opacity 0 until it is passed [verified, shared-lib `Rs`, index.html CSS].
- **Reduced motion: partial.** The reduced pass is the same gate [verified, desktop-rm-s00]. In source, the marquee, idle spin, fluid type, wake and hover shatter stop, but the crystal still travels and turns between sections and the dream still plays [verified, shared-lib].
- **Keyboard: partial.** Pass: the gate button takes Enter or Space; the switch is a labelled `role="switch"`; award rows are focusable and open their certificate on focus; works use buttons, non-current works are `inert`; the case traps Tab and closes on Escape; the game is fully keyboard-driven [verified, shared-lib]. Miss: the switch toggles on Enter only, not Space; the hold and the hover shatter have no key equivalent on the crystal; award rows set `outline: none` [verified, shared-lib + index.html CSS].
- **DOM behind the canvas: pass, with one flaw.** Landmarks, regions, an `h1` with a full label, `h2`/`h3`, lists and links all exist behind the gate [verified, desktop-aria.yml]; the count the crystal draws is mirrored. The flaw: the dream section's per-character spans reach the accessibility tree as spaced letters [verified, desktop-aria.yml].
- **Legibility over GL:** in the night chapter, dark pieces sit over the award names and cut lines off [verified, gated-desktop night]; `uHideR` protects pictures, not text.
- **Phone: pass.** A designed column: name and a Menu button, the label centred over the marquee and the crystal, four bays, a larger Wake | Dream pill; the menu drops a right-aligned list with the sound toggle; the disciplines show the active row in ink and the rest in grey; the contact block stacks cleanly [verified, gated-mobile entered, menu, works, close]. The game on touch is drag-to-move [verified, gated-mobile dream].
- **Wayfinding:** section labels (01)–(06) and a "02 / 03" works counter, but no current-chapter mark in the header and no scrollbar anywhere [verified, gated-desktop + index.html CSS].
- **Weight and surfaces:** up to six WebGL contexts; three.js, both decoders and Lenis fetched from third-party CDNs at run time; a 1.2 MB shared chunk; 1 MB of WebP maps with no KTX2; no `lang` on `<html>`, no `theme-color` [verified, shared-lib, `curl -sI`, manifest.json].
- **What the awards skills do differently:** render the page at once and let the dream engine prepare behind it, with the switch as the only door [pattern:preloaders-and-transitions#the-load-contract]; one context with the fluid and the certificate as passes in it [pattern:webgl-architecture#canvas-positioning]; a static tier that parks the crystal [recipe:reduced-motion-switch]; Space on the switch and an arrow-key turn for the crystal [pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates]; text-aware occlusion; self-hosted decoders and KTX2 maps [pattern:asset-pipeline#textures]; `lang` set.

## 7. Principles
1. **Make the page the material.** An object that refracts the page's own words and pictures belongs to that page in a way an object lit by a stock environment never does.
2. **One object, carried through every chapter.** When a single thing travels the scroll and changes what it holds, the visitor reads the page as one gesture instead of a stack of sections.
3. **Give one archive two readings.** A quiet scroll for the reader in a hurry and a playable world for the curious can share the same content and the same progress, joined by one switch.
4. **Keep the second world's colour behind its door.** The calm page stays paper and ink; the vivid palette appears only once you cross.
5. **Pay for variety while idle.** Pre-build the expensive variations — fracture sets, renderers, shader programs — when nothing is happening, so the moment of interaction costs nothing.
6. **Never make the page wait for the spectacle.** A gate that holds content until an optional world is ready charges every visitor for something only some will choose.

## 8. Take / Don't take
- **Take:**
  - The page re-drawn into a texture for the region behind the glass only, repainted when region, scroll or theme change, then bent through a back-face normal pass at a fraction of DPR with spectral taps under a coarse-pointer define [recipe:gl-dom-refraction-lens].
  - One object driven by visibility-weighted section anchors on a spring, each anchor also choosing what the object holds [recipe:gl-dom-refraction-lens] (scene windows on one progress line: [recipe:gl-progress-scene-windows]).
  - A short-lived pointer wake painted into a small mask that opens the page onto a second world rendered at a reduced scale, and not at all at rest [recipe:gl-pointer-wake-reveal].
  - Picture rects passed as a small uniform array so the GL object slips behind DOM images.
  - Idle-time pre-building of costly variants and a second renderer, with `compileAsync` polling [recipe:gl-fps-governor-idle-gate].
  - Structural: twelve gutterless bays drawn as faint hairlines, with every label hung on a bay edge [pattern:layout-and-composition#grid-systems-seen].
  - A labelled `role="switch"` mode control docked bottom-centre that keeps its state in its accessible name [recipe:persistent-mode-switch].
- **Don't take:**
  - The ice crystal, its ring of small caps and the "memory" pieces as drawn; the awake/dream naming, the "Sites for waking" line and the win-them-back game.
  - The paper and night hexes as literal values:
    `#ECEAE4` [verified, index.html]
    `#07081a` [verified, index.html]
  - The gate without a skip, five-plus contexts, CDN decoders and the Space-less switch: things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards | none found for this site in one search; the page's own list is the site's claim |
| Stack, shaders, parameters, sizes | high: index.html, shared-lib.CTuRAKaB.mjs (read in full for the GL paths), `curl -sI` headers |
| Composition, chapters, footer, dream entry | high: 7 gated desktop states and 5 gated phone states |
| Dream world in play | medium: read in source; the desktop frame caught the dive, the phone frame the rules book, neither the game in play |

**Live pass 2026-10-26: reachable, owner policy allows, capture exit 0.** The ungated pass (desktop, tablet, phone, reduced motion) shows only the gate; states were then reached by clicking `button.ds-penter` and waiting 5–9 s under SwiftShader, with wheel steps of 1,800 / 4,300 / 7,200 / 40,000 px and the switch focused and sent Enter [verified, gated-desktop/manifest.json]. In the desktop mid frame the discipline titles had not revealed yet, while the phone frame shows them [verified, gated-desktop mid, gated-mobile works]; the desktop dream frame caught the crystal dissolving into a prismatic ring over the contact section, not the dream world [verified, gated-desktop dream]. The shader and CSS comments are written in prose and log dated design calls credited to "the user" between 2026-10-14 and 2026-10-26 [verified, shared-lib + index.html]; one names Igloo's ice [site:igloo] as the reference for the embedded mark [verified, shader text]. Portfolio v1 (da-san333.com) is the same designer's earlier, particle-based site [verified, shared-lib work data] and has its own card. Sources in `.awards/research/daikifujita/`: index.html, `src/` (shared-lib, framer, motion, react, script_main), manifest.json, the ungated frames and ARIA snapshots, `gated-desktop/` (entered, hero-hover, mid, works, night, close, dream), `gated-mobile/`, lens-notes.md.
