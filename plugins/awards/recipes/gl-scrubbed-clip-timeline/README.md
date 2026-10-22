# gl-scrubbed-clip-timeline

Animation clips that never play on a clock. Three procedural forms (a bloom of petals, a stack of discs, a coil of beads) each carry one `AnimationClip` built in code from position, rotation and scale `KeyframeTrack`s. One paused GSAP timeline gives each form a slot: a hand-off that slides the rail, a growth proxy that becomes `mixer.setTime(proxy × duration)`, and a tone that warms the material. ScrollTrigger scrubs that timeline across a sticky track, so the scroll position is the clip time and scrolling back ungrows each form exactly. Frames are drawn only when a scroll update or a resize changed something. No model, texture or font files ship; the forms and copy are synthetic.

## Why
- **Scrub the clip, do not trigger it.** Each mixer is set from scroll progress through GSAP-tweened refs, never `play()` on a clock `[site:eugeniagrab]`. An authored growth stays reversible and lasts exactly as long as the reader wants (`[pattern:webgl-3d-scenes#scroll-driven-scenes]`). `[recipe:image-sequence-scrub]` scrubs pre-rendered frames; this scrubs the animation data itself.
- **Slots and hand-offs on one timeline.** Nine units, a slot of three per form. The hand-off straddles the slot boundary, so the outgoing form is still on screen while the next arrives; growth and tone start inside the slot and are done by `s + 2.25`, the settled pose. Eases live inside the slot (`power2.inOut` for the slide, `sine.inOut` for the growth); the scrub itself is linear (`defaults: { ease: 'none' }`), with the smoothing in `scrub`.
- **Clips from code.** `VectorKeyframeTrack` and `QuaternionKeyframeTrack` on named children (`petal3.quaternion`, `disc5.position`, `heart.scale`) bind through `PropertyBinding`, the same path a baked glb clip uses. Swap the procedural groups for loaded models and the timeline does not change.
- **A clamped action must be unpaused.** A `LoopOnce` action with `clampWhenFinished` pauses itself when `setTime` reaches the end, and a paused action ignores the next `setTime`. The form would freeze grown on the way back up. `setClip()` sets `action.paused = false` before every set.
- **Render on demand.** The timeline's `onUpdate` and the resize handler are the only things that mark the frame dirty; the GSAP ticker draws only then. At rest the canvas draws nothing, which the verify measures.

## Parameters
Timeline `9` units, slot `3`, settled at `s + 2.25` · hand-off `s − .5`, `1` unit, `power2.inOut`, rail gap `7` · growth `s + .25`, `1.75`, `sine.inOut` · tone `s + 1`, `1.25`, `sine.inOut` · clips `2.4 / 2.8 / 3 s` · `scrub .8` (fine pointer), `.3` (coarse) · track `640svh` (`560svh` under 768 px) · Lenis `lerp .1` on `gsap.ticker`, `lagSmoothing(0)` · segments `48 / 32 / 20` and DPR / pixel budget from `_shared/quality-tiers.js`, antialias off on the low tier · camera fov `30°` landscape, `42°` portrait.

## Motion tiers
- **Full:** the scroll scrubs every clip, the rail slides, the tone warms.
- **Reduced:** no scrub. A plain ScrollTrigger reports which slot the scroll is in and the timeline is cut (`tl.seek`) to that slot's settled pose; scrolling inside a slot draws nothing, crossing a boundary draws one frame (`[pattern:accessibility-and-reduced-motion#reduced-motion-tiers]`). Lenis wheel smoothing is off.
- **Static:** as reduced.
Without WebGL2 (or with `?gl=0`), a CSS still of the settled bloom stands in, and the timeline still drives the beats.

## Accessibility
- The canvas is `aria-hidden`. The forms are named and described in a `<nav>` of three links (the DOM mirror); the active form's link carries `aria-current="step"`.
- The links are the keyboard path: Enter scrolls to that form's settled pose, and focus stays on the link. Without JS they are anchors to markers at the same scroll positions.
- A skip link past the scene sits in the intro; the clip-time readout is `aria-hidden` decoration.
- On a phone only the active form's line is shown; the other two stay in the accessibility tree.

## Adapters
- **React / R3F:** build the clips in a `useMemo`, create one `AnimationMixer` per form in an effect, and call `mixer.setTime()` from the timeline's `onUpdate`, not in `useFrame`. Use `<Canvas frameloop="demand">` and call `invalidate()` from the same `onUpdate`. Kill the ScrollTrigger and `uncacheRoot` the mixers on unmount.
- **Vue / Nuxt:** a client-only component; build the timeline in `onMounted`, `ScrollTrigger.getAll()` scoped through `gsap.context()` and reverted in `onBeforeUnmount`.
- **Svelte / SvelteKit:** the same in `onMount`, with the returned cleanup reverting the context and disposing the renderer.
- **Astro:** a `client:visible` island around the track; the beats list is static HTML.
- **Baked models:** merge each glb's tracks into one clip per object (retime a track by scaling its `times`), then use the same slots.

## Verify
`slot1` seeks to progress `.46` and checks that the timeline sits at `.46 × 9` and that the second form's `mixer.time` equals the clip time the slot's `sine.inOut` growth implies (± .02), computed in the verify from the scroll position; the heart's scale read from the scene must equal the keyframe interpolation at that time. `idle` checks that no frame is drawn across 500 ms at rest. `keys` presses Enter on the third link. `rm` checks the settled cut, no frame for a scroll inside a slot and exactly one for the next slot. `nogl` checks the CSS still. Removing the `action.paused = false` line fails `keys` and `rm`'s way back; driving the mixer with `update(dt)` fails `slot1`.

## Synthetic content
The three forms, their names and all copy are synthetic demo content generated in code. No media, model or font files ship; type uses system stacks.

Seen in: `[site:eugeniagrab]`.
