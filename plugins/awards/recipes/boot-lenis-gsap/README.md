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
- **React:** `<ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>` plus `useGSAP` for the ticker hookup (see `references/stacks/next.md`).
- **Astro:** run this module inside a `client:load` island or a plain `<script type="module">`; re-run on `astro:page-load` when using View Transitions.

Seen in: `[site:leo-parpeix]`, `[site:lando-norris]`, `[site:mont-fort]`.
