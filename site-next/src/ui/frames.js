// The strip as a jump rail (AWARDS.md, SIGNATURE · Jobs 2 and Keyboard): every frame is a link to its depth.
// Without script a frame's link goes to the chapter at that depth; with script it lands on the exact depth the
// frame was shot at, through window.__awards.scrollTo. The strip is one tab stop: arrows step through its frames,
// Home and End go to the first and last, Enter jumps. Following the reader is src/motion/strip.js, which also keeps
// the strip's one tab stop on the current frame while focus is elsewhere, so Tab enters the strip where it shows.
const LINKS = 'a[data-at]';

function jump(event, link) {
  if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const at = Number(link.dataset.at);
  if (!Number.isFinite(at) || !window.__awards?.scrollTo) return false;
  event.preventDefault();
  window.__awards.scrollTo(at);
  return true;
}

function roving(list) {
  const links = [...list.querySelectorAll(LINKS)];
  if (!links.length) return;
  links.forEach((a, i) => a.setAttribute('tabindex', i === 0 ? '0' : '-1'));
  list.addEventListener('focusin', (e) => {
    const link = e.target.closest?.(LINKS);
    if (!link) return;
    links.forEach((a) => a.setAttribute('tabindex', a === link ? '0' : '-1'));
  });
  list.addEventListener('keydown', (e) => {
    const i = links.indexOf(e.target.closest?.(LINKS));
    if (i < 0) return;
    const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: links.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    // The column is clipped and moved by a transform: focusing must never scroll it, or the page, on its own.
    links[Math.max(0, Math.min(links.length - 1, to))].focus({ preventScroll: true });
  });
}

export function initFrames() {
  document.querySelectorAll('.strip__list, .chapter__frames--row').forEach(roving);
  document.addEventListener('click', (e) => {
    const link = e.target.closest?.(`.strip ${LINKS}, .chapter__frames ${LINKS}, .frames-disclosure ${LINKS}`);
    if (!link || !jump(e, link)) return;
    const details = link.closest('details');
    if (details) {
      details.open = false;
      details.querySelector('summary')?.focus();
    }
  });
  // The phone's Frames disclosure closes on Escape and gives focus back to its summary.
  document.querySelectorAll('.frames-disclosure').forEach((details) => {
    details.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !details.open) return;
      details.open = false;
      details.querySelector('summary')?.focus();
    });
  });
}
