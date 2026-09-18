# USAvionix — https://www.usavionix.com/

> Identity: USAvionix designs jet-powered AI drones for ISR and defence (Delta VTOL drone ≈ 500 km/h, 300–500 km range; Phalanx AI mission coordination). It is **not** uAvionix Corporation (uavionix.com, ADS-B avionics). [verified]

| Field | Value |
|---|---|
| Class | B2B / defence-tech product and capability site |
| Visitor mode | persuade |
| Awards | Awwwards Honorable Mention 10–11 Aug 2026 → SOTD 9–10 Sep 2026 + Developer Award [verified, ±1 day]; score 7.41 [verified]; colour tag #000 + #fff; tech tags 3D, WebGL, Next.js [verified]; also on landing.love and UI UX Showcase |
| Studio / credits | basement.studio (bsmnt) [verified, studio announcement]; individuals [unknown] |
| Stack (evidence level) | Next.js + WebGL [verified tags]; GSAP, `@bsmnt/scrollytelling`, `next-real-viewport`, React Three Fiber or Three.js [inferred from the studio's published house stack, medium]; CMS/hosting/fonts [unknown] |
| Palette | pure black #000000 + white #FFFFFF, no accent [verified] — dark for diegetic reasons (night vision, cockpit) |
| Type | [unknown]; "crisp white type"; a mono or technical grotesque for readouts is [inferred] |
| WebGL dosage | canvas-first: aircraft and telemetry overlays in WebGL over dramatic photography |
| Scroll model | native with "layered scroll animation" (depth compositing); library [inferred] |
| Narrative model | specification with role-casting: boot sequence → capability claim → scenario triptych → platform pages |

## 1. Concept and narrative
The visitor is cast as an operator, not an audience. The site opens with a cinematic system boot: thermal, lidar and IR readouts flicker on before any hero image. That framing carries into three mission scenarios (wildfire, border, infrastructure), each pairing dramatic photography with a tight problem → solution beat, then product pages [verified descriptions]. Copy is clipped and capability-forward: verb-chain sentences that compress a mission timeline into one breath (detect → suppress → secure → keep open → contain) and "agent" framing that positions hardware as an autonomous actor [verified fragments].

## 2. Structure and components
- Diegetic boot-sequence preloader (readouts as timed reveal choreography) [verified].
- Scenario triptych: exactly three concrete use cases, image + problem beat + solution beat [verified].
- Product pages (`/phalanx`, Delta) with capability breakdowns and spec beats (speed, range) [verified routes].
- Layered scroll animation throughout [verified descriptor]. Cursor, menu, footer specifics [unknown].

## 3. Visual language
Zero-accent monochrome: black canvas, white type, colour only from photography and emissive HUD elements. Instrument-panel texture — readouts, reticles, coordinate labels — as an actual layer, not decoration. A disciplined grid with dense spec blocks against large negative space [verified descriptors, layout inferred].

## 4. Motion and effects (with parameters)
Layered parallax compositing (foreground / subject / background / HUD at different rates) rather than per-element fade-ups [verified descriptor]; WebGL aircraft and telemetry [verified tags]; boot choreography timing [unknown]. Studio references worth mining: `basementstudio/scrollytelling` (React + GSAP ScrollTrigger abstraction with `Root`, `Animation`, `Waypoint`, `Parallax`, `ImageSequenceCanvas`), `next-typescript`, `next-real-viewport`, `shader-lab` [verified repos].

## 5. Tech and pipeline
Next.js confirmed; the studio's documented default is Next + GSAP with its own scroll library and a viewport-fix library, TypeScript, Vercel [inferred medium]. Developer Award implies strong responsive/markup/WPO scores [inferred].

## 6. Weaknesses
A boot-sequence intro is a classic reduced-motion hazard; nothing documented about skip paths or keyboard access [unknown]. The awards skills keep the diegetic preloader tied to a real load signal, cap it at ≈ 2.5 s on repeat visits, add an `aria-live` status and a static reduced-motion variant, and never gate content behind it.

## 7. Principles
1. The preloader can carry the concept: make loading an artefact from the product's own world.
2. Address the visitor as the operator; build the first viewport as their console.
3. Total chromatic restraint reads as instrument-grade seriousness.
4. Three concrete scenarios beat one abstract capability claim.
5. Verb-chain sentences and "agent" framing turn specs into narrative.
6. Layered scroll compositing sustains a cinematic feel without gimmicks.

## 8. Take / Don't take
- **Take:** the diegetic preloader pattern (boot / scan / calibration) `[recipe:preloader-counter-hold]`; role-casting heroes; the scenario triptych structure; telemetry/HUD as a persistent design layer; verb-chain capability copy; the constraint-removal and "agent" framings; a house starter + scroll abstraction + viewport-fix baseline at studio level `[pattern:copy-and-content]` `[pattern:hero-archetypes]`.
- **Don't take:** the pure #000/#fff pairing by default (it is diegetic here), the wildfire/border/infrastructure triptych content, the thermal/lidar/IR readouts, the Delta/Phalanx copy.

## 9. Confidence and sources
Identity correction high · awards high (dates ±1) · credits high (studio) · narrative/copy high · palette high · type low · stack medium (Next + WebGL high, libraries inferred) · a11y low.
Sources: awwwards.com/sites/usavionix; awwwards.com/basementstudio; landing.love/sites/usavionix; uiuxshowcase.com/resources/usavionix; usavionix.com and /phalanx; basement.studio (incl. "GSAP & Next.js setup the BSMNT way"); github.com/basementstudio (scrollytelling, next-typescript, next-real-viewport, shader-lab); uavionix.com (distinct company); research transcript batch-A.
