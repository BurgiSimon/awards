# gl-built-studio-environment

A reflective object needs something to reflect. Instead of downloading an HDR file, this recipe builds the studio in code and bakes it once into a PMREM environment map: either a room of emissive panels (`PMREMGenerator.fromScene`) or a gradient with light bands painted on a canvas (`fromEquirectangular`). The scene has no lights at all. A chrome `MeshPhysicalMaterial` (metalness 1, roughness .1) and a clearcoat one (clearcoat 1, coat roughness .04 over a rough base) take every highlight from that map.

Demo content is synthetic: a generated torus knot and sphere, and copy written for the recipe. Nothing is downloaded: no model, texture, HDR or font.

## Why
- **Highlights are placed, not found.** A stock HDR puts its windows wherever its photographer stood. Panels put a broad softbox on top, a warm key strip at the left, a cool rim behind and two thin hot strips that make glints, so the reflection draws the shape the composition wants `[site:ascension-pegassi]` `[pattern:webgl-3d-scenes#lighting-rigs]`.
- **Zero bytes.** The bake costs one cube render and a PMREM pass at load (tens of milliseconds) and no request `[site:a24-raviklaassens]` `[site:cutobot-byholm]`.
- **Values above 1 are the trick.** The `fromScene` target is half-float, so a strip at 8 stays a hard highlight after the rough mips are blurred. The painted canvas is 8-bit and tops out at 1, so the painted variant raises `scene.environmentIntensity` (2.2) instead.
- **Black matters as much as white.** A near-black floor flag and dark walls between panels give chrome its contrast; a uniformly bright room makes chrome look grey.
- **Matte subjects too.** The same bake with a small `sigma` (.02–.04) is a soft fill for organic, rough materials `[site:eugeniagrab]`.

## Parameters
Panels `[w, h, position, value, tint]` in `PANELS` (softbox 2.4, key 6, rim 4.5, sparkles 8–9, fill .5, floor .015) · walls `rgb(.05, .052, .06)` · bake `fromScene(scene, sigma .02, near .1, far 50, { size })`, size 512 on the high quality tier and 256 otherwise · painted canvas 1024 × 512, environment intensity 2.2 · ACES filmic, exposure 1 · chrome roughness .1, clearcoat .25 · sphere base roughness .5, clearcoat 1, coat roughness .04 (the base colour is the theme's `--accent`).

Each variant is baked on first use and kept; every `PMREMGenerator` and the temporary panel scene or canvas texture are disposed right after their bake. On `pagehide` the baked targets, geometry, materials and renderer go too.

## Motion and accessibility
- **Full:** the knot turns slowly so reflections slide across it; renders only while the frame is on screen.
- **Reduced and static:** lighting is not motion, so the scene still renders lit, held at a fixed angle and redrawn only when the variant changes.
- **No WebGL:** the frame keeps a CSS studio-sweep still; the copy and buttons stand alone. The canvas is `aria-hidden`; the figure caption names what it shows. The variant switch is two `aria-pressed` buttons.

## Verify
`lit` reads the chrome knot's covered pixels (from its projected bounding box, alpha 1 only) and asserts luminance standard deviation above .08 and a highlight above .85. `noEnv` sets `scene.environment = null` through `window.__studio.setEnv(false)` and asserts the mean falls by at least half (it falls to 0: there are no lamps). `painted` switches variants and asserts the same lit test. `rm` (reduced motion) must be lit and still; `mobile` lit. If the bake fails or is not assigned, every lit state renders black and fails.

## Adapters
- **R3F:** `<Environment resolution={256}>` with `<Lightformer form="rect" intensity={6} … />` children is this panel room; `frames={1}` bakes it once.
- **Bigger scenes:** pass `options.position` to `fromScene` to bake from the hero object's position rather than the origin.
- **Rotating the light, not the object:** `scene.environmentRotation` turns the map without a rebake.

Seen in: `[site:ascension-pegassi]`, `[site:a24-raviklaassens]`, `[site:eugeniagrab]`, `[site:cutobot-byholm]`.
