# throw-objects-css3d

A toy section: a few extruded CSS-3D blocks you grab and throw. Released mid-swing, a block keeps the velocity of the hand, tilts into its direction of travel and, if its landing point is in the tray, settles into its slot. Every block also has a real button that throws it to the same slot, so the toy works from the keyboard.

Demo content is synthetic: the three numbered blocks, their names and the "tray" are invented for the recipe. Nothing of the source's catcher, copy or palette is reused.

## Why
- **Draggable + InertiaPlugin, not a hand-rolled physics loop.** `type: "x,y"`, `inertia: true`, `bounds` on the stage: velocity tracking, decay and the edge clamp come for free, and the throw is an ordinary tween you can kill `[site:wodniack]`.
- **The landing is decided once, at release.** `snap.points` receives the natural end point; clamped to the bounds, a point inside the tray returns the block's slot, anywhere else returns the point unchanged. InertiaPlugin passes the unbounded end, so clamp before testing or a hard throw overshoots the tray and lands on the edge unsnapped.
- **Two elements per block.** The outer element takes Draggable's `x`/`y`; the inner body takes the tilt (`rotationX`/`rotationY` from `InertiaPlugin.getVelocity`, through `quickTo`). One transform per owner, so drag and tilt never overwrite each other.
- **Each block owns its perspective.** `perspective` on the block, `preserve-3d` on the body, six faces sized from `--w`, `--h`, `--d`. The tray is a separate floor tipped back in its own perspective, with flat slots over it, so measuring a slot is a plain rect.
- **A keyboard path the source lacks.** A button per block tweens it to the same slot the throw reaches (`expo.out`, a half-turn on the body), and a polite live region counts what is in the tray.

## Parameters
Rest pose `rotationX −18°`, `rotationY 24°` · tilt `.018°` per px/s, capped at `±40°`, `quickTo .35 s power3.out` · Draggable `maxDuration 2 s` (default), `zIndexBoost` · button throw `.9 s expo.out` · reset `.6 s expo.out`. Keep the block count small: every face is a composited 3D layer.

## Motion tiers
- **full**: inertia throw, velocity tilt, tweened button throw and reset.
- **reduced / static**: Draggable is rebuilt with `inertia: false`. A block lands where it is let go (in its slot if that is inside the tray), no tilt, and the buttons and reset place blocks instantly. Dragging stays, because it follows the hand rather than moving on its own.

## Touch
Draggable sets `touch-action: none` on the blocks only. The stage and tray keep `auto`, so a finger on empty space still scrolls the page; keep blocks small relative to the stage so they never fill a phone viewport.

## Accessibility
Blocks are `role="img"` with names; the buttons are the operable path (44 px targets, visible `:focus-visible` ring), and the live region announces the tray count. Resizing moves caught blocks to their new slots and loose blocks back to the shelf.

## Adapters
- **React / Next**: create the Draggables in `useGSAP` and kill them in its cleanup; rebuild on a reduced-motion change with `gsap.matchMedia()`.
- **Vue / Nuxt, Svelte**: same lifecycle in `onMounted` / `onMount`, `kill()` on unmount.
- **Webflow**: the markup is plain; load the module after the section and register `Draggable` and `InertiaPlugin` once.

Related: `[recipe:magnetic-button]` reacts to the pointer without handing it an object.

Seen in: `[site:wodniack]`.
