// The motion score as code: one master timeline in chapter units, with a label per chapter, set by the ticker from a
// single piecewise-linear map of the document's scroll. Nothing else owns a clock. Every scroll-mapped tween runs on
// ease 'none'; the hero's pay-out is its own short timeline. Reduced motion is a matchMedia branch: the readouts keep
// counting (they are text), the drag and the splice sit on their settled frames, and the lay of the cable holds still.
import gsap from 'gsap';

export const LABELS = ['fault', 'located', 'descent', 'drag', 'catch', 'lift', 'splice', 'laid', 'end'];

export function createScore() {
  const s = { depth: 0, wire: 0, tension: 0, pulse: 0, drag: 0, trace: 0, lift: 0, open: 0, payout: 0 };
  let master = null;
  let reduced = false;
  let map = [[0, 0]];
  const mm = gsap.matchMedia();

  mm.add({ full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    reduced = !!ctx.conditions.reduced || document.documentElement.dataset.motion === 'static';
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false } });
    tl.addLabel('fault', 0)
      .addLabel('located', 1)
      .fromTo(s, { depth: 0, wire: 0, tension: 0 }, { depth: 200, wire: 200, tension: 3, duration: 1 }, 'located')
      .fromTo(s, { pulse: 0 }, { pulse: 1, duration: 1 }, 'located')
      .addLabel('descent', 2)
      .fromTo(s, { depth: 200, wire: 200, tension: 3 }, { depth: 4212, wire: 4212, tension: 11.9, duration: 1 }, 'descent')
      .addLabel('drag', 3)
      .fromTo(s, { drag: 0, wire: 4212 }, { drag: 1, wire: 6318, duration: 0.68 }, 'drag')
      .fromTo(s, { tension: 11.9 }, { tension: 12.4, duration: 0.66 }, 'drag')
      .fromTo(s, { trace: 0 }, { trace: 1, duration: 1 }, 'drag')
      .addLabel('catch', 3.68)
      .fromTo(s, { tension: 12.4 }, { tension: 17.4, duration: 0.02 }, 'catch')
      .addLabel('lift', 4)
      .fromTo(s, { lift: 0, depth: 4212, wire: 6318, tension: 17.4 }, { lift: 1, depth: 0, wire: 0, tension: 0, duration: 0.5 }, 'lift')
      .addLabel('splice', 4.5)
      .fromTo(s, { open: 0 }, { open: 1, duration: 1 }, 'splice')
      .addLabel('laid', 5.5)
      .fromTo(s, { depth: 0 }, { depth: 4212, duration: 1 }, 'laid')
      .addLabel('end', 6.5);
    master = tl;

    // The hero's one moment: the cable pays out about 40 cm over the sheave and stops.
    if (!reduced) {
      gsap.timeline({ delay: 0.15 }).addLabel('payout').fromTo(s, { payout: 0 }, { payout: 180, duration: 0.9, ease: 'power3.out' }, 'payout');
    }
    return () => { master = null; s.payout = 0; };
  });

  // Chapter positions in scroll pixels → master time. Anchors that do not advance are dropped, so the map is monotonic.
  function measure(anchors) {
    map = [];
    for (const [px, t] of anchors) {
      if (!map.length || px > map[map.length - 1][0]) map.push([px, Math.max(t, map.length ? map[map.length - 1][1] : 0)]);
    }
  }

  function timeAt(y) {
    if (y <= map[0][0]) return map[0][1];
    for (let i = 1; i < map.length; i++) {
      const [x1, t1] = map[i];
      if (y <= x1) {
        const [x0, t0] = map[i - 1];
        return t0 + (t1 - t0) * ((y - x0) / (x1 - x0));
      }
    }
    return map[map.length - 1][1];
  }

  function update(y) {
    if (!master) return s;
    const t = timeAt(y);
    master.time(t, true);
    if (reduced) {
      // Settled frames: the hook has taken the cable, the trace is drawn, the cable is open, the pulse rests at the break.
      s.drag = 1; s.trace = 1; s.open = 1; s.lift = 0; s.pulse = 0.5;
      if (t >= 3 && t < 4) { s.wire = 6318; s.tension = 17.4; } // the drag's readouts match its settled, hooked frame
    }
    s.time = t;
    return s;
  }

  const label = () => {
    if (!master) return 'fault';
    const t = s.time || 0;
    let current = 'fault';
    for (const name of LABELS) if (master.labels[name] <= t + 1e-6) current = name;
    return current;
  };

  return { state: s, measure, update, label, isReduced: () => reduced, revert: () => mm.revert() };
}
