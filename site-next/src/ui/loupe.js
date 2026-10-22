// Chapter 3's full-size view: a native <dialog> on the rebate surface. Esc closes it and the browser returns
// focus to the button; the page behind stops scrolling while it is open. Without script (or without <dialog>)
// the button stays hidden and the frame itself links to the image at 1:1.
export function initLoupe(scroll) {
  const button = document.querySelector('[data-loupe-open]');
  const dialog = document.getElementById(button?.getAttribute('aria-controls') ?? '');
  if (!button || !(dialog instanceof HTMLDialogElement) || typeof dialog.showModal !== 'function') return;
  button.addEventListener('click', () => {
    dialog.showModal();
    scroll?.stop();
  });
  dialog.addEventListener('close', () => {
    scroll?.start();
    button.focus();
  });
  // A click on the surround (not the frame or the bar) closes it as well.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}
