# drag-pan-infinite-grid

A wall of project links that the visitor pans in both axes by drag, wheel, finger or keys. It wraps on both axes, so it never ends. A drag is direct, and the release keeps the plane moving with an inertia that decays on the shared ticker. There are no clones: the 24 `<li>`s are the list and the pool at once, each moved by `translate3d` only. A tile that leaves one side re-enters on the other. Every tile is a real link in DOM order, so Tab, a screen reader and find-in-page each meet every project exactly once, and the plane brings whatever they reach into the window.

## Why
- **Physicality instead of navigation.** Pushing a field of work around is the gallery move in `[pattern:components-catalog#infinite-draggable-plane-and-arc-gallery]`. The corpus records an infinite plane that recycles items past 60 % of the viewport `[clone:floema-jewelry]` and an infinite-canvas archive route with WASD and arrow navigation in a bundle `[site:bleibtgleich]` (seen in the code, not visited). The clone's items are not focusable and it has no keyboard path. Here the drag is one input among four (`[pattern:cursor-and-pointer#drag-affordances]`).
- **The pool is the list.** Tile `i` (column `c`, row `r` on a `6 × 4` sheet) sits at `x = mod(c·pitch + x0 + offset + pitch, 6·pitch) − pitch`, and `y` the same way on rows, with odd columns `.5` of a row lower. Every tile stays within `[−pitch, span − pitch)` however far the plane goes, so the wrap needs no recycling logic and no clones. This is the wrap of `[recipe:gl-endless-reel-sheets]` in two axes and in pixels.
- **No hole at any size.** The pitch is `max(tile + gap, stage / (count − 1))` on each axis, so one sheet always spans the stage plus one tile. A very wide or tall stage spaces the tiles out rather than opening a gap. The column count stays even, so the half-row stagger meets itself across the wrap.
- **Inertia that is the same on every display.** The release velocity comes from the pointer samples of the last `100 ms`. It is `0` when the pointer rested `60 ms` before letting go, and it is clamped to `4000 px/s`. The plane then advances by the exact integral of `v·e^(−4t)` over each frame's `dt`, so a flick coasts `v0 / 4` px at 30, 60 or 144 Hz (`[pattern:motion-vocabulary#damping-math]`). It stops below `8 px/s`, and the ticker is released.
- **A wheel that does not strand the page.** The wheel pans in both axes (Shift turns a vertical wheel sideways). A notch eases in at `k = 16`, and a trackpad stream reads as direct. Until the stage sits wholly in the window, a vertical wheel scrolls the page instead, so a reader scrolling down meets the plane without being caught by it (`[pattern:accessibility-and-reduced-motion#scroll-jacking-rules]`). Ctrl + wheel stays the browser's zoom.
- **Focus moves the plane, never the page.** The stage is `overflow: hidden`: a scroll container that wheel and touch never scroll, parked one pitch in on each axis. When Tab, find-in-page or a screen reader's cursor reaches a tile off the stage, the browser scrolls that container to reveal it. The page never scrolls while the stage is on screen. The script takes the scroll back at once and glides the plane by the same amount, plus a `32 px` margin. Chrome scrolls for focus before `focusin` fires, so the parked container is what keeps the page still. The verifier drives Tab; find-in-page and a screen reader's cursor go through the same browser reveal.

## Parameters
Sheet `6 × 4` (`COLS` even), stagger `.5` row · tile `clamp(180px, 17vw, 300px)` wide, `4:5` plate plus caption, gap `24 px` · stage `clamp(24rem, 100svh − 15rem, 56rem)` tall (`clamp(22rem, 62svh, 40rem)` at 760 px and below), `24 px` mask fade at the edges · drag threshold `6 px`, then pointer capture · velocity window `100 ms`, rest gap `60 ms`, clamp `4000 px/s` · decay `4 /s`, stop `8 px/s` · wheel ease `k = 16 /s`, lines × 16, pages × stage height · glide `.42 s` expo-out (`1 − 2^(−10t)`) · focus margin `32 px`.

## Keyboard and screen readers
- The tiles are 24 links in a `<ul>` in reading order, inside a `<section>` named "Projects, on a plane that wraps in every direction". Its description is the visible line of key help under the stage. A skip link before the stage jumps past all 24 links.
- **Tab** visits every project in order. A tile that is off the stage glides into the window, `32 px` clear of its edges. The ring is a `2px` accent outline at `6px`, on `:focus-visible` only.
- **Arrow keys** move focus to the neighbouring tile, wrapping at the sheet's edge. They move the plane exactly one pitch the other way, plus the half-row stagger between columns, so the neighbour lands where the focused tile was. **Home** glides back to the origin the short way round, with the first project centred and focused. **End** does the same for the last project. Page Up / Down and Space keep scrolling the page. Keys are ignored with Ctrl, Alt or Meta held.
- A press that becomes a drag never follows the link it started on. A tap or a click under `6 px` of travel does. Links cannot start the browser's own drag-and-drop.
- A line under the stage names the project nearest the centre, updated at rest. It is not a live region: Tab already announces each project.

## Motion tiers
- **Full:** the drag, the coast, the eased wheel and the glides.
- **Reduced:** the drag and the wheel stay, because direct manipulation is not decoration, but the release never coasts. Keys, Home, End and focus reveals land at once.
- **Static** (`html[data-motion="static"]`, live): no plane. The same 24 links form a plain wrapped CSS grid that scrolls with the page, with no listener acting and no `touch-action` override. The page is the same without JavaScript: a head script adds `plane-live` before the first paint (except in the static tier), so the plane never replaces the grid after load.

## Touch
`touch-action: none` is set on the stage only, and the page's own `touch-action` stays `auto`. A finger drags the plane through the same pointer path and the same inertia, and the page scrolls from anywhere outside the stage. Keep the stage shorter than the phone's viewport (`62svh` here) so there is always page to scroll by. On a touch laptop the mouse and the finger share the code.

## Adapters
- **React:** render the `<ul>` of links normally. Keep the offset, velocity, glide and drag in refs, never in state, and attach the listeners in one effect that subscribes to the ticker and cleans up both. Write the transforms to the `<li>` refs in the frame callback.
- **Vue / Nuxt:** the same in `onMounted` / `onBeforeUnmount`. Template refs for the pool, a plain object (not `reactive`) for the motion state.
- **Svelte:** an action on the stage (`use:plane`) that returns `destroy`, with `bind:this` on the `<li>`s.
- **Astro:** the list is static HTML (it is already the no-JS grid). Ship `main.js` as a `<script>` island and inline the head script that sets `plane-live`.
- **GL planes:** keep this pool, offset and key model as the DOM mirror, and map each `<li>`'s box to a textured plane, as `[recipe:gl-dom-tethered-planes]` does. The links stay the keyboard and screen-reader path.
- **Real work:** swap each `.tile__plate` for an `<img>` with real `alt` text, `width` and `height`, `loading="lazy"` for tiles beyond the first screen, and `decoding="async"`.

## Verify
`verify.mjs` drives real input in headless Chromium and reads the rendered `<li>` boxes back:
- **At rest:** 24 links in a pool of 24, the first project centred, and no hole on a `40 px` lattice over the stage.
- **Drag:** a slow 240 × 120 px drag moves the plane by exactly that much, and a rested release throws nothing.
- **Flick:** the plane keeps moving after release, slows on every frame and stops after `v0 / 4` px, within the `8 px/s` stop.
- **Long drag:** four strokes of 4400 px in all, more than two sheets, leave every tile inside the pool, with nothing cloned and no hole.
- **Keys:** ArrowRight moves the plane exactly one pitch and the neighbour lands where the first tile was, with a `2px` ring. Home returns to an origin-equivalent offset. Three Tabs glide an off-stage tile `32 px` inside while the page's `scrollY` stays `0`.
- **Wheel:** pans `(−200, −300)` with no page scroll.
- **Reduced:** a flick does not coast, and ArrowRight lands at once.
- **Static:** the plain grid, with no transform and no drag.
- **Phone (390 px):** no horizontal overflow, `touch-action: none` on the stage only, and the drag pans.

## Synthetic content
The 24 projects, their disciplines and years are invented for the demo. The plates are CSS gradients drawn from the tokens, so the recipe ships no image or font files.

Seen in: `[clone:floema-jewelry]`, `[site:bleibtgleich]`.
