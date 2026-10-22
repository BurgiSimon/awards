# image-trail-cursor

As a mouse crosses the hero, small pictures land behind it: one every 80 px of travel along the pointer's path. Each grows in, holds for half a second, then fades in the order it arrived. Twelve picture elements exist, and the thirteenth reuses the oldest. A faster hand leaves larger, more tilted pictures, inside a clamp. A picture that would touch the heading or the copy beside it is skipped, so the trail breaks around the words and never lies on them. The native cursor stays. On a touch screen, under reduced motion, in the static tier and without JavaScript, the hero shows three still pictures placed by the design. They are also the hero's rest frame on desktop: they step aside while a trail is alive and return after it.

## Why
- **The corpus records it, and the plugin refuses its loudest form.** A cursor trail of fifteen copies of a small image, with the system cursor hidden on every element `[site:mensch]`. `[pattern:cursor-and-pointer#refuse]` names that trail, and trails behind the pointer as decoration in general. This recipe is the bounded version that earns a place: one hero instead of the whole site, the native cursor kept, a fixed pool, protected copy, and nothing on a coarse pointer or with reduced motion.
- **Distance, not time.** Travel accumulates along the path, and a picture lands at every 80 px mark. Each mark is placed on the segment between two pointer events, not at the event, so a fast hand and a slow one leave the same density. A timer-based trail clumps when the hand slows and thins when it speeds up. A pointer that teleports lays at most four pictures per event and drops the rest.
- **A fixed pool, recycled oldest first.** The twelve `<span>`s are written once in the HTML. A spawn takes slot `spawns mod 12` and moves it with `transform` and `opacity` only. A newer picture always stacks above an older one through a rising `z-index`. Nothing is created or removed while the pointer moves.
- **Fade in arrival order.** Each picture starts to fade `.5 s` after its birth, and never sooner than `60 ms` after the one before it. A burst therefore dissolves from its tail, not all at once.
- **Speed, clamped.** Pointer velocity is smoothed with a `50 ms` time constant. Speed maps to size from `.8×` at rest to `1.25×` at `2 px/ms` and above. Horizontal speed maps to tilt at `6°` per px/ms, clamped to `±8°`, plus a `±3°` sway cycled over four pictures, so a steady stroke is not a rigid belt. Nothing grows past the layout (`[pattern:motion-vocabulary#velocity-as-an-input]`: clamp it, let it settle).
- **The copy is protected.** Each `[data-trail-protect]` element gives a protected rectangle, padded `12 px`, in hero coordinates. The heading's rectangle is its text box (a `Range`), not its full-width block. A picture is laid only if its full-size box, widened `8 px` for the tilt, clears every protected rectangle. Pictures stay `pointer-events: none`, so even a picture near the call to action never takes a click.
- **One clock, nothing idle.** Ages advance on the shared ticker (`_shared/raf.js`), which is subscribed only while a picture is alive. An `IntersectionObserver` disarms the trail as soon as the hero leaves the screen and returns every picture to the pool. Pointer moves read no layout: the hero's page origin is measured on arm, on resize and after fonts load.

## Parameters
Spacing `80 px` of travel, at most `4` per event · pool `12` · picture `clamp(80px, 7vw, 120px)` wide, `4:5`, six CSS-drawn designs cycled · in `.32 s` expo-out from `.6×`, opacity over `.12 s` · hold `.5 s` from birth · fade stagger `≥ 60 ms` in arrival order · out `.45 s` ease-in to opacity 0 and `.86×` · size `.8–1.25×` from smoothed speed (`τ 50 ms`, saturating at `2 px/ms`) · tilt `6°` per px/ms clamped to `±8°`, plus a sway of `−3, 2, −1, 3°` · protected areas padded `12 px`, picture box widened `8 px` · stills fade out over `--dur-feedback` while trailing and back over `--dur-routine` after `.4 s`.

## Accessibility
- The trail layer is `aria-hidden="true"`, `inert` and `pointer-events: none`. It holds no focusable element and no text, so it never reaches the accessibility tree, never takes focus and never sits between the pointer and a link. The stills are `aria-hidden` too. The verifier reads the hero's ARIA snapshot and finds only the heading, the copy and the link.
- The native cursor is never hidden. The trail follows it and does not replace it.
- It is armed only under `(pointer: fine) and (hover: hover)`, the same guard as `[recipe:cursor-two-speed]` and `[recipe:magnetic-button]`, and it ignores `pointerType: 'touch'` on hybrid devices (`[pattern:cursor-and-pointer#coarse-pointer-policy]`).
- Keyboard users lose nothing: the trail carries no information, and the copy says what a mouse would do. Focus is never moved.

## Motion tiers
- **Full:** the trail, with the stills as the rest frame.
- **Reduced** (`prefers-reduced-motion` or `html[data-motion="reduced"]`): no trail is armed. The three stills stand where the design put them, with no fade.
- **Static** (`html[data-motion="static"]`, live): the same as reduced. Switching tier mid-trail releases every picture at once.
- **Coarse pointer:** the same frame. On a phone the stills join the flow above the copy, centred in the open ground, so they can never sit on the text.

## Adapters
- **Real images:** give each picture a `background-image` (or an `<img alt="">` inside the span) from a list of 6–12 small files. `decode()` them once on arm so the first lap never shows an empty frame, and keep them under ~40 KB each. The pool, spacing and timings do not change.
- **GSAP:** keep the spacing and the pool, and replace the frame loop with one `gsap.timeline()` per spawn on the item (`fromTo` scale and opacity, then the fade at `fadeAt`). Kill the item's previous timeline before reusing its slot.
- **React:** render the twelve spans once and keep the pool, travel and velocity in refs (never state). Attach `pointermove` to the hero ref in an effect that also creates the `IntersectionObserver`, and clean both up.
- **Vue / Svelte:** the same in `onMounted` / an action on the hero. Use `v-for` / `{#each}` over a fixed array of 12 that is never re-rendered by the trail.
- **Astro:** the hero is static HTML, with the stills already in it. Ship `main.js` as a client script, and the page stays complete without it.

## Verify
`verify.mjs` drives a real mouse in headless Chromium:
- **Straight path:** 1200 px lays exactly 15 pictures, 80 px apart. Twelve elements exist, at most 12 are alive at once, and 3 slots are recycled. Fades start at least 60 ms apart in arrival order. Every picture returns to the pool and the ticker leaves.
- **Diagonal across the heading:** marks there are skipped, and no picture's box touches the heading's text box or any padded protected area.
- **Speed:** a slow stroke lays `.93×` pictures tilted about `3.5°`, a fast one `1.25×` tilted up to `11°`, all inside the clamp.
- **Focus:** a focused link keeps focus while the trail runs, and the layer stays `aria-hidden`, `inert` and `pointer-events: none`.
- **Off screen:** scrolling the hero away pauses the trail, releases every picture and stops the ticker.
- **Reduced motion, static tier and a 390 px phone with a coarse pointer:** no picture at all, three stills clear of the heading, and no horizontal overflow.

## Synthetic content
The heading, the copy and the five rules are written for this demo. The pictures are CSS gradients drawn from the tokens, so the recipe ships no image or font files.

## When not to use it
On a page whose hero is for reading: a trail competes with the first sentence. On every element of a site: that is the refused form. Behind a hidden system cursor: keep the cursor and let the trail follow it.

Seen in: `[site:mensch]`.
