# GSAP choreography

What this file is for: the deep GSAP path of `awards:motion` (`--gsap`). How the analysed sites structure GSAP across a whole page — timeline architecture, ScrollTrigger configurations as shipped, easing as actually used, SplitText, Flip and Observer choreography, and GL uniforms driven from timelines. It does not teach the API: that is GreenSock's official skills and `stacks/gsap-3.15.md`. Tokens, duration bands and scrub rules stay in `[pattern:motion-vocabulary]`. Cite as `[pattern:gsap-choreography#section]`. Every row carries the card's confidence label; structure read from minified bundles is `[inferred]`.

## Contents
1. [Timeline architecture](#timeline-architecture)
2. [ScrollTrigger configurations](#scrolltrigger-configurations)
3. [Easing as shipped](#easing-as-shipped)
4. [SplitText choreography](#splittext-choreography)
5. [Flip and layout state](#flip-and-layout-state)
6. [Observer and gesture sections](#observer-and-gesture-sections)
7. [Driving GL from timelines](#driving-gl-from-timelines)
8. [Teardowns](#teardowns)
9. [Recipe map](#recipe-map)
10. [Verify](#verify) · [Refuse](#refuse)

## Timeline architecture

Why: a page whose moments are separate tweens cannot be scored, paused or reduced as one; the deep path names one master timeline per scroll model and a label per chapter.

<!-- filled by wave 4 synthesis from `### Tech lens: GSAP` subsections -->

## ScrollTrigger configurations

Why: start, end, scrub and pin values are where shipped sites differ from tutorials; this table records them as shipped.

| Use | start / end | scrub | pin or sticky | snap | Site | Confidence |
|---|---|---|---|---|---|---|

## Easing as shipped

Why: named curves and CustomEase strings the corpus actually ships, beside the token set in `[pattern:motion-vocabulary#easing]`.

## SplitText choreography

Why: split type, masking and stagger decide whether a text reveal reads as authored or as a plugin default.

## Flip and layout state

Why: shared-element moves are the cheapest way to make two layouts read as one object.

## Observer and gesture sections

Why: section switchers commit on a gesture, not on scroll distance; the thresholds decide whether they feel deliberate or twitchy.

## Driving GL from timelines

Why: when GSAP owns the clock, uniforms are tweened values on the same ticker, never a second loop.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|

## Recipe map

| Intent | Recipe |
|---|---|
| One ticker for Lenis and ScrollTrigger | [recipe:boot-lenis-gsap] |
| Pinned scrubbed chapter | [recipe:scroll-pin-scrub] |
| Masked line reveal | [recipe:split-text-masked-reveal] |
| Scroll-filled words | [recipe:scroll-word-fill] |
| Gesture-committed sections | [recipe:section-switcher-wheel-commit] |
| Chosen item promoted across a route | [recipe:transition-promote-chosen] |
| Route transitions | [recipe:page-transitions] |

## Verify

- [ ] Every motion score row names its timeline and label (`master@ch2`).
- [ ] Every timeline is created inside one `gsap.context()` or `gsap.matchMedia()` scope and reverted on teardown.
- [ ] Every scrubbed tween runs on `ease: 'none'` [M03].
- [ ] The reduced tier is a `matchMedia` branch, not a global kill [M01] [M02].

## Refuse

- A timeline per element with no master: nothing can be scored, paused or reduced as one.
- A corpus site's exact timeline, curve or label set shipped as the signature: pattern pointers, never parts.
