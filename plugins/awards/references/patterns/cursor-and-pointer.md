# Cursor and pointer

What this file is for: the pointer as an affordance system — the cursor that carries mass and meaning, the previews and reveals that chase it, the targets that pull on it, and the drags and holds that ask for a small physical commitment. It records what the corpus does with a fine pointer and what the plugin adds for coarse pointers and keyboards, because no card documents either. Cite as `[pattern:cursor-and-pointer#section]`.

## Two-speed cursor

Why: one element following the pointer is decoration; two elements following it at different rates give the pointer weight, and that weight is what makes a cursor read as part of the world instead of an overlay. Léo Parpeix's cursor is the corpus reference — an inner dot that arrives almost at once and an outer ring that lags it, so every move of the hand registers as a small acceleration [site:leo-parpeix] [recalled medium, from a clone].

| Part | Follow rate | Hover state | Confidence |
|---|---|---|---|
| Dot | lerp .75 per frame (`k ≈ 83` in `damp()`) | shrinks to .7× | [recalled medium], clone |
| Ring | lerp .22 (`k ≈ 15`) | grows to 1.35×; opacity .35 → .8; a dashed orbit spins faster | [recalled medium], clone |
| Curve | the house expo-out, shared with page motion | — | [recalled medium] |

Rules:
- Two rates, one easing token: cursor and page decelerate on the same curve so pointer and layout feel like one hand (`[pattern:motion-vocabulary#easing]`).
- Convert the lerps with `k = −60 · ln(1 − l)` and run them through `damp()` on the shared ticker (`_shared/raf.js`); .75 and .22 were tuned at 60 fps and go stiff at 144 Hz otherwise (`[pattern:motion-vocabulary#damping-math]`).
- Transform only (`translate3d`, `scale`), `pointer-events: none`, `position: fixed`; `mix-blend-mode` only when the ground is one tone. Hide it on window leave (`pointerleave` on the document) and on `visibilitychange`; show it on the next move.
- The native cursor stays on `<input>`, `<textarea>` and `<select>`; hide it only where the custom one truly replaces it.
- Reduced tier: the ring runs at the dot's rate — the lag is spatial motion. Static tier: native cursor.

`[recipe:cursor-two-speed]` ships exactly this: the two rates, the hover scales, `data-cursor` badges, hidden on coarse pointers and on window leave.

## Contextual badges

Why: a cursor that names the gesture replaces a layer of tooltips and lets media stay clean. Léo Parpeix swaps a pill with an SVG icon into the ring over each kind of target — drag on the carousel, play on the reel, view on projects, copy on the email — alternating two accent colours [site:leo-parpeix] [recalled medium]; a fifth badge belongs to its easter egg and is not a pattern [inferred].

Rules:
- Declare the badge on the target (`data-cursor="drag|play|view|copy"`), never inside the cursor's logic; a new component adds an attribute, not a branch.
- The badge is a hint, not the label: the target keeps its own accessible name, because the cursor is invisible to assistive tech and absent on touch.
- Swap badges with an opacity or scale step within `--dur-feedback`; never re-animate the ring's position for a badge change.
- Four or five verbs at most; a cursor vocabulary larger than the site's gesture set is decoration.

## Hover previews and cursor-following reveals

Why: on an index of work, a preview that follows the pointer keeps the list typographic and lets the image arrive only when asked for. One corpus variant survives verification: `[site:leo-parpeix]`'s archive is an **accordion** whose numbered rows expand in place, not a cursor-chasing preview [verified, live bundle 2026-09-18], so the technique below has no corpus exemplar; The Line's about and work lists reveal footage under the pointer through `Cursor`, `CursorPlane` and `HoverReveal` components — whether the plane is GL or CSS is unknown [site:the-line] [verified names].

Rules:
- One preview element per list, repositioned by `damp()` in the loop; swap its source (or GL texture) on row enter and decode the first rows ahead (`img.decode()`).
- The preview is `aria-hidden`; the row is a real `<a>` whose text names the work. On `:focus-visible` the same preview appears, anchored to the row instead of the pointer (`[recipe:hover-preview-list]`).
- Coarse pointer: a static thumbnail in the row, or the row opens on tap — never a hover-only reveal; hover-native lists vanish on touch without such a fallback [site:mindmarket] [inferred].
- Reduced tier: the preview appears in place with an opacity step, no chase.

## Magnetic targets

Why: a button that leans toward the hand confirms it is a target before the click. No card documents a magnetic button — the move is genre-typical rather than a corpus finding [inferred] — so the plugin ships it small and opt-in.

Rules (`[recipe:magnetic-button]`):
- Drive `x`/`y` with `gsap.quickTo()` on the button and a weaker `quickTo` on its label, so ring and label split slightly; fall off with distance (`pull × (1 − d / radius)`, radius ≈ 1.5 × the button's size); return to zero on leave on the house expo-out.
- Fine pointers only (`(hover: hover) and (pointer: fine)`); a magnetic button on touch moves under the thumb.
- Real targets only: primary calls to action, the nav toggle, the sound switch. Magnetic cards or paragraphs are the tell `anti-patterns.md` names.
- `:focus-visible` shows the hover state without displacement; the reduced tier drops the pull.

## Drag affordances

Why: dragging is the one gesture that makes a gallery feel handled rather than paged, and the corpus uses it for fields, rails and objects.

| Affordance | Mechanism | Site | Confidence |
|---|---|---|---|
| Infinite draggable plane | wheel and touch push a 2D field of planes; an item recycles to the far edge once it passes 60 % of the viewport, with a fresh random tilt | [site:floema] | [verified], clone |
| Arc gallery | horizontal drag; per-item rotation from `mapRange(−.2, .2)` plus a cosine vertical offset, so the row bows like a dial | [site:floema] | [verified], clone |
| Draggable project carousel | lazy WebP slides under a `drag` badge | [site:leo-parpeix] | [recalled medium] |
| Hero object with momentum | drag inertia on one mesh; lighting answers the motion | [site:oryzo] | [recalled high], numbers unknown |
| Auto-drifting carousel | auto-speed tweened to 0 on grab and back on release (500 ms each); wheel lerped at .2 into the same value; `releaseStiffness` default 80 | [site:animejs] | [verified] |

Rules:
- Inertia through the same damping as everything else; clamp velocity; `setPointerCapture` so a fast drag survives leaving the element.
- Show the gesture: a `drag` badge on fine pointers, an edge peek or scrollbar on coarse ones.
- Every dragged item stays a real link in a list. Floema's items are not focusable and the site has no keyboard path [site:floema] [verified absence]; the plugin's version moves the scroll target one item per arrow key.
- On touch, a horizontal drag rail becomes native `overflow-x: auto` with scroll snap (`[pattern:responsive-strategy#coarse-pointer-swaps]`).

## Hold gates

Why: a hold asks for a commitment a click does not, and it can pace a story. Why Zero joins its stages with five gates — a drawn shape, a hold that shatters, a hold that launches — and owning the input is what lets it pause and redirect the flow [site:why-zero] [verified]; Son Daven's seasonal compare is a **drag**, and not a mask: a handle is dragged along an SVG path via `getPointAtLength`, `cursor` flips `grab`/`grabbing`, it snaps to either end on release, and at the 0.4/0.5 thresholds it programmatically clicks the real season buttons underneath [site:son-daven] [verified, live source 2026-09-18]. The buttons are the reason it works without a pointer at all.

Rules:
- A hold fills visibly (ring, bar or mask) and completes in ≈ .8–1.2 s; releasing early rewinds rather than resets — a plugin default, since no card publishes hold timings.
- Pointer capture again, and `touch-action: none` on the gate only.
- A skip control sits beside every gate; a gate that blocks content with no second path is the click-to-enter wall in another costume (`[pattern:preloaders-and-transitions#the-load-contract]`).
- `[recipe:compare-hold-drag]` covers the two-condition reveal with pointer capture and arrow keys.

## Coarse-pointer policy

Why: there is no hover on a phone, and a cursor drawn under a thumb is a bug. Léo Parpeix suppresses the whole cursor system on `(hover: none), (pointer: coarse)` [site:leo-parpeix] [recalled medium]; the audit checks for the guard [A08].

- Cursor off; hover previews become thumbnails or taps; magnetic pull off; drag rails become native overflow; hold gates keep working with a larger target.
- Test by emulation and on a device. `pointer: coarse` also matches touch laptops, so keep the fine state reachable when a mouse is present (`any-pointer: fine`).

## Keyboard equivalents

Why: none of the affordances above has keyboard evidence anywhere in the corpus, and the audit fails a pointer-only handler [A11]. This is where new work beats the reference set.

| Pointer gesture | Keyboard path |
|---|---|
| Hover preview | `:focus-visible` on the row shows the same preview |
| Drag a field or rail | arrow keys move one item; Home/End jump; the item stays a link |
| Hold gate | Enter or Space held, or pressed once with a visible countdown; a `Skip` button beside it |
| Compare reveal | arrow keys move the divider in 5 % steps; Home/End to either condition |
| Magnetic button | Tab focuses it; Enter activates; no displacement |
| Cursor badge | the target's accessible name says the verb |

Real controls only — `<a>` and `<button>`, never a `div` with a click handler [A05].

## Verify

- [ ] Dot and ring at two rates through `damp()`, on the shared ticker, on the house curve.
- [ ] Cursor hidden on coarse pointers, on window leave and when the tab is hidden; native cursor on form fields.
- [ ] Badges declared by `data-cursor` on targets; every target has its own accessible name.
- [ ] Hover previews appear on focus; coarse pointers get thumbnails or taps.
- [ ] Magnetic pull only on real targets, fine pointers only, off under reduced motion.
- [ ] Drags use pointer capture and clamp velocity; arrow keys move one item; touch gets native overflow.
- [ ] Every hold gate has a visible fill, a rewind on release, a keyboard hold and a skip.

## Refuse

- A single dot as the "custom cursor"; trails, glitter or particles behind the pointer.
- A custom cursor with no coarse-pointer guard, or one that hides the native cursor on inputs.
- Hover-only previews and drag-only galleries.
- Magnetic cards, paragraphs or whole sections.
- Badges that stand in for accessible names.
- A hold gate with no skip; a drawn gesture as the only way in.
- Léo Parpeix's dashed orbit, badge set and colours, or Floema's recycling field and arc as drawn.
