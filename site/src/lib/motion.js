// The house motion vocabulary, read once from tokens.css so GSAP and CSS share one hand (DESIGN.md ## Motion;
// [recipe:custom-ease-house-defaults]): two curves registered with CustomEase under the token names, and the three
// duration bands plus the stagger in seconds. Anything scrubbed by scroll stays on ease 'none'.
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

const seconds = (v) => {
  const s = String(v).trim();
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return 0;
  return s.endsWith('ms') ? n / 1000 : n;
};

export const EASE = { out: 'house-out', travel: 'house-travel' };
export const DUR = { feedback: 0.16, routine: 0.4, hero: 0.9, stagger: 0.04 };

// Read at boot and again whenever the tier changes (tokens.css shortens the bands under reduced motion).
export function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  for (const [name, token] of [[EASE.out, '--ease-out-expo'], [EASE.travel, '--ease-in-out-expo']]) {
    const pts = (cs.getPropertyValue(token).match(/-?\d*\.?\d+/g) || []).map(Number);
    if (pts.length === 4) CustomEase.create(name, `M0,0 C${pts[0]},${pts[1]} ${pts[2]},${pts[3]} 1,1`);
  }
  DUR.feedback = seconds(cs.getPropertyValue('--dur-feedback'));
  DUR.routine = seconds(cs.getPropertyValue('--dur-routine'));
  DUR.hero = seconds(cs.getPropertyValue('--dur-hero'));
  DUR.stagger = seconds(cs.getPropertyValue('--stagger'));
  gsap.defaults({ ease: EASE.out });
  return { ease: EASE, dur: { ...DUR } };
}
