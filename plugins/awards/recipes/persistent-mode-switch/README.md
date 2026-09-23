# persistent-mode-switch

A mode the visitor holds, not one the scroll imposes. A docked segmented switch re-skins the page (light / dark), a Grid pill lays the page's real twelve columns over it, and `L`, `D`, `G` do the same from the keyboard. Each choice is set as a root attribute, written to `localStorage`, printed in its control's label and restored before first paint on the next visit. At the close the docked switch cross-scales out while a large centred copy arrives, so the page ends on the question it asked all along. Where `theme-swap-tokens` swaps tokens by scroll position `[recipe:theme-swap-tokens]`, this is the user-held control.

## Why
- **The site's one navigation question as its close.** A two-segment switch sits docked over the page the whole time; at the end the small copy leaves by `scale 1.75` and fading out as a large centred one arrives from `.5` `[site:alectear]`.
- **Make the subject the interface.** A toggleable overlay that draws the page's real columns argues its construction instead of decorating it; the state is named in the control `[site:grids-obys]`.
- **Print the state in the control.** `Grid [on]`, `Theme [D]`: the bracket is the readout and, once learned, names the key `[site:haoqi]`.
- **Single-key hotkeys that stand down.** Theme keys are ignored in text fields and with modifier chords, and the choice is stored `[site:haoqi]`.
- **Restore before paint.** A classic inline script in `<head>` reads storage and sets the attributes before the stylesheet paints, so a reload neither flashes the default nor tweens into the stored mode.

## Parameters
Indicator slide and cross-scale `.4 s power3.out` (≈ `cubic-bezier(.06,.58,.3,1)`, the softer switch curve) · out `scale 1.75`, in from `scale .5` · ground and ink transition over `--dur-routine` (`400 ms`), not base's `1.4 s` scroll beat · hand-off when `60 %` of the close section is in view · storage keys `psm:theme` (`default` | `dark`) and `psm:grid` (`on` | `off`) · overlay columns `accent 7 %` fill, `45 %` hairlines, 12 on desktop, 4 under `768 px`.

## Hotkeys
`L` light, `D` dark, `G` grid. Ignored when the target is a text field (`input` other than radio / checkbox / button types, `textarea`, `select`, `contenteditable`), with `Ctrl`, `Alt` or `Meta` held, on key repeat and during IME composition. A focused radio or button is not a text field, so the keys still work from the switch itself. Each control carries `aria-keyshortcuts`.

## Motion tiers
- **Full:** the indicator slides, the ground and ink ease, the overlay fades, the dock and the close copy cross-scale.
- **Reduced:** every state still changes and is stored; nothing tweens (GSAP durations `0`, CSS transitions off).
- **Static:** as reduced (`html[data-motion="static"]`).

## Accessibility
- The switch is native radios in a `fieldset` with a `legend`: arrow keys move the choice, the checked option is announced, and the focus ring sits on the visible segment through `:has(:focus-visible)`.
- Grid is a `<button aria-pressed>`; its bracket text changes with it.
- Only one copy of the switch is ever reachable: the leaving copy is `inert` and `visibility: hidden` once faded. A keyboard user on the leaving copy is moved to the arriving one.
- A polite live region announces each change; the dock's bracket readout is `aria-hidden` (the radios already say it).
- The overlay is `aria-hidden` and `pointer-events: none`; the page stays usable with it on.
- Every target is at least `44 px` tall; contrast holds in both themes.

## Capture hook
`__awards.state()` reports `theme`, `grid`, `at` (`dock` | `close`), `rootTheme`, `rootGrid`, `stored`, `restored`, `hotkeys`, `ignored` and the label texts. `scrollTo` is the default document scroll.

## When not to use it
A theme toggle nobody asked for is chrome for its own sake: ship one when the site has two real registers (a portfolio's two halves, a sober mode and an alternate world, a reading mode). If the page already follows the system scheme and has nothing else to say, `prefers-color-scheme` alone is enough.

## Demo content
The headline, tiles, search field and all copy are synthetic demo text describing the technique. No media or font files ship.

## Adapters
- **Three-way (light / dark / system):** store `system`, set `data-theme` from `matchMedia('(prefers-color-scheme: dark)')` and listen to its `change` while it is chosen.
- **Canvas or WebGL ground:** read `--ground` from `getComputedStyle(html)` after the attribute changes, as the `theme-color` update here does, and repaint.
- **React / Next:** keep the head script as a `<script dangerouslySetInnerHTML>` in the root layout (with `suppressHydrationWarning` on `<html>`), hold the mode in a context, and register the key listener in one effect with cleanup.
- **Astro / SvelteKit:** an `is:inline` script (Astro) or a `%sveltekit.head%` inline script does the pre-paint restore; after a client-side route change, re-run the render step, not the restore.
- **Lenis:** not needed; if the page uses it, nothing changes (the hand-off listens to an IntersectionObserver, not scroll events).

Seen in: `[site:alectear]`, `[site:grids-obys]`, `[site:haoqi]`.
