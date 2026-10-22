# preloader-counter-hold

A counter that only counts what is loading: fonts, image decodes and a scene promise. It advances in uneven jumps but never ahead of the truth, holds at 100 for a beat, exits by lines, and is skipped on repeat visits.

## Why
- **Tied to a real signal.** A timer-only preloader is a lie the jury notices; the counter's ceiling is `done / total` of real promises (`[pattern:preloaders-and-transitions#the-load-contract]`).
- **Non-linear on purpose.** Jumps of 3–14 every 90 ms feel like a machine reporting, not a progress bar `[site:leo-parpeix]`; the hold at 100 is the beat before the curtain `[clone:floema-jewelry]`.
- **Repeat visits skip it.** `sessionStorage` remembers; the second load takes no gate at all, which keeps the usability axis intact.
- **Skippable and announced.** A Skip button, `role="status"` with `aria-live`, and `hidden` after exit so the overlay leaves the accessibility tree.

## Parameters
Jump `3–14` every `90 ms` · hold `450 ms` (300 under reduced motion) · exit: count `yPercent −120`, `.8 s`, `expo.in`; panel `yPercent −100`, `.9 s`, `expo.inOut` · hero lines `yPercent 120 → 0`, `1.4 s`, stagger `.09`.

## Variants
- **Boot sequence:** replace the count with telemetry lines that resolve one per signal `[site:usavionix]`.
- **Sound consent:** add an Enter button after 100 that resolves a consent promise and starts audio; never gate content on it `[site:leo-parpeix]`.
- **fps counter:** `00/24` at headline scale, each frame a signal `[site:the-line]`.

## Adapters

### React
`<Preloader signals={{ fonts: () => document.fonts.ready, scene: () => loadScene() }} onExit={({ skipped }) => …} />` from `adapters/react.jsx`, rendered first inside `<body>` in the root layout so the server paints the overlay. Without `signals` it counts fonts and image decodes; `reveal` (`.hero .line`) names the lines that rise after the exit, `storageKey` the repeat-visit flag.
- With `<SmoothScroll awardsHook="manual">` ([recipe:boot-lenis-gsap]), pass `awardsHook` here so `window.__awards.ready` resolves on the exit, not on fonts.
- Keep it mounted after the exit: it hides itself (`hidden`, `aria-hidden`), and unmounting would cut the hero reveal short. On a repeat visit the server-rendered overlay shows until hydration; an inline head script reading the same `sessionStorage` key can hide it earlier. `'use client'` for Next's App Router.

### Webflow
- Designer: the first element in the body, a Div `preloader` with the custom attributes `data-preloader`, `role="status"` and `aria-live="polite"`. Inside: a paragraph `preloader__count` whose `mask` span holds a `line` span with `data-count` and the text `000`; a List `preloader__signals` with `data-signals` and items `data-signal="fonts"`, `"images"`, `"scene"`; a Skip button with `data-skip`. Only the page that gates (usually home) carries it.
- The images signal decodes every `document.images`, and Webflow marks images `loading="lazy"` (`references/stacks/webflow-export.md`). A decode of a lazy image below the fold waits until it loads [inferred], so narrow the signal to the hero (`img[data-preload]`) and set that image to eager.
- No Webflow page-load interaction on the preloader or the hero lines: the module moves the count, the signals, the panel and the hero lines.
- Inject: the engine from the [recipe:boot-lenis-gsap] Footer-code loader, this module mounted only where `[data-preloader]` exists. On that page the boot does not call `awards.ready()`; the preloader does on exit. The `html.is-loading .hero .line` rules from `style.css` go in Head code.
- Reduced motion: the count and a 300 ms hold remain, the exit is a cut and the hero lines are simply visible. Rename the `awards:preloaded` key per site.

Seen in: `[clone:floema-jewelry]`, `[site:leo-parpeix]`, `[site:the-line]`, `[site:son-daven]`, `[site:usavionix]`.
