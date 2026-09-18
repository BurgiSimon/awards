# gl-msdf-text

A headline drawn in WebGL from a distance-field atlas, with the same string left in the DOM as the heading it claims to be. Recipes ship no font files, so the atlas is built in the page: the browser rasterises each glyph of *this* string from the system stack, a Felzenszwalb distance transform measures every pixel, and the shader does what an MSDF shader does — `median(r, g, b)`, `fwidth`, one texture that stays crisp at any scale.

## What this is, and is not
Single-channel signed distance copied into three channels. That is **not** true MSDF: with one channel a sharp corner is the intersection of two edges the field cannot separate, so spurs and tight joins round off — visible on a serif at display size, invisible on a grotesque. The trade is honest and deliberate: no font file, no build step, no atlas checked into the repo.

**Swapping in a real atlas** changes the loader and nothing else. Generate with `msdf-bmfont-xml`, load the page as a texture and the JSON as the layout, and replace `buildAtlas()`: the same `median()` shader reads three genuine channels, corners come back, and the per-glyph cell lookup becomes a `chars[]` entry with `xoffset` / `yoffset` / `xadvance`.

## Why
- **Type in the scene is a corpus technique, verified twice.** Igloo renders every glyph from an MSDF atlas — IBM Plex Mono Medium as a KTX2 data texture plus a JSON layout, decoded in a dedicated worker `[site:igloo]` `[verified]`. Lando Norris ships MSDF atlases for both faces (`Brier-Bold-msdf.json`, `MonaSans-Bold-msdf.json`) and sets 3D headlines with `three-msdf-text-utils` 1.5.0 `[site:lando-norris]` `[verified]`.
- **Neither of them mirrors it.** Igloo's DOM is empty of the text and its Accessibility, Semantics and Markup scores are its lowest `[site:igloo]` `[verified]`; whether Lando mirrors its MSDF headlines is `[unknown]` — its scene text comes from JS string params `[verified]`. The mirror here is the divergence, not the decoration (`[pattern:typography#type-as-webgl-material]`).
- **The mirror decides the layout.** The `<h1>` is in flow at its real size; the canvas is absolutely positioned over it and `aria-hidden`; the GL line is laid out from the heading's own computed font and rect. When WebGL is gone the ink simply comes back — no reflow, because the text never left.
- **Tiers.** Static tier or no WebGL context: DOM text on the first frame, no renderer built. Reduced: the headline is drawn settled, subscribed to no clock. Full: a 1.4 s staggered rise, then the ticker unsubscribes — nothing animates a headline forever.

## Parameters
Atlas: em box `64 px`, padding `12 px`, spread `12 px`, cells laid out on a `ceil(√n)` grid of the glyphs this string uses. Shader: `median(r,g,b) - 0.5`, `clamp(d / max(fwidth(d), 1e-5) + 0.5)`, `discard` below `0.01`, `#include <colorspace_fragment>`. The floor on the divisor is not decoration: the field is flat wherever it has saturated, which is most of a padded atlas, and `d / 0.0` renders the whole quad opaque under SwiftShader. Reveal: `1.4 s`, per-glyph delay `i/n × 0.6`, ramp `0.35`, rise `18 px` (full tier only). DPR from `_shared/quality-tiers.js`.

## Adapters
- **OGL:** same atlas and fragment shader; `Geometry` with `position` / `uv` / `aDelay` attributes and an orthographic camera in pixel units.
- **Multi-line:** the layout loop advances a pen — add a word wrapper and a line height before it, or hand the string to `three-msdf-text-utils` and keep this shader.
- **Worker:** the distance transform is pure arithmetic over a `Float64Array`; move `buildAtlas` into a worker and post the `Uint8Array` back, as Igloo does for its MSDF decode `[site:igloo]` `[verified]`.
