// The phone's chapter list: a non-modal list under the bridge line, right after its toggle in the DOM. The toggle states its value; Escape and a
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
  // Focus leaving the list (Tab past its end, Shift+Tab back to the toggle) closes it; the list sits right after the
  // toggle in the bridge line, so the tab order runs toggle → list → page.
  const onFocusOut = (e) => { if (!panel.hidden && !panel.contains(e.relatedTarget) && e.relatedTarget !== toggle) set(false); };
  // Shift+Tab back past the toggle leaves the list behind too, so the toggle's own exit closes it.
  const onToggleOut = (e) => { if (!panel.hidden && !panel.contains(e.relatedTarget)) set(false); };
  toggle.addEventListener('click', onToggle);
  document.addEventListener('keydown', onKey);
  panel.addEventListener('click', onPick);
  document.addEventListener('pointerdown', onOutside);
  panel.addEventListener('focusout', onFocusOut);
  toggle.addEventListener('focusout', onToggleOut);
  return () => {
    panel.removeEventListener('focusout', onFocusOut);
    toggle.removeEventListener('focusout', onToggleOut);
    toggle.removeEventListener('click', onToggle);
    document.removeEventListener('keydown', onKey);
    panel.removeEventListener('click', onPick);
    document.removeEventListener('pointerdown', onOutside);
  };
}
