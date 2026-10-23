// The reservation: validated in place, one error line per field, a submitting state and an honest confirmation.
// Nothing leaves the browser: Ekvator is fictional and this page takes no deposit.
export function createReserveForm({ announce }) {
  const form = document.getElementById('reserve-form');
  if (!form) return;
  const status = document.getElementById('reserve-status');
  const button = form.querySelector('button[type="submit"]');
  const fields = {
    name: { input: form.elements.name, error: document.getElementById('r-name-error'), ok: (v) => v.trim().length > 1 },
    email: { input: form.elements.email, error: document.getElementById('r-email-error'), ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
  };

  const check = (f) => {
    const ok = f.ok(f.input.value);
    f.input.setAttribute('aria-invalid', String(!ok));
    f.error.hidden = ok;
    return ok;
  };
  for (const f of Object.values(fields)) {
    f.input.addEventListener('blur', () => { if (f.input.value) check(f); });
    f.input.addEventListener('input', () => { if (f.input.getAttribute('aria-invalid') === 'true') check(f); });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.values(fields).filter((f) => !check(f));
    if (bad.length) {
      bad[0].input.focus();
      status.textContent = '';
      announce(`${bad.length === 1 ? 'One field needs' : 'Two fields need'} attention before the reservation can go through.`);
      return;
    }
    button.setAttribute('aria-disabled', 'true');
    button.textContent = 'Holding a window…';
    status.textContent = '';
    setTimeout(() => {
      const name = fields.name.input.value.trim().split(/\s+/)[0];
      const msg = `Thank you, ${name}. This is a demonstration: no deposit was taken and nothing was sent. In a real batch 03 the receipt would go to ${fields.email.input.value.trim()}.`;
      status.textContent = msg;
      announce(msg);
      button.removeAttribute('aria-disabled');
      button.textContent = 'Reserve a window, €200 deposit';
      form.reset();
      for (const f of Object.values(fields)) f.input.removeAttribute('aria-invalid');
    }, 700);
  });
}
