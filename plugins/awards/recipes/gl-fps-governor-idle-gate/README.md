# gl-fps-governor-idle-gate

Two guards for a GL layer that runs all page long. A **governor** measures the frame rate every half second and steps the renderer's pixel ratio down or up by `.25`, inside the range the one-time probe allowed. An **idle gate** takes the loop off the shared ticker `1.5 s` after the last scroll, pointer, wheel, touch or key input, unless busy work (a running transition, a lens still easing) is in progress. A hidden tab stops the ticker altogether.

**Demo content is synthetic.** The contour field is a few summed sines drawn by one fragment shader, with a lens that follows the pointer and a ring for the demo transition. No image, model or font files ship.

## Why
- **Probe once, then keep listening.** `[recipe:quality-tiers]` decides a tier from a one-time probe. A device that was fine at load can still slow down later: a long page gets heavier, the laptop is on battery, another tab takes the GPU. Stepping the pixel ratio from measured frame rate keeps a heavy stage usable on weak hardware without a device list `[site:primesec]`.
- **The probe sets the clamp.** The ceiling is the probe's DPR cap combined with its absolute pixel budget: `cap = min(profile.dpr, √(maxPixels / (w·h)))`. The floor is `max(.5, cap / 2)`. The governor starts at the ceiling and never leaves the range, so a tier decision is refined, not overridden. A per-tier DPR range with a target fps is the same idea in tier form `[site:pensatori-irrazionali]`.
- **A dead band, not a thermostat.** Under `45` fps one step down, over `57` one step up, and in between it holds. Without the gap the ratio would flip every window near one threshold.
- **Frames nobody asked for are waste.** A decorative field that redraws while the visitor reads burns battery and heat for identical pixels. After `1.5 s` with no input the loop unsubscribes, the canvas keeps its last frame, and the shared ticker stops once it has no subscribers `[site:primesec]`. The loop also sleeps on `visibilitychange` `[site:pensatori-irrazionali]`, which `_shared/raf.js` already does for every subscriber.
- **Busy work holds the gate open.** A transition started by a click runs to its end even without further input, and the pointer lens finishes easing before the loop sleeps. Any such work sets the gate's clock to "now" each frame, so the idle window starts when the motion ends.
- **The first frame after a wake is not a measurement.** The shared ticker restarts with a nominal `1/60 s` after a pause. The governor skips that frame and restarts its window, so a long sleep never reads as one slow frame.

## Parameters
Window `500 ms` · down below `45` fps, up above `57` · step `.25` · ceiling = probe DPR and pixel budget, floor `max(.5, cap / 2)` · idle gate `1.5 s` after the last input or busy frame · demo transition `3 s` of ticker time · lens `damp k = 8` · `antialias: false` (the pixel ratio carries the quality).

## Accessibility and motion tiers
- The canvas is `aria-hidden`. The readout is a plain `<dl>` updated on each governor window and on every sleep and wake, not a live region: it would otherwise announce twice a second.
- Both demo buttons are real `<button>`s, 44 px tall, with a visible focus ring. "Simulate 25 fps" is a toggle with `aria-pressed`.
- Keyboard input wakes the loop like a pointer does.
- **Full:** field drift, pointer lens, scroll offset, ring transition.
- **Reduced:** the governor and the gate are unchanged. The field is still (no drift, no lens, no scroll offset) and the transition is a colour tint instead of a spreading ring.
- **Static:** one frame is drawn and the loop never starts. Input does not wake it, and the transition button is disabled. A resize redraws one frame.
- Without WebGL2 the canvas is hidden and the page is plain text on the ground colour.

## Adapting
- **Your own loop:** keep `govern(frameMs)` and the `wake()` / `sleep()` pair as they are and swap `draw()` for your composer's render. Call `wake()` from anything that changes the picture: a data update, a route transition, a video frame.
- **Busy flags:** add every kind of time-driven work to `state.busy` (a GSAP timeline's `isActive()`, a physics body that has not come to rest). The gate is only as honest as that line.
- **Always-moving scenes:** a scene with continuous ambient motion keeps the governor and drops the gate, or gates on visibility of the canvas (`IntersectionObserver`) instead of on input.
- **Supersampling:** `[site:primesec]` lets the desktop ceiling reach `clamp(DPR, 1.5, 2)` even on a 1× screen. Raise `cap` if the picture needs it and the budget allows.
- **R3F:** `<Canvas frameloop="demand">` plus `invalidate()` from the input handlers is the gate. For the governor, call `setDpr` from the same half-second windows (drei's `PerformanceMonitor` has the shape), clamped to the tier's range.
- **Testing on a fast machine:** press "Simulate 25 fps", or call `__governor.simulate(40)` in the console. Synthetic frame times replace the measured ones in the governor only; the animation keeps real time. `simulate(null)` goes back to measuring.

## Verify
Headless SwiftShader is slow and uneven, so the governor states inject frame times through `__governor.simulate(ms)`, which restarts from the probe's ceiling. The pixel ratio and drawing-buffer size are read back from the renderer and the GL context in the same task, and the render counter is sampled every 100 ms for 4.5 s. **Top:** the ratio starts inside the clamp, and the buffer is the CSS size × that ratio. **Throttle:** 25 fps steps the ratio from the ceiling by one `.25`, and the renderer really reads the lower ratio (on a mid tier, 1440 × 900 at 1 → 1080 × 675 at .75). **Recover:** 83 fps climbs back to the ceiling in `.25` steps. **Hold:** 53 fps over three windows changes nothing. **Idle:** the counter holds. **Wake:** a pointer move restarts it, and it holds again after the idle window. **Busy:** a 3 s transition keeps drawing 1.9–2.8 s after the click. **Hidden:** with `document.hidden` set, pointer and wheel input draw nothing. **Reduced motion:** the same step and the same idle stop, with no drift. **Static:** one frame, and input starts no loop. **Mobile:** 390 × 844 steps from 1 to .75. With the governor's `setPixelRatio` removed the throttle and mobile checks fail (the renderer still reads 1). With the busy hold removed the transition check fails, because the counter stops 1.5 s after the click.

Seen in: `[site:primesec]`, `[site:pensatori-irrazionali]`.
