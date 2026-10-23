// Chapter 3's full-size view: a native <dialog> on the rebate surface. Enter on "Open at full size" (or a click on
// the frame itself) opens it at 1:1; Esc closes it and focus returns to what opened it; the page behind stops
// scrolling while it is open. Without script (or without <dialog>) the button stays hidden and the frame itself
// links to the image at 1:1.
export function initLoupe(scroll) {
  const button = document.querySelector('[data-loupe-open]');
  const dialog = document.getElementById(button?.getAttribute('aria-controls') ?? '');
  if (!button || !(dialog instanceof HTMLDialogElement) || typeof dialog.showModal !== 'function') return;
  let opener = button;
  const open = (from) => {
    opener = from;
    dialog.showModal();
    scroll?.stop();
  };
  button.addEventListener('click', () => open(button));
  // The frame is the same action for a pointer; the button is the one keyboard stop, so the link leaves the tab order.
  for (const link of document.querySelectorAll('.loupe-frame__link')) {
    link.setAttribute('tabindex', '-1');
    link.addEventListener('click', (e) => {
      if (e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open(button);
    });
  }
  dialog.addEventListener('close', () => {
    scroll?.start();
    opener.focus();
  });
  // A click on the surround (not the frame or the bar) closes it as well.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}
