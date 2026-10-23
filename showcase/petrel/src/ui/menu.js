// The phone's chapter list: a non-modal list under the bridge line. The toggle states its value; Escape and a
// chosen link close it and hand focus back.
export function createMenu() {
  const toggle = document.querySelector('.bridge__menu');
  const panel = document.getElementById('chapters');
  if (!toggle || !panel) return () => {};
  const set = (open, { focus = false } = {}) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) panel.querySelector('a')?.focus();
    else if (focus) toggle.focus();
  };
  const onToggle = () => set(panel.hidden);
  const onKey = (e) => { if (e.key === 'Escape' && !panel.hidden) set(false, { focus: true }); };
  const onPick = (e) => { if (e.target.closest('a')) set(false); };
  const onOutside = (e) => { if (!panel.hidden && !panel.contains(e.target) && e.target !== toggle) set(false); };
  toggle.addEventListener('click', onToggle);
  document.addEventListener('keydown', onKey);
  panel.addEventListener('click', onPick);
  document.addEventListener('pointerdown', onOutside);
  return () => {
    toggle.removeEventListener('click', onToggle);
    document.removeEventListener('keydown', onKey);
    panel.removeEventListener('click', onPick);
    document.removeEventListener('pointerdown', onOutside);
  };
}
