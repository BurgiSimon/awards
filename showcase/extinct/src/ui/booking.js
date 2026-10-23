// Booking a viewing: a day (Tuesday to Sunday, from tomorrow), a time slot and a party size; inline errors, a
// submitting state and an honest confirmation. Nothing is charged and nothing leaves the page.
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function createBooking({ announce = () => {} } = {}) {
  const form = document.getElementById('booking');
  if (!form) return () => {};
  const day = form.elements.day;
  const dayErr = document.getElementById('b-day-err');
  const slotErr = document.getElementById('b-slot-err');
  const slots = form.querySelector('.slots');
  const status = form.querySelector('[data-booking-status]');
  const submit = form.querySelector('.booking__submit');
  const tomorrow = new Date(Date.now() + 86400000);
  day.min = tomorrow.toISOString().slice(0, 10);

  const dayOk = () => {
    if (!day.value) return false;
    const d = new Date(`${day.value}T12:00:00`);
    return d.getDay() !== 1 && day.value >= day.min;
  };
  const slotValue = () => form.querySelector('input[name="slot"]:checked')?.value;
  const showDay = (ok) => { day.setAttribute('aria-invalid', String(!ok)); dayErr.hidden = ok; };
  const showSlot = (ok) => { slots.setAttribute('aria-invalid', String(!ok)); slotErr.hidden = ok; };

  const onChange = (e) => {
    if (e.target === day && day.value) showDay(dayOk());
    if (e.target.name === 'slot') showSlot(true);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const okDay = dayOk();
    const okSlot = !!slotValue();
    showDay(okDay);
    showSlot(okSlot);
    if (!okDay || !okSlot) {
      (okDay ? form.querySelector('input[name="slot"]') : day).focus();
      announce(!okDay ? 'Choose a day from tomorrow on, Tuesday to Sunday.' : 'Choose a time.');
      return;
    }
    submit.setAttribute('aria-disabled', 'true');
    submit.textContent = 'Booking…';
    setTimeout(() => {
      const d = new Date(`${day.value}T12:00:00`);
      const when = `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${d.toLocaleString('en-GB', { month: 'long' })}, ${slotValue()}`;
      const n = `MEC-${String(100 + Math.floor(Math.random() * 900))}`;
      const people = form.elements.people.value;
      const text = `Booked: ${when}, ${people} ${people === '1' ? 'person' : 'people'}, booking ${n}. This demonstration charged nothing and holds no place.`;
      status.textContent = text;
      announce(text);
      submit.removeAttribute('aria-disabled');
      submit.textContent = 'Book the viewing';
    }, 800);
  };
  form.addEventListener('change', onChange);
  form.addEventListener('submit', onSubmit);
  return () => {
    form.removeEventListener('change', onChange);
    form.removeEventListener('submit', onSubmit);
  };
}
