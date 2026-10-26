// The keyboard and thumb walk behind capture.mjs --walk: evidence for the jury's usability walk, gathered by a
// browser instead of read off still frames. Desktop: Tab through the page from the top and judge every stop (in
// view, not under a fixed bar, a visible change when focused, an accessible name), then open each disclosure
// (aria-expanded) with Enter and check that Tab goes in, Shift+Tab does not leave it open behind, and Escape closes
// it and returns focus; then press Enter on each button and see whether anything answers. Phone: tap each button
// and disclosure and see whether anything answers. Frames are kept only for stops with a finding.
import path from 'node:path';

// Everything below runs in the page.
function describe(el) {
  if (!el || el === document.body || el === document.documentElement) return null;
  const label = (el.getAttribute('aria-label') || '').trim()
    || (el.getAttribute('aria-labelledby') || '').split(/\s+/).map((id) => document.getElementById(id)?.textContent.trim() ?? '').join(' ').trim()
    || (el.textContent || '').trim().replace(/\s+/g, ' ')
    || el.getAttribute('alt') || el.getAttribute('title') || el.querySelector('img[alt]')?.getAttribute('alt') || el.getAttribute('value') || el.getAttribute('placeholder') || '';
  return { tag: el.tagName.toLowerCase(), name: label.slice(0, 60), id: el.id || null, cls: el.classList[0] ?? null };
}
function stopState() {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return { none: true };
  const d = window.__awardsWalkDescribe(el);
  const b = el.getBoundingClientRect();
  const out = { ...d, key: `${d.tag}|${d.id}|${d.cls}|${d.name}|${Math.round(b.left)}|${Math.round(b.top + scrollY)}`, rect: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }, problems: [] };
  // An iframe or a shadow host keeps activeElement while Tab moves inside it: the embed's own stops are its business.
  if (el.tagName === 'IFRAME' || el.shadowRoot) return { ...out, embed: true };
  if (!d.name && !el.matches('input,select,textarea') ) out.problems.push('no accessible name');
  if (el.matches('input,select,textarea') && !(el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'))) out.problems.push('a field with no label');
  if (b.width < 1 || b.height < 1) out.problems.push('focus on an element with no size (hidden or collapsed)');
  else if (b.bottom <= 0 || b.top >= innerHeight || b.right <= 0 || b.left >= innerWidth) out.problems.push('focus off screen: the focused control is not in view');
  else {
    // What is painted over the focused control's centre, with pointer-events forced on (canvases and bars opt out).
    const style = document.createElement('style');
    style.textContent = '*, *::before, *::after { pointer-events: auto !important; }';
    document.head.appendChild(style);
    const x = Math.min(innerWidth - 1, Math.max(0, b.left + b.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, b.top + b.height / 2));
    const top = document.elementFromPoint(x, y);
    style.remove();
    const tb = top?.getBoundingClientRect();
    // A full-viewport texture over the whole page (a GL canvas, film grain, a vignette) is transparent where the
    // controls are, and a faint layer hides nothing; neither is judged here. A full-screen panel with a solid fill
    // (an open menu over the focused control) still is.
    let faint = 1;
    for (let n = top; n && n !== document.documentElement; n = n.parentElement) faint *= Number(getComputedStyle(n).opacity);
    const fill = top && getComputedStyle(top).backgroundColor.match(/rgba?\(([^)]+)\)/)?.[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    const solidFill = !!fill && (fill.length < 4 || fill[3] >= 0.5) && getComputedStyle(top).mixBlendMode === 'normal';
    const overlay = !!top && tb.width >= innerWidth * 0.9 && tb.height >= innerHeight * 0.9 && (top.tagName === 'CANVAS' || !solidFill);
    if (top && !overlay && faint >= 0.5 && top !== el && !el.contains(top) && !top.contains(el)) {
      let pin = null;
      for (let n = top; n && n !== document.body; n = n.parentElement) { const p = getComputedStyle(n).position; if (p === 'fixed' || p === 'sticky') { pin = n; break; } }
      const ts = getComputedStyle(top);
      const painted = !/rgba\(0, 0, 0, 0\)|transparent/.test(ts.backgroundColor) || /url\(/.test(ts.backgroundImage) || ['CANVAS', 'IMG', 'VIDEO', 'svg', 'SVG'].includes(top.tagName);
      const headerBar = !!pin && pin.getBoundingClientRect().height < innerHeight * 0.35 && pin.getBoundingClientRect().top <= 1;
      if (painted) out.problems.push(`focus lands under ${pin ? 'the fixed ' : ''}<${top.tagName.toLowerCase()}${top.classList[0] ? `.${top.classList[0]}` : ''}>${headerBar ? ' (scroll-padding-top as tall as the bar would clear it)' : ''}`);
    }
  }
  // A visible focus change: the computed look while focused against the look with focus removed, with transitions
  // off (a transitioned ring would read its starting value) and the pseudo-elements and the parent (:focus-within)
  // read too.
  const still = document.createElement('style');
  still.textContent = '*, *::before, *::after { transition: none !important; }';
  document.head.appendChild(still);
  const one = (s) => [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.backgroundColor, s.color, s.borderTopColor, s.borderBottomColor, s.textDecorationLine, s.transform, s.opacity, s.content, s.width].join('|');
  const look = () => [getComputedStyle(el), getComputedStyle(el, '::before'), getComputedStyle(el, '::after'), el.parentElement && getComputedStyle(el.parentElement)].filter(Boolean).map(one).join('#');
  const focused = look();
  el.blur();
  const rest = look();
  el.focus({ preventScroll: true });
  still.remove();
  if (focused === rest) out.problems.push('no visible change when focused');
  out.expanded = el.getAttribute('aria-expanded');
  out.button = el.matches('button,[role="button"],input[type="button"],input[type="submit"]');
  return out;
}
function watchChanges() {
  const w = window.__awardsWalkWatch = { mutations: 0, hash: location.hash, y: scrollY };
  w.observer?.disconnect();
  w.observer = new MutationObserver((list) => { w.mutations += list.length; });
  w.observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
}
function changesSince() {
  const w = window.__awardsWalkWatch;
  w.observer.disconnect();
  return { mutations: w.mutations, hashChanged: location.hash !== w.hash, scrolled: Math.abs(scrollY - w.y) > 4 };
}

async function shot(page, outDir, file, manifest, label, finding) {
  const p = path.join(outDir, file);
  try {
    await page.screenshot({ path: p });
    manifest.captures.push({ label, kind: 'walk', finding, file: p });
    return p;
  } catch { return null; }
}

export async function walkPage(browser, url, { outDir, name = '', desktop, mobile, timeout = 30000, settle = 600, settlePage, manifest, maxStops = 60, maxControls = 10 }) {
  const report = { desktop: { stops: [], findings: [] }, mobile: { taps: [], findings: [] } };
  const find = (where, finding) => report[where].findings.push(finding);

  // ---------- desktop keyboard ----------
  const context = await browser.newContext({ viewport: desktop, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const open = async () => {
    await page.goto(url, { waitUntil: 'load', timeout });
    await settlePage(page);
    await page.evaluate(`window.__awardsWalkDescribe = ${describe.toString()}`);
    await page.mouse.move(0, 0);
  };
  try {
    await open();
    const seen = new Set();
    let frames = 0, inside = 0;
    for (let i = 0; i < maxStops; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      const s = await page.evaluate(stopState).catch(() => ({ none: true }));
      if (s.none) break;
      // Inside an embed the key repeats until Tab leaves it; keep going, up to forty presses per embed.
      if (seen.has(s.key)) { if (s.embed && inside < 40) { inside++; i--; continue; } break; }
      inside = 0;
      seen.add(s.key);
      report.desktop.stops.push({ n: i + 1, tag: s.tag, name: s.name, rect: s.rect, expanded: s.expanded, problems: s.problems });
      for (const problem of s.problems) {
        const finding = { stop: i + 1, control: `<${s.tag}${s.cls ? `.${s.cls}` : ''}> “${s.name.slice(0, 32)}”`, problem };
        if (frames < 6 && !/no accessible name|no label/.test(problem)) finding.frame = await shot(page, outDir, `${name}desktop-walk-${i + 1}.png`, manifest, 'desktop', problem), frames++;
        find('desktop', finding);
      }
    }
    report.desktop.cycled = seen.size;
    // Back up with Shift+Tab: the browser scrolls a control in at the top edge going backwards, which is where a
    // fixed header hides it.
    const reported = new Set(report.desktop.findings.map((f) => `${f.control}|${f.problem}`));
    for (let i = 0; i < Math.min(seen.size, 30); i++) {
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(150);
      const s = await page.evaluate(stopState).catch(() => ({ none: true }));
      if (s.none) break;
      for (const problem of s.problems.filter((p) => /lands under|off screen/.test(p))) {
        const control = `<${s.tag}${s.cls ? `.${s.cls}` : ''}> “${s.name.slice(0, 32)}”`;
        if (reported.has(`${control}|${problem}`)) continue;
        reported.add(`${control}|${problem}`);
        find('desktop', { control, problem: `${problem}, going back with Shift+Tab`, ...(frames < 6 ? { frame: await shot(page, outDir, `${name}desktop-walk-back-${i + 1}.png`, manifest, 'desktop', problem) } : {}) });
        frames++;
      }
    }

    // Disclosures: every control that says it opens something. Each test starts from a fresh load, and the n-th
    // visible toggle is tagged so the steps after a reload address the same control.
    const pick = (selector, i, tag) => page.evaluate(({ selector, i, tag }) => {
      const el = [...document.querySelectorAll(selector)].filter((e) => !e.closest('[hidden],[inert]') && e.getBoundingClientRect().width > 0 && !e.disabled)[i];
      if (!el) return null;
      el.setAttribute('data-awards-walk', tag);
      el.focus();
      const d = window.__awardsWalkDescribe(el);
      return { label: `<${d.tag}${d.cls ? `.${d.cls}` : ''}> “${d.name.slice(0, 32)}”`, native: el.tagName === 'BUTTON', submit: el.type === 'submit' };
    }, { selector, i, tag });
    const toggles = await page.evaluate((max) => [...document.querySelectorAll('[aria-expanded]')].filter((e) => !e.closest('[hidden],[inert]') && e.getBoundingClientRect().width > 0 && !e.disabled).slice(0, max).length, 4);
    for (let i = 0; i < toggles; i++) {
      await open();
      const sel = `[data-awards-walk="t${i}"]`;
      const picked = await pick('[aria-expanded]', i, `t${i}`);
      if (!picked) continue;
      const control = picked.label;
      const before = await page.locator(sel).getAttribute('aria-expanded').catch(() => null);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      const opened = await page.locator(sel).getAttribute('aria-expanded').catch(() => null);
      if (before === 'false' && opened !== 'true') { find('desktop', { control, problem: 'a disclosure that does not open on Enter (aria-expanded stays false)', frame: await shot(page, outDir, `${name}desktop-walk-t${i}-enter.png`, manifest, 'desktop', 'enter') }); continue; }
      if (opened !== 'true') continue;
      // Shift+Tab from the toggle must not leave a modal panel open behind the visitor.
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(200);
      const back = await page.evaluate((s) => {
        const t = document.querySelector(s);
        const panel = document.getElementById(t?.getAttribute('aria-controls') ?? '') ?? null;
        const a = document.activeElement;
        // Modal: says so, or is a fixed panel over most of the screen; a tall accordion panel is neither.
        const pb = panel?.getBoundingClientRect();
        let fixed = false;
        for (let n = panel; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') { fixed = true; break; }
        const modal = !!panel && (panel.matches('[role="dialog"],[aria-modal="true"],dialog') || (fixed && pb.width >= innerWidth * 0.8 && pb.height >= innerHeight * 0.8));
        return { still: t?.getAttribute('aria-expanded') === 'true', inside: !!panel && panel.contains(a), onToggle: a === t, modal, to: window.__awardsWalkDescribe(a) };
      }, sel);
      if (back.still && back.modal && !back.inside && !back.onToggle) find('desktop', { control, problem: `Shift+Tab leaves the open panel for ${back.to ? `<${back.to.tag}> “${back.to.name.slice(0, 24)}”` : 'the page'} while it stays open`, frame: await shot(page, outDir, `${name}desktop-walk-t${i}-shift-tab.png`, manifest, 'desktop', 'shift-tab') });
      // Escape, pressed from inside the panel where the visitor is, closes it and gives focus back to the toggle.
      await page.focus(sel).catch(() => {});
      if ((await page.locator(sel).getAttribute('aria-expanded').catch(() => null)) !== 'true') { await page.keyboard.press('Enter'); await page.waitForTimeout(300); }
      await page.evaluate((s) => {
        const panel = document.getElementById(document.querySelector(s)?.getAttribute('aria-controls') ?? '');
        if (!panel) return;
        const inner = [...panel.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].find((e) => e.getBoundingClientRect().width > 0 && !e.disabled);
        if (inner) inner.focus();
        else { if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1'); panel.focus(); }
      }, sel);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const after = await page.evaluate((s) => { const t = document.querySelector(s); return { open: t?.getAttribute('aria-expanded') === 'true', focus: document.activeElement === t }; }, sel);
      if (after.open) find('desktop', { control, problem: 'Escape leaves the panel open', frame: await shot(page, outDir, `${name}desktop-walk-t${i}-escape.png`, manifest, 'desktop', 'escape') });
      else if (!after.focus) find('desktop', { control, problem: 'Escape closes the panel but focus does not return to its toggle' });
    }

    // Buttons answer Enter (and a role="button" Space too): something in the page changes.
    await open();
    const BUTTONS = 'button:not([aria-expanded]),[role="button"]:not([aria-expanded])';
    const buttons = await page.evaluate(({ sel, max }) => [...document.querySelectorAll(sel)].filter((e) => !e.closest('[hidden],[inert]') && e.getBoundingClientRect().width > 0 && !e.disabled).slice(0, max).length, { sel: BUTTONS, max: maxControls });
    for (let i = 0; i < buttons; i++) {
      await open();
      const control = await pick(BUTTONS, i, `b${i}`);
      if (!control) continue;
      // The URL as loaded (a redirect or a trailing slash makes it differ from the one typed).
      const start = page.url();
      await page.evaluate(watchChanges);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      let moved = await page.evaluate(changesSince).catch(() => ({ mutations: 1 }));
      let answered = moved.mutations > 0 || moved.hashChanged || moved.scrolled || page.url() !== start;
      if (!answered && !control.native) {
        await page.evaluate(watchChanges);
        await page.keyboard.press('Space');
        await page.waitForTimeout(400);
        moved = await page.evaluate(changesSince).catch(() => ({ mutations: 1 }));
        // Space scrolls the page when nothing handles it, so a scroll is not an answer here.
        answered = moved.mutations > 0 || moved.hashChanged;
        if (answered) find('desktop', { control: control.label, problem: 'a custom button that answers Space but not Enter' });
      }
      if (!answered && !control.submit) find('desktop', { control: control.label, problem: 'nothing in the page changes when it is pressed with the keyboard' });
    }
  } catch (e) {
    report.desktop.error = String(e.message ?? e).split('\n')[0];
  } finally {
    await context.close().catch(() => {});
  }

  // ---------- phone thumb ----------
  const phone = await browser.newContext({ viewport: mobile, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const thumb = await phone.newPage();
  try {
    const openPhone = async () => {
      await thumb.goto(url, { waitUntil: 'load', timeout });
      await settlePage(thumb);
      await thumb.evaluate(`window.__awardsWalkDescribe = ${describe.toString()}`);
    };
    await openPhone();
    const count = await thumb.evaluate((max) => [...document.querySelectorAll('button,[role="button"],[aria-expanded]')].filter((el) => !el.closest('[hidden],[inert]') && el.getBoundingClientRect().width > 0 && !el.disabled).slice(0, max).length, maxControls);
    for (let i = 0; i < count; i++) {
      await openPhone();
      const target = await thumb.evaluate((i) => {
        const el = [...document.querySelectorAll('button,[role="button"],[aria-expanded]')].filter((e) => !e.closest('[hidden],[inert]') && e.getBoundingClientRect().width > 0 && !e.disabled)[i];
        el.scrollIntoView({ block: 'center' });
        const b = el.getBoundingClientRect();
        const d = window.__awardsWalkDescribe(el);
        return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height, label: `<${d.tag}${d.cls ? `.${d.cls}` : ''}> “${d.name.slice(0, 32)}”`, submit: el.type === 'submit' };
      }, i);
      await thumb.waitForTimeout(300);
      const start = thumb.url();
      await thumb.evaluate(watchChanges);
      await thumb.touchscreen.tap(target.x, target.y);
      await thumb.waitForTimeout(500);
      const moved = await thumb.evaluate(changesSince).catch(() => ({ mutations: 1 }));
      const answered = moved.mutations > 0 || moved.hashChanged || moved.scrolled || thumb.url() !== start;
      report.mobile.taps.push({ control: target.label, size: `${Math.round(target.w)}×${Math.round(target.h)}`, answered });
      if (!answered && !target.submit) find('mobile', { control: target.label, problem: 'nothing in the page changes when it is tapped', frame: await shot(thumb, outDir, `${name}mobile-walk-tap-${i + 1}.png`, manifest, 'mobile', 'tap') });
    }
  } catch (e) {
    report.mobile.error = String(e.message ?? e).split('\n')[0];
  } finally {
    await phone.close().catch(() => {});
  }
  return report;
}
