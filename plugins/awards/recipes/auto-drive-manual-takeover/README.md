# auto-drive-manual-takeover

An optional auto-scroll for a page that rewards a steady, hands-free read. An Auto toggle, off on every visit, advances the document through Lenis at a fixed `90 px` per second of ticker time. The first wheel, touch, pointer press or key press hands control straight back, as does a scroll from anywhere else and reaching the end. Each change is announced once in a polite status line, and the toggle is disabled under reduced motion with the reason written beside it. Where `[recipe:idle-settle-snap]` finishes a move the visitor started, this one makes a move only when the visitor asked, and drops it the moment they act.

## Why
- **A visitor-held clock with an AUTO mode.** A film whose timeline the scroll holds also offers AUTO ON / OFF in its HUD: the page scrolls itself at a fixed rate, and any wheel or touchmove hands control back `[site:cutobot-byholm]`. The hand-back is the part worth keeping: an auto mode that has to be found and switched off is a seized page (`[pattern:accessibility-and-reduced-motion#scroll-jacking-rules]`).
- **Fixed rate, frame-rate independent.** The pace is `RATE × dt` from `_shared/raf.js`, whose `dt` is clamped to `100 ms`, so a 30 Hz phone reads at the 120 Hz laptop's pace and a stalled frame cannot jump a paragraph. A float accumulator carries the sub-pixel remainder, because Lenis resets its own position to the browser's after an immediate `scrollTo`.
- **Every road back, in the capture phase.** `wheel`, `touchstart`, `pointerdown` and `keydown` are heard on `window` before anything else reads them. The toggle's own press and its Enter / Space are left to its `click`, or pressing it while on would stop and restart it in one go.
- **A scroll we did not write is input too.** Each frame compares `scrollY` with the position written last frame; more than `3 px` apart means a scrollbar drag, find-in-page, a link or a focus move, and the drive stops. This also covers inputs no listener sees.
- **Never by default, never under reduced motion.** The page does not move until asked. Under reduced motion the toggle stays in the tab order, so its reason can be found, but it is `aria-disabled` (`[pattern:accessibility-and-reduced-motion#motion-tiers]`).

## Parameters
Rate `90 px/s` · foreign-scroll tolerance `3 px` · end when the drive reaches `lenis.limit − .5` · Lenis `lerp .1`, `smoothWheel` only in the full tier · takeover events `wheel`, `touchstart`, `pointerdown`, `keydown` (capture, the toggle excluded for its own press and activation keys) · status texts: on, off with the reason, stopped at the end, unavailable under reduced motion.

## Motion tiers
- **Full:** the toggle works; Lenis smooths the wheel.
- **Reduced:** the toggle is `aria-disabled`, a press only announces why, and wheel smoothing is off. A running drive stops if the preference changes mid-read.
- **Static:** as reduced.

## Accessibility
- A real `<button>` with `aria-pressed` and a visible `[on]` / `[off]` state (`aria-hidden`, so the accessible name stays "Auto scroll"); `aria-describedby` points at the line that says what it does or why it is unavailable.
- One polite `role="status"` line, empty on load, written once per change with the reason ("Auto scroll off: a key press took over.").
- Any key hands back, Tab included, so a keyboard user is never chasing a moving page; arrow keys then scroll natively.
- Skip link, landmarks, one `h1`, real headings for each stretch of the walk; the dock's targets are at least `48 px` tall and the footer clears it at the end.

## Adapters
- **GSAP ticker:** drive Lenis from `gsap.ticker` as in `[recipe:boot-lenis-gsap]` and advance by `RATE × gsap.ticker.deltaTime / 1000`, clamped the same way.
- **A film clock:** point the drive at a progress target instead of the document, and keep the cap on the clock that follows it (`[recipe:gl-progress-scene-windows]`).
- **React:** create Lenis, the listeners and the ticker subscription in one `useEffect` and remove them in its cleanup; keep `on` in a ref read by the ticker and mirror it into state only for `aria-pressed`.
- **Vue / Svelte:** the same in `onMounted` / `onMount`, torn down in `onBeforeUnmount` / the returned cleanup.
- **Astro:** a client-side island (`client:idle`) around the dock; the reading content stays static HTML.

## Verify
`auto` turns it on, waits one second and checks that scroll increased and that the rate measured over the next 1.5 s is `90 ± 30 px/s`. `takeover` sends one wheel and checks `aria-pressed="false"` at once, then that the page travels only the wheel's own `200 px` and holds still over the last 500 ms. `keyed`, `drag` and `foreign` hand back by key, pointer press and an outside scroll. `keyboard` turns it on with Enter and off with Space on the same button, exactly once. `end` starts 50 px from the bottom and must stop there by itself. `rm` checks the disabled toggle and its reason, and `mobile` a tap on and a touch back. With the wheel listener removed, `takeover` fails.

## Synthetic content
The towpath, its locks, bridges and boat names, and all other copy are synthetic demo text. No media or font files ship; type uses system stacks.

Seen in: `[site:cutobot-byholm]`.
