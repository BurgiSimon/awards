# Consent and banners

What this file is for: the consent banner, the one piece of chrome many winners let cover their own first viewport. It gives what the corpus records, the legal floor no further than the official sources go, the plugin's rules for placement, size, blocking, keyboard, motion and loading, and how a capture shows both the first visit and the clean page. Read it when the stack adds analytics, embeds or any third-party tag, and before `ship`. Cite it as `[pattern:consent-and-banners#section]`. This file is not legal advice. National laws transposing the ePrivacy Directive differ, and the client's counsel decides what the site needs.

## Contents
1. [What the corpus records](#what-the-corpus-records)
2. [The legal floor](#the-legal-floor)
3. [Placement and size](#placement-and-size)
4. [Blocking or non-blocking](#blocking-or-non-blocking)
5. [Keyboard, focus and screen readers](#keyboard-focus-and-screen-readers)
6. [Motion and the reduced tier](#motion-and-the-reduced-tier)
7. [Design in the world's register](#design-in-the-worlds-register)
8. [Loading and cost](#loading-and-cost)
9. [Captures with a banner](#captures-with-a-banner)
10. [Verify](#verify) · [Refuse](#refuse)

## What the corpus records

Why: a banner over the hero is the first thing the visitor and the jury see. Two cards name it as the cost behind their lowest axis. Counted from the cards on 2026-10-22: 14 cards record a consent surface over the site's own captures. Separately, 18 cards record Awwwards' own cookie wall over the award-entry capture, which hid score panels on several of them. Three cards appear in both groups, so 29 cards are affected in all.

| Card | What the banner covered | Confidence |
|---|---|---|
| [site:floema] | Cookiebot over the centre of all five desktop frames and the whole 390 × 844 phone viewport in all five mobile frames; the phone layout could not be seen; Usability 7.38 was the entry's lowest axis | [verified] |
| [site:mont-fort] | Cookiebot over the bottom third of the desktop viewport and ≈ 60 % of the phone in all fourteen frames, over the hero; Usability 7.40 was the lowest axis | [verified] |
| [site:to-top] | iubenda over the lower 40 % of the desktop frame and 80 % of the phone, covering the whole hero claim on the phone | [verified] |
| [site:abatable] | a ConsentPro box at the bottom right on desktop and over most of the phone screen | [verified] |
| [site:serotoninn] | a dashed-border card with brush-stroke buttons, lower right on desktop, half of every phone frame | [verified] |
| [site:siteassist] | CookieScript at the lower left on desktop and the bottom third on mobile; mobile CLS 0.34 in the same run | [verified] |
| [site:white-desert] | lower right on desktop and the bottom third on mobile, over the *Watch Film* control | [verified] |
| [site:trevor-noah] | appears after first paint and stays over the lower-right quadrant at every scroll state, covering a pull-quote and the footer index | [verified] |
| [site:primesec] | Finsweet consent at the lower right on desktop and the lower half of the phone | [verified] |
| [site:goats] | a card at the bottom left beside the reCAPTCHA badge at the bottom right; its buttons in the site's one accent | [verified] |
| [site:likova] | a cookie box at the lower left of every desktop frame, cut in the building's stepped silhouette | [verified] |
| [site:boc] | a bottom-right ticker pill with info and confirm buttons that jokes it has "nothing to consent to"; on the phone it sits over captions until dismissed | [verified] |
| [site:warmnfuzzy] | a persistent bottom-right Accept / Decline strip, ≈ 5 % of the phone viewport | [verified] |
| [site:shopify-editions-w26] | a bottom banner with Reject all, Accept and settings that collapses to a floating palette button after the choice | [verified] |

Also on record [verified on each card]: Cookiebot never rendered in any capture [site:mensch]; a banner timed to appear after 6 s [site:stanzza]; analytics gated behind a consent library whose CSS held the page's only reduced-motion query, with the beacons blocked by its default [site:mindmarket]; Consent Mode defaulting to denied [site:mont-fort]; a consent line naming another company, left over from a template [site:the-boyd]. The cards' own corrections are consistent: a small corner sheet that never covers the hero [site:mont-fort], a bar that never covers the first claim on a phone [site:to-top], the banner kept off the primary control [site:white-desert], and consent and captcha chrome kept out of the reading column [site:goats].

## The legal floor

Why: the banner exists because of a rule, and its design follows from what that rule asks for. Each point below is limited to what its source says.

| Point | Source |
|---|---|
| Storing or reading information on the visitor's device is allowed only with consent or for the necessity purposes the Article sets out. It covers "similar technologies" as well as cookies | [verified: EDPB Guidelines 2/2023 on Art. 5(3) ePrivacy Directive, §1] |
| The exemptions: storage or access for the sole purpose of transmitting a communication, or strictly necessary for the provider of a service the visitor explicitly requested | [verified: Art. 5(3) as quoted in EDPB Guidelines 2/2023, note 4] |
| Which uses fall inside the exemptions is decided case by case, under national transposition and guidance | [verified: EDPB Guidelines 2/2023, §4] |
| No cookie that requires consent is set before consent, and consent is a positive action | [verified: EDPB Cookie Banner Taskforce report, 2023, §7] |
| Access must not be conditional on accepting (a "cookie wall"); a page that hides content until *Accept* is clicked gets no freely given consent | [verified: EDPB Guidelines 05/2020 on consent, §39–41] |
| Scrolling or swiping is not a clear affirmative action | [verified: EDPB Guidelines 05/2020, §86] |
| Pre-ticked boxes do not give valid consent | [verified: EDPB Taskforce report, §10] |
| A vast majority of authorities treat a banner with no reject option on any layer that has a consent button as an infringement; a refusal offered only as a link in body text, without visual support, is not valid either | [verified: EDPB Taskforce report, §8, §14] |
| A reject button whose text contrast is so low it is unreadable is manifestly misleading; other colour choices are judged case by case | [verified: EDPB Taskforce report, §17–18] |
| Withdrawal is as easy as giving consent and possible at any time, for example through a small, permanently visible icon or a link in a standard place | [verified: EDPB Guidelines 05/2020, §113–114; Taskforce report, §32–34] |
| A cookie classed as "essential" must be shown to be essential | [verified: EDPB Taskforce report, §26–27] |

Plugin consequences: Reject sits on the first layer beside Accept with the same size, weight and contrast. Content is never held behind the choice. A withdraw control stays on every page. The cheapest banner is the one the site does not need, so ship nothing that requires consent unless the brief needs it. Whether a given analytics setup or a stored theme or sound preference needs consent is a legal question for the client [unverified]. Rules outside the EU and EEA are not covered here [unverified].

## Placement and size

Plugin rules, each checked in the first-visit frames at 1440 × 900 and 390 × 844:

- Never over the `<h1>`, the primary action, the sound toggle or the chapter rail in the first viewport.
- Desktop: a corner sheet, ≈ 360–420 px wide, on the side away from the primary action. Phone: a bottom sheet no taller than ≈ 25 % of the viewport, padded with `env(safe-area-inset-bottom)`, which holds the space iOS reserves at the bottom edge [verified: MDN env()]. The corpus spans from ≈ 5 % [site:warmnfuzzy] to the whole phone viewport [site:floema].
- A fixed overlay, never inserted into the flow at the top. "Top-of-screen cookie notices are a very common source of layout shift". Reserve the space or overlay the page [verified: web.dev/articles/cookie-notice-best-practices] (`[pattern:performance-cwv#cls-sources-on-these-sites]`).
- Shown with the first content frame, not after a delay or a scroll. A banner that arrives later covers content mid-read [site:trevor-noah] [site:stanzza] [verified on each card].
- Never stacked with other fixed chrome in one corner. A consent card and a captcha badge occupy two corners at once [site:goats] [verified].
- After the choice the banner leaves completely, or collapses to a small withdraw control of at least 24 px [site:shopify-editions-w26] [verified] (audit A14).

## Blocking or non-blocking

| Mode | Use | Contract |
|---|---|---|
| Non-blocking (default) | every consent banner | a labelled region (`<section aria-label="Cookie choices">`), the page fully usable behind it, trackers waiting for the choice |
| Modal | only a gate that must precede all content, such as an age gate or a regional acknowledgement [site:cyphercapital] [verified]; never consent alone | native `<dialog>` with `showModal()`, background `inert`, focus inside, the answer remembered (`[pattern:accessibility-and-reduced-motion#overlays-and-focus]`) |

A non-blocking banner that covers the whole phone viewport is a modal in practice [site:floema] [verified coverage]; whether it offered Reject is [unknown]. Escape on a non-blocking banner records no choice: the banner stays, or returns on the next visit. Escape is never read as consent.

## Keyboard, focus and screen readers

- Order: the skip link stays the first focusable element (audit A13). The banner region comes straight after it, so a keyboard visitor reaches the choice within two Tabs. A non-blocking banner does not take focus on load.
- Focus not obscured: a sticky banner that entirely hides a focused component fails WCAG 2.2 SC 2.4.11 (AA). The listed passing approaches are a modal, scroll padding, or closing on focus loss [verified: W3C Understanding SC 2.4.11]. Set `scroll-padding-bottom` to the banner's height while it is open.
- Controls are `<button>`s with plain names (*Accept all*, *Reject all*, *Choose*) at equal size, ≥ 24 px (A14), and 44 px on the phone. A refusal styled as a text link is refused.
- The settings layer is a `<dialog>` with a `<fieldset>` of unticked checkboxes, each with a `<label>`. Its scroller carries `data-lenis-prevent` (`[recipe:dialog-nested-lenis-sheet]`).
- After the choice: focus returns to where it was, or to `<main>` if it was inside the banner. One polite status confirms the save, and nothing else is announced.
- Contrast: Reject and Accept at the same ≥ 4.5:1 text contrast (C01 under `--render`), and the focus ring from the tokens on the banner's ground (A12).
- The banner's text is in the page's `lang`. A third-party default in another language is a defect.

## Motion and the reduced tier

| Tier | Enter | Exit |
|---|---|---|
| full | opacity plus a short translate from its own edge, ≤ 300 ms, on transform only | ≤ 200 ms |
| reduced | opacity only, ≤ 200 ms | instant |
| static | instant | instant |

Sliding a notice in can itself shift layout when it animates layout properties [verified: web.dev/articles/cookie-notice-best-practices]. The banner never appears over a running preloader, and the preloader never waits for it. Cookie consent and sound consent are two separate choices, and neither gates content (`[pattern:sound#opt-in-only]`).

## Design in the world's register

Why: the corpus banners that read as authored use the site's own grammar. Brush-stroke buttons [site:serotoninn], the building's silhouette [site:likova], the one accent on the buttons [site:goats], a ticker pill with a joke [site:boc], a hairline strip [site:warmnfuzzy] [verified on each card].

- Ground, ink, accent, radius and the label face come from `DESIGN.md`. A library's default theme is restyled or replaced.
- The copy is in the site's voice and still says what the banner is about and how to choose [verified: EDPB Taskforce report, §12]. A joke never hides the purpose. The copy goes through the copy audit like any other string (`[pattern:copy-and-content#copy-audit]`), which would have caught another company's name left in one banner [site:the-boyd].
- Equal weight for both choices. Highlighting Accept over the other options through colour and contrast is a practice the taskforce examines case by case [verified: EDPB Taskforce report, §15–19], so the accent goes on neither or on both.

## Loading and cost

- Load the notice script asynchronously. Use a synchronous script only when it must block cookies, then speed it up with resource hints. Put its tag in the HTML rather than in a tag manager. A third-party notice can cost more than a self-built one, and self-hosting can improve delivery [verified: web.dev/articles/cookie-notice-best-practices].
- Keep the text short. A notice with a large block of text can become the phone's LCP element [verified: same source].
- Tags wait for the choice: a Consent Mode default of denied [site:mont-fort], beacons blocked by default [site:mindmarket] [verified on each card]. Vimeo, maps and the audio bed wait for their own gates as well (`[pattern:asset-pipeline#budgets]`).
- A returning visitor never sees the banner flash. Read the stored choice in a head script before first paint, wrapped in try/catch, the same rule as any layout class (`[pattern:performance-cwv#two-cases-from-the-recipes]`). The banner adds no font file, image or animation library.

## Captures with a banner

Why: the plain capture pass shows what a first visitor sees, and that is evidence. A jury pass also needs the page without the banner, captured honestly.

- Keep the default scroll frames as they are. They show the banner, and its coverage per viewport goes into `AWARDS.md ## Jury log`.
- Add states (`references/capture-states.md`). Each state navigates to the target afresh, but cookies and storage persist within a viewport. A reject state run first therefore leaves the later states in that viewport clean, and its `reload` proves the choice is remembered. Each viewport has its own context and needs its own reject state.

```json
[
  { "name": "consent-open", "actions": [], "selector": "[data-consent]" },
  { "name": "consent-keyboard", "actions": [{ "type": "press", "key": "Tab" }, { "type": "press", "key": "Tab" }], "selector": "[data-consent]" },
  { "name": "consent-rejected", "actions": [
    { "type": "click", "selector": "[data-consent-reject]" },
    { "type": "waitFor", "selector": "[data-consent]", "state": "hidden" },
    { "type": "reload" },
    { "type": "waitFor", "selector": "[data-consent]", "state": "hidden" }
  ] },
  { "name": "hero-clean", "actions": [] },
  { "name": "mid-clean", "actions": [{ "type": "wheel", "dy": 2400 }, { "type": "wait", "ms": 1200 }] }
]
```

- For another site during research, click its own Reject control by selector. One retry did exactly that and got a clean hero, though its wheel states did not move past the hero [site:to-top] [verified]. An entry page was captured after *Reject all* [site:wodniack] [verified]. Reject, never Accept, so no trackers load during the capture.
- Never hide a banner with injected CSS or a bypass flag in jury evidence, because that misreports the first viewport. A banner in every frame is itself an observation about the load gate (`skills/research/SKILL.md`).
- A missing selector fails that state (exit 2) while later states still run, so read `pageErrors` before trusting a "clean" frame.

## Verify

- [ ] The site sets nothing that needs consent before the choice, and the stack lists every tag that waits for it.
- [ ] Reject and Accept on the first layer, equal in size, weight and contrast; settings unticked; a withdraw control on every page.
- [ ] The first-visit frames show the banner clear of the `h1` and the primary action, ≤ 25 % of the phone viewport, with no layout shift (P08).
- [ ] Non-blocking, reachable within two Tabs, never hiding the focused element (`scroll-padding-bottom` set), with focus returned after the choice.
- [ ] Reduced and static tiers enter without travel; the banner never sits over the preloader.
- [ ] Tokens, faces and voice from `DESIGN.md`; copy audited.
- [ ] The script loads async, the stored choice is read before first paint, and a returning visit shows no flash.
- [ ] The capture plan includes `consent-open`, `consent-keyboard`, `consent-rejected` with a reload, and clean states per viewport.

## Refuse

- A banner over the hero claim, the primary control or the whole phone viewport.
- A cookie wall; consent by scrolling; pre-ticked boxes; refusal only as a text link or as an unreadable button.
- Accept in the accent and Reject in grey; a choice that cannot be withdrawn later.
- A banner inserted at the top of the flow; one that appears after a delay or a scroll; a slide-in on layout properties.
- A modal for consent alone; Escape read as consent; focus stolen on load.
- A library default theme, language or copy left in place.
- Captures with the banner hidden by CSS; Accept clicked during research captures.
