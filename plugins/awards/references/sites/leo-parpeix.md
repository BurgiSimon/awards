# Léo Parpeix — Portfolio 2026 — https://www.leoparpeix.com/

| Field | Value |
|---|---|
| Class | portfolio (art director + interactive designer) |
| Visitor mode | experience |
| Awards | Awwwards SOTD 14 Sep 2026 + Developer Award [verified via search extraction]; overall ≈ 7.69 [recalled medium]; tags Experimental, Animation, Portfolio, Typography, Transitions, 3D; tech tags 3D, WebGL, After Effects, Blender [verified] |
| Studio / credits | DA/UI/interaction Léo Parpeix; front-end + WebGL Thoma Lecornu; 3D Victor Roussel, Felix Sikora, Lucas Gousserey; sound Léonard Bichet; copy Jessica King [verified launch credits]. A conflicting "built by Mélina Guyon" claim in two summaries is treated as a summariser error [unknown] |
| Stack (evidence level) | Three.js + GSAP + Lenis + custom GLSL, Blender → glTF/Draco [verified tags + clone]; Vue 3 + Vite + TypeScript + Pinia [inferred from the educational clone `CW-Ankit/leoparpeix-clone`, medium-low]; hosting/CMS [unknown] |
| Palette | white #FFFFFF / off-white #F7F7F7 ground; forest #083D2A ink; emerald #008841; yellow #F6E016 and cream #EED6C8 accents [recalled from clone, medium — reconstructed hexes]; four named themes swapped per section |
| Type | Monument Grotesk (UI/body) + Avantt variable (display) [verified]; fluid `clamp()` scale; gutters 40–120 px → 20 px |
| WebGL dosage | canvas-first: a 3D studio scene behind DOM content plus one global post-process |
| Scroll model | native + Lenis (^1.1) + GSAP [verified for the vocabulary; versions from the clone] |
| Narrative model | collage → index: craft manifesto, 3 projects · typographic break · 3 projects · archive · CTA |

## 1. Concept and narrative
A first-person craft manifesto rather than a case-study index. The flow: a gated preloader → a two-state hero whose identity line mutates on reveal ("French / Interactive / Designer" resolving to a second claim) [recalled medium] → intro + showreel → three projects → a full-viewport WebGL typographic break → three more projects → a hover-preview archive list → a three-line footer CTA. Every project carries a metadata quartet (name · discipline · year · "Team of N @Studio") plus an award tally; the About page is a tabular CV with an awards count. Tone: warm, precise, French-inflected ("Bonjour"), craft-obsessed; numbers and roles do the bragging.

## 2. Structure and components
- Routes: Work (/), About, Playground, external Lab link with an arrow glyph [verified IA].
- Preloader: percentage counter advancing in randomised 5–23 point jumps every 100 ms, then a "click to enter & enable sound" gate; emits a reveal-complete event [recalled from clone, medium].
- Nav: minimal horizontal list + an equaliser-bar sound toggle; mobile = fullscreen overlay teleported to body with numbered links (01, 02, 03), closes on Escape and route change [recalled medium].
- Custom cursor: inner dot (lerp .75) + outer ring (lerp .22); on interactive hover ring scales 1.35× while the dot shrinks to 0.7×, ring opacity .35 → .8, a dashed orbit animation speeds up; contextual pill badges with SVG icons (drag / play / view / feed / copy) alternating two accent colours; fully suppressed on `(hover: none), (pointer: coarse)` [recalled medium].
- Draggable project carousel with lazy WebP; archive rows whose hover spawns an image preview chasing the cursor (lerp .25); footer in the green theme [recalled medium].
- Easter egg: a "Feed Bee" hint spawns 3D fruit into the scene with one of two SFX [recalled medium].

## 3. Visual language
Light-dominant with themed inversions: default white/forest, dark forest/off-white, yellow/forest, forest/cream — swapped per section so scrolling reads like turning printed pages. Hybrid imagery: a real WebGL scene (`.glb`, Draco), cloud sprites drifting at low opacity, WebP stills, a reel. A shader gradient backdrop blends cream into dark teal with three-point lighting (warm key, cool fill) [recalled from clone, medium]. Type: neo-grotesque body against a wide geometric display face; small technical labels as texture.

## 4. Motion and effects (with parameters)
- Easings: expo-out `cubic-bezier(.16,1,.3,1)` and expo-in-out `cubic-bezier(.87,0,.13,1)`; the same expo-out drives both page motion and the cursor so pointer and page share one feel [recalled medium].
- Signature: a 128 × 128 ping-pong velocity FBO fluid simulation (pointer delta × 10 splatted, radius .0015 at rest → .002 moving, dissipation .96; advection only, no pressure solve) feeding one full-frame post-process: UV distortion strength .0035, velocity scale 1.5, chromatic aberration sampling R and B at ±velocity × .001 — the whole page ripples and fringes in the cursor's wake [recalled from clone, medium-high].
- Scroll-scrubbed 3D: `model.rotation.y = scrollY × 0.00015`; clouds drift on `sin(time × 0.15 + i) × 0.002` [recalled medium].
- Page transitions with a dedicated audio cue; opt-in ambient loop at volume .375 and SFX at .35 through plain `HTMLAudioElement`s [recalled medium].

## 5. Tech and pipeline
Three.js (~0.174), GSAP 3.12+, Lenis 1.1, `vite-plugin-glsl`, Draco decoders in `public/`, self-hosted woff2 [clone, medium]. Assets fetched by a script rather than committed. Real framework [unknown]; Vue is plausible but unconfirmed.

## 6. Weaknesses
No `prefers-reduced-motion` handling found [recalled medium]; the whole experience sits behind a click-to-enter gate (usability cost the jury weights at 30 %). The awards skills keep the sound-consent gesture but never gate content on it, ship a reduced tier for the fluid pass (static frame), and keep the cursor and hover previews keyboard-reachable.

## 7. Principles
1. One global, physically simulated interaction layer beats a dozen isolated hover tricks.
2. Two lerp rates on one pointer create mass; the cursor becomes the affordance system.
3. Theme swaps per section are narrative rhythm, not dark mode.
4. Credibility travels as structured metadata (team size, studio, year, award count), not adjectives.
5. A purposeless easter egg signals confidence.

## 8. Take / Don't take
- **Take:** the velocity-field post-process as an architecture (low-res FBO → one full-screen pass); the two-speed contextual cursor gated on `pointer: fine`; the non-linear preloader tied to a real load signal; named theme tokens swapped per section; the hover-preview archive list; the metadata quartet; a two-state hero headline; expo-out as the house curve `[recipe:cursor-two-speed]` `[recipe:gl-fluid-wake-post]` `[recipe:preloader-counter-hold]` `[recipe:hover-preview-list]` `[recipe:theme-swap-tokens]`.
- **Don't take:** the forest/yellow/cream palette, the "French / Interactive / Designer" hero device, the studio 3D scene, the "Feed Bee" gag, the section order, the click-to-enter gate as a content wall.

## 9. Confidence and sources
Awards high (date) · credits high (one flagged conflict) · type high · palette medium (clone) · components/motion medium-high (clone corroborated by descriptions) · stack medium · a11y medium.
Sources: awwwards.com/sites/leo-parpeix-portfolio-2026; awwwards.com/leoparpeix/submissions; github.com/CW-Ankit/leoparpeix-clone (package.json, variables.css, FluidSimulation.ts, PostProcessing.ts, LoaderBlock/NavbarComponent/CursorIndication); lapa.ninja/post/leo-parpeix; landing.love/sites/leoparpeix; orpetron.com/sites/leo-parpeix-portfolio; thomalecornu.fr; research transcript batch-A.
