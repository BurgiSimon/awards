# idle-settle-snap

When a wheel scroll comes to rest partway through the first viewport, the page waits for a short quiet window and then eases to the nearer end: back to the cover, or on to the first chapter. It watches a smoothed native scroll (Lenis on the shared ticker) and only finishes a move the visitor started. It does not run while a pointer is down. A keyboard or find-in-page scroll is left where it lands. After a settle it waits out a guard before it can arm again. It is off on coarse pointers and under reduced motion. `[recipe:gl-virtual-scroll-camera]` snaps a virtual float that the page owns; this leaves the document scroll native and steps in only once, after the gesture has ended.

## Why
- **Settle, never seize.** A transitional band such as a cover that is half gone reads as a mistake, so the page finishes it. It judges the position only after `160 ms` without movement, and it goes to whichever end is nearer `[site:mensch]`.
- **Only a wheel arms it.** Lenis' `virtual-scroll` event says what moved the page. A `wheel` arms the settle. Touch never does, which covers hybrid laptops with a fine primary pointer. A native scroll disarms it: Lenis reports `isScrolling === 'native'` for keyboard, find-in-page, focus, scrollbar and anchor scrolls, and a scroll-key `keydown` disarms it at once. Those positions were chosen on purpose.
- **Held means held.** `pointerdown` anywhere holds the settle, and a press during a settle stops it in place (`lenis.reset()`). The release restarts the quiet window, so nothing moves under a hand that has only just lifted.
- **A dead zone and a guard.** Within `6 %` of either end nothing happens. A `900 ms` guard, longer than the `.7 s` tween, keeps the settle from arming on its own motion `[site:mensch]`. A wheel during a settle takes over at once: the tween is not `lock`ed, and Lenis retargets from where it is. mensch passes `lock` to `lenis.scrollTo`. This recipe does not, so the visitor can always interrupt.
- **Ticker time, not wall time.** The quiet window and the guard add up the shared ticker's `dt`, which is clamped to `100 ms`. A stalled frame therefore cannot pass for a pause.

## Parameters
Zone `[data-settle-zone]`, from its `offsetTop` to its bottom (here the `100svh` cover) · quiet `160 ms` · dead zone `6 %` at each end · midpoint `50 %` decides the direction · tween `.7 s` ease-out cubic through `lenis.scrollTo(to, { duration, easing })` · guard `900 ms` from the start of a settle · Lenis `lerp .1`. goats uses a variant: the nearest section top within `45 %` of the viewport, `140 ms` of quiet and `.9 s` ease-out cubic, on desktop with a fine pointer only `[site:goats]`.

## Motion tiers
- **Full** (fine pointer): Lenis smooth wheel and the settle.
- **Reduced:** no settle. Lenis' `respectReducedMotion` makes the wheel instant.
- **Static** (`data-motion="static"`): no settle, and `smoothWheel: false`, so the wheel scrolls natively.
- **Coarse pointer:** no settle in any tier. Touch scrolling stays native.

## Accessibility
The settle never runs after a keyboard, find-in-page or focus scroll, so assistive technology and keyboard users keep the position they chose. The gauge and the status line are `aria-hidden` demo readouts. The page has a skip link, landmarks and one `h1`, and the settle zone is an ordinary section with real text.

## Demo content
The cover copy, the "Tidewater survey" chapter and its figures are synthetic demo content. The recipe ships no media or font files, and all type uses system font stacks.

## Adapters
- **With GSAP:** drive Lenis from `gsap.ticker` as in `[recipe:boot-lenis-gsap]`, and count the quiet window and the guard in `gsap.ticker.deltaTime`, clamped to `100 ms` the same way.
- **Several zones:** keep one settle and pick the zone that contains `scrollY`, or snap to the nearest section top within a band of the viewport (the goats variant).
- **React / Vue / Svelte:** create Lenis and the listeners in an effect or `onMount`. In the cleanup, remove the listeners and the ticker subscription and call `lenis.destroy()`.

Seen in: `[site:mensch]`, `[site:goats]`.
