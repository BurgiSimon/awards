# Swiper 14.3

<!-- Labels: [verified: source] = read from `npm pack swiper@14.3.0` (package.json exports, shared/swiper-core.mjs, modules/*.mjs, swiper.css; banner "Released on: September 28, 2026"), 2026-10 · [verified: Context7] = `/nolimits4web/swiper` (repo demos and the React consumer fixture; Context7 indexes v11.2.10, so its snippets confirm shape, not 14.x details), 2026-10 · [recalled] · [unverified]. Swiper is not pinned in `references/stacks/versions.md`; 14.3.0 is the npm `latest` on 2026-10-05. -->

## What it is for in this skill set
The off-the-shelf slider for content rails the jury will only glance at: testimonials, stats rows, product rails, a phone-only card row. It moves a `.swiper-wrapper` of `.swiper-slide`s by transform, with touch, loop, rewind, breakpoints and modules for navigation, pagination, keyboard, a11y, autoplay and effects [verified: source]. The corpus reaches for it on Webflow and template-shaped builds, almost never for the signature moment. When the carousel *is* the moment (blur-peek, spring snapping, WebGL-synced drag), build it: [recipe:blur-peek-snap-carousel], or smooothy (`references/stacks/smooothy-0.0.md`). A rail moved by page scroll is [recipe:horizontal-rail], not Swiper. Never let Swiper own page scroll; Lenis does that.

## Install (pinned)
```sh
npm i -E swiper@14.3.0
```
```js
import Swiper from 'swiper';                                   // core only: no modules registered [verified: source swiper.mjs]
import { Navigation, Pagination, Keyboard, A11y, Autoplay, EffectFade } from 'swiper/modules';   // [verified: source modules/index.mjs]
import 'swiper/css';                                           // core styles [verified: package.json exports]
import 'swiper/css/navigation';                                // one entry per module that styles (pagination, effect-fade, a11y, ...) [verified: exports]
```
- `swiper/bundle` + `swiper/css/bundle` register every module; only for prototypes [verified: exports]. The Context7 demos use `swiper/swiper-bundle.mjs` [verified: Context7].
- Framework entries: `swiper/react` (`Swiper`, `SwiperSlide`, `useSwiper`, `useSwiperSlide`, `modules={[...]}` prop) [verified: Context7 React fixture]; `swiper/vue` and the web component `swiper/element` (`register()`, `<swiper-container>`) also ship [verified: source].
- MIT, no runtime dependencies [verified: package.json]. Core alone is 66 KB minified (`shared/swiper-core.min.mjs`); [site:nodeck] fetched an 84 KB Swiper chunk.
- The corpus shipped 8 and 11 from CDNs; 14 is two majors on. No changelog ships in the tarball, so anything carried from an 11-era snippet is [unverified] until checked against swiperjs.com.

## The API surface we use
Core options [verified: source `defaults` in swiper-core.mjs]:
| Option | Default | Use |
|---|---|---|
| `init` | `true` | `false` + `swiper.init()` when a scroll gate or a fonts-ready promise decides when it builds |
| `speed` | `300` | ms per slide transition; route through the motion tier (see reduced motion) |
| `slidesPerView`, `spaceBetween` | `1`, `0` | `'auto'` lets CSS widths win; `spaceBetween` is px |
| `breakpoints`, `breakpointsBase` | unset, `'window'` | per-width option overrides; `'container'` measures the slider |
| `centeredSlides`, `slidesOffsetBefore/After` | `false`, `0` | peek layouts |
| `loop` / `rewind` | `false` | `loop` clones and re-orders slides; prefer `rewind` unless the design needs endless |
| `allowTouchMove` | `true` | `false` keeps buttons and keys but kills drag ([site:stanzza]) |
| `cssMode` | `false` | native scroll-snap underneath; cheaper, but transitions and effects are the browser's |
| `watchOverflow` | `true` | locks itself and hides nav when slides fit |
| `grabCursor`, `threshold` | `false`, `5` | drag affordance; px before a drag counts |
| `effect` | `'slide'` | `'fade'`, `'creative'`, `'cards'` etc. need their module |
| `resizeObserver` | `true` | re-measures on container resize |

Modules [verified: source `extendParams` per module]:
- `a11y`: `enabled: true` once the module is registered; sets slide `role: 'group'` with `'{{index}} / {{slidesLength}}'` labels, an `aria-live` region, and makes off-slides `inert` on Tab-out in loop mode so focus can leave. Messages are English; localise `prevSlideMessage`, `nextSlideMessage`, `paginationBulletMessage`.
- `keyboard`: `enabled: false`, `onlyInViewport: true`, `pageUpDown: true`.
- `autoplay`: `enabled: false`, `delay: 3000`, `disableOnInteraction: false`, `pauseOnMouseEnter: false`; listens to `visibilitychange`. Instance: `swiper.autoplay.start() / stop() / pause() / resume()`, `running`, `paused`, `timeLeft`; events `autoplayStart`, `autoplayStop`, `autoplayPause`, `autoplayTimeLeft(s, ms, ratio)` for a progress ring.
- `navigation`: `nextEl`, `prevEl`, `addIcons: true` (injects its own arrow SVG; set `false` for your own glyphs), `hideOnClick`.
- `pagination`: `el`, `type: 'bullets' | 'fraction' | 'progressbar' | 'custom'`, `clickable: false` by default, `renderFraction` for a `1 | 14` counter.
- `fadeEffect`: `crossFade: false`, `mode: 'default'`; 14.x also has an `'out-in'` mode [verified: source; new-in-version unverified].
- `mousewheel`: `enabled: false`, `releaseOnEdges: false`, `forceToAxis: false`.

Instance [verified: source]: `slideTo(i, speed)`, `slideNext()`, `slidePrev()`, `slideToLoop(realIndex, speed)` (use with `loop`), `setProgress(p, speed)`, `update()`, `enable()` / `disable()`, `destroy(deleteInstance = true, cleanStyles = true)`, `on(event, handler)`; read `activeIndex`, `realIndex`, `progress`. Events `slideChange`, `setTranslate`, `progress`, `transitionEnd` [verified: source emits; event list beyond these recalled].

Theme with CSS custom properties, not overrides: `--swiper-theme-color` (defaults to `#007aff`, change it), `--swiper-navigation-size`, `--swiper-pagination-color`, `--swiper-pagination-bullet-inactive-color`, `--swiper-wrapper-transition-timing-function` [verified: source swiper-bundle.css].

## Integration with the others
```js
// scroll-gated build, the [site:stanzza] shape: ScrollTrigger decides, Swiper only slides
let swiper = null;
ScrollTrigger.create({
  trigger: '.projects', start: 'top -50%', end: 'bottom bottom', scrub: 0.8,
  onUpdate(self) {
    const open = self.progress >= 0.48;
    if (open && !swiper) swiper = new Swiper('.projects .swiper', {
      modules: [Autoplay, A11y, Keyboard], allowTouchMove: false,
      keyboard: { enabled: true }, autoplay: { delay: 5000 }, speed: tier.speed(700),
    });
    if (!open && swiper) { swiper.slideToLoop(0, 0); swiper.destroy(); swiper = null; }
  },
});
```
- A factory that forces `a11y` on and passes `speed` through the motion tier is the [site:nodeck] pattern; copy it so no rail ships without both.
- Lenis: a vertical Swiper or `mousewheel` rail inside a Lenis page needs `data-lenis-prevent` on `.swiper`, or Lenis eats the wheel [recalled from Lenis behaviour, see `references/stacks/lenis-1.3.md`]. Horizontal touch drags are not affected.
- GSAP on slides: animate children of `.swiper-slide`, never the slide or wrapper transform; Swiper writes those every frame. Drive per-slide reveals from `slideChange` or `progress`.
- Page transitions: `destroy()` in the leave hook, rebuild in enter; a stale instance keeps its resize observer.

## Reduced motion and accessibility hooks
Swiper has no `prefers-reduced-motion` handling of its own: no `matchMedia` call anywhere in the package [verified: source grep]. Do it yourself under reduced motion: shorten `speed` ([site:nodeck] keeps `max(180, 40 %)` of it), do not start `autoplay`, prefer `effect: 'slide'` over cube/flip/creative. Register `A11y`; give navigation real `<button>`s with labels; turn `keyboard` on; any autoplay longer than five seconds needs a visible pause control (WCAG 2.2.2), which the module does not render. Do not set `a11y: false` as [site:siteassist] did.

## Performance rules
Import core plus the modules you use; `swiper/bundle` pulls every effect. Build lazily (`init: false`, or construct on first intersection) when the rail sits below the fold. `loop` duplicates DOM and images; `rewind` costs nothing. `cssMode` hands the transition to the compositor at the cost of effects and custom speed curves. Lazy images: native `loading="lazy"` plus `lazyPreloadPrevNext` [verified: option exists].

## Gotchas
- Modules do nothing unless passed in `modules: [...]` (or `Swiper.use`) when you import from `swiper` [verified: source].
- Pagination bullets are not clickable by default (`clickable: false`) [verified].
- The default blue `--swiper-theme-color` and the injected arrow SVG (`addIcons: true`) are template tells; replace both [verified: defaults].
- Building inside a hidden or `display: none` parent measures zero; call `update()` after it shows.
- `allowTouchMove: false` also disables mouse drag; the rail then moves only by buttons, keys or autoplay.
- Lazy-built instances must be destroyed when their gate closes, or each re-entry stacks another [site:stanzza].
- An 8/11-era CDN snippet is not a 14.3 snippet; version-check option names before copying.

## Where the corpus used it
[site:stanzza] (Swiper 11, built and destroyed by ScrollTrigger progress, 5 s autoplay, touch off) · [site:nodeck] (rails and the slides menu behind a factory with a11y forced on and speed tied to the motion tier) · [site:son-daven] (`swiper@11` floating on a CDN, galleries with a `1 | 14` counter) · [site:siteassist] (Swiper 11 quote fader, `effect: 'fade'`, `a11y: false`) · [site:primesec] (looping testimonial cards with arrows, pagination, scrollbar and keyboard) · [site:abatable] (Swiper 8 stats row) · [site:serotoninn] (phone-only product rail) · [site:pensatori-irrazionali] (sample rails, Swiper on touch). [site:bethebuzz] (Swiper CSS `swiper-icons` only) and [site:the-boyd] (Swiper CSS inlined, no Swiper JS found) show its stylesheet without a confirmed instance.
