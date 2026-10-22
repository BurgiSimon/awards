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

### React
`<PinnedChapter beats={['Approach.', 'Turn.', 'Land.']} note="…" onProgress={(progress, beat) => …} />` from `adapters/react.jsx` renders the chapter: the tall section, the sticky stage, the object, the captions and the readout. Copy the `.chapter`, `.stage`, `.object` and `.caption` rules from `style.css`.
- The readout is written to the DOM every frame and the beat is React state, which changes three times a pass, so scrolling never re-renders the tree.
- Needs the root `<SmoothScroll>` from [recipe:boot-lenis-gsap]. `'use client'` for Next's App Router.

### Webflow
- Designer: a Section with class `chapter` and the custom attribute `data-pin`, `300svh` tall, holding a Div `stage` (`position: sticky; top: 0; height: 100svh`, grid rows `auto 1fr auto auto`). In the stage: a paragraph with two spans, `data-beat` (`01`) and `data-readout` (`000`); a Div `object` with `aria-hidden="true"` and three empty child Divs; an H2 `caption` with three spans `data-caption="0"`, `"1"` and `"2"`, the first also carrying `is-active`.
- Head code gets one `<style>` for what the Designer may not express: `.caption span { grid-area: 1 / 1 }` with the `.is-active` opacity swap, the `svh` heights if the unit picker lacks them [unverified], and `html[data-motion-tier="reduced"] .object { transform: none !important }`.
- No Webflow interaction on `.object`, the captions or the section: the scrub owns those transforms and opacities, and a scroll interaction there writes the same properties.
- Inject: an entry in the engine loaded by the [recipe:boot-lenis-gsap] Footer-code loader. It reuses the boot's Lenis and refresh. When a Collection List above the chapter paginates, call `lenis.resize()` and `ScrollTrigger.refresh()` again.
- Reduced motion: no rotation is created; the captions and the readout still follow the scroll.

Seen in: `[site:son-daven]`, `[site:united-carriers]`, `[site:mont-fort]`, `[site:shopify-editions-w26]`.
