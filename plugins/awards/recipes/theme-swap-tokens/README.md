# theme-swap-tokens

Each chapter names a theme; crossing its midpoint tweens `--ground`, `--ink` and `--accent` on `<html>` in one beat, retargeting rather than stacking, and the canvas clear colour is painted from the same live object on every update, so the DOM and the render never disagree.

## Why
- **Colour as page state** is the corpus's cheapest large move: four named themes swapped per section `[site:leo-parpeix]`, a background tweened per route `[clone:floema-jewelry]`, a colour field bound to the product `[site:slosh-seltzer]` (`[pattern:color-and-material#colour-as-state]`).
- **One tween, one clock.** Tweening the token values (not each element) keeps every `var()` consumer, including `color-mix` derivations, in sync; the canvas reads the same object in `onUpdate`.
- **Retarget, never stack.** A fast scroll that crosses two chapters kills the running tween and aims at the new theme from wherever the colour is.
- **Meta follows.** `theme-color` updates when the tween completes, so the browser chrome matches the chapter.

## Parameters
Trigger `top 50% → bottom 50%` per chapter · duration `1 s` · ease `power2.inOut` (≈ `cubic-bezier(.645,.045,.355,1)`) · `0 s` under reduced motion.

## Accessibility
Contrast holds in every theme (check each pair with `audit.mjs`); the swap is instant under reduced motion but still happens, because it carries wayfinding.

## Adapters
For Three.js call `renderer.setClearColor(live['--ground'])` (and update material uniforms) inside the same `onUpdate`; for R3F write the live values into a ref read in `useFrame`.

### React
`<ThemeSwap onUpdate={(live) => paintSwatch(canvas.current, live)} onTheme={setLabel}>…</ThemeSwap>` from `adapters/react.jsx` wraps the chapters; each child section names its theme with `data-swap`. Themes are your CSS `[data-theme="…"]` blocks (`themes`, default `default`, `dark`, `accent`). `onUpdate` receives the live object every tween frame, so a Three renderer calls `setClearColor(live['--ground'])` there.
- On unmount it restores `data-theme` and `theme-color` and removes the inline tokens. Needs the root `<SmoothScroll>` from [recipe:boot-lenis-gsap]; `'use client'` for Next's App Router.

### Webflow
- Designer: each chapter Section carries the custom attribute `data-swap="default"`, `"dark"` or `"accent"`; an optional readout span carries `data-theme-readout`. A canvas that shares the colour is a Code Embed: `<canvas data-canvas width="480" height="200" aria-hidden="true">`.
- Tokens: the module tweens `--ground`, `--ink` and `--accent` on `html` and reads each theme from `[data-theme="…"]` rules. Define those blocks in Head code and have the Designer's classes use `var(--ground)` and the rest; Webflow's own colour variables publish under names of their own [unverified], so map them to these three or keep the names in Head code.
- Head code also carries `<meta name="theme-color" content="#f4f2ee">`, which the module updates on each swap, and `body { transition: none }`. No Designer transition on body or section colours, or the colour is smoothed twice.
- No Webflow interaction that changes background or text colour on these sections: one tween owns the colour.
- Inject: an entry in the engine loaded by the [recipe:boot-lenis-gsap] Footer-code loader; it uses the boot's Lenis and ScrollTrigger.
- Reduced motion: the swap is instant and still happens, because it carries wayfinding.

Seen in: `[site:leo-parpeix]`, `[clone:floema-jewelry]`, `[site:slosh-seltzer]`, `[site:shopify-editions-w26]`, `[site:lando-norris]`.
