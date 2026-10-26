// The first viewport's one moment (AWARDS.md ## Motion score, "The correction"): the line arrives as a model's
// self-praise, "Stunning. Done.", and the jury corrects it once: a rule strikes "Stunning." out, the struck word goes,
// "Done" slides home, and "when a jury says ship." arrives. Overlay and real text never change layout; only opacity
// and transforms move. Once per session; the reduced and static tiers show the claim settled from the first paint.
import gsap from 'gsap';
import { EASE, DUR } from '../lib/motion.js';

const KEY = 'awards:claim';

export function playClaim({ signal, tier }) {
  const root = document.documentElement;
  const line = document.querySelector('.claim__line');
  const pending = root.classList.contains('claim-pending');
  const settle = () => {
    root.classList.remove('claim-pending');
    try { sessionStorage.setItem(KEY, '1'); } catch { /* storage off: the claim simply plays again next visit */ }
  };
  if (!line || !pending || tier !== 'full') { settle(); return { done: Promise.resolve(), state: () => 'settled' }; }

  const was = line.querySelector('.claim__was');
  const w1 = line.querySelector('.claim__w1');
  const w2 = line.querySelector('.claim__w2');
  const dot = line.querySelector('.claim__dot');
  const strike = line.querySelector('.claim__strike');
  const done = line.querySelector('.claim__done');
  const rest = line.querySelector('.claim__rest');
  let phase = 'waiting';

  const finished = signal.then(({ timedOut }) => new Promise((resolve) => {
    if (timedOut) { settle(); phase = 'settled'; resolve(); return; }
    phase = 'playing';
    // "Done" in the overlay has to land exactly on the real "Done": measure both after the faces are in.
    const shift = done.getBoundingClientRect().left - w2.getBoundingClientRect().left;
    const total = DUR.hero;
    gsap.timeline({
      onComplete() {
        gsap.set([was, w1, w2, dot, strike, rest, done], { clearProps: 'all' });
        settle();
        phase = 'settled';
        resolve();
      },
    })
      .to(strike, { scaleX: 1, duration: total * 0.28, ease: EASE.out }, 0.15)
      .to(w1, { opacity: 0, duration: total * 0.22, ease: 'none' }, '>+0.08')
      .to(dot, { opacity: 0, duration: total * 0.22, ease: 'none' }, '<')
      // "Done" moves only once "Stunning." is gone, so the two words never share ink (component jury, 2026-10-26).
      .to(w2, { x: shift, duration: total * 0.3, ease: EASE.travel }, '>')
      .add(() => { done.style.visibility = 'visible'; was.style.visibility = 'hidden'; })
      .fromTo(rest, { opacity: 0 }, { opacity: 1, duration: total * 0.45, ease: EASE.out });
  }));
  return { done: finished, state: () => phase };
}
