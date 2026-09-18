# AWARDS.md — award-level build contract

<!-- awards:schema 1 · written and read by the awards skills · keep the sections in this order -->

## Status
- [x] Brief captured
- [x] Direction contract locked (concept)
- [x] Visual system written (system → DESIGN.md, tokens.css)
- [x] Page map and skeleton built (structure)
- [x] Stack booted (stack)
- [x] Motion score authored and built (motion)
- [x] WebGL layer built or explicitly declined (webgl)
- [x] Jury disposition: fix
- [ ] Shipped (ship)

## Brief
- **Subject:** Ferro Cycles, a one-person steel frame workshop in Bristol
- **Unique mechanism (what only this subject can prove):** every frame is brazed by the same pair of hands, and the rider's measurements set each tube length
- **Audience and their real scene:** riders on a two-year waiting list, reading on a phone between rides
- **Stakes and conversion (what a visitor should do, matched to the price of the decision):** book a paid two-hour fitting, not an instant checkout
- **Assets on hand:** workshop photography, no video, no 3D; copy written by the builder
- **Binding constraints:** Vite, static hosting, no CMS, WCAG 2.2 AA
- **Routes:** single page
- **Sound:** none
- **Visitor mode:** persuade

## Direction contract
- **THESIS:** a frame is a record of one fitting. The category default it refuses: the hero shot of a bike leaning on a wall. The Awwwards default it refuses: a physics playground with nothing to buy.
- **WORLD:** warm paper ground, one oxide red, ink near-black; a grotesque for headings and the same family at text size; brushed steel and dry paint as the only materials.
- **STORY:** four workshop stages as chapters — measure · braze · paint · the build. Entrance on the fitting jig, hold on the torch, exit on the finished frame. The interruption is the waiting list. The close is the fitting booking.
- **FIRST VIEWPORT:** headline set to fourteen characters a line at the left third, the fitting photograph bled to the right edge, the booking link on the baseline of the headline.
- **SIGNATURE:** the build chapter pins and the frame assembles tube by tube with scroll. It enacts brazing order. On touch it advances on scroll the same way; on keyboard the chapter is a list of stages; under reduced motion the finished frame is shown at once. Tier 2, no WebGL.
- **SCROLL MODEL:** native scroll with Lenis, one pinned stage in the build chapter — the story is read, not flown through.
- **LOAD & CLOSE:** a counter held until the first two photographs decode; the last screen is the fitting form with the current slot year.
- **DIVERGENCE:** `[site:mont-fort]` — the editorial spine, refusing its full-bleed video hero. `[site:white-desert]` — the material restraint, refusing its centred serif lockup. `[site:son-daven]` — the pinned assembly idea, refusing its cursor-led navigation.
- **FINISH:** unreviewed and unshipped is unfinished — this build ends with a jury disposition and a ship report.
- **Seed:** ferro-2026-02

## Page map
| # | Chapter / route | Beat (entrance · hold · exit) | Components (recipe ids) | Notes |
|---|---|---|---|---|
| 0 | Preloader | hold on the counter | `[recipe:preloader-counter-hold]` | real signal: two decoded photographs |
| 1 | Hero | entrance | `[recipe:split-text-masked-reveal]` | headline reveals once, never on re-entry |
| 2 | Measure · Braze · Paint | hold | `[recipe:sticky-stack-cards]` | three chapters, one rhythm |
| 3 | The build | hold | `[recipe:scroll-pin-scrub]` | the signature, one pin only |
| 4 | Waiting list | exit | `[recipe:marquee-raf-mask]` | the interruption, slot years scrolling |
| 5 | Book a fitting | exit | — | form, then footer |

## Motion score
| Moment | Trigger | Vocabulary (ease · duration · stagger) | Reduced-motion tier | Recipe |
|---|---|---|---|---|
| Headline reveal | load, after preloader | power3.out · 0.9s · 0.06s lines | static | `[recipe:split-text-masked-reveal]` |
| Chapter entrances | scroll, once | power2.out · 0.7s · 0.12s | reduced: opacity only | `[recipe:sticky-stack-cards]` |
| Frame assembly | pinned scrub | linear · scrub 0.6 | static: finished frame | `[recipe:scroll-pin-scrub]` |
| Slot marquee | always | linear · 24s loop | paused | `[recipe:marquee-raf-mask]` |

## Budgets & tiers
- Entry JS (gz): 48 KB · GL chunk (gz): none · Textures per scene: none · Fonts (files / KB): 0 / 0, system stack · LCP target: 2.0s on 4G · Tiers: high / mid / low → full · reduced stagger · static

## Jury log
<!-- appended by awards:jury — date · disposition · D/U/C/Co · dev sub-scores · top fixes -->
- 2026-02-11 · fix · D 7.6 / U 7.2 / C 7.8 / Co 7.5 · top fixes: the pinned chapter traps the keyboard, the paint photograph has no alt text, the mouse parallax on the headline fights the reveal.

## Ship log
<!-- appended by awards:ship — date · audit summary · captures · performance numbers -->

## Exceptions
<!-- audit rule ids deliberately accepted, one per line: `C02 — pure black is diegetic (night-vision console)` -->
