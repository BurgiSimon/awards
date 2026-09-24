// Two layers. The harness states check what renders: which errors are visible, where focus lands, whether the
// sentence stacks on the phone and whether any line box crosses the viewport edge, sampled over 600 ms from the
// moment of submit so the entrance tier is judged from what actually moved. inspect() then reads the accessibility
// tree of the same page from Node (getByRole names, the form's ARIA snapshot and the focused node's name /
// description / invalid through CDP), because the in-page probe cannot see what a screen reader is given.

const type = (text) => [...text].map((key) => ({ type: 'press', key }));
const fill = ({ name = 'Ada', role = 'artist', topic = 'loans', email = 'ada@example.com' } = {}) => [
  { type: 'click', selector: '#f-name' }, ...type(name),
  ...(role ? [{ type: 'click', selector: `input[value="${role}"]` }] : []),
  { type: 'click', selector: '#f-topic' }, ...type(topic),
  { type: 'click', selector: '#f-email' }, ...type(email),
];
const send = { type: 'click', selector: '.send' };

export const states = [
  { name: 'desktop', settle: 300 },
  { name: 'empty-submit', settle: 300, actions: [send] },
  { name: 'partial', settle: 300, actions: [{ type: 'click', selector: '#f-name' }, ...type('Ada'), send] },
  { name: 'bad-email', settle: 300, actions: [...fill({ email: 'ada' }), send] },
  { name: 'sent', settle: 300, actions: [...fill(), send] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: [send] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [send] },
];

export async function probe() {
  const $ = (s) => document.querySelector(s);
  const shown = (el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility === 'visible';
  };
  const err = $('#e-name');
  const t0 = performance.now();
  const samples = [];
  for (let i = 0; i < 15; i++) {
    const cs = getComputedStyle(err);
    samples.push({ t: Math.round(performance.now() - t0), shown: shown(err), opacity: Number(cs.opacity), y: Math.round(new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform).m42 * 10) / 10 });
    await new Promise((r) => setTimeout(r, 40));
  }
  // Every line box on the page: text nodes per line (Range client rects) plus every control's box.
  let left = Infinity, right = -Infinity;
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    let rects;
    if (n.nodeType === Node.TEXT_NODE) {
      if (!n.textContent.trim() || n.parentElement.closest('.sr-only')) continue;
      const range = document.createRange(); range.selectNodeContents(n); rects = [...range.getClientRects()];
    } else {
      if (!n.matches('input, button, .choice') || n.closest('.sr-only') || !shown(n)) continue; // controls; text lines cover the rest
      rects = [n.getBoundingClientRect()];
    }
    for (const r of rects) if (r.width) { left = Math.min(left, r.left); right = Math.max(right, r.right); }
  }
  const box = (s) => { const r = $(s).getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) }; };
  const a = document.activeElement;
  const group = a?.closest('[role="radiogroup"]');
  const describedBy = (group ?? a)?.getAttribute('aria-describedby') || '';
  return {
    samples,
    errors: Object.fromEntries([...document.querySelectorAll('.error')].map((e) => [e.id, shown(e) ? e.textContent : null])),
    invalid: Object.fromEntries(['#f-name', '[data-role-group]', '#f-topic', '#f-email'].map((s) => [s, $(s).getAttribute('aria-invalid')])),
    animation: getComputedStyle(err).animationName,
    active: { id: a?.id, name: a?.getAttribute('name'), describedText: describedBy.split(/\s+/).filter(Boolean).map((id) => document.getElementById(id)?.textContent).join(' ') },
    sent: shown($('[data-sent]')) ? $('[data-sent]').textContent : null,
    sentFocused: a === $('[data-sent]'),
    frags: [...document.querySelectorAll('.frag')].map((f) => (shown(f) ? f.textContent.trim() : null)),
    label: box('.frag'),
    field: box('#f-name'),
    sentence: box('.sentence__text'),
    lineLeft: Math.floor(left), lineRight: Math.ceil(right),
    innerWidth, overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

// The accessible name of each control must be its prose fragment, exactly.
const NAMED = [
  ['textbox', 'Hello, my name is'], ['radiogroup', 'and I am'],
  ['radio', 'a collector'], ['radio', 'an artist'], ['radio', 'a studio'],
  ['textbox', 'I would like to talk about'], ['textbox', 'so please write back to'], ['button', 'Send the enquiry'],
];
const MSG = {
  name: 'Your name: the sentence starts with it.',
  role: 'Choose one: a collector, an artist or a studio.',
  email: 'That address needs an @ and a domain.',
};

// Node-side, per state, on the page the harness already drove: the tree as the browser exposes it.
export async function inspect(page, st) {
  const cdp = await page.context().newCDPSession(page);
  const node = async (pick) => {
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const n = nodes.find(pick);
    const prop = (k) => n?.properties?.find((p) => p.name === k)?.value?.value;
    return n && { role: n.role?.value, name: n.name?.value, description: n.description?.value, invalid: prop('invalid') };
  };
  const focused = (n) => n.role?.value !== 'RootWebArea' && n.properties?.some((p) => p.name === 'focused' && p.value?.value);
  if (st.name === 'desktop') {
    const counts = [];
    for (const [role, name] of NAMED) counts.push({ role, name, count: await page.getByRole(role, { name, exact: true }).count() });
    return { counts, snapshot: await page.locator('form').ariaSnapshot() };
  }
  if (st.name === 'empty-submit') return { focused: await node(focused) };
  if (st.name === 'partial') return { focused: await node(focused), group: await node((n) => n.role?.value === 'radiogroup') };
  return null;
}

export async function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const st = (k) => r[k]?.state || {};
  const range = (a) => (a.length ? `${Math.min(...a)}–${Math.max(...a)}` : 'none');

  // Rendered: the fragments are on screen, and the desktop sentence keeps its blanks inline.
  const d = P('desktop');
  out.push({ ok: d.frags?.length === 4 && d.frags.every(Boolean) && Object.values(d.errors || {}).every((v) => v === null) && st('desktop').submits === 0, message: `desktop: four prose fragments rendered (${d.frags?.join(' / ')}), no error shown before a submit` });
  out.push({ ok: d.field?.y < d.label?.bottom && d.field?.x > d.label?.x, message: `desktop: the name blank sits inline after its fragment (label ${d.label?.x},${d.label?.y}; field ${d.field?.x},${d.field?.y})` });

  // Empty submit: nothing leaves the page, every error shows, focus lands on the first field and it describes itself.
  for (const k of ['empty-submit', 'rm', 'mobile']) {
    const p = P(k), s = st(k);
    const shownAll = ['e-name', 'e-role', 'e-topic', 'e-email'].every((id) => p.errors?.[id]);
    out.push({ ok: s.path === '/sentence-form-enquiry/index.html' && s.submits === 1 && !s.sent && shownAll && Object.values(p.invalid || {}).every((v) => v === 'true'), message: `${k}: submit is prevented (${s.path}); four errors rendered, four fields aria-invalid` });
    out.push({ ok: p.active?.id === 'f-name' && p.errors?.['e-name'] === MSG.name && p.active?.describedText === MSG.name, message: `${k}: focus on the first invalid field (#${p.active?.id}), its described error is rendered ("${p.active?.describedText}")` });
  }

  // First invalid, not first field: with a name typed, focus goes to the radio group and only its later errors show.
  const pa = P('partial');
  out.push({ ok: pa.active?.name === 'role' && pa.errors?.['e-name'] === null && pa.errors?.['e-role'] === MSG.role && pa.active?.describedText === MSG.role && pa.invalid?.['#f-name'] === 'false', message: `partial: focus moves to the first invalid (${pa.active?.name}), the name error is gone` });
  const be = P('bad-email');
  out.push({ ok: be.active?.id === 'f-email' && be.errors?.['e-email'] === MSG.email && Object.entries(be.errors || {}).filter(([, v]) => v).length === 1, message: `bad-email: a type mismatch has its own message ("${be.errors?.['e-email']}") and takes focus` });

  // Success: a local confirmation, focused, and the page never navigated.
  const sp = P('sent'), ss = st('sent');
  out.push({ ok: ss.sent && ss.path === '/sentence-form-enquiry/index.html' && sp.sentFocused && sp.sent?.startsWith('Thank you, Ada.') && sp.sent.includes('ada@example.com') && Object.values(sp.errors || {}).every((v) => v === null), message: `sent: local confirmation rendered and focused ("${sp.sent?.slice(0, 40)}…"), no navigation` });

  // Motion tiers: full rises, reduced only fades.
  const fs = P('empty-submit').samples || [], rs = P('rm').samples || [];
  out.push({ ok: st('empty-submit').motion === 'full' && P('empty-submit').animation === 'rise' && fs.some((s) => s.y > 0.5) && fs.at(-1)?.y === 0 && fs.at(-1)?.opacity === 1, message: `full motion: the error rises (y ${range(fs.map((s) => s.y))} px) and settles` });
  out.push({ ok: st('rm').motion === 'reduced' && P('rm').animation === 'fade' && rs.length && rs.every((s) => s.y === 0) && rs.at(-1)?.opacity === 1, message: `reduced motion: no movement (y ${range(rs.map((s) => s.y))} px), opacity ${range(rs.map((s) => s.opacity))}` });

  // Phone: stacked, and no line box crosses the 390 px viewport.
  const m = P('mobile');
  out.push({ ok: m.field?.y >= m.label?.bottom && m.field?.w >= m.sentence?.w - 2 && m.field?.h >= 44, message: `mobile: fragment above a full-width blank (field ${m.field?.w}/${m.sentence?.w} px wide, ${m.field?.h} px tall)` });
  for (const k of ['mobile', 'desktop']) {
    const p = P(k);
    out.push({ ok: p.lineLeft >= 0 && p.lineRight <= p.innerWidth && p.overflowX <= 0, message: `${k}: every line box within the viewport (${p.lineLeft}–${p.lineRight} of ${p.innerWidth} px), overflow ${p.overflowX}px` });
  }

  // Accessibility tree, read by the browser rather than from attributes.
  const I = (k) => r[k]?.inspect || {};
  const ax = { counts: I('desktop').counts, snapshot: I('desktop').snapshot, afterEmpty: I('empty-submit').focused, afterName: I('partial').focused, group: I('partial').group };
  const axError = ['desktop', 'empty-submit', 'partial'].map((k) => I(k).inspectError).find(Boolean);
  out.push({ ok: !axError && !!ax.counts, message: `accessibility tree read${axError ? `: ${axError}` : ''}` });
  for (const c of ax.counts || []) out.push({ ok: c.count === 1, message: `a11y: exactly one ${c.role} named "${c.name}" (${c.count})` });
  out.push({ ok: !!ax.snapshot && !/- (textbox|radio|radiogroup|button)\s*(\[|$)/m.test(ax.snapshot), message: 'a11y: no unnamed control in the form snapshot' });
  const e = ax.afterEmpty || {}, n = ax.afterName || {}, g = ax.group || {};
  out.push({ ok: e.role === 'textbox' && e.name === 'Hello, my name is' && e.description === MSG.name && e.invalid === 'true', message: `a11y: after an empty submit the focused node is ${e.role} "${e.name}", invalid ${e.invalid}, described "${e.description}"` });
  out.push({ ok: n.role === 'radio' && n.name === 'a collector' && g.name === 'and I am' && g.description === MSG.role && g.invalid === 'true', message: `a11y: next submit focuses ${n.role} "${n.name}" in radiogroup "${g.name}", invalid ${g.invalid}, described "${g.description}"` });
  return out;
}
