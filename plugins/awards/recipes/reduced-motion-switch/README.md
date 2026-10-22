# reduced-motion-switch

One place that answers "how much motion may this page use?", and every effect built inside a function of that answer. Three tiers: **full** (the authored score), **reduced** (state changes and hierarchy stay, spatial movement goes), **static** (everything settled on load, nothing subscribed to a clock). A user override on `<html data-motion>` beats the OS setting and is persisted.

## Why
- **No card in the corpus documents a reduced-motion path**, and even a 7.92 Site of the Day scored 6.60 on accessibility `[site:igloo]`. This is where new work beats the reference set (`[pattern:accessibility-and-reduced-motion]`).
- **Tier, not kill switch.** A global `animation: none !important` erases the feedback a visitor needs (a menu that opens, a theme that swaps). Reduced keeps those; it drops translation, rotation, loops and parallax.
- **Torn down, then rebuilt.** `gsap.context().revert()` and the ticker unsubscribe run before the next tier applies, so tiers never stack; the OS setting can change while the page is open.
- **Loops pause off-screen.** The orbit only plays while its trigger is active.

## Parameters
Orbit `6 s` linear loop · marquee `60 px/s` on the shared ticker with modulo wraparound · panels `yPercent 30 → 0`, `1.2 s`, expo-out, stagger `.1` (full) / opacity `.4 s` (reduced).

## Accessibility
The override is a real button group with `aria-pressed`; the readout is `aria-live`; the marquee is `aria-hidden` with a visually hidden text mirror.

## Adapters
- **GSAP only:** `gsap.matchMedia().add({ full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, ctx => …)` (see `boot-lenis-gsap`).
- **anime.js:** `createScope({ mediaQueries: { reduced: '(prefers-reduced-motion: reduce)' } }).add(self => { if (self.matches.reduced) … })`.

### Webflow
- Designer: in the header, a Div with the custom attributes `role="group"` and `aria-label="Motion tier override"` around four buttons with `data-tier="auto"`, `"full"`, `"reduced"`, `"static"` and `aria-pressed`, plus a readout span with `data-tier-readout` and `aria-live="polite"`. The demo pieces are `data-orbit`, `data-marquee` (with its visually hidden mirror) and `data-panel`.
- The module writes `data-motion` on `html` and persists it under the `localStorage` key `awards:motion`; every engine module asks `motionTier()`. Mount it first in the engine loaded by the [recipe:boot-lenis-gsap] Footer-code loader, so the saved override is on `html` before the other modules read it.
- Interactions with GSAP has its own prefers-reduced-motion settings and Classic Interactions has none. At best they follow the OS, not this switch [inferred], so keep Interactions off anything the switch is meant to govern.
- Head code carries the recipe's `html[data-motion-tier="…"]` rules for the orbit, the marquee and the panels.
- Reduced motion: the switch is how a visitor reaches `reduced` or `static` without changing the OS setting; `auto` hands the decision back.
