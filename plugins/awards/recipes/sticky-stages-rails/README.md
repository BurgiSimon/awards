# sticky-stages-rails

Two sticky stages inside tall, invisible rails: a hero panel that hinges out on its bottom-left corner as the first rail scrolls, and three cards that rise, hold and fall in turn across the second. Never `pin: true`: the rail's height is the hold, the sticky child is the stage, ScrollTrigger only reads progress.

## Why
- **Sticky is refresh-proof.** A pinned element needs a spacer that resizes, font loads and route changes can leave stale; a sticky stage inside a rail cannot drift `[site:the-line]`.
- **The hinge reads as mass.** The panel moves `x 0 → −10 %` and rotates `0 → −15°` about its bottom-left corner while the child rotates harder (`−22°`) and starts a beat later; the lag is what sells a physical object `[site:the-line]`.
- **Stages, not a gradient.** Each card owns a third of the rail: rise, hold, fall. The hold is the beat a visitor remembers `[pattern:narrative-structures#pacing]`.
- **Reduced motion keeps the content.** Cards sit at full opacity, the panel stays flat, progress is still tracked for wayfinding.

## Parameters
Hero rail `220svh` (160 on phones) · stages rail `400svh` · `scrub: 0.5` · hinge `xPercent −10`, `rotation −15`, origin `0% 100%` · child `rotation −22`, `xPercent 12`, offset `0.1` · cards `yPercent 40 → 0 → −8`, opacity `.2 → 1`.

## Accessibility
Real headings for both stages (the second visually hidden), figures with captions in the DOM, no scroll hijack, no `pin` spacer to confuse screen-reader scroll positions.

## Adapters
The same markup works with CSS scroll-driven animations (`animation-timeline: view()`) as a progressive enhancement; keep the GSAP path where Safari support matters.

Seen in: `[site:the-line]`, `[site:shopify-editions-w26]`, `[site:mont-fort]`.
