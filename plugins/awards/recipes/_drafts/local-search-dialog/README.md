# local-search-dialog

Release notes searched where they stand. A header button, `/` or Ctrl/Cmd+K opens a native `<dialog>` whose combobox filters the page's own list: every word of the query must start a word of a note, matched word starts are marked, section toggles narrow the set, arrows move the active option and Enter closes the dialog on that note, with focus on its heading. Nothing is fetched and nothing is duplicated: the index is read once from the DOM, so the 48 notes are just as readable, linkable and findable with the script off.

## Why
- **Search the page you already have.** The release site this comes from keeps 150+ updates in one document, each a heading with its own id, behind a search and an edition switcher that are both `role="combobox"` `[site:shopify-editions-w26]` [verified, `index.html`]; its own principle is that a real DOM reading layer is what keeps search, deep links and find-in-page working [verified]. The catalogue refuses search over content that only exists after hydration `[pattern:components-catalog#edition-switcher-and-local-search]`, so the index here is read from the rendered list, never from a second copy of the content in JSON.
- **A combobox, so focus never leaves the field.** That the source's search is keyboard-navigable and closes on Escape is recorded only at medium-low confidence `[site:shopify-editions-w26]` [recalled]; the mechanics here are the plugin's own, after the WAI-ARIA combobox pattern: the input keeps focus, `aria-activedescendant` names the active option, a narrowed list makes its first option active so Enter opens the best match, arrows wrap.
- **Thicker focus than the source.** The same site's focus ring is 1 px, inset, in a pale blue on paper, and Accessibility is its lowest developer score at 7.00 `[site:shopify-editions-w26]` [verified]. Here the page keeps a 2 px outline, the field shows a 3 px rule while focused, the active option is a full inverted row, and Escape returns focus to whatever opened the dialog, the button or the element a shortcut was pressed from.
- **Say the count once, after the typing stops.** The catalogue asks for result counts to be announced; announcing on every keystroke reads the reader four numbers for one word. The status waits 450 ms after the last change, which is the plugin's choice, and the visible `n of 48` updates at once.
- **Inventory thinking inside a world.** A chaptered experience site that also counts its news items for the reader, an unread badge on a news link `[site:mont-fort]` [verified], is the other half of the catalogue entry: the reading routes are part of the product. This recipe builds the find half; a remembered read state belongs beside it, not inside the dialog.
- **Shortcuts that step aside.** `/` and Ctrl/Cmd+K are ignored while focus is in a text field, so a slash typed into the sign-up field stays a slash. This is the plugin's rule; the verifier checks it.

## Parameters
| | |
|---|---|
| Index | built once from `[data-note]`: the `h3`, the summary, the tag list and the section's `h2`, case-folded and accent-folded (`NFD`, marks stripped) |
| Match | every query word must start a word of the note (`startsWith`); rank title (3) before section and tags (2) before summary (1), then page order |
| Marks | each matched word start wrapped in `<mark>`, built with text nodes (no `innerHTML` from input) |
| Active option | none for the full list; the first option once the query or a toggle has narrowed it; ArrowDown / ArrowUp wrap; a pointer move over an option makes it active |
| Follow | Enter or a click: the dialog closes, `history.pushState` to `#id`, `scrollIntoView({ block: 'start' })` under `scroll-margin-top: bar + 24 px`, `h3.focus({ preventScroll: true })`, the note tinted for `1.6 s`, fading over `1.2 s` |
| Shortcuts | `/` (no modifier) and Ctrl/Cmd+K, ignored inside `input`, `textarea`, `select` and editable content, and while the dialog is open |
| Announcement | a polite `role="status"`, written `450 ms` after the last input or toggle; `n changes match “q” in A and B.`; an empty result adds `Clear filters to search every section.` |
| Open | `showModal()`; full tier: panel `opacity 0 → 1`, `translateY(12px) → 0`, `240 ms` expo-out, backdrop fade; reduced: opacity only, `160 ms`; static: a cut |
| Close | the `cancel` event (Escape), the Esc / Close button or a click on the backdrop; an `80 ms` fade, then `close()`; focus back to the opener |
| Results | new options fade in over `--dur-feedback` (`160 ms`), with a 4 px rise in the full tier; under reduced motion the token is `0` and they simply appear |
| Layout | panel `min(46rem, 100%)` at `9vh`, results capped at `min(52vh, 34rem)`; under `760 px` a full-screen sheet |

## Tiers
- **Full:** the dialog fades and rises 12 px over 240 ms, new results fade and rise 4 px over 160 ms, the close fades over 80 ms.
- **Reduced:** the dialog fades over 160 ms with no movement, results appear at once, the close still fades; search, toggles, keys and announcements are unchanged.
- **Static:** the dialog opens and closes as a cut.
- **Forced colours:** the active option and pressed toggles carry a `Highlight` outline and marks an outline, since their backgrounds are dropped.
- **No JavaScript:** the notes are an ordinary page of sections, headings and lists; the search button and the shortcut hint ship `hidden` and only appear once the script runs.

## Accessibility
The dialog is a native modal (`showModal`, so the page behind is inert and focus is contained) labelled by a hidden heading. The input is a `role="combobox"` with `aria-autocomplete="list"`, `aria-controls` on the `role="listbox"` and `aria-expanded` that turns false when nothing matches; options carry `aria-selected`. The six section filters are real buttons in a labelled group with `aria-pressed`, at least 44 px tall. The key hint is linked to the input with `aria-describedby` and hidden on touch screens, where the close button reads Close instead of Esc. Following a result moves focus to the note's heading (`tabindex="-1"`), so the next Tab continues from the note, and the page's `history` gets the note's hash, so Back returns to where search began.

## Adapters

### React / Next
Render the list on the server (an RSC or `getStaticProps`) and build the index in a `useEffect` from `document.querySelectorAll('[data-note]')`, or from the same props the list was rendered from; never fetch a separate search payload the page does not show. Keep `query`, `filters` and `active` in state, render options from a memoised result list, and open the dialog with a ref's `showModal()` in an effect, not with `open={true}`.

### Svelte
A `$state` query and filter set, a `$derived` result list, `{#each}` over options with `aria-selected={i === active}`; bind the dialog with `bind:this` and call `showModal()`. The marks can be a small component that splits the text by the same word regex.

### Webflow
- Designer: a Collection List of the notes with the title, summary and tags in visible fields; each item's slug as its ID, `data-note` as a custom attribute. A Button in the navbar with `data-open` and the `hidden` attribute.
- Embed the `<dialog>` markup in an Embed element, and inject the module from Footer code; it indexes whatever the Collection List rendered, so the CMS stays the single source.
- Webflow's own Site Search is a separate results page; this keeps the reader on the page.

Seen in: `[site:shopify-editions-w26]`, `[site:mont-fort]`.
