// The install blocks: a tablist per block (Claude Code, Codex) kept in step across the page and remembered per
// visitor, and one copy action that copies the visible tab's two commands or selects them when the clipboard is
// blocked. Without JavaScript both panels simply show.
const KEY = 'awards-home-client';

export function createInstall({ announce }) {
  const blocks = [...document.querySelectorAll('[data-install]')];
  let client = 'claude';
  try { client = localStorage.getItem(KEY) || 'claude'; } catch {}

  function show(next, { focus = null } = {}) {
    client = next;
    try { localStorage.setItem(KEY, next); } catch {}
    for (const b of blocks) {
      for (const tab of b.querySelectorAll('[role="tab"]')) {
        const on = tab.dataset.tab === next;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
      }
      for (const p of b.querySelectorAll('[data-panel]')) p.hidden = p.dataset.panel !== next;
    }
    focus?.querySelector(`[data-tab="${next}"]`)?.focus();
  }

  for (const b of blocks) {
    const tabs = [...b.querySelectorAll('[role="tab"]')];
    for (const tab of tabs) tab.addEventListener('click', () => show(tab.dataset.tab));
    b.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j === null) return;
      e.preventDefault();
      show(tabs[j].dataset.tab, { focus: b });
    });

    const button = b.querySelector('[data-copy]');
    button.addEventListener('click', async () => {
      const code = b.querySelector(`[data-panel="${client}"] code`);
      const text = code.textContent;
      const label = client === 'claude' ? 'Claude Code' : 'Codex';
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied';
        announce(`Copied the two ${label} install commands.`);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        const touch = matchMedia('(pointer: coarse)').matches;
        button.textContent = touch ? 'Selected: choose Copy' : 'Selected: press Ctrl+C or ⌘C';
        announce(touch
          ? `The clipboard is blocked here, so the two ${label} commands are selected: choose Copy from the selection menu.`
          : `The clipboard is blocked here, so the two ${label} commands are selected: press Control C or Command C to copy them.`);
      }
      clearTimeout(button.__t);
      button.__t = setTimeout(() => { button.textContent = 'Copy the install commands'; }, 2400);
    });
  }
  show(client);
}
