# cart-drawer-quick-add

A product row for a small shop and the bag behind it. Each print is one link (art, name, price) with its size choice and a quick-add button beside it, never inside it. An add answers in words and a number: a polite message and the `Bag (n)` count in the header, plus the button's own short "Added" state. The bag is a native `<dialog>` opened with `showModal()`: the page behind is inert and locked, focus lands on the bag's heading, and Escape, the Close button, the scrim and the empty state's "Back to the prints" all return focus to the bag button. Line items have quantity steppers and a remove button named for their item, the subtotal is formatted by `Intl.NumberFormat`, and the checkout button in this demo only says that nothing is charged.

## Why
- **The corpus sells, but never shows the bag.** Prices in AED with a currency switch, `CART (0)` in the header and a Stripe checkout `[site:the-boyd]`; `BAG.0` in the header of a shop that puts products, sizes and the bag on its home page `[site:serotoninn]`; Webflow Ecommerce behind `/merchandises` and `/checkout`, with the interaction accent on cart and checkout `[site:united-carriers]`; an "Add to box!" action on every book card `[site:aardvarkbookclub]`, whose box itself was never observed. No card captured a cart or a purchase path, so the rules here are the plugin's: `[pattern:i18n-and-commerce#quick-add-and-the-cart-drawer]`.
- **What to beat.** Every internal click on one shop runs a 1.6 s curtain before a full reload, and the shop ships `outline: none` with no key handlers `[site:serotoninn]`. Here nothing animates between a click and its answer, and the whole path works from the keyboard.
- **The card's anatomy.** A link may not contain interactive content, so the radio group and the add button sit beside the product link; the price is text in the link and changes with the size at once (`[pattern:i18n-and-commerce#product-card-and-price]`). Specification blocks for the product page are `[recipe:product-specification]`.

## Parameters
`LOCALE 'en-GB'`, `CURRENCY 'GBP'`: money is held in pence and formatted twice, `£38` on cards (`trailingZeroDisplay: 'stripIfInteger'`) and `£38.00` in the bag · `MAX_QTY 9` per line · slide in `280ms` `cubic-bezier(.16, 1, .3, 1)`, out `200ms` `cubic-bezier(.7, 0, .84, 0)` · reduced fade `180ms` linear · "Added" state `1400ms` · drawer `min(30rem, 100%)` from the inline-end edge; under `768px` a bottom sheet up to `88dvh` with the checkout always in view.

## Behaviour
- **Quick add** reads the checked radio, adds or increments the line keyed `product:size`, updates the count and says "Added Low Sun, A2 to the bag. 2 prints in the bag." in the page's `role="status"` region. The button's name is an `aria-label` that starts with its visible text ("Add to bag, Low Sun, A2") and follows the size choice.
- **Sold out** stays a focusable radio named "A1 sold out". Choosing it writes "A1 is sold out. A3 and A2 are in stock." under the button (tied by `aria-describedby`), and an add attempt is refused in words, never with a shake.
- **The bag** renders lines keyed and in place, so a focused stepper button survives every update. The steppers use `aria-disabled`, not `disabled`, at 1 and at 9: a disabled button would drop focus to `<body>` at the moment it reaches its limit; pressing it explains the limit instead. Remove sends focus to the bag's heading, because the focused button no longer exists. An empty bag shows "Your bag is empty." with a way back and hides the subtotal and checkout.
- **Two live regions, one at a time.** While the modal is open the page, its status region included, is inert, so the bag has its own `role="status"` for quantity, subtotal and removal messages.
- **Every way out** goes through the dialog's `close` event: the page unlocks, `aria-expanded` returns to `false` and focus returns to the bag button. Escape arrives as `cancel`, which the script takes over so the exit plays its tier instead of cutting. A close during the opening reverses the running animation from where it is.
- **Checkout** is a plain button. A real shop requests its hosted checkout URL (Shopify's cart `checkoutUrl`, a Stripe Checkout session) when this is pressed and navigates straight to it, with no curtain and no preloader in between (`[pattern:i18n-and-commerce#checkout-hand-off]`). This demo writes "Demo only: … Nothing was charged." instead.

## Motion tiers
Through `_shared/reduced-motion.js`, read at each open and close so a change of tier applies to the next one (`[pattern:i18n-and-commerce#motion-out-of-the-purchase-path]`).
- **Full:** the panel slides from the inline-end edge (from the left in a right-to-left document; up from the bottom on phones) while the scrim fades; the exit runs the other way, faster. The "Added" label rises into place.
- **Reduced:** panel and scrim fade, nothing travels; the "Added" swap is a crossfade.
- **Static** (`html[data-motion="static"]`): the bag is there at once and gone at once; every state change is immediate.

## Accessibility
- The bag button shows the count as text, `Bag (2)`, with `aria-haspopup="dialog"`, `aria-controls` and `aria-expanded`.
- Sizes are a `fieldset` whose legend is "Size of Low Sun" (the product name visually hidden), with native radios under pill labels: arrow keys move the choice, `:has(:focus-visible)` rings the pill.
- Stepper buttons are named "Decrease quantity of Low Sun, A2" / "Increase …", the number field "Quantity of …", the remove button "Remove Low Sun, A2" (visible "Remove" plus hidden text), all inside a group named for the line.
- Native modal dialogs do not trap Tab: after the last control focus moves to the browser's own interface, then back to the first control in the bag, and nothing behind the bag can receive it. The verifier presses Tab eight times and counts focus landing behind the bag (`focusOutside`, zero), reads the accessibility tree through CDP to confirm the page behind is out of it, and hit-tests a card button to confirm the pointer cannot reach it either. See `[pattern:accessibility-and-reduced-motion#overlays-and-focus]`.
- Every target is at least 44 px; the focus ring is the blue accent at 2 px on every control.

## Adapters
- **Real cart:** replace the `Map` with calls to the commerce backend (Shopify Storefront cart mutations, a Stripe-backed order, Webflow Ecommerce) keyed by a cart id kept in a cookie, and render the lines from its response. Keep the order: update the count and the message first, render the lines second. Show a failed request in words next to the control. A cart that lives only in `localStorage` is the refusal.
- **React / Next:** the dialog stays native; call `showModal()` from an effect when `open` becomes true, keep the cart in a context or store, and give each line a stable `key` (`product:size`) so the focused stepper is the same element after the update. Return focus from the dialog's `onClose`.
- **Vue / Nuxt:** a `ref` on the `<dialog>`, `watch(open)` to call `showModal()` / `close()`, and `nextTick()` before focusing the heading; `v-for` with `:key` on the lines.
- **Svelte / SvelteKit:** `bind:this` on the dialog, `$effect` to open and close it, `{#each lines as line (line.key)}` for keyed lines, and `tick()` before focus.
- **Lenis on the page:** stop it on open and put `data-lenis-prevent` on the bag's scrolling body; `[recipe:dialog-nested-lenis-sheet]` shows the sheet with its own smooth scroll and drag-to-dismiss.
- **Other currencies:** change `LOCALE` and `CURRENCY` together (`'de-DE'` + `'EUR'` gives `38,00 €`); keep the currency code visible wherever a switch exists.

## Capture hook
`__awards.state()` reports `motion`, `open`, `animating`, `variant` (`drawer` or `sheet`), `opens`, `closes`, `closedBy`, `openProps`, `lastOpenMs`, `lastCloseMs`, `count`, `countText`, `expanded`, `subtotal` (pence), `subtotalText`, `lines`, `announce`, `bagAnnounce`, `demoNote`, `checkouts`, `focused`, `focusInDialog`, `focusOnOpener`, `focusOutside`, `pageLocked` and `path`.

## When not to use it
A shop that sells one thing at a time needs no bag: send the product button straight to the hosted checkout. For a high-ticket piece sold by enquiry, write "price by enquiry" and use `[recipe:sentence-form-enquiry]` instead of a quick add.

## Synthetic content
Moth & Margin, its three prints, their editions, sizes and prices are invented for this demo, and the product links point at routes that do not exist. Nothing can be bought: the cart lives in memory, the checkout button only prints a note, and no payment or personal data is collected. The print art is inline SVG in this page; no image or font files ship, and the type is system stacks.

Seen in: `[site:the-boyd]`, `[site:serotoninn]`, `[site:united-carriers]`, `[site:aardvarkbookclub]` (its quick add only).
