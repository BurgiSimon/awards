# Recipe proposals — wave 2, 2026-09-23

Candidates from wave 2's `### Techniques and stacks` (boc, wodniack) and the synthesis edits, for techniques no recipe in `plugins/awards/recipes/` covers. Each is seen in one site so far; rank follows how many skills would cite it (motion, component, structure, webgl). Folded in rather than proposed alone: boc's gated hover video and late-overshoot grow (into rank 2), wodniack's DrawSVG intro (into rank 3). Not proposed: wodniack's contrast toggle, which `theme-swap-tokens` already covers.

## 1. `transition-promote-chosen` — Route exit that promotes the chosen item
- Seen in: boc
- Tier: P1 · Deps: gsap 3.15.0, @unseenco/taxi 1.9.1 (both pinned)
- Overlap: `page-transitions` wipes the whole view; this exits by lifting the clicked item into the header slot while its siblings fade on a stagger of `.09 s × |i − chosen|`, then pushes the route after the rise. Adds the distance-staggered sibling exit and a phone timing set.
- Verify idea: click the third of six rows; mid-exit the chosen row's top is above its start and siblings' opacity is ordered by distance from it; the route changes only after the rise. Under reduced motion the route changes at once with no tween.

## 2. `filmstrip-index-rows` — Filmstrip project rows at one shared speed
- Seen in: boc
- Tier: P1 · Deps: none (CSS keyframes, `IntersectionObserver`); gsap 3.15.0 only if the pause eases
- Overlap: `marquee-raf-mask` runs one rAF band driven by scroll velocity; this is a list of CSS-keyframe rows whose duration comes from measured width so every row shares one px/s, with one link per project (stills `aria-hidden`), pause on hover, focus and off-screen, a late-overshoot hover grow and hover video mounted only on intersect for `(hover: hover)`.
- Verify idea: two rows of different widths move at the same px/s within 5 %; Tab reaches one stop per project; focusing a row sets it paused; no `<video>` mounts on a coarse-pointer or reduced state. Reduced motion: transforms are none.

## 3. `svg-noise-line-field` — Noise-bent SVG line field with a pointer spring
- Seen in: wodniack
- Tier: P1 · Deps: gsap 3.15.0 (DrawSVGPlugin ships in it); noise hand-written, no dependency
- Overlap: `scroll-drawn-svg-path` draws one path by dash on scroll and `gl-fluid-wake-post` bends the image in a shader; this is a hero field of SVG polylines drawn in from the edges on load, each point's angle one Perlin sample drifting in time, pushed by the pointer within a speed-scaled radius and returned by a spring (.005, damping .925, made framerate-independent).
- Verify idea: sampled point offsets differ between two frames; a pointer sweep across the field raises displacement near its path above the idle level, then it decays. Reduced motion: the field is drawn and still; static: no ticker callback registered.

## 4. `title-mask-tunnel` — Section title as a doorway, with CSS-3D content inside
- Seen in: wodniack
- Tier: P1 · Deps: gsap 3.15.0 (ScrollTrigger), lenis 1.3.26
- Overlap: `scroll-pin-scrub` scrubs a sticky stage and `gl-virtual-scroll-camera` flies a WebGL camera; this scales a title's mask on a `scrub` until it covers the viewport and moves DOM content in CSS 3D (`preserve-3d`, `translateZ`) inside it, no WebGL.
- Verify idea: at the section's midpoint the mask's rect covers the viewport and the inner items' `translateZ` has changed from the start state; before the section the mask is at scale 1. Reduced motion: the works render as a plain list with no 3D transform.

## 5. `dialog-nested-lenis-sheet` — Dialog with its own smooth scroll, a bottom sheet on the phone
- Seen in: boc
- Tier: P2 · Deps: lenis 1.3.26, gsap 3.15.0
- Overlap: `nav-overlay-fullscreen` traps focus in a menu and stops the page Lenis; this gives a long-content dialog a nested Lenis on the shared ticker, `data-lenis-prevent` on inner panes, server-rendered content, and a drag-to-dismiss sheet under 768 px.
- Verify idea: a wheel over the open dialog moves its scroller and not the page; Escape closes and returns focus to the opener; on the phone a downward drag past the threshold closes the sheet. Reduced motion: open and close are instant.

## 6. `throw-objects-css3d` — Grab-and-throw CSS-3D objects
- Seen in: wodniack
- Tier: P2 · Deps: gsap 3.15.0 (Draggable + InertiaPlugin, both in the package)
- Overlap: `magnetic-button` and `cursor-two-speed` react to a pointer but never hand it an object; this throws extruded CSS-3D objects with release velocity into a perspective catcher, with a keyboard path the source lacks.
- Verify idea: a drag released with velocity leaves the object moving for several frames after pointerup; a keyboard "throw" button produces the same end state. Reduced motion: objects settle without inertia.

## 7. `scrollbar-thumb-drag` — A drawn scrollbar thumb beside a working native scroll
- Seen in: wodniack
- Tier: P2 · Deps: none; lenis 1.3.26 when present
- Overlap: `boot-lenis-gsap` keeps native scrolling; this adds a themed thumb that mirrors progress and can be dragged, without hiding the native bar from keyboards (the source hides it).
- Verify idea: dragging the thumb to half its track scrolls to about half the page; keyboard scrolling still moves the page and the thumb follows. Reduced motion: thumb updates without easing.

## 8. `sprite-rain-canvas2d` — Canvas-2D sprite rain as an easter egg
- Seen in: wodniack
- Tier: P2 · Deps: none
- Overlap: no recipe covers a canvas-2D particle toy; `quality-tiers` supplies the count budget.
- Verify idea: after a trigger, sprites' y increases frame to frame and the count stays under the tier budget; they are removed once off-screen. Reduced motion: nothing spawns.
