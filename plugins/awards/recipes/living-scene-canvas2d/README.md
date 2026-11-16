# living-scene-canvas2d

The page ends on something alive: a small scene drawn on one 2D canvas above the footer links. It moves a little on its own, it answers the pointer, and a click leaves something behind. One harness runs three interchangeable scenes: a star chart whose stars join into constellations, a lawn the pointer parts and a click plants, and a koi pond whose fish come over to look.

The plugin's own proposal, first built as the footer of a benchmark report; no corpus card. Demo content is synthetic: every star, blade and fish is drawn procedurally, in the page's tokens.

## Why
- **A reward for reaching the end, sized like a footer.** The scene is a strip of 112–150 px, not a set-piece. It costs one canvas and no library, so a text-heavy page (a report, documentation, a long read) can afford it where a WebGL close `[recipe:gl-swarm-light-field]` cannot.
- **Three verbs, the same in every scene.** It idles (twinkle, breeze, wandering), it answers the pointer (join, lean, approach), and a click leaves one thing (a held constellation, a flower, a pellet). A scene that only loops is wallpaper; one that needs instructions is a game. The cue beside the links names the click in three words.
- **Seeded, never random.** Stars come from one seeded generator, blades and flowers from a hash of their index, fish from fixed starts. The scene is the same after a reload and after a resize, so it reads as part of the design, and only the visitor changes it.
- **The harness owns the plumbing, the scene owns the idea.** Sizing, the clock, input and the still path are written once in `main.js`; a scene is a factory returning `resize`, `frame`, `point`, `click`, `spot` and `state`. A fourth scene is one more module.
- **What it refuses.** No loop off screen, no pointer capture on touch (`touch-action: pan-y`, and `click` rather than `pointerdown`, so a scroll that starts on the scene plants nothing), no information in the canvas. It is the wrong move on a page whose footer has to work hard (a shop's service links, legal columns): put it above that footer, or leave it out.

## Parameters

**Harness.** Backing store `min(dpr, 2)` × the box, resized by a `ResizeObserver` · loop on the shared ticker only while an `IntersectionObserver` reports the scene on screen and the tier is full · `pointermove` from mouse and pen only · paints read from the page's tokens through a probe element (`--ink`, `--muted`, `--line`, `--ground`, and three scene paints mixed from `--accent`).

| Scene | Seed | Pointer | Click |
|---|---|---|---|
| Star chart, `150 px` | One star per jittered `30 px` cell, a quarter left empty, 7 % tinted; magnitude `r³` gives radius `0.7–2.5 px`; twinkle period `3–9 s`; a graticule of three arcs and a fan of meridians around a pole `2.5 ×` the width above the band | The `5` nearest stars within `100 px` joined as a minimum spanning tree; each line eases over `0.2 s` | Holds that constellation `5 s`, fades it over `2 s` (at most 4 held); a shooting star travels `min(360 px, 50 %)` in `900 ms`, cubic out |
| Lawn, `112 px` | A blade every `3 px`, `10–34 px` tall in three depths, taller and shorter patches from two sines; breeze `0.07 rad` ripple plus `0.16 rad` gusts travelling left to right | Blades within `90 px` lean up to `0.55 rad` away, plus `0.4 ×` the pointer's speed in px/ms; spring `0.012`, damping `0.1` per 60 Hz frame | Plants a flower that grows in `1.1 s` (stem for the first 70 %, six petals from 60 %); three from the start, at most `24`, the oldest fades in `600 ms` |
| Koi pond, `150 px` | Three fish on a 10-point spine, spacing `5.4 px`, cruising `24 ± 6 px/s` on a turning circle of `26 px`; they sidestep each other inside `70 px` and steer for the middle line when a probe `40 px` ahead leaves the safe box | Inside `170 px` a slow pointer draws them over to loiter at `34–48 px`; one moving faster than `0.9 px/ms` scatters fish within `90 px` for `0.7 s` | Drops a pellet with three ripple rings; the nearest fish races to it at `2.2–5.5 ×` cruising speed and turns on the spot inside `45 px`; at most `6` pellets |

Every length in the lawn scales with the band's height against 112 px; every length in the pond scales with `clamp(width / 900, 0.72, 1)`.

## Motion tiers
- **full**: the loop runs while the scene is on screen.
- **reduced / static**: no loop. One settled frame is drawn (the pond steps twenty frames into natural poses first), and each input redraws once: a constellation appears whole and lets go on a single later redraw, a flower is planted fully grown, the grass does not lean. The koi stay where they are and the status line says why, so a press is never silent.

## Accessibility
The canvas is `aria-hidden` decoration; the footer's links and everything else are DOM around it. The invitation is a real `<button>` (44 px target, visible focus ring) that performs the scene's click at a spot the scene names, so the keyboard reaches the same thing the pointer does, and a polite status region confirms each press. Nothing in the page depends on the scene.

## As a hero
The same contract fills a first screen: the canvas is `position: absolute; inset: 0` under a real `<h1>`, the heading takes `pointer-events: none` only where the scene must stay reachable beneath it, and small copy sits on a ground-coloured block so its contrast never depends on the drawing. Scale counts with the area instead of stretching the strip (a planisphere that turns, rows of grass for depth, six fish with shadows and lily pads), keep what a click leaves for the whole visit instead of a few seconds, and cap the backing store with `[recipe:quality-tiers]`: a full-viewport canvas at DPR 2 is the cost, not the drawing.

## Adapters
- **React / Next**: mount the harness in an effect with the canvas in a ref; return a cleanup that leaves the ticker and disconnects both observers. Keep the scene's arrays out of state.
- **Vue / Nuxt, Svelte**: the same shape in `onMounted` / `onMount`, with the cleanup in `onUnmounted` / `onDestroy`.
- **GSAP pages**: drive `tick` from `gsap.ticker.add` (its `deltaTime` is in ms, so divide by 1000) and remove it when the scene leaves the screen.
- **Themes**: read the paints again when the theme changes and call `resize`; the scene redraws in the new tokens.

Related: `[recipe:designed-footer]` is the footer this sits in; `[recipe:sprite-rain-canvas2d]` is the other canvas-2D toy at the close; `[recipe:svg-noise-line-field]` is the same pointer spring on SVG lines.
