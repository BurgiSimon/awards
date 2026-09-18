export const states = [
  { name: 'top', scroll: 0, settle: 1800 },
  { name: 'mid', scroll: 0.5, settle: 700 },
  { name: 'end', scroll: 1, settle: 700 },
  { name: 'rm', scroll: 0, reducedMotion: true },
  { name: 'mobile', scroll: 1, viewport: 'mobile', settle: 700 },
];

export function probe() {
  const line = document.querySelector('.hero .line');
  return {
    lineOpacity: Number(getComputedStyle(line).opacity),
    lineTransform: getComputedStyle(line).transform,
    readout: document.querySelector('[data-progress]').textContent,
  };
}

export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.lenis === true, message: 'Lenis instance exposed on window.lenis' });
  out.push({ ok: (r.top.state?.triggers ?? 0) >= 4, message: `ScrollTrigger instances registered (${r.top.state?.triggers})` });
  out.push({ ok: Math.abs((r.mid.state?.scroll ?? 0) - 0.5) < 0.08, message: `mid state scrolled to ≈50% (${r.mid.state?.scroll})` });
  out.push({ ok: (r.mid.state?.progress ?? 0) > 30 && (r.mid.state?.progress ?? 0) < 70, message: `scrubbed readout ≈ 50 at mid (${r.mid.state?.progress})` });
  out.push({ ok: (r.end.state?.revealed ?? 0) >= 3, message: `all chapters revealed at the end (${r.end.state?.revealed})` });
  out.push({ ok: (r.top.state?.revealed ?? 9) <= 1, message: `chapters below the fold not revealed at top (${r.top.state?.revealed})` });
  const ty = (() => { const m = /matrix\([^)]*,\s*([-\d.]+)\)$/.exec(r.top.probe?.lineTransform || ''); return m ? Math.abs(Number(m[1])) : 0; })();
  out.push({ ok: r.top.probe?.lineOpacity === 1 && ty < 1, message: `hero lines settled after the entrance (${r.top.probe?.lineTransform})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.probe?.lineOpacity === 1, message: 'reduced-motion tier active and hero visible' });
  out.push({ ok: (r.mobile.state?.revealed ?? 0) >= 3, message: 'mobile end state reveals chapters' });
  return out;
}
