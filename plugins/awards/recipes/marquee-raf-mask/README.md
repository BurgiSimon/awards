# marquee-raf-mask

A ticker driven by the shared ticker rather than a CSS keyframe loop: the position is a float, so it can pause on hover and focus, resume without a jump, take speed from scroll velocity, stop off-screen and stand still under reduced motion. Edges fade through `mask-image`; the links inside stay real.

## Why
- **Keyframes cannot pause well.** `animation-play-state` freezes mid-frame and cannot vary speed; a rAF float can do both (`[site:seasats]`, described through a third-party rebuild).
- **Velocity as an input.** Speed is `80 px/s + |lenis.velocity| × 0.6`, damped with `k = 6`, so a flick of the wheel flicks the band and decays (`[pattern:motion-vocabulary#velocity-as-an-input]`).
- **Wraparound at one copy's width.** The content is cloned until it covers twice the container; clones are `aria-hidden` and untabbable so screen readers hear the list once.
- **Off-screen and reduced-motion stop.** An IntersectionObserver unsubscribes the frame; under reduced motion the band becomes an ordinary overflow row with no mask.

## Parameters
Base `80 px/s` · velocity share `0.6` · damping `k = 6` · mask fade `8 %` each edge · clones until `2 × clientWidth`.

## Accessibility
Original items are real links; pause on `focusin` so a keyboard user can read; `overflow-x: auto` under reduced motion so nothing is unreachable.

## Adapters
- **anime.js:** `createTimer({ onUpdate: self => … })` with the same float and wrap.
- **GSAP:** the official `horizontalLoop` helper with `paused` toggles; keep `ease: 'none'`.

### React
`<Marquee items={[{ href: '/work/seasats', label: 'Seasats' }, …]} speed={80} Link={Link} />` from `adapters/react.jsx`, inside your own `<section aria-label="Clients">`. React renders the clones (`aria-hidden`, `tabIndex={-1}`, still clickable) and re-counts them on resize; the loop rides `gsap.ticker` and takes velocity from `useLenis()`. Copy the `.marquee` and `.track` rules from `style.css`.
- Reduced and static tiers render an ordinary row that scrolls by hand (inline `overflow-x: auto`, no mask).
- Velocity comes from the root `<SmoothScroll>` ([recipe:boot-lenis-gsap]); without it the band runs at the base speed. `'use client'` for Next's App Router.

### Webflow
- Designer: a Section with the custom attribute `aria-label="Clients"`; inside, a Div `marquee` with `data-marquee`, `data-speed="80"` and `tabindex="-1"`; inside that, a List `track` with `data-track` whose items each hold one Link. A Collection List can feed it when `data-track` sits on the element whose direct children are the items; check the published markup, because the nesting of Collection List wrappers is [unverified].
- Head code `<style>`: the mask fade (`mask-image` and `-webkit-mask-image`, 8 % at each edge), `.track { width: max-content; white-space: nowrap }`, and the recipe's reduced and static rule that turns the band into an `overflow-x: auto` row without the mask. Whether the Designer exposes `mask-image` is [unverified].
- No Webflow loop or scroll interaction on `.track`: the module writes its transform every frame.
- Inject: an entry in the engine loaded by the [recipe:boot-lenis-gsap] Footer-code loader. Drop the recipe's own `new Lenis` and read `velocity` from the boot's instance, on the same ticker. Call `fill()` again after a Collection List loads more items, which no resize event announces [inferred].
- Reduced motion: the loop never starts and the clones are removed; the Head-code rule makes the row scrollable by hand.

Seen in: `[site:seasats]`, `[site:mindmarket]`.
