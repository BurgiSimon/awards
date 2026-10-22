# sentence-form-enquiry

An enquiry form written as one sentence the visitor completes: "Hello, my name is ___, and I am (a collector | an artist | a studio). I would like to talk about ___, so please write back to ___." Each prose fragment is the label of the field that follows it, so the form keeps the site's voice and every field is named by the words around it. Validation is the browser's own constraint API with the page's messages, errors are tied to their fields by `aria-describedby`, and on the phone the sentence stacks into fragment-over-field rows. No other recipe covers a form.

## Why
- **The enquiry as a sentence.** The fragments are the labels, set in the reading serif, and the placeholder is the blank; the form reads as the site speaking, not a template `[site:the-boyd]`.
- **Blanks that fit what is typed.** Inline inputs grow to their content width rather than reserving a fixed box `[site:alectear]`; here that is native `field-sizing: content`, with a minimum width and `max-inline-size: 100%` as the fallback.
- **Label the group, not the radios.** The Boyd wraps a radio group in one `<label>`, which can only ever label its first control. Here the fragment before the choices is a `<span id>` referenced by `aria-labelledby` on a `role="radiogroup"`, and each choice has its own `<label>`.

## Parameters
Sentence size `clamp(1.625rem, 3.2vw, 3.25rem)` at `line-height 1.55`, measure `30em` · blanks `min-inline-size 6ch` · phone breakpoint `767px`: fragments `display: block`, blanks full-width at `48px`, choices wrap as `44px` pills, punctuation hidden · error and confirmation entrance `.5s` expo-out.

## Behaviour
- `novalidate` on the form; validity comes from `required` and `type="email"` through each control's `validity` (a required radio set reports `valueMissing` until one is checked). One message per field and failure (`valueMissing`, `typeMismatch`).
- Submit is always `preventDefault()`ed. Invalid: every error renders under the sentence, each invalid control (the radiogroup, not its radios) gets `aria-invalid="true"`, and focus goes to the first invalid field in sentence order (the checked radio, or the first, for the group). Valid: a local confirmation paragraph appears and takes focus. Nothing is sent anywhere.
- After the first attempt, a field re-checks on `input`, so a fixed error clears as the visitor types.

## Motion tiers
There is almost no motion: the form reads the same in every tier.
- **Full:** errors and the confirmation rise `.4em` while fading in.
- **Reduced:** they fade only (`prefers-reduced-motion` or `html[data-motion="reduced"]`); the underline and button colour changes are instant.
- **Static:** no entrance at all (`html[data-motion="static"]`).

## Accessibility
- Every control's accessible name is its prose fragment exactly; the verifier reads this from the browser's accessibility tree with `getByRole(…, { exact: true })`, and checks that the form's ARIA snapshot has no unnamed control.
- The error list items are `hidden` until needed (`[hidden] { display: none !important }` so no layout rule can reveal them) and are referenced by `aria-describedby`, so the focused field is announced with its name, invalid state and error text.
- Choices are native radios over their pill labels: arrow keys move the choice, `:has(:focus-visible)` puts the ring on the visible pill.
- The confirmation is a `tabindex="-1"` paragraph that receives focus, so it is read once without a live region.

## Capture hook
`__awards.state()` reports `motion`, `submits`, `sent`, `invalid` (field names in sentence order), `focused` (id or name) and `path` (to prove the page never navigated). `scrollTo` is the default document scroll.

## When not to use it
Keep the sentence to four or five blanks. A long form (address, budget ranges, attachments) as prose becomes a riddle; use a plain labelled form and keep the sentence for the first contact. Do not use the sentence when the fragments would have to be translated separately from their order: a translator needs the whole sentence with placeholders.

## Demo content
The Tallow Room, the sentence and every message are synthetic demo copy. The form has no endpoint and stores nothing. No media or font files ship; the serif is a system stack.

## Adapters
- **Real endpoint:** keep the handler, replace the confirmation branch with a `fetch` of `new FormData(form)`, and keep the confirmation paragraph for the response (and a server error message in the same slot, focused the same way).
- **React / Vue / Svelte:** keep the markup and the native `validity` reads; drive `hidden`, `aria-invalid` and focus from state after render (a `useEffect` / `nextTick` / `tick()` before `.focus()`).
- **Overlay:** inside a native `<dialog>` opened with `showModal()`, focus the first blank on open; see `[recipe:dialog-nested-lenis-sheet]` for a sheet with its own scroll.

### Webflow
- Designer: a Form Block, so the submission stays Webflow's (Webflow hosting runs no server code, `references/stacks/webflow-export.md`). Inside one paragraph `sentence__text`: Field Labels `frag` bound to Inputs `blank` (`f-name`, `f-topic`, `f-email`, each with `aria-describedby="e-…"`), and for the role a Div with the custom attributes `role="radiogroup"`, `aria-labelledby="l-role"`, `aria-describedby="e-role"`, `aria-required="true"` and `data-role-group` around three Radio Buttons whose labels are the pills.
- Whether the Form Block's field wrappers let labels and inputs flow inline in one paragraph is [unverified]. If they break the sentence, the inline rules (`display: inline`, `field-sizing: content`) go in Head code, scoped to `.sentence`.
- The error list (`e-name` to `e-email`) and the confirmation paragraph (`data-sent`, `tabindex="-1"`) are plain elements; the module sets `hidden` on them at boot.
- Validation: the recipe always cancels the submit. On Webflow, listen in the capture phase, cancel and stop the event only when a field is invalid, and let a valid submit reach Webflow's handler. How `webflow.js` orders its own submit handling against that listener, and whether `novalidate` survives publishing, are [unverified].
- Inject: an entry in the engine loaded by the [recipe:boot-lenis-gsap] Footer-code loader; it needs neither Lenis nor GSAP.
- Reduced motion: only the entrance of errors and the confirmation changes (a fade, or nothing under static); its `html[data-motion]` rules go in Head code.

Seen in: `[site:the-boyd]`, `[site:alectear]`.
