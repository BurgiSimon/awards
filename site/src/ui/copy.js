// The ticket's Copy buttons. Without script, or without a clipboard, they stay hidden and each command is one
// click-to-select line of text (user-select: all), so nothing on screen offers what the page cannot do.
// A clipboard that refuses (a permission, a browser policy) is said on the ticket itself, not only to a screen
// reader: the command is selected, the button reads "Selected", and a line under the commands says what to press.
const COPIED_MS = 2000;
const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const touch = matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches;

function refusedLine(ticket) {
  let line = ticket.querySelector(':scope > .ticket__refused');
  if (!line) {
    line = document.createElement('p');
    line.className = 'ticket__refused caption';
    line.hidden = true;
    ticket.append(line);
  }
  return line;
}

export function initCopy() {
  const buttons = [...document.querySelectorAll('button[data-copy]')];
  const status = document.querySelector('[data-copy-status]');
  if (!buttons.length || !navigator.clipboard?.writeText || !window.isSecureContext) return;
  const reset = (button) => {
    delete button.dataset.state;
    button.textContent = 'Copy';
  };
  buttons.forEach((button, i) => {
    const code = button.parentElement?.querySelector('code');
    if (!code) return;
    const ticket = button.closest('.ticket');
    // Every button reads "Copy"; its description says which command, so each one is distinct to a screen reader.
    code.id ||= `command-${i + 1}`;
    button.setAttribute('aria-describedby', code.id);
    let timer = 0;
    button.addEventListener('click', async () => {
      const text = code.textContent.trim();
      clearTimeout(timer);
      for (const b of ticket?.querySelectorAll('button[data-copy][data-state]') ?? []) if (b !== button) reset(b);
      try {
        await navigator.clipboard.writeText(text);
        button.dataset.state = 'copied';
        button.textContent = 'Copied';
        if (ticket) refusedLine(ticket).hidden = true;
        if (status) status.textContent = `Copied: ${text}`;
        timer = setTimeout(() => reset(button), COPIED_MS);
      } catch {
        // Select the command so the reader's own copy key finishes the job, and say so where they are looking.
        const sel = getSelection();
        sel?.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(code);
        sel?.addRange(range);
        button.dataset.state = 'refused';
        button.textContent = 'Selected';
        // On a touch screen there is no key to press: say the gesture instead (component jury, 2026-10-26).
        const how = touch ? 'press and hold it, then choose Copy' : `press ${mac ? '⌘C' : 'Ctrl+C'} to copy it`;
        if (ticket) {
          const line = refusedLine(ticket);
          line.textContent = `The browser refused the clipboard. The command is selected: ${how}.`;
          line.hidden = false;
        }
        if (status) status.textContent = `The clipboard refused; the command is selected: ${how}.`;
        timer = setTimeout(() => reset(button), COPIED_MS * 3);
      }
    });
  });
}
