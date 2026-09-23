import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

// The tier only styles the entrance of errors and the confirmation (CSS keys on html[data-motion-tier]).
syncMotionTierAttribute();

const form = document.querySelector('[data-form]');
const group = document.querySelector('[data-role-group]');
const sent = document.querySelector('[data-sent]');
const state = { submits: 0, sent: false, invalid: [] };

// One message per field and failure. Validity itself comes from the browser's constraint API
// (required, type="email"); a required radio set reports valueMissing on every radio until one is checked.
const MESSAGES = {
  name: { valueMissing: 'Your name: the sentence starts with it.' },
  role: { valueMissing: 'Choose one: a collector, an artist or a studio.' },
  topic: { valueMissing: 'A few words on the subject will do.' },
  email: { valueMissing: 'An address to write back to.', typeMismatch: 'That address needs an @ and a domain.' },
};
const FIELDS = Object.keys(MESSAGES); // sentence order, so the first invalid is the first the visitor reads

const control = (name) => form.elements[name] instanceof RadioNodeList ? form.elements[name][0] : form.elements[name];
// The radio group carries aria-invalid itself; the radios inside would each announce it otherwise.
const invalidTarget = (name) => (name === 'role' ? group : control(name));

function check(name) {
  const { validity } = control(name);
  const reason = Object.keys(MESSAGES[name]).find((k) => validity[k]);
  const error = document.getElementById(`e-${name}`);
  error.textContent = reason ? MESSAGES[name][reason] : '';
  error.hidden = !reason;
  invalidTarget(name).setAttribute('aria-invalid', String(!!reason));
  return !reason;
}

function focusField(name) {
  // A radio group takes focus on its checked radio, or its first one.
  const el = name === 'role' ? (form.querySelector('[name="role"]:checked') ?? control('role')) : control(name);
  el.focus();
}

form.addEventListener('submit', (e) => {
  e.preventDefault(); // this form submits nowhere
  state.submits++;
  state.invalid = FIELDS.filter((name) => !check(name));
  if (state.invalid.length) {
    sent.hidden = true;
    state.sent = false;
    focusField(state.invalid[0]);
    return;
  }
  const data = new FormData(form);
  sent.textContent = `Thank you, ${data.get('name').trim()}. In a real site this is where the enquiry would be sent; a reply would go to ${data.get('email')}.`;
  sent.hidden = false;
  state.sent = true;
  sent.focus();
});

// After the first attempt, a field clears (or updates) its message as soon as the visitor fixes it.
form.addEventListener('input', (e) => {
  const name = e.target.name;
  if (state.submits && MESSAGES[name]) {
    check(name);
    state.invalid = FIELDS.filter((n) => invalidTarget(n).getAttribute('aria-invalid') === 'true');
  }
});

awards.addState(() => ({
  motion: motionTier(),
  submits: state.submits,
  sent: state.sent,
  invalid: state.invalid,
  focused: document.activeElement?.id || document.activeElement?.getAttribute('name') || document.activeElement?.tagName,
  path: location.pathname + location.search,
}));
awards.ready();
