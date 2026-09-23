# Ship report — <target> — <date>

## Fix batch (from jury <date>)
| Location | Change | Expected visible result | Viewport/state | Before evidence | After evidence | Status (resolved/partial/unresolved) | Class |
|---|---|---|---|---|---|---|---|

## Audit
`audit.mjs` — P0 n · P1 n · P2 n · exceptions n (reasons in `AWARDS.md ## Exceptions`)

## Captures
Manifest: `<recorded-manifest-path>`
Coverage: applicable Page map chapters at desktop/mobile (including mobile middle/close), reduced-motion sections and required named states — list inspected frames and any gap. Compare only current manifest entries.

## Performance
| Metric | Value | Budget |
|---|---|---|
| Entry JS (gz) | | ≤ 200 KB |
| GL chunk (gz, lazy) | | ≤ 500 KB |
| Images (largest) | | compressed, sized |
| Fonts (files / KB) | | ≤ 4 / 400 KB |
| LCP (throttled) | | ≤ 2.5 s |
| CLS | | ≈ 0 (no preloader shift) |
| Console errors | | 0 |

## Accessibility and usability walk
landmarks · heading order · focus-visible · skip link · reduced-motion tiers verified · keyboard walk · coarse pointer · contrast · `aria-hidden` canvas + DOM mirror · live regions · sound opt-in

## Meta and chrome
title · description · OG image · favicon · `theme-color` · 404 · robots / sitemap · `lang` · `color-scheme`

## Browser surfaces
`::selection` · caret · scrollbar · focus ring

## Cleanup
debug flags off · no `console.log` · unused dependencies removed · `.awards/captures` ignored

## Status
shipped / back to `awards:jury --verdict` / unresolved contract block or evidence gap
