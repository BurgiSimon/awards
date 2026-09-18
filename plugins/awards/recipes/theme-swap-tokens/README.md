# theme-swap-tokens

Each chapter names a theme; crossing its midpoint tweens `--ground`, `--ink` and `--accent` on `<html>` in one beat, retargeting rather than stacking, and the canvas clear colour is painted from the same live object on every update, so the DOM and the render never disagree.

## Why
- **Colour as page state** is the corpus's cheapest large move: four named themes swapped per section `[site:leo-parpeix]`, a background tweened per route `[site:floema]`, a colour field bound to the product `[site:slosh-seltzer]` (`[pattern:color-and-material#colour-as-state]`).
- **One tween, one clock.** Tweening the token values (not each element) keeps every `var()` consumer, including `color-mix` derivations, in sync; the canvas reads the same object in `onUpdate`.
- **Retarget, never stack.** A fast scroll that crosses two chapters kills the running tween and aims at the new theme from wherever the colour is.
- **Meta follows.** `theme-color` updates when the tween completes, so the browser chrome matches the chapter.

## Parameters
Trigger `top 50% → bottom 50%` per chapter · duration `1 s` · ease `power2.inOut` (≈ `cubic-bezier(.645,.045,.355,1)`) · `0 s` under reduced motion.

## Accessibility
Contrast holds in every theme (check each pair with `audit.mjs`); the swap is instant under reduced motion but still happens, because it carries wayfinding.

## Adapters
For Three.js call `renderer.setClearColor(live['--ground'])` (and update material uniforms) inside the same `onUpdate`; for R3F write the live values into a ref read in `useFrame`.

Seen in: `[site:leo-parpeix]`, `[site:floema]`, `[site:slosh-seltzer]`, `[site:shopify-editions-w26]`, `[site:lando-norris]`.
