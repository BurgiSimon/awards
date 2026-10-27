// The signature, second half: the visitor re-sorts the record by any axis. The rows reorder in the DOM (so Tab and a
// screen reader follow the new order) and travel there by FLIP; the floor line stays where the verdict turns, and
// the status line says the order in words. Reduced and static tiers reorder at once.
import gsap from 'gsap';
import { EASE, DUR } from '../lib/motion.js';

const AXIS = { w: 'the weighted score', d: 'Design', u: 'Usability', c: 'Creativity', co: 'Content' };
const FLOOR = { w: 7.2, d: 6.8, u: 6.8, c: 6.8, co: 6.8 };
const two = (n) => Number(n).toFixed(2);
const names = (list) => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`);

export function initSort({ tier, onChange, scope, before }) {
  const group = document.querySelector('.sort');
  const list = document.querySelector('[data-record]');
  const status = document.querySelector('[data-sort-status]');
  const floor = document.querySelector('.record__floor');
  const stage = document.querySelector('.record__stage');
  if (!group || !list) return null;
  group.hidden = false;
  const buttons = [...group.querySelectorAll('[data-sort]')];
  const nameOf = (li) => li.querySelector('.row__name').textContent.trim();
  let key = 'w';
  let dir = -1; // −1 highest first; pressing the pressed button again turns the order round

  function placeFloor() {
    if (!floor) return;
    const rows = [...list.children];
    const below = (li) => Number(li.dataset[key]) < FLOOR[key];
    // The line sits where the rows cross the floor, whichever way round they are sorted.
    const under = rows.findIndex((li, i) => i > 0 && below(li) !== below(rows[i - 1]));
    if (under < 0) { floor.hidden = true; return; }
    floor.hidden = false;
    const s = stage.getBoundingClientRect();
    const l = list.getBoundingClientRect();
    const r = rows[under].getBoundingClientRect();
    floor.style.top = `${(r.top - s.top - 2).toFixed(0)}px`;
    floor.style.left = `${(l.left - s.left).toFixed(0)}px`;
    floor.style.width = `${l.width.toFixed(0)}px`;
    floor.querySelector('.record__floor-label').textContent = key === 'w'
      ? '7.2 weighted: below it, the verdict is fix'
      : `6.8: no axis may fall under it`;
  }

  function say() {
    if (!status) return;
    const rows = [...list.children];
    const order = dir > 0 ? ', lowest first' : '';
    if (key === 'w') {
      const fix = rows.filter((li) => li.dataset.word !== 'ship').map(nameOf);
      const all = rows.every((li) => Number(li.dataset.w) >= FLOOR.w);
      status.textContent = `Ranked by the weighted score${order}. ${all ? 'All five reach 7.2' : 'Not all five reach 7.2'}${fix.length ? `, and ${names(fix)} still ended on fix: a verdict needs more than the number, every axis at 6.8 or more and every block of the contract kept.` : '.'}`;
      return;
    }
    const under = rows.filter((li) => Number(li.dataset[key]) < FLOOR[key]);
    if (under.length) {
      status.textContent = `Ranked by ${AXIS[key]}${order}. ${names(under.map((li) => `${nameOf(li)}, at ${Number(li.dataset[key]).toFixed(1)},`))} ${under.length > 1 ? 'fall' : 'falls'} under 6.8, the floor no axis may cross before a verdict can be ship.`;
    } else {
      const low = dir > 0 ? rows[0] : rows.at(-1);
      status.textContent = `Ranked by ${AXIS[key]}${order}. No build falls under 6.8; the lowest is ${nameOf(low)} at ${Number(low.dataset[key]).toFixed(1)}.`;
    }
  }

  function mark() {
    for (const li of list.children) {
      li.querySelectorAll('.is-key').forEach((el) => el.classList.remove('is-key'));
      li.querySelector(key === 'w' ? '.row__w' : `.row__scores [data-axis="${key}"]`)?.classList.add('is-key');
    }
  }

  function sortBy(next) {
    before?.();
    dir = next === key ? -dir : -1;
    key = next;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sort === key)));
    const rows = [...list.children];
    const first = new Map(rows.map((li) => [li, li.getBoundingClientRect().top]));
    const sorted = [...rows].sort((a, b) => dir * (Number(a.dataset[key]) - Number(b.dataset[key])) || Number(b.dataset.w) - Number(a.dataset.w));
    sorted.forEach((li) => list.append(li));
    mark();
    onChange?.();
    // FLIP on the reordered rows (`sort@<axis>`), inside the tier's context so a tier change reverts it.
    if (tier() === 'full') {
      const flip = () => sorted.forEach((li, i) => {
        const dy = first.get(li) - li.getBoundingClientRect().top;
        if (Math.abs(dy) < 1) return;
        gsap.fromTo(li, { y: dy }, { y: 0, duration: DUR.routine * 1.5, ease: EASE.travel, delay: i * DUR.stagger, clearProps: 'transform', onComplete: placeFloor });
      });
      const ctx = scope?.();
      if (ctx) ctx.add(flip); else flip();
    }
    placeFloor();
    say();
  }

  buttons.forEach((b) => b.addEventListener('click', () => sortBy(b.dataset.sort)));
  // Keyboard focus brings the record to its sorted state at once; a pointer press waits for its click, so the page
  // never moves between press and release.
  group.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) before?.(); });
  mark();
  say();
  placeFloor();
  addEventListener('resize', placeFloor);
  document.fonts?.ready.then(placeFloor);
  return { state: () => ({ key, order: dir > 0 ? 'lowest first' : 'highest first' }), sortBy, placeFloor };
}
