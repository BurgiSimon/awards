export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 'mid', scroll: 0.5, settle: 900 },
  { name: 'end', scroll: 1, settle: 900 },
  { name: 'rm', scroll: 0.5, reducedMotion: true, settle: 900 },
  { name: 'mobile', scroll: 0.5, viewport: 'mobile', settle: 900 },
];
export function probe() {
  const active = document.querySelector('[data-caption].is-active');
  return { caption: active?.textContent, readout: document.querySelector('[data-readout]').textContent };
}
export function assert(r) {
  const out = [];
  out.push({ ok: (r.top.state?.pinProgress ?? 1) < 0.05, message: `pin not started at top (${r.top.state?.pinProgress})` });
  out.push({ ok: (r.mid.state?.pinProgress ?? 0) > 0.2 && (r.mid.state?.pinProgress ?? 0) < 0.9, message: `pin mid-way at mid (${r.mid.state?.pinProgress})` });
  out.push({ ok: (r.mid.state?.rotation ?? 0) > 60, message: `object rotated at mid (${r.mid.state?.rotation})` });
  out.push({ ok: (r.end.state?.pinProgress ?? 0) > 0.98 && Math.round(r.end.state?.rotation ?? 0) === 540, message: `timeline complete at end (${r.end.state?.rotation})` });
  out.push({ ok: r.mid.probe?.caption !== r.top.probe?.caption, message: `caption changed between top and mid (${r.top.probe?.caption} → ${r.mid.probe?.caption})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && (r.rm.state?.rotation ?? 1) === 0 && (r.rm.state?.beat ?? 0) >= 2, message: `reduced motion: beats advance without rotation (rot ${r.rm.state?.rotation}, beat ${r.rm.state?.beat})` });
  out.push({ ok: (r.mobile.state?.pinProgress ?? 0) > 0.2, message: `mobile pin scrubs (${r.mobile.state?.pinProgress})` });
  return out;
}
