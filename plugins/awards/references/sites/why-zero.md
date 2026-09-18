# Why Zero — https://why.zero.university/

| Field | Value |
|---|---|
| Class | campaign / manifesto microsite (AI-native alternative to university; waitlist) |
| Visitor mode | persuade (experience-led) |
| Awards | Awwwards SOTD + Developer Award [verified; date unresolved: 21 Jul vs 7–8 Sep 2026]; CSSDA Website of the Day 11 Aug 2026, score 8.99 [verified]; FWA of the Month Jul 2026 [verified]; "20+ awards" per the team [recalled] |
| Studio / credits | Concept and design direction Atul Khola with Zero's in-house 12-person Design & Experience team; development BUNQ LABS; Sindhur Dutta credited on FWA/CSSDA [verified] |
| Stack (evidence level) | Vanilla Three.js + GSAP timelines (explicitly no ScrollTrigger) + custom GLSL + Vite + Howler + Blender; DRACO + KTX2/ETC1S + atlases [verified via the Codrops engineering case study]; framework/CMS/hosting [unknown] |
| Palette | white #FFFFFF + electric green #01C654 — two colours [verified] |
| Type | served via the Google Fonts API, family [unknown] [verified/unknown]; a "hexagonal text blur" shader renders type through WebGL at key moments [verified] |
| WebGL dosage | 100 % canvas (fullscreen camera path; no page grid) |
| Scroll model | virtual float: wheel/touch update a target that eases; no native scroll, no oversized DOM [verified] |
| Narrative model | manifesto with gates: promise → shatter → devalue → tunnel → alternative → enlist |

## 1. Concept and narrative
You sign the manifesto before you read it: the entry asks you to draw a zero, and when the stroke closes, frost spreads from it to reveal the experience. Six scrolling stages are joined by five interactive gates that pause or redirect the flow (draw, hold to shatter, hold to launch). Stage one states the traditional promise; gate one shatters it, with real unemployment statistics scattered across the glass; the diploma is devalued (cash burns, certificates shred); the scene funnels into a tunnel whose cross-section is extruded from the ZERO logotype; later stages present the alternative and end at a city map with game-style controls; the waitlist form is presented as an origami fold. A persistent XP counter accumulates as you descend [verified, Codrops]. Tone: defiant, gamified; the argument is delivered as physics.

## 2. Structure and components
Participatory preloader (gesture capture → frost dissolve) · five hold-to-proceed gates · XP counter HUD · custom cursor · interactive city map · origami waitlist form · custom 404 · interactive header [verified tags]. No conventional sections; the layout is a camera path.

## 3. Visual language
High-key white ground with one signal green; frost, glass, paper and currency as materials; CGI modelled in Blender, plus illustration and some AI-generated content [verified tags]. Two colours keep a CGI-heavy site from reading as a render demo.

## 4. Motion and effects (with parameters)
- Virtual scroll: wheel and touch input update a target value that eases toward it; everything derives from one normalised progress float, which is what makes gating, holding and redirecting possible [verified].
- Five named GLSL effects: frost unlock, burning money, certificate shredding, tunnel pulse, hexagonal text blur [verified].
- Adaptive quality manager steps pixel ratio, blur sample count and geometry detail down from real-time frame timing to hold 60 fps on budget Android [verified].
- Audio via Howler [verified]; consent handling [unknown].

## 5. Tech and pipeline
Four-month build. Asset pipeline: DRACO geometry, KTX2/ETC1S textures, texture atlases — over 1 GB of sources shipped as under 10 MB [verified]. Vite build, vanilla Three.js, GSAP for timelines only [verified].

## 6. Weaknesses
Gesture gates, hold-to-proceed and game controls are hostile to keyboard and assistive tech; no reduced-motion path or skip route documented [inferred high]. The awards skills keep gated progression only with a keyboard equivalent (Enter/Space to hold, arrows for the map), a skip-to-content path and a reduced tier that cuts between stages instead of animating them.

## 7. Principles
1. Enact the thesis physically (shatter, burn, shred) rather than stating it.
2. A participatory preloader converts loading into commitment.
3. Progression that unlocks borrows the one thing games have over marketing pages.
4. Brand geometry can become environment (the logotype as a tunnel).
5. Owning the scroll is what makes non-linear narrative possible.
6. Asset budget is craft: single-digit megabytes for a full 3D narrative.

## 8. Take / Don't take
- **Take:** the virtual-scroll float as a single source of truth; N stages joined by N−1 gates each requiring a small physical commitment; a game HUD (progress/XP) as felt achievement; reframing the form as an object; the adaptive quality manager (DPR → blur samples → LOD from frame time); DRACO + KTX2 + atlases as the default pipeline; two-colour 3D `[recipe:gl-virtual-scroll-camera]` `[recipe:quality-tiers]`.
- **Don't take:** the draw-a-zero gesture, the shattered-diploma metaphor, the ZERO tunnel, the XP counter as-is, the white + #01C654 pairing, the six-stage script.

## 9. Confidence and sources
Awards high (Awwwards date low) · credits high · narrative high · palette high · type low · motion/stack/perf high · a11y unknown (presumed weak).
Sources: awwwards.com/sites/why-zero; cssdesignawards.com/sites/why-zero/49794; csswinner.com/details/why-zero/19308; thefwa.com/cases/why-zero; orpetron.com/sites/why-zero; tympanus.net/codrops/2026/07/17 "ZERO: The Engineering Behind a Defiant Interactive Narrative" (read via search extraction); bunqlabs.com; atulkhola.com; research transcript batch-A.
