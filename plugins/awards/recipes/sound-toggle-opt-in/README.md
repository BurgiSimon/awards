# sound-toggle-opt-in

A sound switch that is off until asked, remembers the answer, and still waits for a gesture when it comes back. No audio file ships: the bed is two detuned sines under filtered noise, the cues are one-shot blips, and the 24 × 24 icon is an `AnalyserNode` drawn to a canvas. Three states — `off`, `armed`, `on` — and only the last one has ever touched an `AudioContext`.

## Why
- **The corpus is unanimously opt-in.** Mont-fort boots at `audioState = "stopped"`, fetches its bed as an ArrayBuffer only when asked, and wraps its 24 × 24 canvas in a real `<button class="sound">` `[site:mont-fort]` `[verified]`. Igloo labels its control with its current value and runs a dedicated audio worker for 18 files `[site:igloo]` `[verified]`.
- **Igloo's control is the part not to copy.** Its toggle is a canvas object with no focusable proxy `[site:igloo]` `[verified]`, so a keyboard visitor cannot reach the sound at all. Here the button is the control and the canvas is decoration inside it.
- **No context before a gesture.** Browsers refuse to start audio without one and a jury refuses a site that starts talking; constructing the context in the click handler satisfies both, and makes `context: null` a testable claim rather than a promise (`[pattern:sound#opt-in-only]`).
- **A remembered yes is not a licence.** The stored choice returns the switch pressed and the state `armed`; the first gesture on the page starts the bed. Storage is read in a try/catch because it throws in private windows.
- **Synthesised, so the recipe stays a recipe.** Levels follow the only ones the corpus publishes — ambient `.375`, one-shots `.35` (`[pattern:sound#levels-and-layers]`). Swapping in Howler or an `<audio>` element changes `build()` and nothing else.

## Parameters
Bed: sines at `110 Hz` and `165 Hz`, detuned `∓6 / +5` cents, through a lowpass at `420 Hz` `Q 6` swept `±180 Hz` by a `0.07 Hz` LFO; noise band at `900 Hz` `Q .8` at `.08`. Cues: triangle `660 Hz` on, `330 Hz` off, exponential ramp to silence over `120 ms`. Meter: `fftSize 64`, smoothing `.75`, three bars, the shared ticker only on the full tier.

## Accessibility
The toggle is a `<button>` whose accessible name states the current value ("Sound off" / "Sound on"), with `aria-pressed` carrying it again; Enter and Space work because nothing intercepts them. The canvas is `aria-hidden`. Under reduced motion the meter holds the on pose and subscribes to no clock; `visibilitychange` suspends the context, so a backgrounded tab is silent.

## Adapters
- **Howler:** `new Howl({ src: ['bed.webm'], loop: true, volume: .375 })` created in the same click handler, `Howler.ctx` in place of `audio` for the state readout.
- **An `<audio>` element:** one loop plus two cues covers most sites (`[pattern:sound#engine]`); keep the same three states, the same storage key and the same button.
- **SPA router:** keep the bed across routes and re-apply the stored choice on the new page's first gesture.
