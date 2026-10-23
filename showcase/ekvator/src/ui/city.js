// The city switch: a button in the hour line opens a non-modal panel holding a radio group.
// Arrow keys move and choose, Enter or Space chooses, Escape closes and returns focus to the button.
export function createCitySwitch({ onChoose }) {
  const toggle = document.querySelector('.hourline__city');
  const panel = document.getElementById('cities');
  const radios = [...panel.querySelectorAll('[role="radio"]')];
  if (!toggle || !panel) return { sync() {} };

  const open = () => {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    (radios.find((r) => r.getAttribute('aria-checked') === 'true') || radios[0]).focus();
    document.addEventListener('pointerdown', outside, true);
  };
  const close = (refocus = true) => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', outside, true);
    if (refocus) toggle.focus();
  };
  const outside = (e) => {
    if (!panel.contains(e.target) && !toggle.contains(e.target)) close(false);
  };

  function sync(id) {
    for (const r of radios) {
      const on = r.dataset.city === id;
      r.setAttribute('aria-checked', String(on));
      r.tabIndex = on ? 0 : -1;
    }
  }

  function choose(r) {
    sync(r.dataset.city);
    onChoose(r.dataset.city);
  }

  toggle.addEventListener('click', () => (panel.hidden ? open() : close()));
  panel.addEventListener('keydown', (e) => {
    const i = radios.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (i < 0) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const r = radios[(i + 1) % radios.length];
      r.focus(); choose(r);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const r = radios[(i - 1 + radios.length) % radios.length];
      r.focus(); choose(r);
    } else if (e.key === 'Tab') {
      close(false);
    }
  });
  for (const r of radios) {
    r.addEventListener('click', () => { choose(r); close(); });
  }
  return { sync };
}
