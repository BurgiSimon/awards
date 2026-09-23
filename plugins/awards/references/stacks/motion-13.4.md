# Motion 13.4

<!-- Labels: [verified: <source>] = checked against Context7 (`/websites/motion_dev`: react-animate-presence, react-layout-animations, react-drag, react-motion-config, react-accessibility, react-use-reduced-motion, react-installation, react-reduce-bundle-size, animate, frame, performance, gsap-vs-motion), or read in the published tarballs `motion@13.4.1`, `framer-motion@13.4.1`, `motion-dom@13.4.1` (named file), 2026-09-23 · [recalled] · [inferred] · [unverified]. Pinned version: npm `latest` on 2026-09-23. -->

## What it is for in this skill set
The React/Next-side option for **component-state** animation: things that enter and leave the React tree (dialogs, sheets, toasts, menus), layout changes a render causes, and gestures with physics (drag-to-dismiss). GSAP 3.15 stays the default engine and owns the score: timelines, ScrollTrigger pins and scrubs, SplitText reveals, anything on the one ticker, GL uniforms [pattern:motion-vocabulary]. Motion is formerly Framer Motion; the npm package `motion` re-exports `framer-motion` (its only runtime dependency besides `tslib`) [verified: motion/package.json]. React is an optional peer, so the vanilla `animate()` also works without React [verified: motion/package.json `peerDependenciesMeta`].

Prefer Motion over GSAP when:
- an element must animate **out** before React removes it: `AnimatePresence` exit props, no manual unmount bookkeeping;
- a render changes layout and the element should glide to its new box: `layout` / `layoutId` beat a hand-written Flip that fights React's commit;
- the interaction is a gesture with physics: `drag` with constraints, elasticity, momentum and an `onDragEnd` velocity (the phone bottom sheet [site:boc]);
- a spring must be interrupted mid-flight by state and retarget smoothly.

Do not use it when:
- the effect is scroll-linked (scrub, pin, parallax): that is ScrollTrigger on Lenis; `useScroll` / `scroll()` beside ScrollTrigger is a second scroll model [pattern:motion-vocabulary];
- the site is vanilla, Astro, Nuxt or SvelteKit and GSAP is already loaded: a second library for one fade is budget with no gain;
- it is a timeline of the score, a line reveal or a GL uniform;
- GSAP already animates the same element: two engines writing one `transform` overwrite each other [inferred].

## Install (pinned)
```sh
npm i motion@13.4.1          # peers: react ^18 || ^19, react-dom ^18 || ^19 (optional) [verified: motion/package.json]
```
```js
import { AnimatePresence, MotionConfig, motion, useDragControls, useReducedMotion } from 'motion/react'; // client components
import * as motion from 'motion/react-client';   // Server Components in the App Router: ships less client JS [verified: react-installation]
import { animate, frame, cancelFrame } from 'motion';                      // vanilla, hybrid engine [verified: framer-motion/dist/es/dom.mjs re-exports motion-dom]
import { animate as animateMini } from 'motion/mini';                      // WAAPI only, 2.3–2.5 kb [verified: animate, upgrade-guide]
```
Entry points in 13.4.1: `.`, `./mini`, `./react`, `./react-client`, `./react-m`, `./react-mini`, `./react-animate-view`, `./three`, `./vgpu`, `./debug` [verified: motion/package.json `exports`]; `three`, `vgpu` and `react-animate-view` are not used here and their scope is [unverified]. Never install `framer-motion` separately at another version.

## The API surface we use
### Presence
- `<AnimatePresence>` fires `exit` on `motion` descendants of a **direct child** removed from the tree (unmount, `key` change, list removal); every direct child needs a unique `key` [verified: react-animate-presence].
- `mode`: `"sync"` (default), `"wait"` (entering waits for the exit; one child only), `"popLayout"` (the exiting child leaves the layout at once, pairs with `layout`; a custom-component child must forward its ref to the DOM node) [verified: react-animate-presence].
- `onExitComplete` for focus return after the last exit [recalled].

### Layout
- `layout` (`true | "position" | "size"`), `layoutId` (shared element: a new element with a matching id animates from the old one's box; both mounted → crossfade), `layoutDependency` (measure only when it changes), `layoutScroll` (on scrollable ancestors), `layoutRoot` (on `position: fixed` roots), `onLayoutAnimationStart / Complete` [verified: vue-motion-component layout props; same props in React per react-layout-animations].
- `<LayoutGroup>` when layout and exit animations mix outside one `AnimatePresence`; `id` namespaces `layoutId`s per instance [verified: vue-animate-presence, vue-layout-group].

### Gestures
- `drag` / `drag="x" | "y"`, `dragConstraints` (pixels or a ref), `dragElastic` 0–1, `dragControls` + `dragListener={false}` to start the drag from another element (`controls.start(event)`), `onDrag(event, info)` with `info.point / delta / offset / velocity` [verified: react-drag]. Also typed on 13.4.1: `dragMomentum`, `dragTransition`, `dragSnapToOrigin`, `dragDirectionLock`, `dragPropagation`, `whileDrag` [verified: motion-dom/dist/index.d.ts]. `velocity` in px/s [recalled].

### Vanilla `animate()`
- `animate(element | selector, keyframes, options)` returns controls: `time`, `speed`, `state`, `duration`, `play()`, `pause()`, `stop()` (halts and keeps the current value), `cancel()` (halts and removes, as WAAPI), `complete()`, `finished` promise, `then()` [verified: motion-dom/dist/index.d.ts `AnimationPlaybackControls`; animate, improvements-to-the-web-animations-api-dx].
- Hybrid engine: rAF or WAAPI per value; a whole `transform` string, `opacity`, `filter`, `clipPath` can run on the compositor and keep moving while the main thread is blocked [verified: performance, gsap-vs-motion]. Independent `x` / `y` keys are the non-accelerated path [verified: performance, "use this instead of individual transforms"].
- Options `reduceMotion` and `skipAnimations` [verified: motion-dom/dist/index.d.ts `ReduceMotionOption`, `skipAnimations`]. Durations are seconds [recalled]; the house expo-out is `ease: [0.16, 1, 0.3, 1]` [recalled: cubic-bezier arrays] [pattern:motion-vocabulary#easing].

### Config and loop
- `<MotionConfig reducedMotion skipAnimations transition nonce>` [verified: framer-motion/dist/index.d.ts].
- `frame.read / update / render(fn, keepAlive?)`, `cancelFrame(fn)`: Motion's batched loop [verified: frame].
- Bundle: the `motion` component cannot tree-shake below ~34 kb; `m` + `<LazyMotion features={domAnimation}>` starts under 4.6 kb and can lazy-load the rest [verified: react-reduce-bundle-size].

## Integration with the others
### The one-ticker rule
Motion keeps its own clock: `frame` is a batcher scheduled with `requestAnimationFrame` [verified: motion-dom/dist/es/frameloop/frame.mjs]. It is demand-driven: it reschedules only while some step asked for another frame, so it sleeps when nothing animates [verified: frameloop/batcher.mjs]. `MotionGlobalConfig.useManualTiming` only freezes the timestamp; it does not hand scheduling to another clock [verified: batcher.mjs], so Motion cannot be put on `gsap.ticker`. The rule therefore reads:
- GSAP's ticker (or `_shared/raf.js`) stays the only **persistent** clock: Lenis, ScrollTrigger, GL [recipe:boot-lenis-gsap].
- Motion's loop is tolerated because it is transient: it runs while a presence, layout or drag animation runs, and WAAPI values do not touch it at all.
- Never `frame.update(fn, true)` as a keep-alive loop, never tick Lenis or a GL scene from Motion, never scroll-linked Motion values.

### Lenis: dialogs and sheets [recipe:dialog-nested-lenis-sheet]
Boc runs Motion dialogs with a nested Lenis per dialog (`duration 1.2`, expo) and `data-lenis-prevent` on scroll panes, but ticks the nested instance with its own `autoRaf` [site:boc] [verified, card §4 and §5]. Keep the structure, fix the clock:
```tsx
// Sketch: API names verified above; this composition is not run in the recipe harness [unverified]
'use client';
const EXPO_OUT = [0.16, 1, 0.3, 1], EXPO_IN = [0.64, 0, 0.78, 0];      // house ease; Boc's close ease [site:boc]
function Sheet({ onClose, tier }) {
  const ref = useRef(null), scroller = useRef(null), controls = useDragControls();
  const page = useLenis();                                              // root instance from ReactLenis [recalled]
  useEffect(() => {
    ref.current.showModal(); page?.stop();                              // native <dialog>: top layer, inert page, Escape → cancel
    if (tier !== 'full') return () => page?.start();                    // reduced / static: the sheet scrolls natively
    const inner = new Lenis({ wrapper: scroller.current, content: scroller.current.firstElementChild,
      autoRaf: false, duration: 1.2, easing: (x) => Math.min(1, 1.001 - 2 ** (-10 * x)) });
    const tick = (t) => inner.raf(t * 1000);                            // same clock as the root Lenis
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); inner.destroy(); page?.start(); };
  }, [tier]);
  return (
    <motion.dialog ref={ref} data-lenis-prevent aria-labelledby="sheet-title"
      onCancel={(e) => { e.preventDefault(); onClose(); }}              // animate the close instead of the instant one
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { duration: 0.66, ease: EXPO_OUT } }}
      exit={{ y: '100%', opacity: 0, transition: { duration: 0.42, ease: EXPO_IN } }}
      drag="y" dragControls={controls} dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 1 }}
      onDragEnd={(_, i) => { if (i.offset.y > ref.current.offsetHeight * 0.25 || i.velocity.y > 600) onClose(); }}>
      <header onPointerDown={(e) => controls.start(e)}><h2 id="sheet-title">Info</h2></header>
      <div ref={scroller} data-lenis-prevent className="sheet-scroll"><div>…</div></div>
    </motion.dialog>
  );
}
// parent: <AnimatePresence onExitComplete={() => opener.current?.focus()}>{open && <Sheet key="info" … />}</AnimatePresence>
```
- `wrapper` / `content` / `autoRaf: false` on the nested Lenis, one clock for both, `stop()` / `start()` on the page instance [verified: the vanilla recipe passes verify-recipes, 2026-09-23].
- Drag starts from the header only, so touch scrolling in the content is never taken over; dismiss past `.25` of the height or on a flick (the recipe's `.6 px/ms` ≈ 600 px/s) [recipe:dialog-nested-lenis-sheet].
- Removing an open modal `<dialog>` from the DOM ends its modality after the exit [recalled]; keep the content server-rendered so nothing hides from crawlers or no-JS readers [site:boc].
- `layout` children inside a Lenis- or natively-scrolled pane need `layoutScroll` on that pane; a fixed overlay root gets `layoutRoot` [verified: layout props].

### Next
- Every file that imports `motion/react` hooks or `AnimatePresence` is a Client Component; a Server Component that only needs a `motion.div` imports `motion/react-client` [verified: react-installation].
- Route transitions stay on `template.tsx` + `useGSAP` or React's `<ViewTransition>` (stacks/next.md); do not wrap App Router pages in `AnimatePresence` expecting page exits [recalled, medium: the router unmounts the old tree before an exit can run].
- 13.4.1 fixed a duplicate re-export in `motion/react` that made Turbopack run out of memory during module-graph analysis (#3741) [verified: motion/dist/es/react.mjs comment]; do not pin below it on Turbopack builds [inferred].

## Reduced motion and accessibility hooks
Read the tier once from `lib/reduced-motion.ts` (port of `_shared/reduced-motion.js`) and hand it to Motion; do not let Motion decide on its own [pattern:accessibility-and-reduced-motion#motion-tiers] [recipe:reduced-motion-switch].
```tsx
const tier = useSyncExternalStore(onMotionTierChange, motionTier, () => 'full');   // re-renders on a mid-session flip
<MotionConfig reducedMotion={tier === 'full' ? 'never' : 'always'} skipAnimations={tier === 'static'}>{children}</MotionConfig>
```
| Tier | Motion setting | What happens |
|---|---|---|
| full | `reducedMotion="never"` | the authored enter, exit, layout and drag release |
| reduced | `reducedMotion="always"` | positional keys (`width`, `height`, `top`, `left`, `right`, `bottom` and every transform) jump with `type: false`; layout animations jump; `opacity`, `backgroundColor` and the like still animate [verified: react-motion-config; motion-dom/dist/es/render/utils/keys-position.mjs, animation/interfaces/visual-element-target.mjs, projection/node/create-projection-node.mjs]. This is exactly our reduced tier: the sheet above still fades, it no longer travels |
| static | `skipAnimations` | every animation jumps to its final value [verified: framer-motion/dist/index.d.ts] |

Vanilla: `animate(el, kf, { reduceMotion: motionTier() !== 'full', skipAnimations: motionTier() === 'static' })`; left `undefined`, `reduceMotion` follows the device preference [verified: motion-dom `ReduceMotionOption`, animation/animate/effects.mjs].
- The React default is `reducedMotion: "never"`: without a `MotionConfig`, nothing is reduced [verified: framer-motion/dist/es/context/MotionConfigContext.mjs; react-motion-config].
- `"user"` reads `prefers-reduced-motion` only; it ignores our `data-motion` override, hence `"always"` driven by the tier [inferred].
- `useReducedMotion()` in 13.4.1 stores the preference in `useState` once and does **not** re-render when it changes (a `TODO` in the source), although the docs say it responds to changes [verified: framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs vs react-use-reduced-motion]. Use the tier hook above.
- Each visual element reads the preference when it mounts [verified: motion-dom/dist/es/render/VisualElement.mjs], so a flip reaches components mounted afterwards; the `MotionConfig` prop change is what reaches the rest [inferred].
- Drag under reduced motion still follows the finger (it moves because the user moves it); whether release momentum and snap-back honour `reducedMotion` is [unverified]: set `dragMomentum={tier === 'full'}` rather than rely on it.
- A drag gesture always has a keyboard equivalent: Escape and a Close button [pattern:accessibility-and-reduced-motion#overlays-and-focus].

## Performance rules
- One owner per element and property: Motion for component state, GSAP for the score.
- `m` + `LazyMotion` when Motion ships beside GSAP; load `domAnimation` (or the heavier set with layout and drag only where needed: `domMax` [recalled]) [verified: react-reduce-bundle-size].
- A full `transform` string or `opacity` for enter/exit so WAAPI can accelerate it; `x` / `y` keys only where drag or layout needs them [verified: performance].
- `layoutDependency` on anything with `layout` that re-renders often [verified].

## Pitfalls
- Two scroll models: `useScroll` / `scroll()` for scrub next to ScrollTrigger on Lenis (stacks/next.md).
- A keep-alive `frame.update(fn, true)` loop or a nested Lenis with `autoRaf: true`: a second persistent clock.
- `AnimatePresence` around a component whose `motion` element is not a keyed direct child: the exit never fires [verified].
- `mode="wait"` with several children, or `popLayout` with a custom child that does not forward its ref [verified].
- Relying on `useReducedMotion()` for live changes, or on `MotionConfig`'s default: see above.
- GSAP and Motion both writing `transform` on one node; or GSAP Flip in React where `layoutId` fits.
- Seconds vs milliseconds: Motion durations in seconds, `lenis.raf` in milliseconds.
- A drag listener on the whole sheet: it steals the content's touch scroll; start the drag from the header.

## Where the corpus used it
[site:boc] is the only card with Motion in the served bundle: Motion (framer-motion) for dialogs and the phone drag-to-dismiss sheet, entrance `.666 s` on `[.16, 1, .3, 1]`, close `[.64, 0, .78, 0]`, next to GSAP 3.15.0 for the case-open timeline and Lenis via a provider [verified, card]. [site:mindmarket]'s old card came from a React + Framer Motion practice clone; the served site has no Framer Motion signature and that stack is withdrawn [verified, card]. [site:white-desert] has no Framer Motion signature [verified, absent]; [site:shopify-editions-w26] shows none in its preloaded chunks [unknown]. Everything else in the corpus animates with GSAP, CSS or anime.js.
