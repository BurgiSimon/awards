# Internationalisation and commerce

What this file is for: two things an award site meets after the comp is approved. Part A is a second language that breaks the display type, the splits and the motion direction: locales, scripts, right-to-left, fonts, hreflang and a pseudo-locale check. Part B is a shop whose purchase path has to survive the motion layer: the product card, price and variants, quick add, the cart drawer and the hand-off to a hosted checkout. Read Part A when the brief names more than one language, and Part B when anything is sold. Cite it as `[pattern:i18n-and-commerce#section]`. The corpus is thin on both: no card records a right-to-left locale, and no card captured a cart, a product route or a checkout. Where this file has no card, it says so and states a plugin rule.

## Contents
**A. Internationalisation**
1. [Locales in the corpus](#locales-in-the-corpus)
2. [Long and short languages](#long-and-short-languages)
3. [Splitting across scripts](#splitting-across-scripts)
4. [Right to left](#right-to-left)
5. [Fonts per locale](#fonts-per-locale)
6. [hreflang and the switcher](#hreflang-and-the-switcher)
7. [The pseudo-locale check](#the-pseudo-locale-check)

**B. Commerce**
8. [Shops in the corpus](#shops-in-the-corpus)
9. [Product card and price](#product-card-and-price)
10. [Quick add and the cart drawer](#quick-add-and-the-cart-drawer)
11. [Checkout hand-off](#checkout-hand-off)
12. [Motion out of the purchase path](#motion-out-of-the-purchase-path)
13. [Verify](#verify) · [Refuse](#refuse)

## Locales in the corpus

| Card | Locales and mechanism | Confidence |
|---|---|---|
| [site:son-daven] | EN / UA through Webflow Localization, hreflang en / uk / x-default, a UA toggle in the header | [verified] |
| [site:floema] | four locales with translated path segments (`/products` → `/produits`, `/produtos`, `/productos`), hreflang for each plus x-default | [verified] |
| [site:boc] | en / ca / es alternates | [verified] |
| [site:goats] | Polish first, with EN and DE routes; the current language in the one accent | [verified] |
| [site:to-top] | DE → EN subdirectory translation by Weglot; a flag beside an EN switch | [verified] |
| [site:agrumeafarm] | IT / EN discs, the active language in the accent | [verified] |
| [site:runrobrun] | EN / DA / PT in the footer | [verified] |
| [site:usavionix] | two variable families split by `unicode-range` into 5 + 6 files, only the Latin slice preloaded | [verified] |

None of these cards compares the display type across its locales. What breaks is the plugin's own reading, from the platform sources below.

## Long and short languages

Why: a display line locked to an English word fits that word only. Translations from English into European languages grow most on short strings: up to 10 characters average 200–300 %, 11–20 characters 180–200 %, and over 70 characters 130 % [verified: W3C i18n, "Text size in translation", citing IBM figures]. Many non-Latin scripts have taller characters and need more leading; Thai takes about 150 % of the Latin vertical space [verified: same].

Rules:
- Size display type per locale, not per string: `:lang(de) { --display: … }` in the token layer, and re-fit by container width (`cqw`) rather than viewport width when a word must fill a box.
- `hyphens: auto` only works with a correct `lang` and an available dictionary [verified: MDN hyphens]. Set `lang` per document and per inline foreign phrase (A09). Never hyphenate display words; shorten the copy or step the size.
- Line masks that clip at a leading of .8 cut accents, descenders and tall scripts. Each locale gets its own leading token, and the mask clears it (`[pattern:motion-vocabulary#masked-line-reveals]`).
- Short languages leave holes too. A three-word Chinese headline in a slot drawn for twelve English words needs its own layout decision, not a stretched size.
- Labels, buttons and nav items wrap, never truncate. Test the longest locale at 390 px.

## Splitting across scripts

| Script | Split by | Source |
|---|---|---|
| Latin, Cyrillic, Greek | lines or words; chars only for a logo | `[recipe:split-text-masked-reveal]` |
| Chinese, Japanese and other text written without spaces between words | words found by `Intl.Segmenter`, fed to SplitText through `prepareText` or a `wordDelimiter` RegExp | `Intl.Segmenter` segments graphemes, words and sentences by locale, Baseline 2024 [verified: MDN]; `prepareText` exists for languages with no spaces [verified: gsap.com SplitText docs] |
| Arabic, Persian, Indic scripts | lines only, never chars | element boundaries that divide grapheme clusters or ligatures may give inconsistent results; shaping must break at inline boundaries with margin, border or padding or a changed `vertical-align`; letter-spacing on cursive scripts should be avoided [verified: W3C CSS Text 3, §1.4, §7.2.1, §7.3]; a transformed character box breaking the join is [inferred] |
| Any script | after `document.fonts.ready` for that locale's face | SplitText warns when splitting before fonts load [verified: gsap.com SplitText docs] |

Kerning between characters is lost when each character becomes its own element [verified: gsap.com SplitText docs]. That is one more reason to split words in every language. The accessibility rules for split text are in `[pattern:seo-and-semantics#lazy-and-split-text]`.

## Right to left

No card in the corpus records a right-to-left locale [verified: search of every card for `rtl`, `dir=` and Arabic, 2026-10-22]. A currency switch with AED, SAR and QAR [site:the-boyd] [verified] is the closest one gets. These are plugin rules built on the platform sources.

- `dir="rtl"` goes on `<html>`, never CSS `direction`. Inserted or user text takes `dir="auto"` or `<bdi>` [verified: W3C i18n, "Structural markup and right-to-left text in HTML"].
- Layout uses logical properties (`margin-inline-start`, `inset-inline-end`, `padding-block`), which follow the writing direction [verified: MDN CSS logical properties].
- Motion is physical. GSAP `x`, `xPercent` and `clip-path` insets do not mirror, so every horizontal value is multiplied by one `--dir` sign read from `<html>`. Rails, marquees, "next" arrows, wipes, the discipline slide and the cursor's offset all flip. A drag that advances to the left in LTR advances to the right in RTL.
- WebGL scenes, camera paths and SDF type do not read `dir`. Mirror the camera path or keep the scene neutral, and keep glyphs from the DOM (`[pattern:webgl-architecture#text-in-webgl]`).
- Numbers, Latin brand names and code inside RTL copy sit in `<bdi>` so they do not reorder.

## Fonts per locale

- `unicode-range` downloads a face only when the page uses a character in its range [verified: MDN unicode-range]. Ship one subset per script and preload only the current locale's slice [site:usavionix] [verified].
- The budget (P05: ≤ 4 files, ≤ 400 KB) applies per locale route, not to the sum of every locale.
- The fallback face is metric-matched per script, because a Latin `size-adjust` does not hold for Cyrillic or Greek glyphs (`[pattern:typography#loading]`). One variable TrueType with no subset and no woff2 for four locales is the miss [site:floema] [verified].
- A display face that lacks a locale's glyphs falls back mid-word. Choose a family that covers every launch locale, or give that locale its own display face on purpose and record it in `DESIGN.md`.

## hreflang and the switcher

- Each language version lists itself and every other version. `x-default` is the fallback. Values are an ISO 639-1 language with an optional ISO 3166-1 alpha-2 region. HTML links, HTTP headers and the sitemap are equivalent methods [verified: developers.google.com, localized versions].
- Each locale has its own URL, its own `<title>`, description and canonical, and a `lang` on `<html>` (`[pattern:seo-and-semantics#the-head-per-route]`). Translated path segments read best [site:floema] [verified].
- The switcher links to the same page in the other locale, not to the home page. Each name is written in its own language, with `lang` and `hreflang` on the link. The language's own name is the label, and a flag beside it is decoration at most [site:to-top] [verified]. The current language may take the accent [site:goats] [site:agrumeafarm].
- No automatic redirect by IP or browser language: suggest, then let the visitor choose.

## The pseudo-locale check

A plugin procedure for any multi-locale build, and for single-locale builds whose copy may later be translated:

1. Generate an `xx` locale from the source strings: each Latin letter accented (`a` → `å`), each string padded by 40 % (by 100 % under 20 characters) and wrapped in `⟦ ⟧`, so truncation and concatenation show.
2. Add an `xx-rtl` variant with `dir="rtl"` on `<html>`.
3. Capture both with `capture.mjs` at every viewport, with `--states` for the menu, the cart and the forms. Run `audit.mjs --render` for horizontal overflow (L02), invisible content (L06), line length (L07) and text at the phone edge (L08).
4. Open every frame. A missing `⟦`, a clipped accent in a line mask, a mirrored rail that still moves the wrong way and an untranslated canvas string are the usual findings.

The recipes run a lighter version of the same check: `verify-recipes.mjs --pseudo` lengthens every text node by about 40 % with accented letters, then flips the page right to left, on a phone, and fails on horizontal overflow or a control whose label is cut off.

---

## Shops in the corpus

| Card | Commerce | Confidence |
|---|---|---|
| [site:serotoninn] | products, prices, sizes, a bag, favourites and search on the home page; `BAG.0` and `FAVOURITES.0` in the header; the whole catalogue inlined as JSON, a 928 KB document; 308 of 366 images with `alt=""`; product and cart routes not captured | [verified] |
| [site:the-boyd] | prices in AED with a four-currency switch, `CART (0)` in the header, Stripe checkout; priced cards or "price by enquiry"; the image host is gone, so the cards now show titles and prices over empty frames | [verified] |
| [site:united-carriers] | Webflow Ecommerce on Stripe behind `/merchandises` and `/checkout`; the interaction accent on cart and checkout; eight card marks in the footer | [verified] |
| [site:floema] | a catalogue with wishlist and quote modals, a colour swatch row ("+4") and no checkout in the served markup | [verified] |
| [site:agrumeafarm] | the home page as a ring of product jars, each a link with alt text to its product route; the jar flies into the product page | [verified]; product routes [unknown] |
| [site:aardvarkbookclub] | a subscription with an add-to-box action on every book | [verified]; cart [unknown] |
| [site:aqualoqa] | a password-gated Shopify Horizon store behind a splash | [verified] |
| [site:white-desert] | priced trips from US $16,500 as flickable cards, enquiry-led | [verified] |

Price on the page is the corpus's strongest commerce move: published prices on a high-ticket site [site:white-desert], plain-number plans [site:okaydev] [verified]. The action has to match the stakes (`[pattern:copy-and-content#conversion-matched-to-stakes]`).

## Product card and price

- **Card anatomy.** One `<a>` to the product page holds the image with real alt text, the name and the price. An `<a>` may not contain interactive content [verified: MDN `<a>`], so swatches and quick add sit beside the link, not inside it. A shop with empty product alts is the miss [site:serotoninn].
- **Price.** Text, never an image or canvas glyphs. Formatted by `Intl.NumberFormat` with the locale and currency; separators, symbol position and minor units differ by locale [verified: MDN Intl.NumberFormat]. Use `tabular-nums`, keep the currency code beside the symbol wherever a switch exists [site:the-boyd], and write "price by enquiry" as words, not a blank.
- **Reductions.** In the EU, a trader announcing a discount shows the lowest price it charged for the item in the last 30 days [verified: europa.eu, Your Europe, unfair pricing]. The strike-through is that price, not a list price.
- **Variants.** A radio group (`fieldset`, `legend`, one `input type="radio"` per option); arrow keys move the selection; unavailable options stay focusable and are announced as unavailable. A colour that repaints the world is allowed only when the product has real variants (`[pattern:components-catalog#colour-bound-product-row-and-theme-switcher]`).
- **Data.** `Product` and `Offer` JSON-LD for what the page shows (`[pattern:seo-and-semantics#structured-data]`). The catalogue is fetched per page, not inlined whole into every document [site:serotoninn] [verified].
- **Images.** Dimensions, `sizes`, lazy below the fold, on a host the site controls [site:the-boyd] [verified] (`[pattern:asset-pipeline#images]`).
- **Specification.** `[recipe:product-specification]` models a `<dl>` of facts with units as text and a native `<details>` for care notes.

## Quick add and the cart drawer

- **Quick add** is a `<button>` beside the card link that names its product ("Add *Name*, size M"). With variants, it opens the variant choice instead of guessing. Its answer is a polite live-region message ("Added. Bag: 2") and an updated count in the header button, never only an animation.
- **The bag button** shows the count as text (`Bag (2)`), with `aria-expanded` when it opens a drawer.
- **The drawer** is a native `<dialog>` opened with `showModal()`: background inert, focus on its heading, Escape closes, focus returns to the button, and Lenis is stopped with `data-lenis-prevent` on the list (`[recipe:dialog-nested-lenis-sheet]`, `[pattern:accessibility-and-reduced-motion#overlays-and-focus]`). On phones it is a bottom sheet with the checkout button always in view.
- **Line items** have a quantity stepper of real buttons with the input between, a remove button named for the item, and the subtotal in a live region.
- **Persistence and errors.** The cart lives on the commerce backend (a cart id), not only in `localStorage`, and survives a route change and a reload. Out of stock, a quantity limit or a network failure is stated in words next to the control, never as a shake.

## Checkout hand-off

Why: the hosted checkout is the platform's job, and it takes card data off the award site's pages.

- Shopify headless: the cart returns a `checkoutUrl` that redirects the buyer through Shopify's web checkout; request it when the buyer is ready and request it again if stale [verified: shopify.dev, Storefront API cart guide].
- Stripe: Checkout can be a full page hosted by Stripe or embedded on the site [verified: docs.stripe.com/payments/checkout].
- The hand-off button is a plain button or link labelled with the outcome ("Checkout", "Pay securely"). It skips the route curtain, has no preloader in front of it, and is never animated after the click.
- From 28 June 2025 the European Accessibility Act covers online shops in the EU; service businesses with fewer than 10 employees and under €2 million turnover are exempt [verified: europa.eu, Your Europe, accessibility requirements]. That reaches the product pages and cart the site builds, not only the hosted checkout [inferred]. What it requires in detail is a question for counsel [unverified].

## Motion out of the purchase path

Plugin rules. No card captured a purchase path, so none is cited:

| Moment | Allowed | Refused |
|---|---|---|
| Product card hover | image swap or a slight scale on transform; the price never moves | a cursor label as the only add affordance; a GL distortion over the price |
| Add to bag | the button's own state change (≤ 200 ms) and the count updating | a flying product clone that delays the confirmation or the next click |
| Drawer open | ≤ 300 ms from its edge; instant under reduced motion | a full-page curtain; a scroll lock with no `data-lenis-prevent` |
| Product → checkout | an immediate navigation | a route transition, a preloader, a sound |
| Variant change | an instant image and price update, then an optional crossfade | a timeline that must finish before the price is correct |

INP applies here first: time `add-to-bag`, `variant-change` and `drawer-open` in a `--states` plan on the throttled phone pass (`[pattern:performance-cwv#keeping-interactions-under-200-ms]`). A full-page curtain on every click [site:serotoninn] [verified] is what to beat.

## Verify

- [ ] Each locale: its own URL, head, `lang` and hreflang set; the switcher keeps the page; no auto-redirect.
- [ ] Display, leading and mask tokens per locale; the pseudo-locale and its RTL variant captured and audited clean.
- [ ] Splits by words or lines per script, after that locale's fonts; no char splits on cursive scripts.
- [ ] RTL: `dir` on `<html>`, logical properties, every horizontal motion value signed by direction.
- [ ] Per-script font subsets with only the current slice preloaded; P05 met per locale.
- [ ] Product cards: one link plus sibling controls; prices as formatted text; real alt text; JSON-LD for what is shown.
- [ ] Quick add, bag and drawer work by keyboard, announce their results and survive a reload.
- [ ] Checkout is a direct hand-off with no motion; purchase-path states pass INP on the throttled phone.

## Refuse

- Display sizes fitted to English only; truncated labels; hyphenated display words.
- Character splits on Arabic, Persian or Indic text; splits before the locale's fonts land.
- CSS `direction` for the base direction; motion that does not mirror in RTL.
- One font file for every script; a flag as the only language name; a switcher that returns to the home page.
- Prices as images; a strike-through price that is not the 30-day lowest in the EU; buttons inside the product link.
- A cart only in `localStorage`; an add-to-bag confirmed only by animation.
- A route curtain, preloader or sound between the bag and the hosted checkout.
