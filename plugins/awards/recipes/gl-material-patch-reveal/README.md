# gl-material-patch-reveal

One scene, one stock `MeshStandardMaterial`, patched through `onBeforeCompile`. A luma mix after `<map_fragment>` turns the map grey or (saturation-boosted) colour. A grained circular `discard` after `<clipping_planes_fragment>` splits the surface between two layers that share one geometry: the grey layer keeps the outside of the circle, the colour layer the inside. The circle's centre and starting radius come from a DOM element's rect (the dial in the corner), read every frame, and its radius is scrubbed by ScrollTrigger from that rect to the farthest canvas corner. The rippled cloth, its hue-band pattern and all copy are synthetic demo content, generated in code; nothing is downloaded.

## Why
- **Patch, don't replace.** Keeping the stock material keeps its lighting, tone mapping, fog and colour management; the patch adds only two chunks (`[pattern:webgl-3d-scenes#materials]`). Each replacement throws if its include is missing, so a three upgrade fails loudly instead of rendering silently grey.
- **The DOM owns the origin.** The circle grows from a real element, so layout, responsiveness and the visible progress readout stay in HTML (`[pattern:webgl-architecture#html-lays-out-webgl-renders]`). The anchor is measured each frame; nothing is cached across a resize.
- **Two layers, exact complements.** Both layers test the same per-pixel hash (`k < grain(gl_FragCoord)`) with opposite outcomes, so no pixel is drawn twice or left empty, and the dithered edge needs no transparency or sorting.
- **Uniforms as parameters.** Circle centre, radius and softness are shared `{ value }` objects; each layer owns only `uColor` and `uSide` (`[pattern:webgl-architecture#effect-parameters]`).
- **Scrub with no ease.** The tween on the `{ p }` proxy uses `ease: 'none'` (`[pattern:gsap-choreography#scrolltrigger-configurations]`); the radius curve `r0 + (rMax − r0) · p²` is applied when rendering, so the circle starts slowly at the dial.

## Parameters
Scene `300svh`, `top top` → `bottom bottom`, `scrub: true` · radius from the anchor's half-width to the farthest canvas corner `+ 2 px`, curve `p²` · edge softness `clamp(3 % of min(w, h), 10, 32) px` × DPR · colour layer `uSat 1.35`, `uGain 1` · roughness `.62` · variant `?wobble`: two-sine normal wobble at `<normal_fragment_begin>`, amount `.035`.

## Motion tiers
- **Full:** the circle opens from the dial; the cloth sways slightly; the wobble variant moves with time.
- **Reduced:** no circle and no sway; the whole surface mixes from grey to colour with the scroll (colour only, no spreading shape).
- **Static** (`data-motion="static"`): settled colour, nothing tied to the scroll.
- **No WebGL:** a CSS grey gradient stage; the copy and the dial still read.

## Accessibility
The canvas is `aria-hidden`; the scene has a heading and the dial is `role="img"` with a label. Copy is DOM text. Lenis smooths the wheel only; keyboard scrolling is native.

## Adapters
- **React / R3F:** set `onBeforeCompile` on `<meshStandardMaterial>` once (memoise it), keep the shared uniforms in a ref and write them in `useFrame`; give the material a `customProgramCacheKey` if two patched materials differ in source.
- **Physical material:** the same three chunks exist in `MeshPhysicalMaterial`; the wobble reads well on a low-roughness chrome.
- **Section hand-off:** swap the grey layer for the outgoing object and the colour layer for the incoming one; the mask is unchanged.

Seen in: `[site:eugeniagrab]`, `[site:ascension-pegassi]`, `[site:agrumeafarm]`.
