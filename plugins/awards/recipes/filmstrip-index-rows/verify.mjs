const tab = (n) => Array.from({ length: n }, () => ({ type: 'press', key: 'Tab' }));

export const states = [
  { name: 'top', scroll: 0, settle: 900 },
  { name: 'hover', scroll: 0, settle: 600, actions: [{ type: 'hover', selector: '[data-row]:nth-child(2) .reel' }, { type: 'wait', ms: 900 }] },
  { name: 'focus', scroll: 0, settle: 600, actions: [{ type: 'focus', selector: '[data-row]:nth-child(1) [data-project]' }, { type: 'wait', ms: 500 }] },
  // From the last link before the list: six Tabs reach the sixth project, the seventh leaves the list.
  { name: 'tab6', settle: 400, actions: [{ type: 'focus', selector: '.topbar a' }, ...tab(6), { type: 'wait', ms: 300 }] },
  { name: 'tab7', settle: 400, actions: [{ type: 'focus', selector: '.topbar a' }, ...tab(7), { type: 'wait', ms: 300 }] },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 900 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 900 },
];

// Reads the rendered transforms at the same instants for every row, so frame jitter cancels between rows.
export async function probe() {
  const rows = [...document.querySelectorAll('[data-row]')];
  const tracks = rows.map((r) => r.querySelector('[data-track]'));
  const read = () => tracks.map((t) => new DOMMatrixReadOnly(getComputedStyle(t).transform).m41);
  const t0 = performance.now(), a = read();
  await new Promise((r) => setTimeout(r, 1000));
  const t1 = performance.now(), b = read();
  const s = (t1 - t0) / 1000;
  const active = document.activeElement;
  return {
    hoverMedia: matchMedia('(hover: hover)').matches,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    videos: document.querySelectorAll('video').length,
    syntheticVideos: document.querySelectorAll('video[data-synthetic]').length,
    tabbableInList: document.querySelectorAll('[data-rows] a[href], [data-rows] button, [data-rows] [tabindex]:not([tabindex="-1"])').length,
    focusableInReels: document.querySelectorAll('.reel a, .reel button, .reel [tabindex]').length,
    activeRow: active?.hasAttribute('data-project') ? rows.indexOf(active.closest('[data-row]')) : -1,
    activeInList: !!active?.closest('[data-rows]'),
    rows: rows.map((r, i) => {
      const box = r.getBoundingClientRect(), copy = tracks[i].offsetWidth / 2;
      const moved = (((a[i] - b[i]) % copy) + copy) % copy; // leftward travel, wrap-safe
      const v = r.querySelector('video');
      return {
        onscreen: box.bottom > 0 && box.top < innerHeight,
        paused: r.hasAttribute('data-paused'),
        playState: getComputedStyle(tracks[i]).animationPlayState,
        transform: getComputedStyle(tracks[i]).transform,
        scale: new DOMMatrixReadOnly(getComputedStyle(r.querySelector('.grow')).transform).a,
        copy,
        pxs: moved / s,
        videoPlaying: !!v && !v.paused && v.readyState >= 2,
      };
    }),
  };
}

export function assert(r) {
  const out = [];
  const rows = (k) => r[k].probe?.rows ?? [];
  const running = (k) => rows(k).filter((x) => x.onscreen && !x.paused);
  const sameSpeed = (k) => {
    const run = running(k);
    const copies = run.map((x) => x.copy), speeds = run.map((x) => x.pxs);
    const widthRatio = Math.max(...copies) / Math.min(...copies);
    const spread = Math.max(...speeds) / Math.min(...speeds);
    return { ok: run.length >= 2 && widthRatio > 1.3 && spread <= 1.05 && speeds.every((v) => Math.abs(v - 70) < 70 * 0.15), msg: `${run.length} rows, widths ×${widthRatio.toFixed(2)}, speeds ${speeds.map((v) => v.toFixed(1)).join(' / ')} px/s (spread ×${spread.toFixed(3)})` };
  };

  const top = sameSpeed('top');
  out.push({ ok: top.ok, message: `one px/s across rows of different widths, within 5 %: ${top.msg}` });
  const t = rows('top');
  out.push({ ok: t.some((x) => !x.onscreen) && t.every((x) => x.onscreen ? !x.paused : x.paused && x.pxs < 1), message: `off-screen rows paused, on-screen rows running (${t.map((x) => (x.onscreen ? 'on' : 'off') + (x.paused ? '·p' : '')).join(' ')})` });
  const onscreen = t.filter((x) => x.onscreen).length;
  out.push({ ok: r.top.probe?.hoverMedia === true && r.top.probe?.syntheticVideos === onscreen && r.top.probe?.videos === onscreen, message: `desktop (hover: hover): a synthetic video mounted per on-screen row only (${r.top.probe?.videos} videos, ${onscreen} on screen)` });

  const h = rows('hover')[1] ?? {};
  out.push({ ok: h.paused && h.pxs < 1 && h.playState === 'paused' && Math.abs(h.scale - 1.2) < 0.02 && h.videoPlaying, message: `hover: row paused (${h.pxs?.toFixed(1)} px/s), grown to ×${h.scale?.toFixed(2)}, clip playing (${h.videoPlaying})` });

  const f = rows('focus');
  out.push({ ok: r.focus.probe?.activeRow === 0 && f[0]?.paused && f[0]?.playState === 'paused' && f[0]?.pxs < 1 && f[1]?.pxs > 50, message: `focus pauses its own row only (row 1 ${f[0]?.pxs?.toFixed(1)} px/s, row 2 ${f[1]?.pxs?.toFixed(1)} px/s)` });

  const n = rows('top').length;
  out.push({ ok: r.top.probe?.tabbableInList === n && r.top.probe?.focusableInReels === 0 && r.tab6.probe?.activeRow === n - 1 && r.tab7.probe?.activeInList === false, message: `Tab: one stop per project (${r.top.probe?.tabbableInList} for ${n}; 6 Tabs → row ${r.tab6.probe?.activeRow + 1}, 7th leaves the list: ${r.tab7.probe?.activeInList === false})` });

  const rm = rows('rm');
  out.push({ ok: r.rm.state?.motion === 'reduced' && rm.every((x) => x.transform === 'none' && x.pxs < 1) && r.rm.probe?.videos === 0, message: `reduced motion: transforms none, no travel, no video (${r.rm.probe?.videos} videos)` });

  const m = sameSpeed('mobile');
  out.push({ ok: r.mobile.probe?.hoverMedia === false && r.mobile.probe?.videos === 0 && m.ok, message: `mobile: coarse pointer mounts no video (${r.mobile.probe?.videos}), rows run at 70 px/s: ${m.msg}` });
  out.push({ ok: ['top', 'hover', 'mobile'].every((k) => r[k].probe?.overflow === false), message: 'no horizontal overflow' });
  return out;
}
