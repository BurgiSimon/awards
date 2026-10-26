// The phone band's Menu: a disclosure, not a dialog. The button names what it controls and states whether it is
// open; Escape closes it and gives focus back to the button; following a link closes it.
export function initMenu() {
  const band = document.querySelector('.band');
  const button = band?.querySelector('.band__menu');
  const nav = band?.querySelector('.band__nav');
  if (!button || !nav) return;
  const set = (open) => {
    band.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? 'Close' : 'Menu';
  };
  button.addEventListener('click', () => set(button.getAttribute('aria-expanded') !== 'true'));
  band.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { set(false); button.focus(); }
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}
