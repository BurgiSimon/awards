// Front-end only: nothing leaves the page. Each form validates in plain sentences, ties errors to fields,
// and moves focus to its confirmation, which says plainly that the lido is fictional.
import { setName } from './name.js';
import { motionTier } from '../lib/reduced-motion.js';

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const money = (n) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

function fieldError(form, input, message) {
  const out = form.querySelector(`#${input.id}-error`) || (input.getAttribute('aria-describedby') || '').split(' ').map((id) => form.querySelector(`#${id}`)).find((el) => el?.classList.contains('field__error'));
  if (out) out.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

function validate(form, rules) {
  let first = null;
  for (const [name, check] of rules) {
    const input = form.elements[name];
    const message = check(input) || '';
    if (!fieldError(form, input, message) && !first) first = input;
  }
  first?.focus();
  return !first;
}

function finish(form, done) {
  form.hidden = true;
  done.hidden = false;
  done.focus({ preventScroll: true });
  if (window.lenis) window.lenis.scrollTo(done, { offset: -120, duration: 0.8 });
  else done.scrollIntoView({ block: 'center', behavior: motionTier() === 'full' ? 'smooth' : 'auto' });
}

export function initForms({ onBallot } = {}) {
  const ballot = document.querySelector('[data-ballot]');
  if (ballot) {
    ballot.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ok = validate(ballot, [
        ['name', (i) => (i.value.trim() ? '' : 'Please give your first name, so we can pencil it on the back.')],
        ['surname', (i) => (i.value.trim() ? '' : 'Please give your surname, for the draw.')],
        ['email', (i) => (!i.value.trim() ? 'Please give an email address, so we can tell you on 8 May.' : emailOk(i.value) ? '' : 'That email address doesn’t look complete. It needs an @ and a domain, like name@example.com.')],
        ['rules', (i) => (i.checked ? '' : 'Please tick to say you’ve read how the ballot works.')],
      ]);
      if (!ok) return;
      setName(ballot.elements.name.value.trim().slice(0, 40));
      await onBallot?.();
      finish(ballot, document.querySelector('[data-ballot-done]'));
    });
  }

  const join = document.querySelector('[data-join]');
  if (join) {
    join.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = validate(join, [
        ['name', (i) => (i.value.trim() ? '' : 'Please give your name as it should go on the members’ board.')],
        ['email', (i) => (!i.value.trim() ? 'Please give an email address for your membership card.' : emailOk(i.value) ? '' : 'That email address doesn’t look complete. It needs an @ and a domain.')],
      ]);
      if (ok) finish(join, document.querySelector('[data-join-done]'));
    });
  }

  const passes = document.querySelector('[data-passes]');
  if (passes) {
    const total = passes.querySelector('[data-passes-total]');
    const err = passes.querySelector('[data-passes-error]');
    const count = () => ['adult', 'child', 'conc'].map((n) => Math.max(0, Math.min(10, Math.floor(Number(passes.elements[n].value) || 0))));
    const update = () => {
      const [a, c, k] = count();
      const n = a + c + k;
      const sum = a * 145 + c * 60 + k * 95;
      total.textContent = n ? `Total: ${money(sum)} for ${n} pass${n === 1 ? '' : 'es'}.` : 'No passes chosen yet.';
    };
    passes.addEventListener('input', update);
    update();
    passes.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = count().reduce((x, y) => x + y, 0);
      err.textContent = n ? '' : 'Please choose at least one pass.';
      const ok = validate(passes, [['email', (i) => (!i.value.trim() ? 'Please give an email address for the receipt.' : emailOk(i.value) ? '' : 'That email address doesn’t look complete.')]]);
      if (ok && n) finish(passes, document.querySelector('[data-passes-done]'));
    });
  }

  const per = document.querySelector('[data-perswim]');
  if (per) {
    const out = per.querySelector('[data-perswim-out]');
    const update = () => {
      const opt = per.querySelector('select').selectedOptions[0];
      const price = Number(opt.value);
      const single = Number(opt.dataset.single);
      const who = { 145: 'an adult', 60: 'an under-16', 95: 'a concession' }[price];
      const m = Math.max(1, Math.min(60, Math.round(Number(per.querySelector('input').value) || 1)));
      const each = price / (m * 12);
      const breakEven = Math.ceil(price / single);
      out.textContent = `At ${m} swim${m === 1 ? '' : 's'} a month, ${who} pass works out at ${money(Math.round(each * 100) / 100)} a swim, against ${money(single)} for a single. It pays for itself after ${breakEven} swims.`;
    };
    per.addEventListener('input', update);
    update();
  }
}
