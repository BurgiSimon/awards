# Sound

What this file is for: when a site may make sound, at what levels, bound to which states, and how the control is built so that a visitor who never wanted audio is never ambushed by it. Three cards carry real evidence [site:leo-parpeix] [site:igloo] [site:mont-fort]; Why Zero names its engine [site:why-zero]; Floema verifiably ships none [site:floema-jewelry]; the rest are unknown. The 2026-09-23 wave adds ten sounded cards, verified from their bundles: [site:nodeck] [site:areebali] [site:zainabkabira] [site:gehry-getty] [site:runrobrun] [site:noth] [site:pensatori-irrazionali] [site:haoqi] [site:spasoje] [site:siena]. Cite as `[pattern:sound#section]`.

## Opt-in only

Why: browsers refuse to start audio without a gesture, and a jury refuses a site that starts talking; both side with the visitor. Every sounded site in the corpus is opt-in — a toggle in the chrome [site:leo-parpeix] [recalled medium], a control whose label states its current value [site:igloo] [verified], a switch that defaults to off [site:mont-fort] [verified control, default inferred]. The newer cards split [verified on each]: a Howler bank muted by default with the choice remembered [site:nodeck]; synthesised clicks behind a toggle that starts muted [site:areebali]; a recorded track with `preload="none"`, started only by its own control [site:zainabkabira]; consent taken on the preloader's first click [site:gehry-getty] — against sound on by default, stored as on unless "false" was saved [site:pensatori-irrazionali], a loop that tries `play()` at once and again on the first tap [site:haoqi], and hover and click audio with no control at all [site:spasoje] [site:siena].

Rules:
- Never autoplay, never fade in "quietly" before consent, never resume on a route change without a stored yes.
- Consent may ride the preloader's gesture, but content never waits for it: offer enter-with-sound beside enter, or reveal on the load signal and leave the switch in the chrome (`[pattern:preloaders-and-transitions#sound-consent-on-the-gesture]`).
- The toggle is always visible, always a `<button>` with `aria-pressed` and a name that carries the state, keyboard-operable, styled from the tokens [A05].
- Create or resume the audio context inside the click handler; keep it suspended until then.

## Levels and layers

| Layer | Level | Behaviour | Site | Confidence |
|---|---|---|---|---|
| Ambient loop | .375 | opt-in, loops, plain `HTMLAudioElement` | [site:leo-parpeix] | [recalled medium], clone |
| SFX | .35 | one-shots on interactions; two variants for one easter egg | [site:leo-parpeix] | [recalled medium], clone |
| Bed | — | wind and music crossfaded by state; ≈ 1.5 MB track | [site:igloo] | [verified asset names]; level unknown |
| Event SFX | — | named and rate-limited: enter, leave, click, beeps, shard | [site:igloo] | [verified names]; limits unknown |
| Transition cue | — | a dedicated sound on route change | [site:leo-parpeix] | [recalled medium] |
| Narration and one recording per chapter | — | the architect's voice over a licensed orchestral piece per chapter; the header spells the state | [site:gehry-getty] | [verified]; levels unknown |
| Film sound bound to a section | fade in .35 s on toggle; out over 1.6 s after a 1.4 s delay once the section leaves | [site:noth] | [verified] |
| Synthesised UI tones | — | sine and triangle voices at 784 Hz then 1174.7 Hz 85 ms later; a 300 → 760 Hz sweep over .1 s; one WAV fetched on first use | [site:areebali] | [verified] |
| Ducked SFX bank | — | named cues (typing, eraser, paper, whoosh) ducking between layers | [site:nodeck] | [verified] |
| UI cues | .5 | four hover and menu cues | [site:siena] | [verified]; no mute |
| Background loop | .35 | on by default | [site:haoqi] | [verified]; the default is the miss |
| Easter-egg cue | .15 | plays only when sound is already on | [site:pensatori-irrazionali] | [verified] |

Rules:
- Ambient sits under the SFX and both sit well under full scale; .375 / .35 are the only published levels and make a sensible ceiling [site:leo-parpeix]. Normalise the files themselves rather than mixing with gain alone.
- Sound is state, not wallpaper [site:igloo]: bind the bed's mix to the chapter (wind up, music down) and give each interaction its own named one-shot. Crossfade over the hero unit (≈ 1.2–1.5 s) — a plugin default; no card publishes a crossfade time.
- Rate-limit repeats per name (one per ≈ 150 ms, plugin default) so a hovered list does not machine-gun; Igloo rate-limits but publishes no interval [site:igloo].
- Decode off the main thread where the engine allows it; Igloo runs a dedicated audio worker [site:igloo] [verified].
- Give sound a visible job: an analyser (`fftSize 256`, three bands, onset pulses) driving the hero object turns the play button into an interaction with a payoff [site:runrobrun] [verified] — but the player is hidden below 1000 px, so phones lose the signature.
- UI tones can be synthesised with oscillators rather than shipped as samples [site:areebali] [verified].

## The control

Why: the switch is the one piece of chrome that must be honest about what it is doing. Mont-fort's is a 24 × 24 canvas drawing the live signal, so the control is its own visualiser [site:mont-fort] [verified element; behaviour inferred high]; Léo Parpeix animates equaliser bars in the nav [site:leo-parpeix] [recalled medium]; Igloo's lives in the scene with its state in the label [site:igloo] [verified]; Getty spells `SOUND ○ OFF / ● ON` in the header [site:gehry-getty] [verified]; Haoqi prints the state as a glyph in brackets and binds it to one key [site:haoqi] [verified]. A named toggle without `aria-pressed` is the common gap [site:runrobrun] [verified].

Rules:
- The visual (bars, waveform) is decoration over a real button; the state lives in `aria-pressed` and the name, never in the animation alone.
- Reduced tier: the bars freeze in the "on" pose; static tier: text only. Pause the visualiser on `visibilitychange`.
- Persist the choice per origin in `localStorage`, wrapped in try/catch (it can throw in private windows [site:animejs] [verified for its tweak panels]) and re-apply it on the next visit — a remembered "on" still waits for the first gesture. No card documents persistence; this is the plugin's rule.
- Under a SPA router the bed keeps playing across routes; under an MPA it resumes from the stored choice on the new page's first gesture.

## Engine

Howler is the corpus's named engine [site:why-zero] [verified] and the pinned one (`howler` 2.2.4, `stacks/versions.md`); plain `HTMLAudioElement`s carry one loop and a few one-shots [site:leo-parpeix] [recalled medium]. Choose Howler for sprites, crossfades and rate limiting — the newer cards that name an engine use it [site:nodeck] [site:siena] [site:gehry-getty] [verified] — choose the element when the layer is a loop and two cues, and Web Audio oscillators for short synthetic UI tones [site:areebali] [verified]. `[recipe:sound-toggle-opt-in]` ships the toggle, the persistence and the 24 × 24 reactive icon.

## Verify

- [ ] No audio before a gesture; the switch is a `<button>` with `aria-pressed`, visible at every breakpoint, reachable by Tab.
- [ ] Consent on the preloader has a silent path of equal weight.
- [ ] Files normalised; ambient ≤ .375, SFX ≤ .35 unless the direction contract says otherwise.
- [ ] Bed bound to state; SFX named and rate-limited; the choice persisted and honoured on return.
- [ ] Visualiser frozen under reduced motion and paused when hidden; nothing on the page depends on sound.

## Refuse

- Autoplay, muted-then-unmuted tricks, or sound tied to scroll position without a stored yes.
- A toggle only inside a hamburger menu, a `div` toggle, or an icon with no state in its name.
- A sound-on gate as the only entrance.
- A multi-megabyte bed fetched before consent [site:the-boyd] [verified].
- A sound note that sits over the content until clicked [site:gehry-getty] [verified]; sound on by default [site:pensatori-irrazionali] [site:haoqi]; hover and click audio with no toggle [site:spasoje] [site:siena].
- Léo Parpeix's equaliser bars, Igloo's in-scene label or Mont-fort's icon as assets.
