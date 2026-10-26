// The motion score (AWARDS.md ## Motion score) on the one ticker, one tier at a time: full (the authored score),
// reduced (no spatial travel: the frames rest in the pile and change place in one step, the sort reorders at once,
// the claim is settled) and static (everything settled at load). Each tier lives in one gsap.context, reverted
// when the motion preference changes; the master timeline (src/motion/master.js) carries every scrubbed value.
import gsap from 'gsap';
import { readTokens } from '../lib/motion.js';
import { motionTier, onMotionTierChange } from '../lib/reduced-motion.js';
import { createMaster } from './master.js';
import { playClaim } from './claim.js';
import { initGather } from './gather.js';
import { initSort } from './sort.js';

export function initMotion({ signal }) {
  let tier = motionTier();
  let master = null;
  let gather = null;
  let ctx = null;
  readTokens();
  const claim = playClaim({ signal, tier });
  const build = () => {
    ctx = gsap.context(() => {
      master = createMaster();
      gather = initGather({ tier, master });
    });
  };
  build();
  // A sort pressed or focused while the five builds are still gathered first brings the record to its sorted state,
  // so the reorder is always seen (jury 2026-10-26, craft 1).
  const ensureSorted = () => {
    if (!gather?.gathered?.()) return;
    const y = master?.scrollYFor('record:sorted');
    if (y === null || y === undefined) return;
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    gather.refresh();
  };
  const sort = initSort({ tier: () => tier, onChange: () => gather?.refresh(), scope: () => ctx, before: ensureSorted });
  onMotionTierChange((next) => {
    if (next === tier) return;
    tier = next;
    readTokens();
    gather?.destroy();
    master?.kill();
    ctx?.revert();
    build();
  });
  return {
    heroDone: claim.done,
    settled: () => gather?.settled?.() ?? null,
    state: () => ({ tier, claim: claim.state(), master: master?.state() ?? null, gather: gather?.state() ?? null, sort: sort?.state() ?? null }),
  };
}
