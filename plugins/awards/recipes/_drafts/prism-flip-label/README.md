# prism-flip-label

Links whose labels turn like a small block. Each label becomes a box with the label on its front face and a copy folded under it; hover or keyboard focus turns the box a quarter about X, so the copy rolls up into the label's exact place. Header cells roll to an inked cell, footer links to an inverted tile, and a `letters` variant turns one block per letter in a capped wave. At rest every box is flat, so a page of prisms holds no 3D layers; the accessible name is always the one real label, touch gets a press state instead of a turn, and reduced motion swaps the two faces by colour without rotating anything.

## Why
- **A label that turns reads as an object, not a highlight.** On the source site every nav cell is a prism that turns a clone face into view: the face goes `rotateX(90deg) translateZ(var(--flip-depth)) translateY(-50%)`, the depth is half the row height and the perspective is `1000px` `[site:warmnfuzzy]` [verified, `0lbgeuh6in.p_.css`]. Here the whole box turns about an axis set back by its own measured half-height (`transform-origin` z), so a label that wraps to two lines still turns about its own centre and the copy lands exactly on the link. The verifier checks both to the pixel: on the header cells, and on a footer link whose column is narrowed until it wraps.
- **Flat at rest, 3D only while it turns.** The source applies `perspective` only while a face moves `[site:warmnfuzzy]` [verified]. This goes further, as the plugin's own choice: `preserve-3d`, `backface-visibility` and the copy's fold apply only while a label is hovered or focused, and are held until the turn back ends. With those set on all 73 boxes at rest, the demo held about 240 compositor layers; it now holds none for the prisms, and only the label that is turning gets layers (the verifier reads the layer tree over CDP).
- **One name, however many faces.** The copy is `aria-hidden`; the letters variant hides its letter boxes and names the link with a visually hidden span, so the accessibility tree reads "The Lantern Keeper", not sixteen letters or the title twice (checked in the ARIA snapshot). A per-character roll of a duplicated label with an `aria-hidden` copy is the same arrangement another corpus site ships `[site:seasats]` [verified].
- **The keyboard gets the turn too.** The source has no skip link and only two `focus-visible` rules `[site:warmnfuzzy]` [verified]. Letting `:focus-visible` drive the same turn as hover is the plugin's choice, which the card's take-away also asks for and the motion vocabulary asks of every hover shift `[pattern:motion-vocabulary#hover-shifts]`. Focus turns the cell, and its ring is drawn by a layer above the box, since an outline is painted under 3D faces.
- **The routine band for a whole label, the hover band for a letter.** The hover-shift rule asks for 300 ms or less. A header cell takes 400 ms (`--dur-routine`) because a quarter turn of a whole cell is a small set-piece rather than feedback, and the source takes `.5s` `[site:warmnfuzzy]` [verified]; that is the plugin's choice, so drop it to `--dur-feedback` where many prisms sit close together. Each letter turns in 300 ms on a cubic out, the house curve of the per-character roll `[site:seasats]` [verified], and the stagger is capped so the wave across a title spans at most 400 ms, inside the motion vocabulary's rule for text staggers `[pattern:motion-vocabulary#staggers]`. The longest title has finished 700 ms after the pointer arrives.
- **Shaded by the turn.** The light comes from above: the face turning up and away brightens and the face coming up from below starts in shade, on the turn's own timing. A letter caught mid-turn then reads as the side of a block rather than a squashed glyph. That is the plugin's choice.
- **Dim the siblings, but keep them readable.** The source dims idle faces to `.5` `[site:warmnfuzzy]` [verified]. On this rose ground that would leave the 14 px bold labels at 3.1:1, so the siblings dim to `.66` (4.8:1), and the cell that has keyboard focus is never dimmed.
- **No hover, no turn.** A touch screen fires hover only on tap, a frame before navigating, so the turn is gated by `(hover: hover)` and a press fills the label instead.

## Parameters
| | |
|---|---|
| Depth | `d = box height / 2`, written as `--depth` by a `ResizeObserver` on every box: a font swap, a resize or a narrower column re-measures it, the size comes from the observer (nothing is read back from layout) and only a changed value is written |
| Rest | box flat (`transform: none`, `transform-style: flat`); the copy `visibility: hidden` at `top: 100%`, folded `rotateX(-90deg)` about its top edge; no 3D compositor layer |
| Turn | on `:hover` (inside `@media (hover: hover)`) and `:focus-visible`: box `preserve-3d`, `rotateX(90deg)` about `transform-origin: 50% 50% -d`; faces `backface-visibility: hidden`; copy visible. Whole labels: `400 ms cubic-bezier(.16, 1, .3, 1)` |
| Hold | leaving, `transform-style` and `backface-visibility` return only after the turn back (`0s` transitions delayed by the turn, `transition-behavior: allow-discrete`); the copy's `visibility` transitions over the turn, so it hides at the end |
| Perspective | `1000px` on the box's parent (the link, or the word in the letters variant); it promotes nothing while the box is flat |
| Letters | one box per grapheme (`Intl.Segmenter`); `300 ms cubic-bezier(.215, .61, .355, 1)` each; stagger `min(40 ms, 400 ms / (letters − 1))`, so 40 ms for "Moth Season" and 26.7 ms for the 16 letters of "The Lantern Keeper", and every title finishes by 700 ms; words are `inline-flex` wrap units (a word moves to the next line whole, and breaks between letters only if it alone is wider than the line); the row carries the label's own `dir`, so a Latin title still reads left to right on a right-to-left page. Not for joined scripts such as Arabic, where separate boxes break the shaping: use the whole-label prism there |
| Shading | on the turn's own duration, curve and delay: the outgoing face brightens (cells: transparent to `--lit-ground`; letters: ink to `--lit-ink`; footer: transparent to `--lit-footer`), the incoming face comes up out of shade (letters: `--shade-accent` to madder; footer tile: `--shade-ground` to paper) |
| Faces | header cell: transparent, then ink with paper text; footer link: paper tile on the ink footer; letters: ink, then madder red |
| Siblings | the other header cells fade to `.66` over 400 ms while one is hovered (a cut in static), never the cell with keyboard focus |
| Focus ring | header cells: a 2 px `::after` border in the paper colour, inset 7 px, `z-index: 1` above the box; letters: a 2 px outline 4 px outside the link (2 px on phones); footer links: 2 px at 3 px |
| Press | `:active` fills the front face (ink on the cells, paper on footer links, madder letters); the module sets an empty `ontouchstart` handler on the document, without which iOS Safari never applies `:active` |
| Reduced / static | no transforms and no transform transition; the copy lies over the label and the faces cross-fade over `--dur-routine` (120 ms under `prefers-reduced-motion`; 400 ms when a site sets `data-motion="reduced"` itself); static cuts, the sibling dim included. A change to `data-motion` on `<html>` is followed at once |

## Tiers
- **Full:** the quarter turn on hover and focus, shaded faces, the capped letter wave, the sibling dim.
- **Reduced:** the faces swap in place: the label fades out as the copy, in its other colours, fades in. Nothing rotates or moves.
- **Static:** the same swap as a cut, and the sibling dim cuts too.
- **Forced colours:** no transforms, no copy: the plain label, with the system's own focus colours.
- **No JavaScript:** plain links with their labels; the faces are built by the script.

## Accessibility
Every prism is a real link whose name is its visible label. The copy face is `aria-hidden="true"` and, at rest, `visibility: hidden`, so it is not read, found or selected; in the letters variant the whole letter row is hidden and `user-select: none`, and a visually hidden span carries the name, so screen readers never spell a title letter by letter and a selection copies the title once. Keyboard focus produces the same turn as hover plus a visible ring above the turned face. Targets: header cells 64 px tall (56 px on phones), footer links at least 48 px, film titles 44.6 px or more on a 390 px phone. The turn is decoration on top of a label that is already readable, so nothing depends on seeing it. Under forced colours the label is shown flat with no copy.

The letters variant has two limits: find-in-page matches the visually hidden label, so its highlight is not seen, and machine translation translates that label but not the letters on screen. Keep it to display titles that are names or are not translated, and use the whole-label prism for everything else.

## Adapters

### React / Next
A `<PrismLink href label>` that renders the box with both faces in JSX (`aria-hidden` on the copy) and observes the box in a `useLayoutEffect` with a `ResizeObserver` that writes `--depth`; where a label can never wrap, skip the script and fix `--depth` in CSS (half the cell height). The tier classes go on `<html>` from the same `reduced-motion` module. For the letters variant, map the label to `<span className="prism__box" style={{ '--i': i }}>` per grapheme inside word spans, set `--steps` on the row, and put the label in a visually hidden span.

### Svelte
An action, `use:prism`, that builds the faces from the node's text on mount and observes its boxes' sizes; or write the faces in the component's markup and keep only the measuring in the action. The tier classes come from the same `reduced-motion` module.

### Webflow
- Designer: a Link Block holding a Div (`prism__box`) with two Text Blocks (`prism__face--front`, `prism__face--next`, the second with the custom attribute `aria-hidden="true"`), both with the same text; the CSS above in an Embed.
- Inject from Footer code only the observer that writes `--depth`, or fix `--depth` per breakpoint in the Embed when labels are a single line; add the empty `document.ontouchstart` handler there too.
- Webflow interactions cannot express `:focus-visible` or the held 3D state; keep the turn in CSS, not in an Interaction.

Seen in: `[site:warmnfuzzy]`, `[site:seasats]`.
