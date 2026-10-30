# local-search-dialog

Release notes searched where they stand. A header button, `/` or Ctrl/Cmd+K opens a native `<dialog>`, drawn as the instrument's own face, whose combobox filters the page's own list: every word of the query must start a word of a note, matched word starts are marked, section toggles light like step buttons, the best match is lit as soon as the list narrows, and Enter follows it to the note with focus on its heading. Nothing is fetched and nothing is duplicated: the index is read once from the DOM, so all 48 notes are just as readable, linkable and findable with the script off.

## Why
- **Search the page you already have.** The release site this comes from keeps its 150+ updates in one document, 187 `<h3>` update headings each with its own id, behind a search and an edition switcher that are both `role="combobox"` `[site:shopify-editions-w26]` [verified, `index.html`]. From those facts the card draws the principle that a reading layer of real DOM is what keeps search, deep links and find-in-page working `[site:shopify-editions-w26]` [inferred]. The catalogue refuses search over content that only exists after hydration `[pattern:components-catalog#edition-switcher-and-local-search]`, so the index here is read from the rendered list, never from a second copy of the content in JSON.
- **A combobox, so focus never leaves the field.** The components catalogue records, at medium-low recall, that the source's search is keyboard-navigable and closes on Escape `[pattern:components-catalog#edition-switcher-and-local-search]` [recalled]; the site card itself verifies only the two comboboxes. The mechanics here are the plugin's own, after the WAI-ARIA list-autocomplete pattern with automatic selection: the input keeps focus, `aria-activedescendant` names the lit option, a narrowed list lights its first option so Enter opens the best match, the full list lights nothing so Enter never sends the reader somewhere unseen, and arrows wrap.
- **Quiet for a screen reader.** Each option is named by its title alone and described by its section and tags; one element per note is kept between renders, so while the top result stays the same, `aria-activedescendant` is not rewritten and nothing is read again. The count waits 450 ms after the last change before the polite status speaks it, so one word typed is one announcement, while the visible `n of 48` updates at once. Both are the plugin's choices.
- **Thicker focus than the source.** The same site's focus ring is 1 px, inset, in a pale blue on paper, and Accessibility is its lowest developer score at 7.00 `[site:shopify-editions-w26]` [verified]. Here the page keeps a 2 px outline (in ink on a found note, so it reads as "you are here" inside the red tint, not as an error), the field shows a 3 px rule while focused and a 2 px outline in forced colours, the lit option is a full inverted row, and Escape returns focus to whatever opened the dialog: the button, the element a shortcut was pressed from, or the search button when nothing had focus.
- **The machine's face, not a docs palette.** The plugin's own choice, for this subject. The page is the Thaw release's paper: a meltwater aqua ground, a deep teal ink and one signal red for what search found. The dialog is the groovebox itself: a graphite face with pale legends, section toggles whose square lights red like a step button, and results numbered down a step gutter. A light near-achromatic ground with one accent everywhere is a spent house device `[pattern:house-tells#wave-1-2026-10-23]`; here the light page carries the reading and the dark face carries the instrument.
- **Inventory thinking inside a world.** The catalogue entry's other half is a news link that carries its own count badge (`data-total-count="27"`, class `counter no-unread`) `[site:mont-fort]` [verified]: the reading routes are part of the product. This recipe builds the find half; a remembered read state belongs beside it, not inside the dialog.
- **Shortcuts that step aside.** `/` and Ctrl/Cmd+K are ignored while focus is in a text field, so a slash typed into the sign-up field stays a slash. This is the plugin's rule; the verifier checks it with real keystrokes.

## Parameters
| | |
|---|---|
| Index | built once from `[data-note]`: the `h3`, the summary, the tag list and the section's `h2`, case-folded and accent-folded (`NFD`, marks stripped) |
| Match | every query word must start a word of the note (`startsWith`); rank title (3) before section and tags (2) before summary (1), then page order |
| Marks | each matched word start wrapped in `<mark>`, built with text nodes (no `innerHTML` from input) |
| Options | named by the title (`aria-labelledby`), described by section and tags (`aria-describedby`); one element per note, kept between renders and moved only when the order changes |
| Lit option | none for the full list; the first option once the query or a toggle has narrowed it, rewritten only when the top result changes; ArrowDown / ArrowUp wrap and scroll it into view; a mouse over an option lights it without scrolling the list |
| Follow | Enter (only while an option is lit) or a click: the dialog closes, `history.pushState` to `#id`, `scrollIntoView({ block: 'start' })` under `scroll-margin-top: bar + 24 px`, `h3.focus({ preventScroll: true })`, the note tinted for `1.6 s`, fading over `1.2 s`; Back returns to where search began |
| Shortcuts | `/` (no modifier) and Ctrl/Cmd+K, ignored inside `input`, `textarea`, `select` and editable content, and while the dialog is open |
| Announcement | a polite `role="status"`, written `450 ms` after the last input or toggle; `n changes match “q” in A and B.`; an empty result adds `Clear filters to search every section.` |
| Count | `n of 48` in the search bar beside the close button, so the list's top edge never depends on how many digits the count has |
| Open | `showModal()`; full: panel `opacity 0 → 1`, `translateY(12px) → 0`, `240 ms` expo-out, backdrop fading with it; reduced: opacity only, `160 ms`; static: a cut; the tier is read at every open, close and render |
| Close | the `cancel` event (Escape), the Esc / Close button, or a press and a release that both land on the backdrop (a text selection dragged out of the panel does not close it); panel and backdrop fade together over `80 ms` from their current opacity, then `close()` |
| Results | new options fade and rise 4 px over `--dur-feedback` (`160 ms`, read with its unit, since a minifier writes `.16s`) in the full tier; in the reduced and static tiers they appear at once |
| Layout | panel `min(46rem, 100%)` at `9vh`; results capped at `min(52vh, 34rem)`, with a `56 px` fade at the bottom edge while more rows lie below; under `760 px` a full sheet as tall as `visualViewport.height`, the toggles one row that scrolls sideways |
| Scroll lock | `overflow: hidden` on `<html>` with `scrollbar-gutter: stable`, so the page behind does not shift; while open the root takes the backdrop's colour, which is what the reserved gutter shows |

## Tiers
- **Full:** the dialog fades and rises 12 px over 240 ms with the backdrop, new results fade and rise 4 px over 160 ms, the close fades panel and backdrop over 80 ms.
- **Reduced:** the dialog and backdrop fade over 160 ms with no movement, results appear at once, the close still fades; search, toggles, keys and announcements are unchanged, and the toggles change colour on the feedback token (0 ms under `prefers-reduced-motion`).
- **Static:** the dialog opens and closes as a cut, results appear at once, and the toggles and found note change colour without a transition. The tier is read at each open, close and render, so a site's motion switch setting `data-motion="static"` applies without a reload.
- **Forced colours:** the focused field, the lit option and the pressed toggles carry a `Highlight` outline (the pressed square keeps `Highlight` as its fill), and marks carry an outline, since backgrounds and shadows are dropped.
- **No JavaScript:** the notes are an ordinary page of sections, headings and lists; the search button and the shortcut hint ship `hidden` and only appear once the script runs.

## Accessibility
The dialog is a native modal (`showModal`, so the page behind is inert and focus is contained) labelled by a hidden heading. The input is a `role="combobox"` with `aria-autocomplete="list"`, `aria-controls` on the `role="listbox"` and an `aria-expanded` that turns false when nothing matches; options carry `aria-selected`, are named by their titles and described by section and tags, and the step numbers are `aria-hidden`. The six section filters are real buttons in a labelled group with `aria-pressed`, at least 44 px tall, and the nav's section counts carry a visually hidden unit ("11 changes", not "11"). The key hint is linked to the input with `aria-describedby`, hidden while nothing matches and on touch screens, where the close button reads Close instead of Esc. Following a result moves focus to the note's heading (`tabindex="-1"`), so the next Tab continues from the note, and the page's `history` gets the note's hash, so Back returns to where search began.

## Adapters

### React / Next
Render the list on the server (an RSC or `getStaticProps`) and build the index in a `useEffect` from `document.querySelectorAll('[data-note]')`, or from the same props the list was rendered from; never fetch a separate search payload the page does not show. Keep `query`, `filters` and `active` in state, render options from a memoised result list with `key={note.id}` so React keeps each option element, and set the active id only when the top result changes. Open the dialog with a ref's `showModal()` in an effect, not with `open={true}`.

### Svelte
A `$state` query and filter set, a `$derived` result list, a keyed `{#each results as n (n.id)}` over options with `aria-selected={n.id === activeId}`; bind the dialog with `bind:this` and call `showModal()`. The marks can be a small component that splits the text by the same word regex.

### Webflow
- Designer: a Collection List of the notes with the title, summary and tags in visible fields; each item's slug as its ID, `data-note` as a custom attribute. A Button in the navbar with `data-open` and the `hidden` attribute.
- Embed the `<dialog>` markup in an Embed element, and inject the module from Footer code; it indexes whatever the Collection List rendered, so the CMS stays the single source.
- Webflow's own Site Search is a separate results page; this keeps the reader on the page.

Seen in: `[site:shopify-editions-w26]`.
