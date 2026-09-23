# Responsive strategy

What this file is for: the decision that has to be made before the first component exists — how the layout scales, what a coarse pointer swaps out, whether the phone gets its own experience or a degraded one, and what the GL layer may cost on a mobile GPU. The corpus offers two scaling systems and two mobile philosophies; it offers almost no touch-target, zoom or reflow evidence, so those rules are the plugin's own and are marked as such. Cite as `[pattern:responsive-strategy#section]`.

## Decide before build

Why: a scaling system chosen after the components exist means every measure is rewritten twice. Two systems cover the corpus; both are decided in the direction contract and never mixed on one surface [L01] [L02].

| System | How it scales | Best for | Sites |
|---|---|---|---|
| vw-lock | every desktop measure is a fraction of one artboard; the page scales like a poster | print-like sites, one display face, few components | [site:the-line] [verified] |
| Fluid `clamp()` from a baseline | one custom property anchored to the comp width, every size derived, floors and ceilings in rem | product-like sites with many components and long copy | [site:lando-norris] [verified]; [site:leo-parpeix] [verified] |

Whichever is chosen, display type stays under ≈ 12–13 vw at its ceiling [T03] and no fixed width exceeds 600 px [L01].

## vw-lock

The Line converts each desktop value with `px / 1728 × 100` and keeps six decimals: 210 px → `12.15278vw`, 126 px → `7.29167vw`, 32 px → `1.85185vw`, 22 px → `1.27315vw`. Below its tablet breakpoint the same measures become fixed pixels (`72px`, `22px`), so small screens are fixed and large screens are fluid. Breakpoints 767 / 768 / 1023 / 1024 / 1240 / 1600, an 8 px page margin [site:the-line] [verified]. Resize costs no JavaScript, because the layout is a ratio (`[pattern:motion-vocabulary#scrub-and-refresh-rules]`).

Rules:
- Pick your artboard (1728 or 1440) and your handoff width (≈ 768); publish both as tokens (`--artboard` and the `clamp()` on `--display` in `_shared/tokens.css`, which caps at 13.125 rem).
- Wrap display sizes in `clamp()` even under a lock, so a 4K window does not set 400 px type.
- Never lock line-height or letter-spacing to vw; they are ratios of the font size already.

## Fluid clamp from a baseline

Lando derives every size from one `--fluid-font` property anchored to a 1728 px comp [site:lando-norris] [verified]; Léo Parpeix runs a fluid `clamp()` scale with gutters from 40–120 px on desktop down to 20 px on phones [site:leo-parpeix] [verified]. Rules: one baseline, one formula; floors in rem so 200 % zoom still enlarges; ceilings so ultra-wide screens do not shout; gutters and section padding on the same scale as type.

## Coarse-pointer swaps

Why: hover, drag and a drawn cursor are fine-pointer ideas. The swap list is fixed, not improvised per component (`[pattern:cursor-and-pointer#coarse-pointer-policy]`).

| Fine pointer | Coarse pointer | Evidence |
|---|---|---|
| Two-speed cursor and badges | off | [site:leo-parpeix] hides on `(hover: none), (pointer: coarse)` [recalled medium] [A08] |
| Hover preview on a list row | thumbnail in the row, or tap opens | hover-native lists vanish on touch without a fallback [site:mindmarket] [inferred] |
| Drag rail or arc | native `overflow-x: auto` with scroll snap; an edge peek shows there is more | rails fall back to native overflow on touch [site:son-daven] (skill); `[recipe:horizontal-rail]` |
| Magnetic pull | off | `[recipe:magnetic-button]` |
| Hover video in a row | a still, or the clip on tap | [site:boc] mounts clips only for `(hover: hover)` and offers touch nothing [verified] |
| Hold gate | the same gate with a larger target; `touch-action: none` on the gate only | [site:why-zero] [inferred] |
| Scroll-driven nav inversion | unchanged — it reads scroll, not hover | [site:lando-norris] samples the section under the header [verified] |

Test with `any-pointer` as well as `pointer`: a touch laptop with a mouse attached must keep the fine state available.

## Dedicated mobile versus graceful degrade

Why: a heavy canvas site has two honest options on a phone, and the corpus took both.

- **Dedicated**: Oryzo's mobile treatment is indexed on Awwwards as its own inspiration entry [site:oryzo] [recalled high]; Slosh is cited twice as proof that heavy WebGL runs on the mobile web — an engineered path, not a still [site:slosh-seltzer] [recalled medium]; Trevor Noah designed the tour flow for each device with full attention rather than reducing desktop [site:trevor-noah] [verified intent]. Floema branches its markup on the server by device class through a UA parser [site:floema-jewelry] [verified] — a third route, with the fragility UA sniffing carries.
- **Degrade**: Shopify built for 70 % mobile sessions and a 60 fps target, with three content tiers — scene, static media, text — chosen from capability and measured frame rate [site:shopify-editions-w26] [recalled high for the numbers; medium-low for the tiers].
- **The anti-model**: Lando shows a rotate-your-device prompt in phone landscape instead of a landscape layout [site:lando-norris] [verified].

Rule: dedicated when the phone is the revenue surface or the loud moment can be rebuilt smaller; degrade when the page is a document under an experience layer. Either way the phone gets the same content, headings and links, and a designed still where the scene would be.

## Mobile GL budget

Why: mobile GPUs fail on pixel count and bandwidth, not on triangle count. The rules below are the genre's survival kit as the Slosh card records it [site:slosh-seltzer] [inferred; not verified on Slosh itself] and as a third party reconstructs Shopify's tiers [site:shopify-editions-w26] [recalled medium-low]; `_shared/quality-tiers.js` encodes them.

| Rule | Value | Source |
|---|---|---|
| DPR cap | ≈ 1.5–2: high tier ≤ 2, mid ≤ 1.5, low 1 | [site:shopify-editions-w26] DPR ≤ 2 at high [recalled medium-low]; `quality-tiers.js` |
| Absolute pixel cap | 2560 × 1440 at high, 1920 × 1080 mid, 1280 × 720 low; DPR scaled down to fit | [site:slosh-seltzer] [inferred]; `applyRendererBudget()` |
| Render targets | half-float; no depth buffer on fullscreen quads | [site:slosh-seltzer] [inferred]; `stacks/three-0.186.md` |
| Anti-aliasing | SMAA in the composer, renderer `antialias: false` | [site:slosh-seltzer] [inferred] |
| Assets | low-detail variants per tier; texture format by capability | [site:slosh-seltzer] [inferred]; [site:lando-norris] [contradicted by the live build, 2026-09-18: every texture path in the shipped GL manifest is /webp/ and the only KTX2 code is GLTFLoader's inert Basis extension — recorded from a rebuild document, not observable on the site today] |
| Loop | paused off-screen and when the tab is hidden | [site:slosh-seltzer] [inferred] [M08] |
| Adaptive | step DPR, blur samples and geometry detail from measured frame time | [site:why-zero] [verified]; 30 fps target at low [site:shopify-editions-w26] [recalled medium-low] |

## Never reload at a breakpoint

Why: Lando forces a full page reload when the viewport crosses 992 px because its six scenes cannot resize [site:lando-norris] [verified]. Zoom users, split-screen users and anyone dragging a window edge trip it, and every transition, scroll position and form field is lost.

Rules: rebuild scenes on a debounced `ResizeObserver` and refresh triggers afterwards; breakpoint-specific choreography lives in `gsap.matchMedia()` blocks that revert themselves, or in Anime's `createScope({ mediaQueries })`, which re-runs per query with cleanup [site:animejs] [verified]; never two scores toggled by `display: none`; `ScrollTrigger.config({ ignoreMobileResize: true })` so the address bar does not trigger rebuilds (`stacks/vite-vanilla.md`).

## Navigation and rails on small screens

- A side index collapses under ≈ 900 px into a conventional, visible nav: Seasats hides its rotated scrollspy below that width [site:seasats] [clone-described]; Shopify's numbered sidebar is collapsible on mobile and its phone nav is a full-height overlay of stacked labels [site:shopify-editions-w26] [recalled medium-low]; Léo Parpeix's phone nav is a fullscreen overlay with numbered links [site:leo-parpeix] [recalled medium]. The same wayfinding must exist at both widths — a different nav model per device is the usability cost Seasats paid [site:seasats] [verified score]. Wodniack drops its section anchors on the phone, leaving only scroll [site:wodniack] [verified]; Boc folds its filter sidebar into an inline block above the rows [site:boc] [verified].
- Horizontal rails become native overflow on touch (`[recipe:horizontal-rail]`); pinned chapters keep working because sticky stages need no pin (`[recipe:sticky-stages-rails]`).
- The cursor-driven hero (fluid wake, magnetic pull, hover reveals) becomes a still or a tap-driven state; the theme swap and the preloader stay.

## Checks

Plugin rules; no card documents any of them:
- 320 px wide with no horizontal scroll and nothing clipped (WCAG reflow); the vw-lock's fixed-px handoff makes this the width to test.
- 200 % browser zoom: text enlarges (rem floors), the layout does not reload or lock, sticky stages still release.
- Touch targets ≥ 44 × 44 CSS px for every control and list row; 24 px is WCAG's AA minimum, 44 the AAA size and the comfortable one.
- Phone landscape gets a layout, not a prompt.
- `capture.mjs` runs desktop 1440 × 900 and mobile 390 × 844 at every scroll state; both must show the same headings.

## Verify

- [ ] Scaling system named in the direction contract; artboard and handoff width as tokens; display ≤ 13 vw under `clamp()`.
- [ ] The coarse-pointer swap list applied in full; `any-pointer` tested.
- [ ] Dedicated or degrade decided; the phone gets the same content and a designed still.
- [ ] DPR and pixel caps, half-float targets, SMAA, low-detail variants and the off-screen pause all wired through the tier.
- [ ] No `location.reload()` on resize; scenes rebuild on `ResizeObserver`; `matchMedia` blocks revert.
- [ ] Side index collapses to a visible nav; rails are native overflow on touch.
- [ ] 320 px, 200 % zoom, 44 px targets and a landscape layout all pass.

## Refuse

- Two scaling systems on one page; a vw value with no `clamp()` ceiling on display type.
- Hover-only, drag-only or cursor-only affordances on coarse pointers.
- A rotate-your-device prompt; a breakpoint reload; texture tiers keyed on `innerWidth`.
- An uncapped DPR on a phone; MSAA plus a post stack on mobile; loops that run off-screen.
- A different nav model per device with no shared wayfinding.
- A mobile "experience" that drops headings, copy or links the desktop has.
- The Line's breakpoint set and vw values, or Lando's 1728 baseline, as numbers to copy.
