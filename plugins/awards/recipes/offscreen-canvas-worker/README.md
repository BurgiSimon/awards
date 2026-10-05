# offscreen-canvas-worker

Hand an animated canvas (a loader, a generative field) to a Worker with `transferControlToOffscreen()`, so whatever the main thread is busy with (shader compilation, hydration, a long parse) never stalls it. A hello handshake with a fixed timeout guards the hand-off: if the Worker does not answer in time, or errors, the very same draw code runs on the main thread instead.

## Why
- **The loader is the one thing that must not freeze.** A loader drawn in a worker on an OffscreenCanvas keeps its pen moving while shaders compile on the main thread `[site:cutobot-byholm]`; a logo intro renders in a Worker and falls back to the main thread after a timed hello `[site:cyphercapital]` (`[pattern:webgl-architecture]`).
- **Handshake before transfer.** The canvas is transferred only after the Worker has answered. A transferred canvas can never give a context on the main thread again, so transferring first would leave the fallback without a surface (the recipe still swaps in a cloned canvas if the Worker dies later).
- **One draw module, two clocks.** `draw.js` holds `drawFrame` and a message handler with no DOM access. The Worker drives it from its own `requestAnimationFrame`; the fallback drives it from `_shared/raf.js`. Nothing forks, so the fallback is never a stale copy.
- **Off-screen means stopped.** An `IntersectionObserver` on the stage posts `{ run }` to whichever thread draws.

## Parameters
Hello timeout `1000 ms` (`HELLO_TIMEOUT`) · DPR cap `2` · pen trail `1.6 s` over `120` samples · `72` ripple ticks. Colours are read from the CSS tokens once and posted to the Worker (it cannot read CSS).

## Motion tiers
`full` animates. `reduced` and `static` post `animate: false`: the Worker (or the fallback) draws one settled frame (`STILL_T`) and starts no loop.

## Accessibility
The canvas is decorative (`aria-hidden`) with a visible caption; the drawing thread is announced in an `aria-live` output. The "block the main thread" button is a demo control only.

## Adapting
- **Vite / Rollup / webpack 5**: keep `new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })` literal so the bundler emits the worker chunk.
- **Next / Nuxt / SvelteKit / Astro**: create the Worker inside the client-only lifecycle (`useEffect`, `onMounted`, `onMount`, a client script) and `terminate()` it on unmount. A canvas element that has been transferred cannot be reused by a re-render: key it so the framework mounts a fresh one.
- **WebGL**: call `getContext('webgl2')` on the OffscreenCanvas inside the handler; program compilation then happens in the Worker too.
- **Input**: the Worker sees no DOM events. Post pointer or scroll values to it as messages.

Demo content is synthetic: generated ticks and a Lissajous pen, no media, fonts or models.

Seen in: `[site:cyphercapital]`, `[site:cutobot-byholm]`.
