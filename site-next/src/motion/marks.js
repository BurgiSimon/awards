// The jury's marks (AWARDS.md, SIGNATURE; state a only, when a page-round report exists). When a cited frame first
// becomes current its marks draw once: each stroke by its dash offset over --dur-mark on the house expo-out,
// --stagger between strokes on one frame, and the report's line follows in a --dur-feedback opacity step. The memory
// ring on s00 is the first viewport's one moment and draws over --dur-hero instead. Nothing redraws in a session
// (sessionStorage); the reduced and static tiers, and every route but home, show the marks already drawn.
import gsap from 'gsap';
import { DUR, addStroke, hideStroke, showStroke } from '../lib/motion.js';

const KEY = 'awards:marks';

export const session = {
  get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* storage refused: the page simply redraws */ } },
  drawn() { try { return new Set(JSON.parse(sessionStorage.getItem(KEY) || '[]')); } catch { return new Set(); } },
  addDrawn(ids) {
    const all = session.drawn();
    for (const id of ids) all.add(id);
    session.set(KEY, JSON.stringify([...all]));
  },
};

// A unit is what draws together: a strip item (its frame, any frame set beside it, their lines), a frame of the
// phone's row (its lines sit under the row, named by the item's data-unit), a phone chapter's figure, or the close's
// s100 frame. A frame whose row was printed under an earlier frame has marks and no line.
export function markUnits() {
  const units = [];
  for (const el of document.querySelectorAll('.strip__item, figure.chapter__frames, .select__frame')) {
    const paths = [...el.querySelectorAll('.frame__marks path')];
    if (!paths.length) continue;
    const key = el.dataset.unit;
    const notes = el.matches('.select__frame') ? []
      : key ? [...document.querySelectorAll(`.frame__note[data-unit="${CSS.escape(key)}"]`), ...el.querySelectorAll('.frame__note:not([data-unit])')]
        : [...el.querySelectorAll('.frame__note')];
    units.push({ el, paths, notes, ids: [...new Set(paths.map((p) => p.dataset.markId))], state: 'drawn', tl: null });
  }
  return units;
}

const visible = (el) => el.getClientRects().length > 0;

export function createMarks({ units }) {
  const byEl = new Map(units.map((u) => [u.el, u]));
  const running = new Map(); // timeline → resolve of its settle promise

  function show(u) {
    if (u.tl) {
      u.tl.kill();
      running.get(u.tl)?.resolve();
      running.delete(u.tl);
    }
    u.tl = null;
    u.paths.forEach(showStroke);
    for (const n of u.notes) n.style.opacity = '';
    u.state = 'drawn';
  }

  function hide(u) {
    u.paths.forEach(hideStroke);
    for (const n of u.notes) n.style.opacity = '0';
    u.state = 'pending';
  }

  // Full tier on home: every visible unit not drawn this session waits, hidden, for its frame.
  function prepare(animate) {
    const drawn = session.drawn();
    for (const u of units) {
      if (animate && visible(u.el) && !u.ids.every((id) => drawn.has(id))) hide(u);
      else show(u);
    }
  }

  // A unit whose marks were all drawn earlier this session (in the strip, or at the close) shows them at once.
  function draw(u) {
    if (!u || u.state !== 'pending') return null;
    if (u.ids.every((id) => session.drawn().has(id))) { show(u); return null; }
    u.state = 'drawing';
    session.addDrawn(u.ids);
    const tl = gsap.timeline({ onComplete: () => show(u) });
    let end = 0;
    u.paths.forEach((p, i) => {
      // The memory ring is the first viewport's moment: it takes the hero band wherever it draws.
      const memoryRing = p.dataset.mark === 'ring' && p.dataset.source === 'memory';
      end = Math.max(end, addStroke(tl, p, { duration: memoryRing ? DUR.hero : DUR.mark, at: i * DUR.stagger }));
    });
    if (u.notes.length) tl.to(u.notes, { opacity: 1, duration: DUR.feedback, ease: 'none' }, end);
    u.tl = tl;
    let resolve;
    const done = new Promise((r) => { resolve = r; });
    running.set(tl, { done, resolve });
    return tl;
  }

  // The strip's frames above the current one have been passed, by scroll or by a jump (__awards.scrollTo, Enter,
  // End): they show their marks drawn at once, so no line waits hidden in its own space between frames (verdict
  // 2026-10-22, craft fix 1). Only the frame that became current draws.
  function passed(li) {
    const list = li?.parentElement;
    const k = Number(li?.dataset.stop);
    if (!list || !Number.isFinite(k)) return;
    for (const el of list.querySelectorAll(':scope > .strip__item[data-stop]')) {
      const u = byEl.get(el);
      if (u && u.state === 'pending' && Number(el.dataset.stop) < k) { session.addDrawn(u.ids); show(u); }
    }
  }

  return {
    prepare,
    draw,
    passed,
    reveal(u) { session.addDrawn(u.ids); show(u); },
    unitOf: (el) => (el ? byEl.get(el) ?? null : null),
    pending: (el) => byEl.get(el)?.state === 'pending',
    // Captures wait for any stroke still being drawn, so a frame never shows half a mark.
    settled: () => Promise.all([...running.values()].map((x) => x.done)),
    state: () => ({ units: units.length, drawn: units.filter((u) => u.state === 'drawn').length, pending: units.filter((u) => u.state === 'pending').length }),
    // A stroke cut short by a tier change lands drawn (it already counts as drawn this session); pending units
    // stay pending until the next tier decides.
    finish() {
      for (const u of units) if (u.state === 'drawing') show(u);
    },
  };
}
