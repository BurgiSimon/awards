export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'mid', scroll: 0.5, settle: 600 },
  { name: 'end', scroll: 1, settle: 600 },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 600 },
  { name: 'rm-mid', scroll: 0.5, reducedMotion: true, settle: 600 },
  { name: 'mobile', scroll: 0.5, viewport: 'mobile', settle: 600 },
  // The same page forced onto the IntersectionObserver fallback through its own comparison link, then a jump to mid-scroll.
  { name: 'script', scroll: 0.5, settle: 1600, actions: [{ type: 'click', selector: '[data-engine-link]' }, { type: 'waitFor', fn: "window.__awards?.state?.().engine === 'script'", timeout: 10000 }] },
];

export function probe() {
  const read = (el) => {
    const s = getComputedStyle(el);
    const m = s.transform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(s.transform);
    const b = el.getBoundingClientRect();
    return { opacity: Number(Number(s.opacity).toFixed(3)), scale: Number(Math.hypot(m.a, m.b).toFixed(3)), tx: Math.round(m.e), ty: Math.round(m.f), top: Math.round(b.top), width: Math.round(b.width) };
  };
  const chapters = [...document.querySelectorAll('.chapter')].map((c) => [...c.querySelectorAll('.reveal')].map(read));
  return {
    chapters,
    hero: read(document.querySelector('.hero-copy')),
    bar: read(document.querySelector('[data-progress]')),
    frame: read(document.querySelector('[data-frame]')),
    cover: read(document.querySelector('.trace-cover')),
    caption: read(document.querySelector('.stage-caption')),
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
}

const settled = (x) => x && x.opacity === 1 && x.ty === 0 && x.scale === 1;
const close = (a, b, d = 0.06) => typeof a === 'number' && Math.abs(a - b) <= d;

export function assert(r) {
  const out = [];
  const t = r.top, m = r.mid, e = r.end, rm = r.rm, rmm = r['rm-mid'], mob = r.mobile, sc = r.script;

  // Which path ran, and what it costs the main thread.
  out.push({ ok: t.state?.engine === 'css' && t.state?.supported?.view && t.state?.supported?.scroll, message: `CSS scroll timelines supported and in charge (${t.state?.engine})` });
  out.push({ ok: t.state?.mainThread?.listeners === 0 && t.state?.mainThread?.observers === 0 && t.state?.timelines >= 10, message: `nothing on the main thread: 0 listeners, 0 observers, ${t.state?.timelines} scroll-driven animations` });

  // Reading progress: monotonic over the document.
  const p = [t, m, e].map((s) => s.state?.progress);
  out.push({ ok: close(p[0], 0, 0.01) && close(p[1], 0.5, 0.1) && close(p[2], 1, 0.02) && p[0] < p[1] && p[1] < p[2], message: `progress bar scaleX grows with the scroll (${p.join(' → ')})` });
  out.push({ ok: (t.probe?.bar?.width ?? 1) < (m.probe?.bar?.width ?? 0) && (m.probe?.bar?.width ?? 1) < (e.probe?.bar?.width ?? 0), message: `progress bar drawn width grows too (${[t, m, e].map((s) => s.probe?.bar?.width).join(' → ')} px)` });

  // Reveals: below the fold they wait; by mid-scroll the first chapters are fully in place.
  const first = t.probe?.chapters?.[0] ?? [];
  out.push({ ok: first.length === 2 && first.every((x) => x.opacity < 1 && x.ty > 0), message: `first chapter waits below the fold at top (opacity ${first.map((x) => x.opacity).join(', ')})` });
  out.push({ ok: settled(t.probe?.hero), message: 'hero copy fully visible at top' });
  const early = (m.probe?.chapters ?? []).slice(0, 2).flat();
  out.push({ ok: early.length === 4 && early.every(settled), message: `chapters one and two fully revealed by mid-scroll (${early.map((x) => `${x.opacity}/${x.ty}`).join(' ')})` });
  out.push({ ok: (m.probe?.hero?.opacity ?? 1) < 0.5, message: `hero copy has left by mid-scroll (opacity ${m.probe?.hero?.opacity})` });

  // Sticky media: part-open at mid, open with its caption at the end.
  out.push({ ok: (m.state?.frame ?? 1) > 0.56 && (m.state?.frame ?? 1) < 0.99, message: `sticky media scaling at mid (${m.state?.frame})` });
  out.push({ ok: close(e.state?.frame, 1, 0.001) && e.probe?.caption?.opacity === 1 && (e.probe?.cover?.tx ?? 0) >= (e.probe?.frame?.width ?? 1), message: `media open, trace uncovered and caption in at the end (${e.state?.frame}, caption ${e.probe?.caption?.opacity})` });
  const last = (e.probe?.chapters ?? []).slice(-2).flat();
  out.push({ ok: last.length === 4 && last.every(settled), message: 'last chapters revealed at the end' });

  // Reduced motion: every end state at scroll 0, no reveal or scale animation; the bar moves in tenths only.
  const all = (rm.probe?.chapters ?? []).flat();
  out.push({ ok: rm.state?.motion === 'reduced' && all.length === 8 && all.every(settled), message: 'reduced motion: every block at its end state at scroll 0' });
  out.push({ ok: close(rm.state?.frame, 1, 0.001) && rm.probe?.caption?.opacity === 1 && (rm.probe?.cover?.tx ?? 0) >= (rm.probe?.frame?.width ?? 1) && settled(rm.probe?.hero), message: 'reduced motion: media open, trace uncovered, caption and hero in place' });
  out.push({ ok: rm.state?.timelines <= 1 && rm.state?.mainThread?.listeners === 0, message: `reduced motion: no reveal or media timelines (${rm.state?.timelines} left: the stepped bar)` });
  const stepped = rmm.state?.progress;
  out.push({ ok: typeof stepped === 'number' && stepped > 0 && close(stepped * 10, Math.round(stepped * 10), 0.001) && (rmm.probe?.chapters ?? []).flat().every(settled), message: `reduced motion: progress moves in tenths (${stepped}), blocks stay put` });

  // Phone.
  out.push({ ok: mob.state?.engine === 'css' && close(mob.state?.progress, 0.5, 0.1) && (mob.probe?.chapters ?? []).slice(0, 2).flat().every(settled), message: `phone: progress ${mob.state?.progress}, first chapters revealed` });

  // Fallback: the IntersectionObserver path sets the same end states, including blocks the jump skipped past.
  const ss = sc.state ?? {};
  out.push({ ok: ss.engine === 'script' && ss.forced === true && ss.timelines === 0 && ss.mainThread?.listeners === 2 && ss.mainThread?.observers === 1, message: `fallback: script path ran (${ss.engine}, ${ss.timelines} timelines, ${ss.mainThread?.listeners} listeners)` });
  out.push({ ok: close(ss.progress, 0.5, 0.1), message: `fallback: progress drawn by the scroll listener (${ss.progress})` });
  out.push({ ok: (sc.probe?.chapters ?? []).slice(0, 2).flat().every(settled) && (ss.frame ?? 0) > 0.97, message: `fallback: chapters jumped past are revealed, media opened (${ss.frame})` });
  out.push({ ok: (ss.mainThread?.pending ?? 0) >= 4, message: `fallback: blocks still below the fold keep waiting (${ss.mainThread?.pending} pending)` });

  out.push({ ok: [t, m, e, mob].every((s) => s.probe?.overflow === false), message: 'no horizontal overflow' });
  return out;
}
