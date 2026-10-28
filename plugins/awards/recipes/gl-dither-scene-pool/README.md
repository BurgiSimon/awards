# gl-dither-scene-pool

The weave from `[recipe:gl-video-dither-layers]` on every picture of a page, from one WebGL context. Five scenes down the page (a hero, two chapters, a glyph interlude and the close) share four pooled clips; each scene is an ordinary canvas in its section, so it scrolls natively and sits under the section's text. A clip three scenes show is one texture, uploaded once per new frame; a scene draws only while it is on screen and only when something it shows changed.

The clips (a ridge, reeds, a flock, snow) are drawn in code and streamed into muted `<video>` elements; no media ships. Each scene takes its colours from its own section's tokens.

## Why
- **Contexts are a budget.** Chromium keeps sixteen live WebGL contexts per page and loses the oldest past that. A site that gives every picture its own canvas and context sits at the edge: `[site:son-daven]` runs fifteen dither canvases on its home page, each with its own context, program and video elements, so a bird clip shown by three scenes is three videos and three uploads [verified, `slater-55210.js` and the live page, 2026-10-28]. One context here, measured (`state.contexts`).
- **Slices, copied in the same task.** The pool renders a scene into the top-left slice of a detached buffer (`viewport(0, H − h, w, h)`) and `drawImage`s that slice into the scene's 2D canvas before the task ends, while the drawing buffer is still valid without `preserveDrawingBuffer`. The buffer only grows, so scenes of different sizes never reallocate it. The pattern is `[recipe:gl-one-context-many-canvases]`'s, applied to footage.
- **In-flow canvases beat a fixed one here.** A single fixed canvas scissored per scene costs no copies, but on a phone it trails native touch scroll by a frame and pictures swim; it also has to sit over the text. A 2D canvas per scene moves with its section on the compositor and stacks like any image (`[pattern:webgl-architecture#canvas-positioning]`).
- **Clips play for the scenes that show them.** A clip's clock and its video run while at least one visible scene uses it; off screen, its decoder rests.
- **Levels are state.** The seasons scene holds both seasons as layers. Switching tweens the outgoing layers to no ink and the incoming ones to their levels over 1.2 s, in the section's ink, instead of cross-fading two pictures; Son Daven slides black and white points to the same end.

## Parameters
| | |
|---|---|
| Scenes | hero (develops 1.6 s after arrival), weather, seasons, interlude (glyphs), close (each develops from its top at the viewport bottom to its centre at 60 %) |
| Levels | normal 20 / 235 on light sections, inverted 225 / 35 on dark ones |
| Grid | as `gl-video-dither-layers`: cells never under 5 CSS px (9 for glyphs); thin subjects (reeds, snow, the flock in glyphs) key on the cell centre only |
| Budget | one context; DPR ≤ 1.5; 30 fps at most; a scene draws only when visible (10 % root margin) and changed |
| Flocks | cross each scene in 8 s with a 2 s rest, offset 1.3 s per scene |

These are this recipe's own values, not a site's.

## Real footage
Each clip is a pool entry, `pool.addClip(name, source)`, where `source` is `{ el: <video>, kind: 'video', version }`: see `[recipe:gl-video-dither-layers]` ("Real footage") for the video element and the per-frame version. Register a clip once and reference it by name from as many scenes as show it.

## Tiers
- **Full:** clips play for the scenes that show them, levels develop with the scroll, flocks loop; a **Pause footage** button in the top bar stops every clip and flock loop at once, and with nothing changing no scene redraws (moving content longer than five seconds needs one, WCAG 2.2.2).
- **Reduced and static:** one still per scene from the canvases at a fixed time, drawn when the scene first comes into view and on resize; no clock, nothing loops, no pause button; the season switch is instant.
- **No WebGL:** no context; each scene keeps a quiet CSS bar texture under its caption, and the pause button stays hidden.

`window.__pool.freeze()` pins the clips for verification, `inkShare(scene)` reads a scene's canvas back (and checks that part-covered pixels carry no ground colour), `setSeason(name, instant)` drives the switch, and `colours(el)` returns a section's tokens as the shader gets them.

## Accessibility
Scene canvases are `aria-hidden` and every scene has a visible caption; the season switch is a pair of `aria-pressed` buttons with 44 px targets. **Pause footage** sits in the top bar, reachable from the first screen; it keeps its label while `aria-pressed` carries the state, as in `[recipe:gl-video-dither-layers]`. All text is DOM.

## Adapters

### Webflow
- Designer: a Div with class `scene` in each section, holding an Embed `<canvas aria-hidden="true">` and a caption text element; mark each with a `data-scene` custom attribute.
- Inject: one page-level `<script type="module">` that creates the pool once and registers every `[data-scene]` it finds; with Barba or another transition library, keep the pool across pages and re-register scenes on enter (dispose only the scene records, never the context).
- Controls: one page-level Button with `data-pause` and `aria-pressed="false"`, `hidden` until the pool runs (needed whenever footage loops past five seconds, WCAG 2.2.2); a scene's own switches (the seasons here) also start `hidden`. A page without them still draws.
- Variables: a section's variable mode sets `--ground` and `--ink`, which the scene reads; hex directly, any other CSS colour (`rgb()`, `hsl()`, `oklch()`, named) through one painted pixel.

Seen in: `[site:son-daven]` (one dither shader across fifteen scene canvases on the home page).
