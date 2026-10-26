// The first screen's client switch on a phone: two tabs (Claude Code, Codex) over the two command lists, so the
// install and the gathered builds both fit the first screen. Arrow keys move between the tabs; above 767 px the switch
// is hidden and both lists show, so the tab roles are set only while it is in use.
export function initClients() {
  const ticket = document.querySelector('#install-first');
  const tabs = [...(ticket?.querySelectorAll('[role="tab"]') ?? [])];
  if (tabs.length !== 2) return;
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const phone = matchMedia('(max-width: 767px)');
  const select = (i, focus = false) => {
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
      panels[j].classList.toggle('is-shown', i === j);
    });
    if (focus) tabs[i].focus();
  };
  const roles = () => panels.forEach((p, j) => {
    if (phone.matches) { p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', tabs[j].id); }
    else { p.removeAttribute('role'); p.removeAttribute('aria-labelledby'); }
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(1 - i, true); }
    });
  });
  phone.addEventListener('change', roles);
  roles();
}
