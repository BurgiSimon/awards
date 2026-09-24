# gl-endless-reel-sheets

A portfolio reel that never ends. The document does not scroll: wheel, touch and keys move a virtual offset, and one canvas draws every work as a segmented sheet on a modulo-wrapped belt, so the first work follows the last. While the belt moves, the sheets twist and fold by a uniform that peaks mid-transit at `sin(π·p)`. At rest they lie flat. A real button list of the works is the index, the keyboard path and the fallback.

**Demo content is synthetic.** The eight works, their disciplines and years are invented, and the card art is drawn at runtime on a 2D canvas (a field colour, a number, a title). No image files ship.

## Why
- **A loop, not a list with an end.** Every sheet sits within half a loop of the offset: `d = mod(i − offset + N/2, N) − N/2`. Past the last work the first arrives from the same side, and the offset keeps counting (8, 9, …), so nothing rewinds. The corpus's endless belt of project sheets `[site:jesperlandberg]` and its looping film strip `[site:siena]` both work this way.
- **Offsets in items, not pixels.** One unit is one card pitch, so a resize or an orientation change never loses the place.
- **A flick is not a stream.** A wheel event of at least 40 px, after a 30 ms gap and at least 500 ms after the previous burst, counts as a burst. It is doubled and released over frames at `1 − (1 − .22)^frames`, capped at four frames per tick. Anything else (a trackpad stream) moves the target directly. Mouse wheels and trackpads then feel equally deliberate `[site:jesperlandberg]`.
- **Snap to a work.** 200 ms after the last input the target rounds to the nearest work. The drawn offset follows by `damp(k = 6)`, and its velocity in items per second drives the bend.
- **The bend is one named uniform.** `uBend = clamp(velocity / 4) · sin(π·p)`, where `p` runs from 0 as a sheet enters the viewport to 1 as it leaves. The vertex shader twists the sheet about the travel axis (up to `0.55` rad at the ends) and folds it along its length (up to `.16` of half its length). At rest the velocity is zero, so the uniform is exactly 0 and the sheets are flat.
- **One camera, pixel units.** A perspective camera placed so that one world unit is one CSS pixel at `z = 0`, as in `[recipe:gl-dom-tethered-planes]`. Landscape screens get a horizontal belt of cards 43.5 % of the viewport tall. Portrait screens get a vertical stack of full-width cards. The same shader swaps axes through `uVertical`.
- **Keep the index beside the reel.** A live "05 / 08 · Title" counter and a button per work make the loop browsable `[site:siena]`, and give it the position and count the reference sites lack.

## Parameters
Wheel `× 1.25` (lines `× 16`) · burst `≥ 40 px`, gap `30 ms`, cooldown `500 ms`, gain `× 2`, release `k = .22` per frame, `≤ 4` frames per tick · follow `damp k = 6` · snap after `200 ms` idle · bend saturates at `4` items / s · twist `0.55 rad`, fold `.16` · touch `× 1.5` · segments `48 × 24 / 32 × 12 / 24 × 8` by quality tier, DPR and pixel budget from `_shared/quality-tiers.js` · card art `1024 × 586` canvas, sRGB.

## Accessibility and motion tiers
- The canvas is `aria-hidden`. The works are an `<ol>` of `<button>`s inside a labelled `<nav>`, with a visible focus ring and `aria-current` on the centred work. Clicking or focusing a button brings its work to the centre by the shortest way round. The counter is a polite live region, updated only when the reel comes to rest.
- Keys: arrows, Page Up / Down and Space (Shift + Space back) step one work. Home and End go to the first and last. Keys are ignored with Ctrl, Alt or Meta held and in text fields. Space on a focused button presses the button.
- **Full:** bursts, easing, snap and bending sheets.
- **Reduced:** WebGL stays, the sheets stay flat, and each input is one snapped step: one step per wheel gesture (350 ms cooldown), per swipe past 40 px, or per key. No easing.
- **Static, or no WebGL:** no renderer is created. The page is an ordinary scrolling page with the list of works.
- `__awards.scrollTo(p)` steps the virtual reel (`p` 0 → work 1, 1 → work 8), because the document itself never scrolls. Textures, materials, geometry and the renderer are disposed on `pagehide`.

## Adapting
- **Real work:** swap the canvas art for one KTX2 texture per project. Keep the button list and make each button a link to the project page (an `<a>` also gets focus-to-centre).
- **OGL:** `new Plane(gl, { widthSegments: 48, heightSegments: 24 })` with a `Program` running the same vertex shader.
- **R3F:** keep the offset, target and burst reservoir in refs, integrate them in `useFrame` and write `uBend` into each material's uniforms. Never put them in React state.
- **Velocity texture:** `[site:siena]` also blurs its DOM layer by speed. Add a blur only if the reel has DOM text over it, and drop it on phones.

## Verify
`verify.mjs` reads back real pixels after a fresh render. **Top:** work 1's field colour is at the viewport centre, and forcing `uBend` from 0 to 1 changes about 6 % of the frame (the shader really bends). **Wrap:** from work 8, one ArrowRight lands on work 1 going forward (target 8), drawn in the centre with work 8 one pitch behind. ArrowLeft from work 1 lands on work 8. **Wheel:** a burst raises `uBend` (peak near 1 in transit). **Rest:** the reel snaps to a work and every `uBend` is 0 again. **Reduced motion:** two wheel events in one gesture are one step and a key is one more, with no easing and flat sheets on every sample. **Mobile:** vertical reel, `scrollTo(.5)` centres work 5, 44 px index buttons, no overflow. With the modulo removed, the wrap checks fail (the centre pixel is the ground). With the twist and fold removed from the shader, the bend check reads 0 %.

Seen in: `[site:jesperlandberg]`, `[site:siena]`.
