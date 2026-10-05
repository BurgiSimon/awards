# gl-uniform-tween-targets

Shader uniforms and post-look values driven as plain GSAP tween targets. A uniform's `{ value }` object goes straight into `gsap.to`; every retarget calls `gsap.killTweensOf` on that uniform first and tweens from wherever the value is now. Shader states then use the house eases, sit on GSAP's clock and can be interrupted halfway without a jump.

Demo content is synthetic: a generated ring field in one fragment shader, colours read from the shared tokens. No models, textures, fonts or media.

## Why
- **One clock.** When GSAP owns the motion, the GPU should read tweened numbers on `gsap.ticker`, not run a second interpolation loop `[pattern:gsap-choreography#driving-gl-from-timelines]`. Uniforms as tween targets with a kill first `[site:why-zero]`; post presets tweened per scene `[site:edolus]` (`[pattern:webgl-shaders#uniform-contract]`).
- **Kill, then tween from here.** `retarget(targets, vars)` is `killTweensOf(targets)` + `gsap.to(targets, vars)`. Without the kill, a long entrance keeps writing after a short exit has finished and the value snaps back; with `fromTo`, every interruption jumps to the start value.
- **Exit faster than entrance.** Charge `.9 s power2.out`, release `.45 s power2.in`. The verify pins the uniform at progress `.5` to `power2.out(.5)`.
- **Post looks are presets, tweened.** Vignette, grain and ring density move together between `calm` and `charged` (`.9 s power2.inOut`), one function-based `value` over an array of uniforms. A free dial is not offered (`[recipe:gl-postprocessing-presets]` switches fixed presets without tweening).
- **Render on change.** The ticker listener draws only when a tween's `onUpdate` or a resize marks the frame dirty, so a resting scene costs nothing.

## Parameters
Charge `0 → 1` `.9 s power2.out`, release `→ 0` `.45 s power2.in`; swell rides the same tweens. Presets: calm vignette `.35`, grain `.04`, density `38`; charged `.75 / .12 / 64`, `.9 s power2.inOut`. DPR capped at `1.5`.

## Motion tiers
- **full** — the timings above, spatial swell on.
- **reduced** — colour charge only (`.25 s` / `.2 s`), swell stays `0`, presets `.3 s`.
- **static** — every retarget is instant (`duration: 0`), one frame per change.
Without WebGL the stage keeps a CSS radial gradient; the controls still work.

## Accessibility
The charge target is a real button: focus charges, blur releases, so keyboard users see the same state. The canvas is `aria-hidden`; the copy and controls stay in the DOM. Hover charging listens to mouse pointers only, so a tap does not leave a stuck charge.

## Adapters
- **postprocessing effects**: tween a plain preset object and copy into `effect.intensity` / `blendMode.opacity.value` in `onUpdate`, or target the effect's own uniform objects.
- **Colours**: tween the `THREE.Color` instance's `r / g / b` (linear working space), with the same kill first.
- **React / R3F**: keep the uniforms in a `useMemo`, retarget inside `useGSAP` handlers; `contextSafe` cleans up the tweens on unmount.

## Verify
`hover` seeks the running charge tween to `.5` and checks the uniform against `parseEase` and the read-back centre pixel against the rest and target colours. `interrupt` releases mid-charge and checks every logged frame's step against the steepest ease slope × `dt`. Removing the `killTweensOf` line fails it (the entrance resumes after the exit).

Seen in: `[site:why-zero]`, `[site:edolus]`.
