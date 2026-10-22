# physics-pile-matter

A section's words as a heap of rigid bodies. Fourteen labelled pieces (pills, circles and blocks) drop into a bounded box when it scrolls into view, collide, pile up along the floor and go still. matter-js does the physics with no renderer of its own: each piece is the list item itself, moved by a `transform` written from its body's position and angle, so the words stay text in source order. A fine pointer can drag a piece, the keyboard and a tap can toss one, and the simulation leaves the clock once every body sleeps.

Synthetic content: the letterpress drawer, its fourteen pieces and every line of copy are invented for the recipe. Nothing of the source's fruit, dome, counter or palette is reused.

## Why
- **The pile is the idea, so a physics engine earns its weight.** A heap of the brand's own things says more than a bar, and when many shapes have to collide, settle on each other and rest, a rigid-body solver is cheaper to get right than a hand-rolled one: Agrumea Farm drops its fruit as matter-js bodies onto a static dome under strong gravity, with sleeping on `[site:agrumeafarm]` `[pattern:preloaders-and-transitions#preloader-archetypes]`. This recipe takes the move out of the loader and into a section, with DOM pieces instead of SVG hulls.
- **The DOM is the render.** No `Matter.Render`, no canvas: every `<li>` is placed absolutely at the box origin and moved by `translate(x − w/2, y − h/2) rotate(angle)`. Find-in-page, selection across the section, translation and the accessibility tree all read the words in the order the HTML lists them, whatever heap the physics makes.
- **One clock, fixed step.** `Engine.update(engine, 1000 / 60)` runs from the shared ticker (`_shared/raf.js`) through an accumulator capped at four steps a frame: no `Runner`, no second `requestAnimationFrame`, the same pile at 60 Hz and 120 Hz, and no spiral after a slow frame. The drop is seeded (drop order, x band, tilt), so a load always makes the same heap.
- **Asleep means off the ticker.** `enableSleeping` with a `sleepThreshold` of 40 steps; when every body sleeps the callback unsubscribes and the shared ticker stops requesting frames. A pointer press, a key, a tap or a change in the box's size (a `ResizeObserver` on the frame) wakes it. A pile still trading micro-jitters after ten seconds awake is put to sleep rather than stepped for ever. The steps also pause while the box is off screen.
- **Walls rebuilt, not stretched.** On resize the floor and walls are rebuilt for the new frame, pieces whose size changed (the type is fluid) get new bodies at the same pose, and anything now outside the walls is moved back in before the pile wakes and settles again.
- **The drag is scoped.** `Mouse.create` binds the list only, and its `wheel` (which calls `preventDefault`) and touch listeners are removed at once, so the page still scrolls over the box with a wheel or a finger (`references/stacks/matter-js-0.20.md`, gotchas). A release or move outside the box is forwarded so a piece never sticks to the hand, and the mouse point is clamped inside the walls.

## Parameters
Step `1000 / 60` ms, at most `4` a frame · gravity `y 2.4` (scale `.001`) · bodies `restitution .12`, `friction .6`, `frictionStatic .9`, `frictionAir .015`, `density .002`, `sleepThreshold 40` · solver `positionIterations 8`, `velocityIterations 6` · walls `400` px thick, inset `--pad: 10px` from the clip, a lid added once every piece is below it · drag constraint `stiffness .2`, `damping .1`, `angularStiffness 0` (the piece swings from the hand) · toss `vy −14` px/step with a small random `vx` and spin, arrow push `vx ±9`, `vy −6` · start at `30 %` of the box in view · force-sleep after `600` awake steps. Pill bodies are rectangles chamfered by half their height, blocks by `6` px, circles are circles: the same shapes the CSS draws.

## Motion tiers
- **full**: drop, pile, drag, toss, sleep.
- **reduced**: no engine is created. The list keeps its CSS arrangement, wrapped upwards from the floor of the box (`flex-wrap: wrap-reverse`, each piece resting on its row) with a few degrees of fixed tilt, so it reads as a settled pile; the hint says why nothing falls.
- **static**: the same arrangement. It is also what a page without script shows.

## Accessibility
- Each piece's word is wrapped in a real `<button>` only in the full tier, inside the original `<li>`: the list reads as fourteen named items in source order, and the hint is attached to every button by `aria-describedby`. In the reduced and static tiers the items stay plain text, since there is nothing to operate.
- Keyboard path: Tab reaches the pieces in source order; Enter or Space tosses the focused one, ← and → push it sideways. A focused piece rises above its neighbours and draws its ring inside its own fill (ground on ink and accent, accent on paper), because a ring outside it would land on whichever neighbour touches it.
- Tabbing in before the box is on screen starts the simulation from the laid-out arrangement instead of the drop, then centres the box in the viewport: the browser's own focus scroll measured the piece where it waited above the clip, so without this the focus would land off screen.
- Touch: no drag on coarse pointers; a tap tosses the piece and the box keeps `touch-action: auto`, so a finger on the pile still scrolls the page.
- A mouse press on a piece is a drag, so text selection there is suspended while the button is held; selecting across the section, copying or find-in-page still read the words in order.

## Adapters
- **React / Next**: create the engine in an effect that runs once the fonts are ready, keep bodies and elements in a ref keyed by item, subscribe the step to `gsap.ticker` or the shared ticker, and in the cleanup remove the callback, the Mouse listeners, then `Composite.clear` and `Engine.clear`.
- **Vue / Nuxt, Svelte**: same lifecycle in `onMounted` / `onMount`; render the list from data so the pieces keep their keys, and let the library own only `transform`.
- **Astro**: server-render the list (it is the reduced and no-script view) and hydrate the toy with `client:visible`, which matches the start-in-view rule.
- **GSAP pages**: drive the step from `gsap.ticker.add((t, deltaMs) => …)` instead of the shared ticker; keep the fixed step and the accumulator.
- **Loader variant**: the same engine under a full-screen layer, pieces made from the brand's SVGs (`Vertices.hull` of sampled points), torn down after the hand-off; the counter must follow a real signal, not the pile.

Related: `[recipe:throw-objects-css3d]` throws objects with Draggable inertia and no collisions; `[recipe:sprite-rain-canvas2d]` releases the shared ticker the same way.

Seen in: `[site:agrumeafarm]`.
