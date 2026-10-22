# boot-lenis-gsap

The foundation every other recipe assumes: Lenis smooth scroll driven by GSAP's ticker, ScrollTrigger kept in sync, text work gated on `document.fonts.ready`, a reduced-motion tier declared once through `gsap.matchMedia`, and the `window.__awards` hook that `capture.mjs`, `verify-recipes.mjs` and the jury use.

## Why
- **One clock.** Lenis, ScrollTrigger and every loop tick from `gsap.ticker`; `lagSmoothing(0)` keeps scroll-linked values honest after a tab switch. Two smooth-scroll libraries, or CSS `scroll-behavior: smooth` next to Lenis, produce fighting scroll positions.
- **Scrubbed tweens use `ease: 'none'`.** The smoothing already lives in Lenis' lerp (0.1 here); an eased scrub double-smooths and lags.
- **Reveal once.** Chapters enter through a class toggle so CSS owns the reduced-motion variant; nothing replays on the way back up.
- **Reduced motion is a tier.** Under `prefers-reduced-motion` the hero lines fade instead of rising and chapters skip the translate; content is never hidden behind an animation that will not run.

## Parameters
`lerp: 0.1` (Lenis) · hero `yPercent: 120 → 0`, `1.4 s`, `expo.out`, stagger `0.09` · readout `scrub: 0.4` · reveal at `top 80%`, `once: true`.

## Accessibility
Skip link, landmarks, `aria-live="polite"` readout, no hover-only affordances. Keyboard scrolling works because Lenis leaves native keyboard scrolling alone.

## Adapters
- **Astro:** run this module inside a `client:load` island or a plain `<script type="module">`; re-run on `astro:page-load` when using View Transitions.

### React
`adapters/react.jsx` exports `SmoothScroll` (default) and `useLenis`, the recipe's three moves as `HeroLines`, `ScrollProgress` and `Reveal`, and the `motionTier()` they read.
- Mount `<SmoothScroll>` once around the whole app. In Next's `app/layout.tsx` it wraps `{children}`; the adapter's own `'use client'` line keeps the layout a Server Component.
- Props: `lerp` (0.1), `options` (any other Lenis option; `autoRaf` is forced off because `gsap.ticker` drives it) and `awardsHook`: `false` by default, `true` installs `window.__awards` and resolves `ready` after fonts, `'manual'` leaves `ready` to a preloader. The hook is optional in an app and needs `_shared/awards-hook.js` copied beside the adapter.
- Every other adapter reads the instance with `useLenis()`; `useLenis((l) => …)` also runs on each scroll. `ReactLenis` from `lenis/react` with `autoRaf: false` (`references/stacks/next.md`) is the alternative provider, never a second one.

### Webflow
This module is the engine's boot, the `src/main.js` of `references/stacks/webflow-export.md`; every other recipe's Webflow module mounts from it and reuses its Lenis.
- Designer: give the page wrapper Tag **Main** and id `main`, and make a "Skip to content" link to `#main` (class `skip-link`) the first element in the body. Chapters that reveal once are Sections with the custom attribute `data-reveal`; the scrubbed readout is a span with `data-progress` inside a paragraph with `aria-live="polite"`. The hero's masked lines need a `mask` span (`display: block; overflow: hidden`) around each `line` span; if the Designer will not nest spans that way [unverified], let [recipe:split-text-masked-reveal] split the heading instead.
- Inject once, in Site settings → Custom code → Footer code: `<script type="module" src="https://your-origin/main.js"></script>`. The origin must send CORS headers, or the module fails and the site is a static Webflow page.
- Turn off every second scroll model: no smooth-scroll cloneable, no class that sets `scroll-behavior: smooth`, and one owner for in-page links. Webflow's built-in smooth scroll animates them; hand them to Lenis (`anchors: true`) instead. Where Webflow's switch for it lives is [unverified].
- GSAP: bundle it, pinned, with Settings → GSAP integration off, or use the integration and bundle none. Two cores on one page is what [site:abatable] and [site:primesec] ship.
- Reduced motion: the module's `gsap.matchMedia` picks the hero and chapter vocabulary, and Lenis honours the OS setting itself. Interactions with GSAP elsewhere on the page has its own reduced-motion settings; set them to agree.

Seen in: `[site:leo-parpeix]`, `[site:lando-norris]`, `[site:mont-fort]`.
