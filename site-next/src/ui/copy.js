// The ticket's Copy buttons. Without script, or without a clipboard, they stay hidden and each command is one
// click-to-select line of text (user-select: all), so nothing on screen offers what the page cannot do.
const COPIED_MS = 2000;

export function initCopy() {
  const buttons = [...document.querySelectorAll('button[data-copy]')];
  const status = document.querySelector('[data-copy-status]');
  if (!buttons.length || !navigator.clipboard?.writeText || !window.isSecureContext) return;
  buttons.forEach((button, i) => {
    const code = button.parentElement?.querySelector('code');
    if (!code) return;
    // Every button reads "Copy"; its description says which command, so each one is distinct to a screen reader.
    code.id ||= `command-${i + 1}`;
    button.setAttribute('aria-describedby', code.id);
    let timer = 0;
    button.addEventListener('click', async () => {
      const text = code.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        button.dataset.state = 'copied';
        button.textContent = 'Copied';
        if (status) status.textContent = `Copied: ${text}`;
        clearTimeout(timer);
        timer = setTimeout(() => {
          delete button.dataset.state;
          button.textContent = 'Copy';
        }, COPIED_MS);
      } catch {
        if (status) status.textContent = 'The clipboard refused; select the command and copy it by hand.';
      }
    });
  });
}
