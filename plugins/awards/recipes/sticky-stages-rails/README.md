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

### React
`<StickyStagesRails hero={{ label: '/ hinge', title: 'The panel hinges out.' }} stages={[{ label: 'Stage I', caption: '…' }, …]} />` from `adapters/react.jsx`, or `HingeRail` and `StagesRail` on their own; `onProgress(rail, progress)` reports each rail for wayfinding. Copy the `.rail`, `.stage`, `.panel`, `.logo` and `.card` rules from `style.css`.
- Each rail is its own `useGSAP` scope split by `gsap.matchMedia`; under reduced motion only the progress triggers exist.
- Needs the root `<SmoothScroll>` from [recipe:boot-lenis-gsap]. `'use client'` for Next's App Router.

### Webflow
- Hero rail: a Section `rail hero-rail` with the custom attribute `data-rail="hero"` (`220svh`, `160svh` at 767 px and below, which is also one of Webflow's breakpoints [recalled]); a Div `stage` (`position: sticky; top: 0; height: 100svh; overflow: hidden`); inside it a Div `panel` with `data-hinge` and transform origin `0% 100%`, holding the label, the H1 and a Div `logo` with `data-hinge-child` and `aria-hidden="true"`.
- Stages rail: a Section `rail stages-rail` with `data-rail="stages"` (`400svh`), whose stage holds a visually hidden H2 and three Divs with Tag **Figure**, class `card` and `data-stage="0"`, `"1"`, `"2"`. The Tag setting lists Figure but no caption element, so each caption is a text element unless a Code Embed supplies `<figcaption>` [unverified].
- No Webflow scroll interaction or sticky effect on the panel, the logo or the cards: the two scrubbed timelines own their transforms and opacity.
- Inject: an entry in the engine loaded by the [recipe:boot-lenis-gsap] Footer-code loader. It reuses the boot's Lenis and never pins, so no spacer enters the Webflow layout.
- Reduced motion: progress is still tracked. The recipe's `html[data-motion-tier="reduced"]` rule (no transform, full opacity on panel, logo and cards) goes in Head code.

Seen in: `[site:the-line]`, `[site:shopify-editions-w26]`, `[site:mont-fort]`.
