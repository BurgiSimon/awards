// The fault desk: a ticket form with inline errors, a submitting state and an honest confirmation. Nothing leaves
// the page.
const RULES = {
  cable: (v) => v.trim().length >= 2,
  repeater: (v) => /^\d{1,3}$/.test(v.trim()),
  alarm: (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v.trim()),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
};

export function createDesk({ announce = () => {} } = {}) {
  const form = document.getElementById('desk');
  if (!form) return () => {};
  const status = form.querySelector('[data-desk-status]');
  const submit = form.querySelector('.desk__submit');
  const fields = Object.keys(RULES).map((name) => {
    const input = form.elements[name];
    return { name, input, error: document.getElementById(`${input.id}-err`) };
  });
  const check = (f) => {
    const ok = RULES[f.name](f.input.value);
    f.input.setAttribute('aria-invalid', String(!ok));
    f.error.hidden = ok;
    return ok;
  };
  const onBlur = (e) => {
    const f = fields.find((x) => x.input === e.target);
    if (f && f.input.value) check(f);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      bad[0].input.focus();
      announce(`${bad.length === 1 ? 'One field needs' : `${bad.length} fields need`} attention: ${bad.map((f) => form.querySelector(`label[for="${f.input.id}"]`).textContent).join(', ')}.`);
      return;
    }
    submit.setAttribute('aria-disabled', 'true');
    submit.textContent = 'Opening the ticket…';
    setTimeout(() => {
      const n = `PT-${String(1000 + Math.floor(Math.random() * 9000))}`;
      const text = `Ticket ${n} opened for ${fields[0].input.value.trim()}. In a real desk the watch officer would call you within 15 minutes; this demonstration sent nothing.`;
      status.textContent = text;
      announce(text);
      submit.removeAttribute('aria-disabled');
      submit.textContent = 'Open a fault ticket';
    }, 900);
  };
  form.addEventListener('focusout', onBlur);
  form.addEventListener('submit', onSubmit);
  return () => {
    form.removeEventListener('focusout', onBlur);
    form.removeEventListener('submit', onSubmit);
  };
}
