// Every state starts on index.html. A tile click is a real page load: state() and probe() then read the new document.
const tile = (slug) => `[data-vt-item="${slug}"] a.work`;
const settledOn = (slug) => ({ type: 'waitFor', fn: `location.pathname.endsWith('/${slug}.html') && window.__awards?.state?.().settled === true`, timeout: 10000 });

export const states = [
  { name: 'top', settle: 600 },
  { name: 'open', actions: [{ type: 'click', selector: tile('ropewalk') }, settledOn('ropewalk'), { type: 'wait', ms: 150 }] },
  // Evidence frame: the screenshot is taken while the picture and name are still in flight (the in-flight count is reported, not asserted: timing-bound).
  { name: 'mid', actions: [{ type: 'click', selector: tile('lamps') }, { type: 'waitFor', fn: "location.pathname.endsWith('/lamps.html') && (window.__vt?.reveal?.groups?.length ?? 0) > 0", timeout: 10000 }, { type: 'wait', ms: 260 }] },
  { name: 'back', actions: [{ type: 'click', selector: tile('ropewalk') }, settledOn('ropewalk'), { type: 'click', selector: '[data-back]' }, settledOn('index'), { type: 'wait', ms: 150 }] },
  { name: 'keyboard', actions: [{ type: 'focus', selector: tile('nightbus') }, { type: 'press', key: 'Enter' }, settledOn('nightbus'), { type: 'wait', ms: 150 }] },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'click', selector: tile('ropewalk') }, settledOn('ropewalk'), { type: 'wait', ms: 150 }] },
  { name: 'mobile', viewport: 'mobile', actions: [{ type: 'click', selector: tile('lamps') }, settledOn('lamps'), { type: 'wait', ms: 150 }] },
];

export function probe() {
  const names = [...document.querySelectorAll('body *')].map((el) => getComputedStyle(el).viewTransitionName).filter((n) => n && n !== 'none');
  return {
    h1: document.querySelector('h1')?.textContent.trim(),
    title: document.title.split(' — ')[0],
    active: document.activeElement?.tagName.toLowerCase(),
    names,
    inline: document.querySelectorAll('[style*="view-transition-name"]').length,
    running: document.getAnimations().filter((a) => a.effect?.pseudoElement && a.playState === 'running').length,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
}

const count = (list, n) => (list || []).filter((x) => x === n).length;
const has = (list, part) => (list || []).some((x) => x.includes(part));

export function assert(r) {
  const out = [];
  const top = r.top, open = r.open, back = r.back, kb = r.keyboard, rm = r.rm, mob = r.mobile;

  out.push({ ok: top.state?.page === 'index' && top.probe?.h1 === 'Three works, three documents.', message: 'index renders' });
  out.push({ ok: JSON.stringify(top.probe?.names) === '["bar"]', message: `at rest no tile carries a shared name (${top.probe?.names?.join(', ')})` });
  out.push({ ok: top.state?.focused === false, message: 'a direct visit leaves focus alone' });
  out.push({ ok: (top.state?.api?.crossDocument || top.state?.api?.sameDocument) && top.state?.optedIn === true, message: `View Transitions API present and @view-transition opted in (cross-document ${top.state?.api?.crossDocument}, opt-in ${top.state?.optedIn})` });

  // Forward: the old page named only the chosen tile; the new page morphed both shared elements.
  const os = open.state ?? {}, sw = os.swap ?? {}, rv = os.reveal ?? {};
  out.push({ ok: os.page === 'ropewalk' && open.probe?.h1 === 'Rope Walk Studio' && open.probe?.title === 'Rope Walk Studio', message: `detail page loaded (${os.page}, "${open.probe?.h1}")` });
  out.push({ ok: os.focused === true && open.probe?.active === 'h1', message: `focus on the new h1 (${open.probe?.active})` });
  out.push({ ok: sw.from === 'index' && sw.to === 'ropewalk' && sw.transition === true && count(sw.named, 'media') === 1 && count(sw.named, 'title') === 1, message: `pageswap named one tile only (${sw.named?.join(', ')})` });
  out.push({ ok: rv.transition === true && rv.direction === 'forward' && rv.finished === true, message: `pagereveal ran a forward transition (${rv.direction}, finished ${rv.finished})` });
  out.push({ ok: has(rv.groups, 'group(media)') && has(rv.groups, 'group(title)') && has(rv.groups, 'old(root)'), message: `picture and name morphed, body slid (${rv.groups?.join(' ')})` });

  // Back: the index names the tile it is returning to, then clears it.
  const bs = back.state ?? {}, bsw = bs.swap ?? {}, brv = bs.reveal ?? {};
  out.push({ ok: bs.page === 'index' && bsw.from === 'ropewalk' && brv.direction === 'back' && brv.from === 'ropewalk', message: `back to the index with a back transition (${brv.direction} from ${brv.from})` });
  out.push({ ok: count(brv.named, 'media') === 1 && has(brv.groups, 'group(media)') && back.probe?.inline === 0, message: `returned tile named for the capture, cleared afterwards (${brv.named?.join(', ')}; ${back.probe?.inline} inline names left)` });
  out.push({ ok: bs.focused === true, message: 'focus on the index h1 after coming back' });

  out.push({ ok: r.mid.state?.page === 'lamps' && r.mid.state?.reveal?.transition === true, message: `mid-morph frame captured on the way to lamps (${r.mid.probe?.running} pseudo-element animations running)` });

  // Keyboard: Enter on a focused tile is the same navigation.
  out.push({ ok: kb.state?.page === 'nightbus' && kb.state?.focused === true && kb.state?.reveal?.transition === true, message: 'Enter on a tile opens it with the transition, focus on its h1' });

  // Reduced motion: the opt-in is off, so neither side ran a transition; the navigation and focus still work.
  const rs = rm.state ?? {};
  out.push({ ok: rs.motion === 'reduced' && rs.optedIn === false && rs.page === 'ropewalk', message: `reduced motion: opt-in off, page still opens (${rs.optedIn})` });
  out.push({ ok: rs.swap?.transition === false && rs.reveal?.transition === false && (rs.reveal?.groups ?? []).length === 0, message: 'reduced motion: no view transition ran on either side' });
  out.push({ ok: rs.focused === true, message: 'reduced motion: focus still lands on the h1' });

  out.push({ ok: mob.state?.page === 'lamps' && mob.state?.focused === true && mob.state?.reveal?.transition === true, message: 'phone: tile opens with the transition' });
  out.push({ ok: [top, open, back, mob].every((s) => s.probe?.overflow === false), message: 'no horizontal overflow' });
  return out;
}
