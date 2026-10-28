# Recipe proposals — wave 6a, Son Daven's video weave (2026-10-28)

The maintainer asked for a deep read of Son Daven with the awards skills and for new recipes, naming the video "ASCII" effect that runs across the site and closes it in the footer. The effect is a halftone weave rather than a glyph ramp: one vertical bar per cell, as wide as the cell is dark, over clips graded on black. The recipes build the weave as Son Daven ships it and add the glyph ramp the request names as a mode.

Candidates come from `### Techniques and stacks` under `## Wave 6a` in `docs/handoff/corpus-ledger.md` and from the card's `### Tech lens: WebGL`. A candidate is listed only when no title or tag in `recipes/*/recipe.json` covers it. Each generalises the technique; none copies the site's palette, clips, grids, levels or copy. All three build under the recipe contract: headless SwiftShader, system fonts, footage drawn in code (streamed into `<video>` through `captureStream`), and the pinned `gsap@3.15.0` or no dependency.

The selection gate was answered in advance by the request; all three were built.

## 1. `gl-video-dither-layers` — Keyed footage woven into the close: bars or ASCII glyphs (footer)
- Seen in: son-daven
- Tier: P1 · Deps: gsap@3.15.0
- Overlap:
  - `gl-dispersion-stripes` and `gl-ping-pong-grain-field` are procedural fields, not footage.
  - `video-clip-wipe-panels` cuts between clips; it does not treat them.
  - This recipe composites several clips graded on black as keyed layers on one raw-WebGL canvas, one quad per layer sized to the layer, and weaves each cell into a bar (or a glyph from a ramp sorted by measured ink) in the section's own tokens. Layer settings are the GSAP tween targets; footage arrives as `<video>` and uploads once per decoded frame.
- Differs from the site: quads sized to each layer instead of a full-canvas quad per layer; a five-point key inside the cell (or the centre alone for thin strokes) instead of a 25-read texel ring; box-filtered bar edges; a 30 fps cap and render-on-change; a minimum cell size in CSS px, so phones coarsen; colours re-read on a theme change; a pause control; a reduced-motion still; nothing allocated until the close is near.
- Verify:
  - Each cell's ink share follows the tone the levels give the clip at its centre (r > .85 over 680 cells).
  - Every all-black cell is transparent.
  - Bars are uniform down their cell; glyph cells are not, and use a coarser grid.
  - Footage arrives as `<video>` frames and uploads once per frame.
  - The levels develop part-way at a mid scroll; pausing stops rendering.
  - Reduced motion draws one still and stops.
- Lens: webgl

## 2. `gl-dither-scene-pool` — One dither compositor for every picture on the page (whole page)
- Seen in: son-daven
- Tier: P1 · Deps: gsap@3.15.0
- Overlap:
  - `gl-one-context-many-canvases` shares one three.js renderer between item canvases; this recipe applies the same slice-and-copy to footage, with pooled clips.
  - `gl-dom-tethered-planes` and the fixed-canvas models trail native touch scroll; in-flow 2D canvases do not.
- What it adds: five scenes on one detached context; each draws into the top-left slice of a buffer that only grows and is copied into its own canvas in the same task; four clips pooled (one texture each, uploaded at most once per new frame); clips play only while a visible scene shows them; scenes redraw only on screen and on change; normal levels on light sections, inverted on dark; seasons swapped by levels.
- Verify:
  - One context (measured).
  - Off-screen scenes do not draw while the visible one plays.
  - No clip uploads more often than it has frames.
  - The season button changes the picture in at least 4 of 18 regions.
  - The glyph interlude carries ink.
  - Reduced motion draws one still per scene.
- Lens: webgl

## 3. `dither-cell-transition` — One woven curtain for the arrival and every route (arrival and chrome)
- Seen in: son-daven
- Tier: P1 · Deps: gsap@3.15.0
- Overlap:
  - `page-transitions` is a taxi wipe and its renderer lifecycle.
  - `preloader-counter-hold` is a counter.
  - The corpus's cell wipes (`runrobrun`) switch cells on; none scales them as bars or shares one curtain between arrival and routes.
- What it adds: a grid rebuilt to the viewport; cells scaling on X from hairlines to bars, swept from the far corner; shut from first paint; an arrival gate that races real loads against a ceiling after a minimum hold, with a short repeat path; routes that swap only behind a fully shut curtain, restore scroll on back and forward only, focus the new `h1`, set the title and announce the page.
- Verify:
  - The arrival waits for its loads but not past 4 s when one never answers.
  - The curtain is fully shut at the swap.
  - Focus, title and the top of the page follow a route; back restores the scroll.
  - The repeat visit is short; reduced motion fades; the phone grid is about 5 × 11.
- Lens: none (DOM), the transition the GL weave needs

## Built after the wave
Left unbuilt by the wave and built the same day, at the maintainer's request. `VideoEncoder` works under headless Chromium (H.264 baseline, VP9 and VP8 all encode and decode there), so the demo encodes its own drawn film on load.

- `webcodecs-frame-scrub`:
  - Frame-accurate scrubbing of one encoded clip with WebCodecs: chunks and a JSON manifest in one binary with an offset footer, a keyframe seek then deltas, a sequential fast path, `VideoFrame` closed after drawing. Son Daven ships the decoder (`ActiveFrame.js`) without using it, and scrubs 120 WebP frames instead.
  - Built as proposed, with three changes from ActiveFrame: requests made during a seek wait and only the newest runs (ActiveFrame resets and reconfigures the decoder when a non-sequential seek arrives while chunks are still queued), a target ahead in the same group continues from the decoder instead of the keyframe, and frames passed on the way are cached as bitmaps for scrubbing back. H.264 baseline first, VP9 and VP8 as fallbacks.
  - Verified: a jump decodes from its keyframe and no further, a step forward is one decode, a step back through the group is a cache hit, a burst of 119 requests costs 11 decodes, the frame on screen is read off an edge code, and no `VideoFrame` is left open.
