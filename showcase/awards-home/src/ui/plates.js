// The plate menu on narrow screens: a non-modal list of the chapters under the slug line.
export function createPlates() {
  const button = document.querySelector('.slug__menu');
  const panel = document.getElementById('plates');
  if (!button || !panel) return;
  const close = (refocus) => {
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (refocus) button.focus();
  };
  button.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) panel.querySelector('a')?.focus();
  });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(true); } });
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
  document.addEventListener('pointerdown', (e) => { if (!panel.hidden && !panel.contains(e.target) && !button.contains(e.target)) close(false); });
}
