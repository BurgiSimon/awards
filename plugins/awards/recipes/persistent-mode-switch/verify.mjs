// Every state opens a fresh browser context, so localStorage starts empty; `reload` keeps it within one state.
// The probe samples what renders every 50 ms for 1 s: body background, indicator translate, overlay opacity,
// dock and close-switch opacity / scale, and where the switch lives (state() is read before the probe, so the
// close hand-off, which lands a frame after the scroll, is judged from the samples). Static facts (grid alignment,
// reachability, sizes) are read once after.
const DOCK_DARK = '[data-switch="dock"] input[value="dark"]';
const toBottom = { type: 'waitFor', fn: '(scrollTo(0, document.documentElement.scrollHeight), true)' };

export const states = [
  { name: 'fresh', settle: 300 },
  // Grid first, then theme, so the samples catch the theme transition from its start.
  { name: 'toggle', settle: 300, actions: [{ type: 'click', selector: '[data-grid-toggle]' }, { type: 'click', selector: DOCK_DARK }] },
  // Choose dark by pointer, grid by hotkey (focus sits on a radio, which is not a text field), then reload.
  { name: 'reload', settle: 300, actions: [{ type: 'click', selector: DOCK_DARK }, { type: 'press', key: 'g' }, { type: 'wait', ms: 100 }, { type: 'reload' }] },
  // Keys typed into the search field and modifier chords do nothing; a bare g on the page still works.
  { name: 'guarded', settle: 300, actions: [
    { type: 'click', selector: '#q' }, { type: 'press', key: 'd' }, { type: 'press', key: 'g' }, { type: 'press', key: 'l' },
    { type: 'click', selector: '#w' }, { type: 'press', key: 'Alt+g' }, { type: 'press', key: 'Control+g' }, { type: 'press', key: 'g' },
  ] },
  { name: 'close', settle: 300, actions: [toBottom] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: [{ type: 'click', selector: '[data-grid-toggle]' }, { type: 'click', selector: DOCK_DARK }] },
  { name: 'rm-close', reducedMotion: true, settle: 300, actions: [toBottom] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [{ type: 'click', selector: DOCK_DARK }, { type: 'click', selector: '[data-grid-toggle]' }, { type: 'wait', ms: 600 }] },
];

export async function probe() {
  const $ = (s) => document.querySelector(s);
  const dock = $('[data-dock]'), large = $('[data-switch="close"]'), overlay = $('[data-grid-overlay]');
  const m = (el) => new DOMMatrix(getComputedStyle(el).transform === 'none' ? undefined : getComputedStyle(el).transform);
  const ind = (sel) => Math.round(m($(`${sel} .switch__ind`)).m41 * 10) / 10;
  const t0 = performance.now();
  const read = () => ({
    t: Math.round(performance.now() - t0),
    at: window.__awards.state().at,
    bg: getComputedStyle(document.body).backgroundColor,
    ind: ind('[data-switch="dock"]'),
    indLarge: ind('[data-switch="close"]'),
    overlay: Number(getComputedStyle(overlay).opacity),
    dockOpacity: Number(getComputedStyle(dock).opacity),
    dockScale: Math.round(m(dock).a * 1000) / 1000,
    largeOpacity: Number(getComputedStyle(large).opacity),
    largeScale: Math.round(m(large).a * 1000) / 1000,
  });
  const samples = [];
  for (let i = 0; i < 20; i++) { samples.push(read()); await new Promise((r) => setTimeout(r, 50)); }
  const cols = [...overlay.children].filter((s) => getComputedStyle(s).display !== 'none').map((s) => Math.round(s.getBoundingClientRect().left));
  const left = (s) => Math.round($(s).getBoundingClientRect().left);
  const radios = [...document.querySelectorAll('[data-switch] input')];
  const d = dock.getBoundingClientRect();
  return {
    samples,
    cols,
    overlayVisibility: getComputedStyle(overlay).visibility,
    tileLeft: [left('.tile--a'), left('.tile--b')],
    reachable: radios.filter((r) => !r.closest('[inert]') && getComputedStyle(r).visibility === 'visible').map((r) => r.name),
    checked: radios.filter((r) => r.checked).map((r) => r.name + ':' + r.value),
    query: $('#q').value,
    meta: $('meta[name="theme-color"]').content,
    dockInView: d.top >= 0 && d.bottom <= innerHeight && d.left >= 0 && d.right <= innerWidth,
    targets: [$('[data-grid-toggle]'), ...dock.querySelectorAll('.switch__opt')].map((el) => Math.round(el.getBoundingClientRect().height)),
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

const LIGHT = 'rgb(244, 242, 238)', DARK = 'rgb(26, 28, 28)';
const red = (c) => Number(/\d+/.exec(c || '')?.[0]);
const between = (v, a, b) => v > Math.min(a, b) + 0.01 && v < Math.max(a, b) - 0.01;

export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.probe?.samples || [];
  const P = (k) => r[k]?.probe || {};
  const st = (k) => r[k]?.state || {};
  const range = (a) => (a.length ? `${Math.min(...a)}–${Math.max(...a)}` : 'none');

  // Fresh visit: defaults, nothing stored, labels read the state.
  const f = st('fresh');
  out.push({ ok: f.rootTheme === 'default' && f.rootGrid === 'off' && f.stored?.theme === null && f.stored?.grid === null && f.labels?.theme === '[L]' && f.labels?.grid === '[off]' && S('fresh').every((s) => s.bg === LIGHT && s.overlay === 0), message: `fresh visit: light ground ${S('fresh')[0]?.bg}, grid hidden, nothing stored` });

  // Toggle: root attributes and storage are set; what renders follows, with a visible transition.
  const t = st('toggle'), ts = S('toggle'), tl = ts.at(-1) || {};
  out.push({ ok: t.rootTheme === 'dark' && t.rootGrid === 'on' && t.stored?.theme === 'dark' && t.stored?.grid === 'on', message: `toggle sets html[data-theme=${t.rootTheme}][data-grid=${t.rootGrid}] and localStorage (${JSON.stringify(t.stored)})` });
  out.push({ ok: t.labels?.theme === '[D]' && t.labels?.grid === '[on]' && t.labels?.pressed === 'true' && P('toggle').meta === '#1a1c1c', message: `labels print the state (${t.labels?.theme} ${t.labels?.grid}, aria-pressed ${t.labels?.pressed}), theme-color ${P('toggle').meta}` });
  out.push({ ok: tl.bg === DARK && tl.overlay === 1 && P('toggle').overlayVisibility === 'visible', message: `renders dark (${tl.bg}) with the overlay shown (opacity ${tl.overlay})` });
  out.push({ ok: ts.some((s) => between(red(s.bg), 26, 244)) && ts.some((s) => between(s.ind, ts[0].ind, tl.ind)) && tl.ind > ts[0].ind, message: `full motion: ground eases (red ${range(ts.map((s) => red(s.bg)))}) and the indicator slides (x ${range(ts.map((s) => s.ind))} px)` });
  const cols = P('toggle').cols || [], tiles = P('toggle').tileLeft || [];
  out.push({ ok: cols.length === 12 && Math.abs(tiles[0] - cols[0]) <= 1 && Math.abs(tiles[1] - cols[4]) <= 1, message: `12 overlay columns; tiles sit on columns 1 and 5 (tiles ${tiles.join('/')}, columns ${cols[0]}/${cols[4]})` });

  // Reload: the stored choice is back before the first sample, with no tween into it.
  const rl = st('reload'), rs = S('reload');
  out.push({ ok: rl.restored?.theme === 'dark' && rl.restored?.grid === 'on' && rl.rootTheme === 'dark' && rl.rootGrid === 'on' && rl.labels?.theme === '[D]' && rl.labels?.grid === '[on]', message: `reload restores from storage (${JSON.stringify(rl.restored)}), labels ${rl.labels?.theme} ${rl.labels?.grid}` });
  out.push({ ok: rs.length > 0 && rs.every((s) => s.bg === DARK && s.overlay === 1 && s.ind === rs.at(-1).ind) && rs[0].ind > 0 && P('reload').checked?.includes('theme-dock:dark'), message: `after reload the first frame is already dark (${rs[0]?.bg}), grid on, indicator parked at ${rs[0]?.ind} px: no flash, no tween` });

  // Guard: typed keys and chords are ignored; the bare key outside a field still works.
  const g = st('guarded');
  out.push({ ok: g.rootTheme === 'default' && S('guarded').every((s) => s.bg === LIGHT) && P('guarded').query === 'dgl' && g.ignored === 5, message: `keys typed into the field reach the field ("${P('guarded').query}") and not the page (theme ${g.rootTheme}, ${g.ignored} ignored)` });
  out.push({ ok: g.grid === true && g.hotkeys === 1 && g.stored?.grid === 'on', message: `Alt+g / Ctrl+g ignored, a bare g toggles the grid (hotkeys ${g.hotkeys})` });

  // Close: the dock cross-scales out as the large copy arrives; only the large radios are reachable.
  const cs = S('close'), cl = cs.at(-1) || {};
  out.push({ ok: cl.at === 'close' && cl.dockOpacity === 0 && cl.largeOpacity === 1 && cl.largeScale === 1 && P('close').reachable?.join() === 'theme-close,theme-close', message: `at the close the large switch is the only reachable copy (${P('close').reachable?.join(', ')})` });
  out.push({ ok: cs.some((s) => between(s.dockOpacity, 0, 1) && between(s.dockScale, 1, 1.75)) && cs.some((s) => between(s.largeScale, 0.5, 1)), message: `full motion: cross-scale (dock scale ${range(cs.map((s) => s.dockScale))}, large ${range(cs.map((s) => s.largeScale))})` });

  // Reduced motion: the state changes with no tween at all.
  const m = st('rm'), ms = S('rm');
  out.push({ ok: m.motion === 'reduced' && m.rootTheme === 'dark' && m.stored?.theme === 'dark' && ms.length > 0 && ms.every((s) => s.bg === DARK && s.overlay === 1 && s.ind === ms[0].ind && s.ind > 0), message: `reduced motion: first sample already dark, overlay on, indicator at ${ms[0]?.ind} px throughout` });
  const rc = S('rm-close');
  out.push({ ok: rc.at(-1)?.at === 'close' && rc.every((s) => !between(s.dockOpacity, 0, 1) && !between(s.largeOpacity, 0, 1)) && rc.at(-1)?.largeOpacity === 1, message: `reduced motion: the close hand-off swaps without a cross-scale (dock opacity ${range(rc.map((s) => s.dockOpacity))})` });

  // Mobile: tap works, four columns aligned, controls in view and large enough, no overflow.
  const mb = P('mobile'), mst = st('mobile');
  out.push({ ok: mst.rootTheme === 'dark' && mst.grid === true && S('mobile').at(-1)?.bg === DARK && mb.cols?.length === 4 && Math.abs(mb.tileLeft?.[0] - mb.cols?.[0]) <= 1 && Math.abs(mb.tileLeft?.[1] - mb.cols?.[1]) <= 1, message: `mobile: taps switch theme and grid; 4 columns, tiles on columns 1 and 2 (${mb.tileLeft?.join('/')} vs ${mb.cols?.slice(0, 2).join('/')})` });
  out.push({ ok: mb.dockInView && mb.targets?.every((h) => h >= 44) && (mb.overflowX ?? 1) <= 0, message: `mobile: dock in view, targets ${mb.targets?.join('/')} px, overflow ${mb.overflowX}px` });
  return out;
}
