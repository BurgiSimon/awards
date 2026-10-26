# wordmark-header-handoff

The giant name in the hero and the small logo in the header are the same link. It is laid out in the header slot (`position: fixed`), and a transform draws it over a reference box in the hero. As the hero scrolls away the transform unwinds to identity, and the name docks in the bar. The nav underline beside it eases both edges toward the active chapter's link.

## Why
- **One element, one name, one focus ring.** A screen reader meets the brand once, as a link with an accessible name. A keyboard user tabs to it once. There is no second "logo" copy to keep in sync. `[site:oryzo]` drives its header logo this way, from the hero's scroll ratio [verified, `hoisted.CRsATKbF.js`, `siteHeader.setLogoTransform`, 2026-10-26].
- **The transform follows the hero, then lets go.** At the top the mark scrolls with the hero's reference box, so it reads as part of the page. Over the first 60 % of the hero it eases (cubic in-out) into the slot. No layout property ever animates.
- **Painted, not composited.** The mark carries no `will-change` and a 2D transform only. On a composited layer the browser keeps the raster of the 28 px logo and stretches it up to ten times (1,320 px of hero over a 132 px slot at 1440) into a blurred hero mark. Painted in place, the word is rasterised at every scale it passes through. The cost is one word repainted per scroll frame, and only during the hand-off.
- **An underline that lands and stops.** Both edges move by `1 − e^(−10·dt)` toward the target link and snap the last 0.05 px. The motion is frame-rate independent, and once settled the loop writes no styles.

## Parameters
| | |
|---|---|
| Hand-off | over `scrollY / (hero height × .6)`, cubic in-out; scale from `reference width / slot width` to 1 |
| Slot | 132 × 28 px on desktop, 96 × 20 px under 760 px |
| Underline | edges eased at `1 − e^(−10·dt)`; snap under .05 px; active chapter = the last chapter whose top is above the viewport middle; `aria-current` on its link |

## Tiers
- **Full:** as above.
- **Reduced motion and static:** the link stays in the bar from the first frame. A decorative `aria-hidden` copy of the name fills the hero and fades out (opacity only) when the hero is half gone. The underline jumps rather than eases.

## Accessibility
The mark is a real link with an `aria-label`, reachable on the second Tab, with a visible `:focus-visible` ring. The hero's heading is a separate `h1` sentence, so the brand name never has to double as the page title. The nav links are 44 px tall.

## Adapters

### Webflow
- Designer: a fixed Navbar with an empty Div `bar__slot` and the logo Link Block `mark` (also fixed, the same box as the slot). In the hero, an empty Div `hero__ref` sized to the big name's box.
- Inject from Footer code: the module measures the slot and the reference box on load and resize and writes only `transform` on the link. Do not attach a Webflow interaction to the logo; one owner per property.
- Reduced motion: add the decorative hero copy as a Text Block with `aria-hidden="true"`, hidden by default and shown only under `prefers-reduced-motion` in Head code.

Seen in: `[site:oryzo]`.
