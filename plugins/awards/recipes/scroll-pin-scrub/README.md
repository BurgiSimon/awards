# scroll-pin-scrub

A chapter that holds for three viewport heights while a timeline scrubs through three beats. The stage is `position: sticky` inside a tall section, so the scroll consumes the section's own height and ScrollTrigger only reads progress; no `pin: true`, no injected spacer, an honest scrollbar.

## Why
- **Scrub is linear.** `defaults: { ease: 'none' }` on the timeline; `scrub: 0.6` adds a little catch-up so wheel steps do not stutter. The smoothing already lives in Lenis (`[pattern:motion-vocabulary#scrub-and-refresh-rules]`).
- **Beats, not a gradient.** Progress is quantised into three beats that switch captions and the readout, so the chapter reads as entrance → hold → exit rather than one long morph (`[pattern:narrative-structures#pacing]`).
- **Sticky instead of pin.** Where sticky works it is cheaper, keyboard-friendly and refresh-proof; reserve `pin: true` for elements that cannot be sticky.
- **Reduced motion keeps the beats.** The object stops rotating, but captions and the readout still respond to scroll, so the chapter still tells its story.

## Parameters
Section height `300svh` · `scrub: 0.6` · `invalidateOnRefresh: true` · beats = `floor(progress × 3)` · full tier: rotation 0 → 540°, scale 1 → 1.15 → 0.9 → 1.

## Accessibility
Real heading per chapter, captions in the DOM (the active one shown, the others at opacity 0 but present), no scroll hijack, keyboard scrolling untouched.

## Adapters
- **anime.js:** `animate(object, { rotate: 540, autoplay: onScroll({ container: window, target: chapter, enter: 'top top', leave: 'bottom bottom', sync: true }) })`.
- **React (basement):** `<Scrollytelling.Root start="top top" end="bottom bottom"><Scrollytelling.Animation tween={{ start: 0, end: 100, to: { rotation: 540 } }} /></Scrollytelling.Root>`.

Seen in: `[site:son-daven]`, `[site:united-carriers]`, `[site:mont-fort]`, `[site:shopify-editions-w26]`.
