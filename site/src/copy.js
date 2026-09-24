// Copy buttons for install commands. The command stays selectable text without JavaScript.
export function mountCopyButtons(root = document) {
  const status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  document.body.append(status);
  for (const li of root.querySelectorAll('.commands li')) {
    const code = li.querySelector('code');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', `Copy: ${code.textContent}`);
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.dataset.state = 'copied';
        button.textContent = 'Copied';
        status.textContent = `Copied ${code.textContent}`;
      } catch {
        button.dataset.state = 'failed';
        button.textContent = 'Select';
        getSelection()?.selectAllChildren(code);
        status.textContent = 'Clipboard unavailable. The command is selected; copy it with your keyboard.';
      }
      clearTimeout(button._t);
      button._t = setTimeout(() => { button.textContent = 'Copy'; delete button.dataset.state; }, 2400);
    });
    li.append(button);
  }
}
