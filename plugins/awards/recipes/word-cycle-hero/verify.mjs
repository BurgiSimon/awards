// The probe samples what renders every 50 ms for 4 s: which word sits in the slot (computed visibility plus
// its offset from the slot's top edge, so a word rolled out under the clip does not count), the slot width,
// where the text after the slot starts, the headline height and scrollY.
const pick = (v) => [{ type: 'click', selector: `input[name="driver"][value="${v}"]` }, { type: 'wait', ms: 200 }];
const wheel = (dy, ms = 900) => [{ type: 'wheel', dx: 0, dy }, { type: 'wait', ms }];

export const states = [
  { name: 'timed', settle: 600 },
  { name: 'typed', settle: 600, actions: pick('typed') },
  { name: 'wheel', settle: 600, actions: [...pick('wheel'), ...wheel(120), ...wheel(120)] },
  { name: 'wheel-through', settle: 600, actions: [...pick('wheel'), ...wheel(120), ...wheel(120), ...wheel(120), ...wheel(120, 300), ...wheel(120, 600)] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: wheel(120, 600) },
  { name: 'mobile', viewport: 'mobile', settle: 600 },
];

export async function probe() {
  const slot = document.querySelector('[data-slot]');
  const words = [...slot.querySelectorAll('.slot__word')];
  const type = slot.querySelector('[data-type]');
  const tail = document.querySelector('[data-tail]');
  const h1 = slot.closest('h1');
  const read = () => {
    const s = slot.getBoundingClientRect();
    let text = '';
    if (getComputedStyle(type).visibility === 'visible') text = type.textContent;
    else {
      const seen = words
        .filter((w) => getComputedStyle(w).visibility === 'visible')
        .map((w) => ({ t: w.textContent, d: Math.abs(w.getBoundingClientRect().top - s.top) }))
        .sort((a, b) => a.d - b.d)[0];
      if (seen && seen.d < s.height / 2) text = seen.t;
    }
    return { text, w: Math.round(s.width * 10) / 10, tail: Math.round(tail.getClientRects()[0].left * 10) / 10, h: Math.round(h1.getBoundingClientRect().height), y: Math.round(scrollY) };
  };
  const samples = [];
  for (let i = 0; i < 80; i++) { samples.push(read()); await new Promise((r) => setTimeout(r, 50)); }
  const lbl = document.querySelector('[data-slot-label]');
  return {
    samples,
    labelLive: lbl.getAttribute('aria-live'),
    slotHidden: slot.getAttribute('aria-hidden'),
    heading: h1.textContent.replace(/\s+/g, ' ').trim(),
    driversShown: !document.querySelector('[data-drivers]').hidden && getComputedStyle(document.querySelector('[data-drivers]')).display !== 'none',
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.probe?.samples || [];
  const words = r.timed?.state?.words || [];
  const texts = (k) => S(k).map((s) => s.text);
  const dedupe = (a) => a.filter((t, i) => i === 0 || t !== a[i - 1]);
  const steady = (k, f) => { const v = S(k).map((s) => s[f]); return v.length > 0 && Math.max(...v) - Math.min(...v) <= 0.5; };
  const geometry = (k) => steady(k, 'w') && steady(k, 'tail') && steady(k, 'h');
  const range = (k, f) => { const v = S(k).map((s) => s[f]); return `${Math.min(...v)}–${Math.max(...v)}`; };

  // Timed: a pair of samples 1 s (20 samples) apart shows different words, and the list keeps turning.
  const t = texts('timed');
  const pairDiffers = t.some((x, i) => i + 20 < t.length && x !== t[i + 20]);
  const distinct = new Set(t.filter(Boolean)).size;
  out.push({ ok: words.length === 4 && pairDiffers && distinct >= 3, message: `timed: the slot word changes across samples 1 s apart (${dedupe(t).join(' → ')})` });
  const seated = t.filter((x) => words.includes(x)).length / (t.length || 1);
  out.push({ ok: t.every((x) => x === '' || words.includes(x)) && seated >= 0.6, message: `timed: a whole word is seated in the slot ${Math.round(seated * 100)} % of the time, the rest is the roll` });
  out.push({ ok: geometry('timed'), message: `timed: slot width ${range('timed', 'w')} px, tail x ${range('timed', 'tail')}, headline height ${range('timed', 'h')}: the line never reflows` });

  // Typed: first paint is the whole first word, then it is erased per character and the next is typed.
  const ty = dedupe(texts('typed'));
  const [a, b] = words;
  const partOf = (w) => ty.some((x) => x && x.length < w.length && w.startsWith(x));
  out.push({ ok: ty[0] === a && ty.at(-1) === b && ty.includes('') && partOf(a) && partOf(b) && ty.every((x) => a.startsWith(x) || b.startsWith(x)), message: `typed: erased and retyped per character (${ty.map((x) => x || '∅').join(' → ')})` });
  out.push({ ok: geometry('typed') && S('typed')[0]?.w === S('timed')[0]?.w, message: `typed: slot width held at ${range('typed', 'w')} px while the word is partial` });

  // Wheel: two wheel inputs step the word twice while the page stays at the top.
  const w = S('wheel');
  out.push({ ok: w.length > 0 && w.every((s) => s.text === words[2] && s.y === 0) && r.wheel?.state?.word === words[2], message: `wheel: two inputs stepped the word to "${w[0]?.text}" with scrollY ${range('wheel', 'y')}` });
  out.push({ ok: geometry('wheel') && S('wheel')[0]?.w === S('timed')[0]?.w, message: 'wheel: line width unchanged after the steps' });
  const wt = S('wheel-through');
  out.push({ ok: wt.length > 0 && wt.every((s) => s.text === words[3] && s.y > 0), message: `wheel: past the last word the wheel scrolls the page (word "${wt[0]?.text}", scrollY ${wt[0]?.y})` });

  // Accessibility: the visible slot is hidden from AT, the heading reads one whole sentence.
  out.push({ ok: r.timed?.probe?.slotHidden === 'true' && r.timed?.probe?.labelLive === 'off' && r.timed?.state?.label === r.timed?.state?.word, message: 'the slot is aria-hidden; the current word is exposed once through an aria-live="off" label' });

  // Reduced motion: first word, still, wheel scrolls the page, no driver switch.
  const rm = r.rm || {};
  out.push({ ok: rm.state?.motion === 'reduced' && rm.state?.driver === 'static' && texts('rm').every((x) => x === words[0]) && S('rm')[0]?.y > 0 && rm.probe?.driversShown === false, message: `reduced motion: the first word, static; the wheel scrolls the page (scrollY ${S('rm')[0]?.y}); driver switch hidden` });
  out.push({ ok: geometry('rm') && S('rm')[0]?.w === S('timed')[0]?.w, message: 'reduced motion: the slot keeps the widest word\'s width' });

  // Mobile: the timed cycle runs, no reflow, no horizontal overflow.
  const m = texts('mobile');
  out.push({ ok: new Set(m.filter(Boolean)).size >= 3 && geometry('mobile'), message: `mobile: cycles (${dedupe(m).join(' → ')}) with slot width ${range('mobile', 'w')} px` });
  out.push({ ok: (r.mobile?.probe?.overflowX ?? 1) <= 0, message: `mobile has no horizontal overflow (${r.mobile?.probe?.overflowX}px)` });
  return out;
}
