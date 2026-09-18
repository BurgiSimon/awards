# Léo Parpeix — Portfolio 2026 — https://www.leoparpeix.com/

<!-- Label key. [verified: awwwards] = Awwwards listing / profile text via search extraction · [verified: gallery] = Lapa Ninja, landing.love, Orpetron, Muzli extracts · [verified: clone <file>] = CW-Ankit/leoparpeix-clone on GitHub (fetched directly) — a third-party educational reconstruction ("Original Concept & Design: Léo Parpeix"), so its hexes and parameters approximate the live site and are never better than medium as evidence about it · [inferred] · [unknown]. The live site, awwwards.com and archive.org were not fetched. -->

| Field | Value |
|---|---|
| Class | portfolio — personal site of a French art director and interactive designer (Montreal / Paris), reportedly ~3 years in the making `[verified: gallery]`; routes Work · About · Playground + an external Lab |
| Visitor mode | experience — the site is the proof of craft; conversion is an email CTA, not a funnel |
| Awards | Awwwards SOTD 14 Sep 2026 + Developer Award, PRO entry `[verified: awwwards, high]` · overall 7.69/10 `[verified: awwwards, medium — one extraction]` · one juror (Marina Golubeva) at 8 on Design `[verified: awwwards, low — one extraction]` · tags Experimental, Animation, Portfolio, Typography, Transitions, 3D; tech tags 3D, WebGL, After Effects, Blender `[verified: awwwards]` · featured on Lapa Ninja, landing.love, Orpetron, Muzli `[verified: gallery]` · no HM for this site `[verified: awwwards submissions, medium]` · Léo was an Awwwards Young Jury member in 2025 `[verified: awwwards jury page]` |
| Studio / credits | DA, UI, interactive design — Léo Parpeix · front-end + WebGL — Thoma Lecornu (thomalecornu.fr) · 3D modelling — Victor Roussel, Léo Parpeix · 3D lighting & textures — Victor Roussel, Felix Sikora, Lucas Gousserey, Léo Parpeix · 3D to WebGL — Roussel, Gousserey, Parpeix · sound design — Léonard Bichet · copy — Jessica King `[verified: launch-post extract, high]`. Two other extractions name "Mélina Guyon" as developer — read as a summariser error, unverified `[verified: conflicting extracts, low]` |
| Stack (evidence level) | Three.js + custom GLSL + GSAP + Lenis `[verified: awwwards tags + gallery, high]` · Vue 3 + Vue Router + Pinia + Vite + TypeScript `[verified: clone package.json; for the live site inferred, low-medium]` · CMS none `[inferred]` · Blender → glTF / Draco, After Effects boards `[verified: awwwards tags]` · hosting / CDN `[unknown]` · fonts self-hosted woff2 / ttf `[verified: clone fonts.css]`, licensing source `[unknown]` |
| Palette | forest `#083D2A` (primary ink) · dark green `#022016` · emerald `#008841` · yellow `#F6E016` (accent) · cream `#EED6C8` (accent) · off-white `#F7F7F7` · border `rgba(8, 61, 42, 0.15)` `[verified: clone variables.css — reconstruction, medium for the live site]`. Strategy: theme-per-section (four named themes, §3), light-dominant with inversions |
| Type | Monument Grotesk (Dinamo) for text and UI + Avantt (variable) for display `[verified: clone fonts.css, high]`; Awwwards tagged the site under Typography `[verified: awwwards]`. Contract: quiet neo-grotesque workhorse + wide geometric-humanist display; fluid `clamp()` scale `[verified: clone]` |
| WebGL dosage | canvas-first — a persistent 3D scene under DOM content, a full-frame post-process, a WebGL type break, a 3D easter egg `[verified: clone; awwwards 3D / WebGL tags]` |
| Scroll model | native + smooth library — Lenis ^1.1.x behind a `SmoothScroll` service `[verified: clone; gallery lists Lenis]` |
| Narrative model | chaptered journey behind one entry gate — a first-person craft manifesto, not a case-study index |

## 1. Concept and narrative
The one idea: the portfolio *is* the work — seamless motion demonstrated on every pixel instead of claimed in a bio. Copy below is recovered from the clone's content file, so wording is near-verbatim rather than exact `[verified: clone siteContent.ts, medium]`.

Beats, in order `[verified: clone views; consistent with every written description]`:
1. Gated loader — a counter, then "Click to enter & enable sound."
2. Hero identity claim in two states: "French / Interactive / Designer" resolves on reveal into "Creative / Passionnate / Art Director" (the spelling reads as deliberate). Header line: "Driven by detail. Obsessed with seamless motion." Locator lines: raised in France, designing worldwide; currently at @Locomotive and freelance, formerly @ImmersiveGarden.
3. Intro + showreel — "Bonjour, I cherish simplicity, a touch of craziness, a unique identity & pixel-perfect animations."
4. Three projects → 5. a full-viewport WebGL typographic break → 6. three more projects.
7. Archives list (~18 rows). 8. Footer CTA in three lines: "Let's create / a remarkable / journey".

Each project carries a metadata quartet — name · discipline · year · "Team of N @Studio" — plus an award tally, e.g. Creandum (Finance, 2023, Team of 2 @ImmersiveGarden), Dioriviera (2023, Team of 5 @ImmersiveGarden, Awwwards ×1, FWA ×1); also Veillance, Mechachain, Dulcedo, Trebuchet `[verified: clone siteContent.ts; client names corroborated by his award history]`. About carries a tabular CV (Freelance 2023–present · Locomotive 2022–23 · Immersive Garden 2020–22 · Trebuchet 2019–20), a tally of Awwwards SOTD ×8 · FWA ×6 · CSSDA ×12, and the claim of "6+ years creating digital experiences" bridging design systems and "bleeding-edge WebGL technology" `[verified: clone, medium]`.

Tone: warm but precise, French-inflected, craft-obsessive, no corporate voice. Numbers and roles do the bragging; adjectives are rationed.

## 2. Structure and components
Routes: Work `/` · About `/about` · Playground `/playground` · Lab ↗ (lab.leoparpeix.com, external) `[verified: gallery + clone router]`. 404 and the Playground's contents `[unknown]`.

- **Preloader** — a percentage counter that advances in randomised 5–23-point jumps every 100 ms (deliberately non-linear, so it feels organic), title + loading word, then a button "Click to enter & enable sound." Emits `LOADER_REVEAL_COMPLETE`, which starts the reveal `[verified: clone LoaderBlock.vue]`.
- **Nav** — horizontal Work / About / Playground + "Lab ↗"; a sound toggle rendered as animated equaliser bars that reflect state. Mobile: fullscreen overlay teleported to `body` (`z-index: 99990`), numbered links 01 / 02 / 03, closes on Escape or route change, sound toggle + socials in its footer `[verified: clone NavbarComponent.vue]`.
- **Cursor (the signature)** — two layers with different inertia: an inner precision dot at lerp 0.75 and an outer spring ring at lerp 0.22. On interactive hover the ring scales to 1.35 while the dot shrinks to 0.7, ring opacity 0.35 → 0.8, and a dashed orbit animation speeds from 9 s to 4 s. It becomes a contextual pill with an SVG icon — `drag` (arrows), `play` (triangle), `view` (eye), `feed` (radial sunburst), `copy` / `mail` (envelope) — with badge colour alternating `#F6E016` / `#EED6C8` by action type. Fully suppressed under `(hover: none), (pointer: coarse)` `[verified: clone CursorIndication.vue]`.
- **Project carousel** (`ProjectSlider`) — draggable, lazy-loaded WebP `[verified: clone]`.
- **Archives list** — text rows; hover spawns a floating image preview that chases the cursor via `translate3d` with a 0.25 easing factor `[verified: clone HomeView.vue]`.
- **WebGL typographic break** — full-viewport animated type between the two project groups, used as a palate cleanser `[verified: clone + gallery descriptions]`.
- **Easter egg "Feed Bee"** — a hint in the hero; each click spawns 3D fruit into the scene and fires `fruit1.aac` or `fruit2.aac` at random. No navigational purpose `[verified: clone HomeScene.ts]`.
- **Footer** — three-line CTA, Instagram / Email / LinkedIn, on the green theme `[verified: clone]`.

## 3. Visual language
- **Themes** swapped per section / route `[verified: clone variables.css]`: default — bg `#FFFFFF`, text `#083D2A` · dark — bg `#083D2A`, text `#F7F7F7` · yellow — bg `#F6E016`, text `#083D2A` · green — bg `#083D2A`, text `#EED6C8`. Four named states, not a dark-mode toggle: scrolling reads like turning the pages of a printed book, and the footer closes on green. Vivid green as the accent also anchors `[site:why-zero]` (`#01C654`) — a 2026 marker, hence a reflex to avoid.
- **Type** — Monument Grotesk body / UI, Avantt display; fluid `clamp()` sizes; `font-display: swap` `[verified: clone fonts.css]`.
- **Imagery and materials** — hybrid: a `scene_v9.glb` studio / architectural environment, cloud plane sprites at 0.35 opacity, WebP project stills in carousels, a reel video, `.aac` audio `[verified: clone]`. Shader backdrop: a vertical gradient from cream `vec3(0.92, 0.90, 0.87)` to dark teal `vec3(0.03, 0.24, 0.16)` via `smoothstep(0.1, 0.85, vUv.y)`; three-point lighting — ambient 1.5, warm key `0xfffaed`, cool fill `0xe8f0ee` `[verified: clone HomeScene.ts]`.
- **Layout** — editorial and generous; desktop gutters 40–120 px collapsing to 20 px on mobile; the two-column CV / awards table collapses under 900 px `[verified: clone]`.
- **Browser surfaces** (selection, scrollbar, favicon, OG) `[unknown]`.

## 4. Motion and effects (with parameters)
- **Smooth scroll** — Lenis ^1.1.20 wrapped in a `SmoothScroll` service `[verified: clone]`. The only orthodox Lenis + GSAP site in batch A; see `[site:why-zero]` for the virtual-float alternative and `[site:usavionix]` for a studio scroll abstraction.
- **Engine and easings** — GSAP ^3.12.7 throughout; two house curves, `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` and `--ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1)`. The expo-out curve is reused on the cursor, so page motion and pointer motion share one feel `[verified: clone variables.css]`.
- **Fluid simulation driving the frame** — a 128 × 128 (`simRes: 128`) ping-pong velocity FBO pair (`velFboA` / `velFboB`). Mouse delta × 10.0 is splatted into the field with `uRadius` 0.0015 at rest → 0.002 while moving and `uDissipation: 0.96`. Advection-only: no curl confinement, no pressure projection — the cheap, correct choice for a cursor wake `[verified: clone FluidSimulation.ts]`.
- **Post-process fed by that velocity texture** — UV distortion at `uDistortionStrength: 0.0035` with `uVelocityScale: 1.5`, plus chromatic aberration sampling R and B at `vel * 0.001` offsets from G. Net effect: the frame ripples and colour-fringes in the wake of the cursor — the Developer Award move `[verified: clone PostProcessing.ts]`.
- **Scroll-scrubbed 3D** — `model.rotation.y = scrollY * 0.00015`; clouds drift on `Math.sin(time * 0.15 + idx) * 0.002` `[verified: clone HomeScene.ts]`.
- **Page transitions** — a dedicated `pageTransition.aac` cue `[verified: clone]`; the visual treatment `[unknown]`.
- **Text animation** — the WebGL type break `[verified: clone]`; DOM text reveal parameters `[unknown]`.
- **Sound (opt-in)** — a looping `ambient.aac` at volume 0.375, SFX at 0.35, raw `HTMLAudioElement` with `currentTime = 0` resets and a silent `.catch(() => {})`; no Howler `[verified: clone SoundController.ts]`.
- **Load sequence** — non-linear counter → click-to-enter (also the audio consent) → `LOADER_REVEAL_COMPLETE` → hero reveal `[verified: clone]`.

## 5. Tech and pipeline
- Clone `package.json` `[verified: clone]`: gsap ^3.12.7 · lenis ^1.1.20 · pinia ^2.3.1 · three ^0.174.0 · vue ^3.5.13 · vue-router ^4.5.0; dev — vite ^6.2.0 · vite-plugin-glsl ^1.3.1 · typescript ~5.7.3 · @vitejs/plugin-vue ^5.2.1 · @types/three.
- Clone architecture `[verified: clone]`: `src/webgl/{WebGLManager, HomeScene, AboutScene, TopScene, FluidSimulation, PostProcessing, GLTFLoaderHelper}.ts` · `src/services/{EventBus, SmoothScroll, SoundController}.ts` · a Pinia store · `public/` with `.glb` models, Draco decoders and audio, downloaded by script rather than committed.
- What the live site corroborates: Awwwards tech tags 3D / WebGL / After Effects / Blender; galleries list Three.js, GSAP, Lenis, WebGL, custom GLSL `[verified: awwwards + gallery]`. Vue 3 + Vite is the least corroborated element — plausible, since his collaborators sit in the French Vue / Nuxt orbit, but `[inferred, low-medium]`.
- Pipeline: Blender → glTF + Draco → Three.js; After Effects for motion boards; lazy WebP; self-hosted fonts with `font-display: swap` `[verified: clone; awwwards tags]`.
- Budgets (entry JS, GL chunk, texture sizes, LCP), hosting / CDN, CMS, resize strategy `[unknown]`.

## 6. Weaknesses
- **Reduced motion** — no `prefers-reduced-motion` handling anywhere in the reconstruction `[verified: clone, absence]`, and nothing in the listings mentions it. For a site whose every frame is post-processed, that is the largest gap. The awards skills author three tiers per moment (full / reduced / static): reduced keeps the theme swaps and metadata reveals without the fluid wake; static ships the page as an editorial document.
- **Load gate** — the whole experience sits behind "Click to enter", with sound consent fused into the same gesture `[verified: clone LoaderBlock.vue]`. Awwwards-friendly, usability-hostile; a 7.69 overall is consistent with a docked usability axis `[inferred]`. The awards skills bind the preloader to a real load signal (fonts ready + first GL frame), never a click wall, keep sound as a separate toggle, and hold CLS ≈ 0 at reveal.
- **Keyboard and touch** — the overlay closes on Escape `[verified: clone]`, but the drag / play / view affordances live only in the pointer badge, and the cursor is suppressed on coarse pointers, so touch and keyboard visitors get no affordance at all `[inferred from the clone]`. The awards skills keep every affordance as a DOM label or button and treat the cursor badge as decoration.
- **DOM mirror** — the WebGL type break and the 3D scene have no documented text equivalents `[unknown]`. The awards skills mark the canvas `aria-hidden` and mirror any canvas-rendered words in the DOM.
- **Budget** — three GL scenes, Draco decoders, a reel video, ambient audio and two families; totals `[unknown]`. The awards skills lazy-load the GL chunk (≤ 500 KB gz) behind a DOM-first paint and cap fonts at 4 files / 400 KB.
- **Research caveat** — parameters come from a reconstruction; live values may differ. No published criticism found `[verified: search, absence]`.

## 7. Principles (3–6, generalisable)
1. **One simulated layer, not a dozen tricks** — a single field that every effect reads from unifies a page; accumulated hover gimmicks fragment it.
2. **Mass through differentiated lerps** — a fast element (≈ 0.75) and a slow one (≈ 0.2) make a pointer, a follower or a layer feel like an object.
3. **The cursor can be the affordance system**, which lets the layout shed chrome — as long as touch and keyboard get a DOM equivalent.
4. **Theme as chapter rhythm** — named palette states swapped per section read as page turns, not as a mode toggle.
5. **Structured credibility** — year, team size, studio and award count persuade harder than adjectives.
6. **A purposeless reward** shows confidence and buys goodwill — cheap, but only after the essentials are flawless.

## 8. Take / Don't take
- **Take:**
  - The velocity-field post-process as a *system*: a 128² ping-pong velocity FBO, pointer delta splatted (× 10, radius 0.0015 → 0.002, dissipation 0.96), one full-screen pass doing UV offset (strength 0.0035, velocity scale 1.5) plus RGB split (vel × 0.001). Advection + dissipation only — skip pressure and curl. Decision: one field, one pass, everything shares it.
  - The two-speed pointer: ring lerp ≈ 0.22, dot ≈ 0.75; on hover ring × 1.35 and dot × 0.7, opacity 0.35 → 0.8; `data-cursor="drag|play|view"` on targets renders a pill + icon from a two-hue accent set (your hues); gate on `(pointer: fine)`; always pair with a visible DOM label.
  - A non-linear loader counter (random 5–23 steps per 100 ms) — tied to a real load signal, with audio consent as a separate toggle.
  - Named theme tokens (`--theme-bg` / `--theme-text`) swapped per section, three or four states, one reserved for the close.
  - Hover-to-preview archive rows with an image following the pointer at ≈ 0.25 lerp.
  - Rule-of-three grouping with a full-viewport typographic break between groups.
  - The metadata quartet (name · discipline · year · team + studio) plus an award tally; a two-state hero headline that resolves from one claim to another.
  - One shared easing token for page and pointer (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Don't take:**
  - The palette (`#083D2A`, `#022016`, `#008841`, `#F6E016`, `#EED6C8`) or the theme sequence white → forest → yellow → cream-on-green.
  - The copy: "Driven by detail…", "Bonjour, I cherish…", "Let's create / a remarkable / journey", "Click to enter & enable sound", the French / Interactive / Designer ↔ Creative / Passionnate / Art Director switch.
  - The section order loader → hero → intro + reel → 3 projects → GL type break → 3 projects → archives → CTA.
  - Monument Grotesk + Avantt as the pairing.
  - A fluid-distortion + chromatic-aberration cursor wake as *the* signature — that now reads as this site. Re-aim the fluid recipe at a different job (a material, a reveal, a transition).
  - "Feed Bee" and fruit-spawning, the equaliser-bar sound toggle, the `scene_v9.glb` studio backdrop, drifting cloud sprites, the dashed orbit ring.

## 9. Confidence and sources
Per section — table / awards: high (score medium) · credits: high, one flagged conflict · §1 concept: medium-high (clone wording) · §2 components: medium-high · §3 palette: medium (reconstruction), type: high · §4 motion: medium-high (clone-derived; the Lenis + GSAP + fluid + aberration vocabulary is high) · §5 stack: medium (Vue / Vite low-medium) · §6: medium. Evidence note: the live site, awwwards.com and archive.org were network-blocked; listing text came via search extraction, GitHub via direct fetch.

Cross-references: the virtual-scroll alternative and shader-as-event philosophy `[site:why-zero]`; a diegetic preloader instead of a counter `[site:usavionix]`; the no-WebGL counter-example `[site:white-desert]`.

- https://www.awwwards.com/sites/leo-parpeix-portfolio-2026
- https://www.awwwards.com/leoparpeix/submissions · https://www.awwwards.com/jury-member/leoparpeix
- https://github.com/CW-Ankit/leoparpeix-clone — `package.json`, `src/styles/variables.css`, `src/styles/fonts.css`, `src/data/siteContent.ts`, `src/webgl/HomeScene.ts`, `src/webgl/FluidSimulation.ts`, `src/webgl/PostProcessing.ts`, `src/components/{LoaderBlock,NavbarComponent,CursorIndication}.vue`, `src/views/{HomeView,AboutView}.vue`
- https://www.lapa.ninja/post/leo-parpeix/ · https://www.landing.love/sites/leoparpeix/ · https://orpetron.com/sites/leo-parpeix-portfolio/ · https://me.muz.li/leo-parpeix/leo-parpeix-art-director-interactive-designer-2
- https://thomalecornu.fr/ · https://www.linkedin.com/in/leo-parpeix/ · https://theorg.com/org/locomotive/org-chart/leo-parpeix
