# reduced-motion-switch

One place that answers "how much motion may this page use?", and every effect built inside a function of that answer. Three tiers: **full** (the authored score), **reduced** (state changes and hierarchy stay, spatial movement goes), **static** (everything settled on load, nothing subscribed to a clock). A user override on `<html data-motion>` beats the OS setting and is persisted.

## Why
- **No card in the corpus documents a reduced-motion path**, and the Site of the Year scored 6.6 on accessibility `[site:igloo]`. This is where new work beats the reference set (`[pattern:accessibility-and-reduced-motion]`).
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
