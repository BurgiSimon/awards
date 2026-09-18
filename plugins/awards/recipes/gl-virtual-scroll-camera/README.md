# gl-virtual-scroll-camera

The document does not scroll. Wheel and touch add velocity to a float that coasts with friction (`0.97` per frame), a double lerp (`.075 → .15`) smooths it, the float sets the camera's position on a Catmull-Rom spline, DOM labels are projected onto scene points, and after a moment's idle the float snaps to the nearest chapter over `1.4 s`. Keys move by chapter; reduced motion steps without easing; the chapters exist below as real DOM.

## Why
- **Own the scroll only when the story needs it.** A virtual float is the model for gates, holds and spatial descents `[site:igloo]` `[site:why-zero]`; everywhere else native scroll with a smooth library is cheaper and kinder (`[pattern:motion-vocabulary#scroll-philosophies]`).
- **The constants are the feel.** Friction `.97`, double lerp `.075 / .15` and a `1.4 s` in-out snap are the corpus's own numbers; change them together or not at all.
- **The float is drivable.** `awards.setScroller` lets the capture tool and the jury move the tour like a page, so the evidence pipeline works on a canvas-first site.
- **Keys, a mirror and a way out.** PageDown / arrows / Home / End move by chapter; the chapter list below is real DOM with headings; the HUD links to it.

## Parameters
`WHEEL 0.00035` progress per pixel · `FRICTION 0.97` · lerps `.075 → .15` · snap after `900 ms` idle, `1.4 s` in-out cubic.

Seen in: `[site:igloo]`, `[site:why-zero]`.
