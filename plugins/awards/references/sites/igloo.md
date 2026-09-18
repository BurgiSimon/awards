# Igloo Inc — https://www.igloo.inc/

| Field | Value |
|---|---|
| Class | brand — a corporate monument for the parent company of Pudgy Penguins and Overpass IP; the ventures appear as specimens, not as a portfolio grid [verified: `swan4er/igloo` docs; manifest holds `pudgy.drc` and `overpass_logo.drc`] |
| Visitor mode | experience |
| Awards | Awwwards **Site of the Year 2024** and **Developer Site of the Year 2024** [verified: four independent sources agree]; Site of the Month Jul 2024; Site of the Day 23 Jul 2024 [verified]. Overall 7.92, Dev award 7.66; developer sub-scores animation 9.60 · WPO 8.00 · responsive 8.40 · semantics 6.60 · accessibility 6.60 · markup/meta 6.40 [recalled medium: AI-compiled `vigchetan/Any-IDE`, but `families.json` independently cites the same 6.4–6.6 empty-DOM band]. D/U/C/Co split [unknown]. FWA / CSSDA / Godly [unknown] |
| Studio / credits | Abeto (`abeto.studio` / `abeto.co`) with agency Bureaux (`bureaux.studio`) [verified: `LAYTAT` and `SamGomes1984` READMEs]; Abeto published an Awwwards case study [verified via `starman011/portfolio-tech/SOURCES.md`]; Abeto's `messenger.abeto.co` is a 2025 SOTY-collection entry — same house style [verified]; named individuals [unknown] |
| Stack (evidence level) | Vite [verified: `assets/[name]-[hash].js` manifest] · Three.js with DRACOLoader + KTX2Loader [verified: decoder WASM in manifest] · Svelte, likely via Threlte; three-mesh-bvh [recalled medium, single source] · GSAP [recalled medium, case-study summary]; ScrollTrigger [contested, unverified] · Houdini + Blender + Substance 3D Painter authoring [recalled medium] · no CMS [inferred: content is baked into assets] · hosting, CDN, versions [unknown] |
| Palette | `#b6bac5` `#383e4e` `#A0A5B1` `#6A6F7D` `#E1E6F1` `#83A1C5` [verified: sampled, `families.json`]. Ground is a fog gradient `#6A6F7D → #E1E6F1`; `#83A1C5` is the single cool rim accent. Strategy: one temperature, saturation ≈ 0, no ground image |
| Type | single monospace contract — IBM Plex Mono Medium only, rendered in-canvas as MSDF glyphs; no DOM text [verified: `IBMPlexMono-Medium-datatexture.ktx2` + `IBMPlexMono-Medium.json` + `msdfworker-*.js`] |
| WebGL dosage | 100 % canvas — the DOM is a shell around a CSS preloader [verified] |
| Scroll model | virtual float — document scroll abolished; wheel/touch drive a damped, snapping, modulo-wrapped scalar [verified] |
| Narrative model | chaptered journey as a spatial descent, wrapping infinitely [verified] |

## 1. Concept and narrative
**One idea:** you descend into an arctic world; scroll drives a camera, not a document [recalled high: `swan4er/igloo`; `families.json` family "carved-ice-mono"].

Beats [recalled high unless noted]:
1. Snow plain with an ice igloo; a HUD line invites the scroll (`Scroll down to discover.` [verified copy]).
2. The camera orbits and approaches; the manifesto chapter (`/////// Manifesto` [verified]) states a one-sentence mission — 19 words about consumer brands "at the intersection of Community, AI, and crypto" [verified copy fragment].
3. The camera flies inside the structure; interior scenes succeed one another through flash / glitch / interference cuts, never a fade.
4. Specimen chapters: a Pudgy Penguin frozen inside a carved crystal cube with technical leader-line callouts; the ventures are exhibits.
5. No end — the scalar wraps modulo and the descent begins again [verified: Awwwards "Infinite Scroll" tag; observed behaviour].

**Tone and register:** expedition telemetry / research station. Terse copy, slash rules, coordinate readouts, leader lines, a state-labelled `Sound: Off` control and a HUD copyright line (`// Copyright (c) 2026 …`) [verified: DOM capture 2026-07-06, `YZversion` RECON]. The coldness is functional: it stops a crypto-adjacent mission from reading as hype.

## 2. Structure and components
Routes: a single page [inferred: the manifest shows one entry bundle + one 3D app bundle, both verified]; 404 [unknown].

| Component | What it does | Label |
|---|---|---|
| Preloader | pure-CSS ASCII loader (`content:` keyframes) — the only meaningful DOM before the canvas takes over | [verified: `families.json`] |
| Hero | snow plain + igloo, HUD scroll prompt | [verified] |
| Manifesto | slash-ruled heading + mission sentence, in-canvas type | [verified] |
| Interior scenes | camera dives inside; scenes cut by flash / interference transitions | [recalled high] |
| Specimens | brands (Pudgy, Overpass) as objects frozen in carved crystal with callouts; per-project enter/leave SFX | [verified: `pudgy.drc`, `overpass_logo.drc`, `enter-project` / `leave-project` audio names] |
| Sound toggle | visible `Sound: Off` control rendered in-canvas, icon from `ui/sound-datatexture.ktx2` | [verified] |
| Nav / menu | no conventional DOM nav; HUD chrome only | [inferred] |
| Cursor | — | [unknown] |
| Footer | HUD copyright text, not a DOM footer | [verified] |
| Easter eggs | — | [unknown] |

## 3. Visual language
- **Palette roles** [verified hexes]: fog gradient `#6A6F7D → #E1E6F1` as the ground; `#383e4e` as the darkest ink; `#b6bac5` / `#A0A5B1` mid-tones for ice and HUD; `#83A1C5` reserved for the rim. Near-monochrome blue-grey; no saturated colour anywhere.
- **Type**: one face, one weight, one size class per role; glyphs live in the scene as MSDF, so type has depth, parallax and obeys the post stack [verified: font atlas + worker]. UI icons are textures too: `ui/arrow-`, `ui/close-`, `ui/logo-`, `ui/sound-`, `ui/visit-datatexture.ktx2`, `scroll-datatexture.ktx2` [verified].
- **Material vocabulary** from asset names [verified]: `frost-datatexture`, `caustics`, `bokeh`, `clouds_noise`, `wind_noise`, `perlin-datatexture`, `noises/blue-8-128-rgb` (blue noise for dithering), `mosaic`, `dot_pattern`, `triangles_tiling`, `shapes_blurred`.
- **The "cheap ice" recipe** [recalled high: `swan4er/igloo` render teardown]: the igloo blocks are *not* transparent — no transmission, just rough matte surfaces. The expensive look is optics: bevelled edges catch light as a bright line; the key light sits inside / below so seams glow; Fresnel rim; bloom with a *high* luminance threshold (snow is near white — a low threshold smears the frame); depth of field; fog; film grain. Real refraction appears only on the later crystal cubes.
- **Grade**: a no-tone-mapping 3D LUT rather than curves [verified: `families.json`].
- **Layout system**: none in CSS terms — composition is camera framing plus HUD anchors [verified: no DOM layout].
- **Browser surfaces**: moot — no selectable text, no native scrollbar (document height equals viewport) [verified].

## 4. Motion and effects (with parameters)
- **Virtual scroll** [verified: `document.scrollHeight === viewport height`; wheel/touch consumed by the canvas]. Constants [verified: `families.json` — single detailed source, medium-high]: wheel delta × **0.1** → friction **0.97** → **double lerp 0.075 → 0.15** (one slow lerp for the raw target, a second faster one for the camera reading it — the weighted-but-responsive feel) → **1.4 s `inOut3`** (ease-in-out-cubic) auto-snap to the nearest section → **modulo wrap** → exponential / log framerate-independent damping.
- **Scroll → GSAP** [contested, unverified]: `LAYTAT` claims ScrollTrigger drives camera and shader values; that cannot be the default document mode on a page with no scroll height. Most likely a custom scalar feeding timeline `.progress()`.
- **Text**: scramble-decode reveals via SDF texture offsets — zero DOM reflow [recalled high].
- **Transitions**: flash / glitch / interference cuts between interior scenes [recalled high]; render-to-texture compositing with a fullscreen shader plane is the likely mechanism [inferred] — compare [site:slosh-seltzer].
- **Post FX**: chromatic aberration [verified: `migueljnew-droid/ui-ux-gold-standard/TECHNIQUES.md` names igloo.inc], frost displacement, "tech" displacement, bloom, DOF, grain [recalled high: `LAYTAT` README].
- **Simulation is playback**: `ceilingsmoke.drc`, `smoke_trail.drc`, `intro_particles.drc`, `shattered_ring_smoke.drc` are Draco *geometry* — Houdini simulates offline, the browser replays [verified: manifest].
- **Volumes**: `images/volumes/medium_32.ktx2`, `peachesbody_64.ktx2`, `x_64.ktx2` — 32³ / 64³ volumes flattened into texture atlases [verified: manifest]; produced with a custom VDB→web exporter [recalled high: case-study summary].
- **Sound** [verified: audio asset names]: crossfaded wind + music bed (~1.5 MB track), rate-limited event SFX `beeps`, `click-project`, `enter-project`, `leave-project`, `wind`, `shard`; state-bound, not ambient; decoded in `audioworker`.
- **Load sequence**: CSS ASCII loader → 16 KB entry responds instantly → the 3D app and textures stream behind it, decoded in workers [verified: bundle sizes + worker files].
- Pointer effects [unknown].

## 5. Tech and pipeline
- **Captured manifest** (66 URLs) [verified: `Vishagautam/igloo/captured_urls.txt`]: `assets/index-2eb69c09.js`, `assets/App3D-f554a111.js`; `assets/libs/draco/draco_decoder.wasm` + `draco_wasm_wrapper.js`; `assets/libs/basis/basis_transcoder.js` + `.wasm`.
- **19 Draco `.drc` geometries** [verified]: `igloo`, `igloo/igloo_cage`, `igloo/igloo_outline`, `igloo/patch`, `mountain`, `ground`, `floor`, `cubes/background_shapes`, `intro_particles`, `ceilingsmoke`, `smoke_trail`, `shattered_ring`, `shattered_ring2`, `shattered_ring_smoke`, `pudgy`, `abstractlogo`, `overpass_logo`, `blurrytext`, `blurrytext_cylinder`. No glTF / GLB at all.
- **36 KTX2 / Basis textures** — every image asset; zero PNG / JPG except the favicon (`assets/favicon32-af94112f.png`) [verified].
- **Four dedicated workers** [verified]: `audioworker`, `bitmapworker-046527f8.js`, `exrworker-41cbee65.js`, `msdfworker-ac346fa7.js` — all decode off the main thread.
- **Budgets** [verified: `swan4er/igloo`, from the shipped files]: entry **16 KB (~6 KB gz)**; main scene bundle **1.45 MB (~420 KB gz)**; full landscape texture set **625 KB**; music **1.5 MB**. Awwwards WPO 8.00 and responsive 8.40 [recalled medium]; LCP ≈ 1 s desktop and mobile [recalled low].
- **Authoring**: Houdini + Blender + Substance 3D Painter; Figma / Photoshop / Affinity for UI; DaVinci Resolve for sound [recalled medium, single source].
- Resize strategy, DPR policy, quality tiers [unknown].

## 6. Weaknesses
- **Empty DOM.** An automated audit found the site "WebGL-gated", defaulting to Times New Roman with zero-confidence colour and button classification — i.e. no semantic DOM to read [verified: `Venkata-Manoj/mere-human`]. This is the 6.6 accessibility / 6.6 semantics / 6.4 markup band on the winner's own card [recalled medium, cross-corroborated]. `families.json` warns the family is not for SEO, a11y or conversion pages [verified].
- **WebGL2-only, no reduced-motion path** [verified: `families.json`]; a camera flight with post FX is a vestibular trigger with no non-motion equivalent.
- **Keyboard**: a virtual scroll consumes wheel and touch; nothing shows keys advance sections [inferred, unknown].
- **What the awards skills do differently:** the canvas is `aria-hidden` and a visually hidden semantic mirror carries landmarks, headings, the manifesto sentence and real links to each venture (GL text never ships without a DOM mirror); reduced motion becomes a stepped tier — sections change on a cut, camera flight and displacement FX off, a static frame per chapter; arrow / PageDown / Space advance the virtual scroll and the sound toggle is a focusable control with its state in the accessible name; the preloader is tied to a real `Promise.all(fonts, assets)` with `aria-live`, holds at 100, and skips on repeat visits (≤ 2.5 s); a no-WebGL / WebGL1 tier renders a still per chapter instead of a blank page. Keep Igloo's staged 16 KB entry and its honest sound switch — both are the model.

## 7. Principles
1. **The bake step is the moat.** Cinematic scenes ship in ~420 KB gz because simulation, volumes and glyphs are pre-computed into GPU-native formats; the spectacle is inseparable from the pipeline.
2. **Expense comes from optics, not materials.** Bevels, interior light, rim, thresholded bloom, DOF, fog and grain read as luxury; transmission is reserved for the one object that earns it.
3. **Discipline as luxury.** One face, one weight, one temperature, zero saturation — restraint is what makes a single cool accent land.
4. **Scroll can be a camera, but then it must behave like software** — framerate-independent damping, a snap, and a predictable loop.
5. **Sound is state.** Named SFX per interaction, a crossfaded bed, and a switch that says what it is currently doing.
6. **Register commitment.** The 9 px labels, the callouts and the copyright line all speak the same telemetry dialect as the hero.

## 8. Take / Don't take
- **Take:**
  - The virtual-scroll camera rig and its numbers: input × ~0.1 → friction ~0.97 → two chained lerps ~0.075 then ~0.15 → progress; ~1.4 s ease-in-out-cubic snap to the nearest section; modulo wrap only when the story is a loop; damping as `1 - Math.exp(-k * dt)` so 60 Hz and 144 Hz feel identical. Decision: only when the page is a world, never for a document — and ship it with keys and a stepped reduced-motion tier (`[recipe:gl-virtual-scroll-camera]`).
  - The cheap-ice checklist as an ordered effort-to-impact list: bevel every edge → light from inside / below → Fresnel rim → bloom with a high threshold → DOF → fog → fine grain → desaturate to near zero. No transmission until one hero object needs it.
  - Offline bake for anything non-interactive: smoke, shatter, particle bursts simulated in a DCC and exported as Draco geometry or a KTX2 volume atlas; play back, never compute.
  - In-canvas MSDF type for scramble / decode reveals, always paired with a hidden DOM mirror — the fix for the 6.6.
  - Budget as a design constraint: entry < 20 KB; 3D app deferred; scene ≈ 420–500 KB gz; textures ≤ ~625–700 KB per scene; KTX2 and Draco for everything; decode in workers; measure gzipped.
  - Event-bound audio: rate-limited named SFX (enter / leave / click / shard), a crossfaded bed, a visible toggle that states its current value.
  - Copy register as instrumentation: slash rules, monospace micro-labels, coordinate readouts and leader lines turn corporate copy into readouts (compare [site:usavionix]).
  - A preloader that costs nothing — pure CSS, no framework before first paint.
- **Don't take:**
  - The arctic world: snow plain, igloo, carved-crystal specimen cubes, the frozen mascot, the callout-line exhibit staging.
  - The descent-then-wrap chapter order and the flash / glitch / interference cut vocabulary as-is.
  - The hexes, the `#6A6F7D → #E1E6F1` fog and the `#83A1C5` rim — blue-grey monochrome is now this site's signature.
  - IBM Plex Mono-only as an identity; the slash-rule heading style (`/////// …`); the copy lines `Scroll down to discover.`, `Sound: Off`, the mission sentence.
  - The asset names and files, the ASCII preloader, the chromatic-aberration + tech-displacement + grain stack as a look.
  - The empty DOM: the winner's 6.6 is a ceiling that was survived, not a licence.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards (SOTY / Dev SOTY / SOTM Jul / SOTD 23 Jul 2024) | high — four sources agree |
| Score sub-metrics | medium — AI-compiled, numerically cross-corroborated by `families.json` |
| Credits | high for Abeto + Bureaux; individuals unknown |
| Copy and narrative | high — verbatim DOM capture; beat order recalled high |
| Palette | high — sampled dataset |
| Assets, build, formats, budgets | very high — real network capture + file inspection |
| Svelte / Threlte / BVH / DCC tools | medium — single source + case-study summary |
| GSAP ScrollTrigger | contested |
| Scroll constants | medium-high — one detailed source, consistent with observed behaviour |
| Cheap-ice optics | recalled high — third-party render teardown |

Sources: `raw.githubusercontent.com/Vishagautam/igloo/master/captured_urls.txt` · `.../YZversion/ai-interaction/main/igloo-clone/RECON/original-observations.json` and `TEARDOWN.md` · `.../LAYTAT/igloo-reverse-engineering/main/README.md` · `.../swan4er/igloo/main/docs/how-igloo-inc-works.md` · `.../ryanonline1234/mediatastelibrary/main/data/families.json` · `.../roshanvijay37/Roshan/main/public/awwwards/data.js` · `.../vigchetan/Any-IDE/main/docs/award_winning_analysis.md` · `.../migueljnew-droid/ui-ux-gold-standard/main/TECHNIQUES.md` · `github.com/SamGomes1984/igloo-inc-website-recreation` · `.../Venkata-Manoj/mere-human` (`ui_ux_audit_results.md`) · `.../starman011/portfolio-tech/.../SOURCES.md` · `awwwards.com/igloo-inc-case-study.html` (cited, not fetched). Batch-E research report, 2026-09-17; the site itself was unreachable through the egress proxy.
