# custom-ease-house-defaults

A small, named motion vocabulary written once and used by every hand on the page. Five curves (`house`, `out`, `in`, `in-out`, `write`) and a duration ladder (`xs`, `s`, `m`, `l`, plus `fade`) live as CSS custom properties. On boot `main.js` reads them, registers each curve with `CustomEase.create(name, "x1,y1,x2,y2")`, and sets `gsap.defaults({ ease: 'house', duration: --dur-m })`. A tween that names nothing, a named tween and a CSS `transition` then share one feel.

The demo content is synthetic: six lanes, one curve plot each, nothing taken from a real site. The token values are this recipe's own; tune them per project.

## Why
- **Shipped sites name their curves once.** Several cards set one slow-start, hard-arrival CustomEase as `gsap.defaults` at about .6 s `[site:abatable]` `[site:aardvarkbookclub]` `[site:a24-raviklaassens]`; another keeps four named curves and a duration ladder as tokens `[site:bleibtgleich]`; another mirrors its GSAP curves as CSS `cubic-bezier` properties `[site:agrumeafarm]`; a GL site registers one CustomEase beside GSAP's named eases `[site:why-zero]`. Strings and counts are in `[pattern:gsap-choreography#easing-as-shipped]`.
- **One source, not two.** The curves are written in CSS, where transitions need them before any script runs; JavaScript reads the same strings, so the two cannot drift. The `CSS transition` lane and the unannotated GSAP lane run side by side to show it.
- **A shared default is a library's, not a house style.** The same control points on unrelated sites mean a snippet library (`[pattern:motion-vocabulary#easing]`). Retune the four numbers before calling a curve a signature.

## Parameters
| Token | Value | Job |
|---|---|---|
| `--ease-house` | `cubic-bezier(.6, .04, .1, 1)` | the default: every tween with no `ease` |
| `--ease-out` | `cubic-bezier(.2, .9, .3, 1)` | arrivals, hover in |
| `--ease-in` | `cubic-bezier(.55, 0, .8, .15)` | exits |
| `--ease-in-out` | `cubic-bezier(.72, 0, .22, 1)` | travel between two known states |
| `--ease-write` | `cubic-bezier(.4, 0, .6, 1)` | strokes and counters, near-linear |
| `--dur-xs / s / m / l` | `.15 / .3 / .55 / 1.1 s` | `m` is the GSAP default duration |
| `--dur-fade` | `.2 s` | opacity and colour only |
| `--stagger` | `.04 s` | pass as `stagger: tokens.stagger`; GSAP has no global stagger default |

Use the names in GSAP (`ease: 'in-out'`, `duration: tokens.dur.l`) and the properties in CSS (`transition: opacity var(--dur-fade) var(--ease-out)`). Anything scrubbed by scroll stays `ease: 'none'`.

## Motion tiers
`_shared/reduced-motion.js` decides the tier and `<html data-motion-tier>` carries it. Under **reduced**, every movement duration token and the stagger become `0s` in CSS, and `gsap.defaults` is re-applied with duration 0, so tweens and transitions land instantly; `--dur-fade` survives so state changes still read. **Static** zeroes the fade too. Nothing autoplays outside the full tier. The tokens are re-read when the OS setting changes.

## Accessibility
The play control is a real `button` with `aria-pressed`; the curve plots are `aria-hidden` decoration beside text names.

## Verify
`verify.mjs` checks that `gsap.defaults()` carries the house curve and `--dur-m`, that `parseEase(defaults.ease)(.5)` and an unannotated tween seeked to its midpoint both match the CSS token's cubic-bezier evaluated independently at .5 (within 1e-3), that the CSS lane's computed `transition-timing-function` holds the same four points, that every duration token is 0 under reduced motion, and that the phone layout keeps the curve and has no horizontal overflow. `window.__houseEase.sampleDefault(p)` is the debug seam it uses.

## Adapters
- **JS-first tokens:** keep the curves in a module, call `CustomEase.create` from it, and write `root.style.setProperty('--ease-…', 'cubic-bezier(…)')` at boot; CSS transitions then wait for the script.
- **Curves `cubic-bezier` cannot hold** (overshoot with several bounces, springs): export `CustomEase` samples as a CSS `linear()` list and keep the name the same in both places.
- **React / Vue / Svelte:** register once in the app entry, before any component's `useGSAP` / `onMounted`; the defaults are global.
