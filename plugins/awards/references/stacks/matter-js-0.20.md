# matter-js 0.20

<!-- Labels: [verified: source] = checked against the published npm tarball matter-js@0.20.0 (`src/`, `CHANGELOG.md`), 2026-10 · [recalled] · [unverified]. Pinned in versions.md at 0.20.0; `npm view matter-js version` also returns 0.20.0 (2026-10-05). -->

## What it is for in this skill set
2D rigid-body physics for one moment, not a page engine: the brand's own objects falling, piling and settling (a preloader, a footer toy, a draggable sticker heap). The simulation runs headless; you draw the bodies yourself in DOM transforms, canvas or a WebGL scene, and Matter's own `Render` stays a debug view. It earns its weight when the pile is the idea [site:agrumeafarm] [pattern:preloaders-and-transitions]. For a scroll-scrubbed fall or anything that must be identical on every load, a GSAP timeline is cheaper and deterministic; reach for Matter only when collisions between many shapes are the point.

## Install (pinned)
```sh
npm i matter-js@0.20.0
npm i poly-decomp@0.3.0   # only when concave SVG shapes go through Bodies.fromVertices [verified: npm view, 2026-10-05]
```
```js
import Matter from 'matter-js';                 // UMD build, `main: build/matter.js` [verified: source package.json]
const { Engine, Runner, Bodies, Body, Composite, Events, Sleeping, Svg, Vertices, Common } = Matter;
```
No ESM entry and no bundled types in 0.20 [verified: source package.json has `main` only]; `@types/matter-js` exists for TypeScript [recalled].

## The API surface we use
Engine [verified: source core/Engine.js]:
| Option / call | Default | Use |
|---|---|---|
| `Engine.create({ ... })` | — | one engine per scene |
| `gravity` | `{ x: 0, y: 1, scale: 0.001 }` | raise `y` for a heavier, faster pile (agrumeafarm ran 3.35) |
| `enableSleeping` | `false` | turn on so a settled pile stops costing CPU; `sleepStart` / `sleepEnd` fire on each body [verified: core/Sleeping.js] |
| `positionIterations` / `velocityIterations` / `constraintIterations` | `6` / `4` / `2` | raise only if stacked bodies jitter or sink |
| `Engine.update(engine, deltaMs)` | — | advance one step; warns above `1000 / 60` ms |
| `Engine.clear(engine)` | — | teardown with `Composite.clear(engine.world, false)` |

Bodies [verified: source factory/Bodies.js, body/Body.js]:
- `Bodies.rectangle(x, y, w, h, opts)`, `circle(x, y, r, opts, maxSides)`, `polygon`, `trapezoid`, `fromVertices(x, y, vertexSets, opts, flagInternal, removeCollinear, minimumArea, removeDuplicatePoints)`. Positions are centres.
- Body option defaults: `density .001`, `restitution 0`, `friction .1`, `frictionAir .01`, `slop .05`, `sleepThreshold 60`, `isStatic false`.
- `Body.setPosition`, `setAngle`, `setVelocity`, `setAngularVelocity`, `setStatic`, `scale`, `translate`, `rotate`, `applyForce(body, position, force)`. Read `body.position` and `body.angle` each frame to draw.
- `Composite.add(engine.world, bodies)`, `Composite.remove`, `Composite.allBodies` [verified: body/Composite.js]. `World.add` is an alias kept for old code [verified: body/World.js].

Shapes from SVG [verified: source geometry/Svg.js, geometry/Vertices.js, core/Common.js]:
- `Svg.pathToVertices(pathEl, sampleLength)` samples a `<path>`; it needs the `pathseg` polyfill in current browsers because it reads `pathSegList`.
- Concave output must be decomposed: `Common.setDecomp(decomp)` then `Bodies.fromVertices`, or take `Vertices.hull(points)` and accept a convex body. The hull is what [site:agrumeafarm] shipped, sampled every 16 px; it is cheaper and reads fine for fruit-like silhouettes.

Clock [verified: source core/Runner.js]:
- `Runner.create({ delta: 1000/60, frameDeltaSmoothing: true, maxFrameTime: 1000/30, enabled: true })`, `Runner.run(runner, engine)`, `Runner.stop(runner)`. `Runner.run` opens its own `requestAnimationFrame` loop; `runner.isFixed` is now redundant and only warns.
- `Events.on(engine, 'beforeUpdate' | 'afterUpdate' | 'collisionStart' | 'collisionActive' | 'collisionEnd', fn)`.

Pointer [verified: source core/Mouse.js, constraint/MouseConstraint.js]: `Mouse.create(el)` + `MouseConstraint.create(engine, { mouse })` for drag. See the wheel pitfall below.

## Integration with the others
```js
// one clock: drive Matter from the shared ticker (or GSAP's), never a second rAF loop
const engine = Engine.create({ gravity: { y: 3.35 }, enableSleeping: true });
const step = 1000 / 60;
let acc = 0;
ticker.add((_, dtMs) => {                       // shared ticker (recipes/_shared/raf.js); no catalogue recipe yet
  acc = Math.min(acc + dtMs, step * 4);         // cap after a hidden tab
  while (acc >= step) { Engine.update(engine, step); acc -= step; }
  for (const b of bodies) b.el.style.transform =
    `translate(${b.body.position.x - b.w / 2}px, ${b.body.position.y - b.h / 2}px) rotate(${b.body.angle}rad)`;
});
```
The fixed step and the accumulator are this skill set's pattern, not library API [recalled]; `Engine.update` with a variable delta works but warns above 16.7 ms and changes the outcome per device [verified: Engine.js warning].
- Three / OGL: copy `position` and `angle` into instance matrices in the same callback; Matter's y grows downward, so flip once at the boundary.
- Lenis: the physics canvas does not scroll; keep `MouseConstraint` off any element Lenis smooths (see below).

## Reduced motion and accessibility hooks
Under `prefers-reduced-motion: reduce`, do not create the engine: place the objects at their final, pre-computed resting positions, as [site:agrumeafarm] does with a static ring [verified, that card]. The pile is decoration: `aria-hidden="true"` on its layer, the loading state announced in text. Never gate content on bodies falling asleep; time out with the counter.

## Performance rules
Sleeping on, bodies counted (tens, not hundreds, for a loader). Convex hulls over decomposed concave parts. Static bodies for floors, walls and domes. Stop the runner or remove the ticker callback the moment the moment ends, then `Engine.clear`. Draw with transforms; never let Matter's `Render` ship.

## Gotchas
- `Mouse.create` adds a `wheel` listener with `passive: false` that calls `preventDefault()` [verified: source core/Mouse.js]: a full-page physics canvas with a mouse attached eats page scroll. Remove that listener (`mouse.element.removeEventListener('wheel', mouse.mousewheel)`) or scope the mouse to a small element.
- `Svg.pathToVertices` throws or returns nothing without the `pathseg` polyfill [verified: CHANGELOG and Svg.js warning].
- `Bodies.fromVertices` with concave points and no `setDecomp` falls back to a convex hull with a console warning [recalled].
- Very thin static floors let fast bodies tunnel under high gravity; make floors thick and keep the step at 1000 / 60.
- `Runner.run` plus a GSAP ticker is two clocks; pick one.
- The library is quiet since 0.20.0 (2024-06-23) [verified: CHANGELOG date]; treat it as stable, not evolving.

## Where the corpus used it
[site:agrumeafarm]: the physics-pile preloader, fruit SVGs as hull bodies (gravity 3.35, restitution .03, friction .82, air friction .03, sleeping on) dropping onto a static dome, inside a Nuxt + GSAP + Lenis bundle; listed in [pattern:preloaders-and-transitions]. No other card in `references/sites/` names matter-js (grep, 2026-10-05).
