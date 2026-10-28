# prism-flip-label

Links whose labels turn like a small block. Each label becomes a CSS 3D box with the label on its front face and a copy on the face below; hover or keyboard focus turns the box a quarter about X, so the copy rolls up into the label's exact place. Header cells roll to an inked cell, footer links to an inverted tile, and a `letters` variant turns one block per letter with a stagger. The accessible name is always the one real label, touch gets a press state instead of a turn, and reduced motion swaps the two faces by colour without rotating anything.

## Why
- **A label that turns reads as an object, not a highlight.** On the source site every nav cell is a prism that turns a clone face into view: the face goes `rotateX(90deg) translateZ(var(--flip-depth)) translateY(-50%)`, the depth is half the row height and the perspective is `1000px` `[site:warmnfuzzy]` [verified, `0lbgeuh6in.p_.css`]. Here the box turns rather than the face, and the depth is measured from the box itself, so a label that wraps to two lines still turns about its own centre and the front face rests exactly in the page plane (the verifier checks both to the pixel).
- **One name, however many faces.** The copy is `aria-hidden`; the letters variant hides its letter boxes and names the link with a visually hidden span, so the accessibility tree reads "The Lantern Keeper", not sixteen letters or the title twice (checked in the ARIA snapshot). A per-character roll of a duplicated label with an `aria-hidden` copy is the same arrangement another corpus site ships `[site:seasats]` [verified].
- **The keyboard gets the turn too.** The source has no skip link and only two `focus-visible` rules, and the card asks for `:focus-visible` to drive the same turn as hover `[site:warmnfuzzy]` [verified]; the motion vocabulary says the same of every hover shift `[pattern:motion-vocabulary#hover-shifts]`. Focus turns the cell, and its ring is drawn by a layer above the box, since an outline is painted under 3D faces.
- **The routine band, not the hover band.** The hover-shift rule asks for 300 ms or less; this turn runs 400 ms (`--dur-routine`) because a quarter turn of a whole cell is a small set-piece rather than feedback, and the source takes `.5s` `[site:warmnfuzzy]` [verified]. That is the plugin's choice; drop it to `--dur-feedback` where many prisms sit close together. The siblings dim to `.55` (the source uses `.5`) so the dimmed labels stay readable.
- **No hover, no turn.** A touch screen fires hover only on tap, a frame before navigating, so the turn is gated by `(hover: hover)` and a press fills the label instead.

## Parameters
| | |
|---|---|
| Depth | `d = box.offsetHeight / 2`, measured on load, after fonts and on a `ResizeObserver`, written as `--depth` |
| Rest | box `translateZ(-d) rotateX(0deg)`; front face `translateZ(d)`; copy `rotateX(-90deg) translateZ(d)`, absolutely over the front face's box; `backface-visibility: hidden` on both |
| Turn | box `translateZ(-d) rotateX(90deg)` on `:hover` (inside `@media (hover: hover)`) and on `:focus-visible`; `transform 400 ms cubic-bezier(.16, 1, .3, 1)` |
| Perspective | `1000px` on the box's parent: the link, or the word in the letters variant |
| Letters | one box per grapheme (`Intl.Segmenter`), `transition-delay: i × 24 ms`; words are `inline-flex` wrap units (a word moves to the next line whole, and breaks between letters only if it alone is wider than the line); the row carries the label's own `dir`, so a Latin title still reads left to right on a right-to-left page. Not for joined scripts such as Arabic, where separate boxes break the shaping: use the whole-label prism there |
| Faces | header cell: transparent, then ink with paper text; footer link: paper tile on the ink footer; letters: ink, then madder red |
| Siblings | the other header cells fade to `.55` over 400 ms while one is hovered |
| Focus ring | header cells: a 2 px `::after` border in the paper colour, inset 7 px, `z-index: 1` above the box; letters and footer links: a 2 px outline outside the link |
| Press | `:active` fills the front face (ink on the cells, paper on footer links, madder letters); iOS Safari applies `:active` only once the page has some touch listener, which most sites already register |
| Reduced / static | no transforms and no transform transition; the copy lies over the label and the faces cross-fade over `--dur-routine` (120 ms under the media query); static cuts |

## Tiers
- **Full:** the quarter turn on hover and focus, the letter stagger, the sibling dim.
- **Reduced:** the faces swap in place: the label fades out as the copy, in its other colours, fades in. Nothing rotates or moves.
- **Static:** the same swap as a cut.
- **Forced colours:** no transforms, no copy: the plain label, with the system's own focus colours.
- **No JavaScript:** plain links with their labels; the faces are built by the script.

## Accessibility
Every prism is a real link whose name is its visible label. The copy face is `aria-hidden="true"`; in the letters variant the whole letter row is hidden and a visually hidden span carries the name, so screen readers never spell a title letter by letter. Keyboard focus produces the same turn as hover plus a visible ring above the turned face. The header cells are 64 px tall (56 px on phones) and the footer links at least 48 px. The turn is decoration on top of a label that is already readable, so nothing depends on seeing it. Under forced colours the label is shown flat with no copy.

## Adapters

### React / Next
A `<PrismLink href label>` that renders the box with both faces in JSX (`aria-hidden` on the copy) and measures `--depth` in a `useLayoutEffect` with a `ResizeObserver`; if the label never wraps, skip the script and set `--depth: calc(0.5em * var(--line-height))` in CSS. For the letters variant, map the label to `<span className="prism__box" style={{ '--i': i }}>` per character inside word spans, with the label in a visually hidden span.

### Svelte
An action, `use:prism`, that builds the faces from the node's text on mount and observes its size; or write the faces in the component's markup and keep only the measuring in the action. The tier classes come from the same `reduced-motion` module.

### Webflow
- Designer: a Link Block holding a Div (`prism__box`) with two Text Blocks (`prism__face--front`, `prism__face--next`, the second with the custom attribute `aria-hidden="true"`), both with the same text; the CSS above in an Embed.
- Inject from Footer code only the measuring loop that writes `--depth`, or fix `--depth` per breakpoint in the Embed when labels are a single line.
- Webflow interactions cannot express `:focus-visible`; keep the turn in CSS, not in an Interaction.

Seen in: `[site:warmnfuzzy]`.
