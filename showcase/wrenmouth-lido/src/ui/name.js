// The visitor's first name, kept only in this browser, pencilled on the back of every frame.
const KEY = 'wrenmouth:ballot-name';

export function getName() {
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
}

export function setName(name) {
  try { localStorage.setItem(KEY, name); } catch { /* private mode: the name just won't persist */ }
  pencilName();
}

export function pencilName() {
  const name = getName();
  document.querySelectorAll('[data-pencil-name]').forEach((el) => {
    el.textContent = '';
    if (!name) return;
    const words = document.createElement('span');
    words.className = 'pencil-name';
    words.textContent = `and ${name}, if the draw says so`;
    el.append(', ', words);
  });
  document.querySelectorAll('[data-pencil-name-plain]').forEach((el) => { el.textContent = name; });
}
