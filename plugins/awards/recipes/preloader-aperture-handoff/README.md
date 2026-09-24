# preloader-aperture-handoff

A curtain that waits on real signals, then lifts while the hero opens underneath it from a rounded `clip-path: inset()` window to full bleed and its media scales in. Loading and arriving read as one move. Where `[recipe:preloader-counter-hold]` is about the honest wait, this recipe is about the hand-off: what the loader gives way to.

## Why
- **One frame from loader to hero.** The hero's first appearance is the aperture opening as the curtain leaves, so the load sequence arrives somewhere instead of ending before the page starts `[site:goats]` `[site:areebali]`.
- **Real signals, a ceiling, no floor.** The gate is `Promise.race([fonts + hero first frame, 4 s ceiling])`. It has no minimum hold and no timer-driven progress. The hero signal is the placeholder film's first drawn frame; for a real hero use the video's first decoded frame (`requestVideoFrameCallback` or `loadeddata`) or the poster's `decode()` (`[pattern:preloaders-and-transitions#the-load-contract]`).
- **The closed aperture is never seen before the lift.** The frame, media and copy get their start values while the curtain still covers them. The head script sets `is-gated` before first paint, so a first visit never flashes the hero and a repeat visit never flashes the curtain.
- **Ready means open.** `__awards.ready` resolves in `finish()`, after the hand-off, so captures and the jury see the open hero, not the curtain.
- **Scroll is locked for the gate and the hand-off only.** `html.is-gated { overflow: hidden }` stops wheel, touch and keys. The header, `main` and footer are `inert` behind the curtain. Both are released the moment the frame is open.
- **Repeat visits skip it.** The `sessionStorage` flag `awards:aperture` is read in the head, before first paint; the second load in a session opens straight onto the hero. This is what the source sites get wrong: both play their intro again on every visit `[site:goats]` `[site:areebali]`.

## Parameters
Aperture `inset(30% round 12px)` → `inset(0% round 0px)` (same value count, so GSAP interpolates the string), `1.4 s` `expo.inOut`, starting `.3 s` into the curtain's lift · media `scale .6 → 1`, same timing · curtain `yPercent 0 → −100`, `.9 s` `expo.inOut` · copy `y 24 → 0` + fade, `1 s` `expo.out` at `1.1 s` · gate ceiling `4000 ms` · placeholder film drawn at 1/6 resolution on the shared ticker, paused off-screen.

## Motion tiers
- **Full:** the curtain lifts and the aperture opens. If the page is not at the top when the gate opens, the curtain fades instead, since an aperture on an off-screen hero is wasted.
- **Reduced:** a fade only. The curtain's opacity goes `1 → 0` over `.6 s`; the frame is never clipped or scaled, and the film holds one frame.
- **Static** (`data-motion="static"`): the gate still waits on its signals, then the curtain is removed in one cut.
- **No JavaScript:** nothing is gated; the head script never runs and the curtain is `display: none`.

## Accessibility
The curtain is `role="status"` with `aria-live="polite"` and lists its signals as they land. A *Skip intro* button ends the gate at any point. The curtain is `hidden` after the hand-off, so it leaves the accessibility tree. If focus was inside it, focus moves to `main`. Replay moves focus to the Skip button. The placeholder media is `role="img"` with a label; a real hero film needs a visible pause control.

## Demo content
The "Aperture" mark, the hero line and the film are synthetic demo content. The film is a canvas-2D placeholder (three drifting colour blooms), so the recipe ships no media or font files. All type uses system font stacks. *Replay intro* reruns the same `intro()` a first visit runs, so the hand-off can be seen again without clearing storage.

## Adapters
- **Intro film cut onto the element (areebali):** absolutely position the film at the target's `getBoundingClientRect()`, and cut to the live element when the film reaches its last frame (`timeupdate`), with a timer fallback. Drop the film on small screens and under reduced motion.
- **Bowed curtain edge (goats):** give the curtain an SVG lower edge and morph its control point to `Q50,10` over `.4 s`, then flat over `.45 s`, alongside the lift.
- **With Lenis:** call `lenis.stop()` in `lock(true)` and `lenis.start()` in `lock(false)`, and drive `lenis.raf` from the GSAP ticker as in `[recipe:boot-lenis-gsap]`.
- **React / Vue / Svelte:** keep the head script in the document template. Run `intro()` in a mount effect and build the timeline in `useGSAP` / `gsap.context()` so it reverts on unmount.

Seen in: `[site:goats]`, `[site:areebali]`.
