// Booking a viewing: a day (the open days of the next three weeks), a time slot and a party size; inline errors, a
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
  // The next three weeks' open days, written the way the confirmation writes them ("Tuesday 27 October"), so the
  // field never shows a locale's mm/dd/yyyy and a closed Monday cannot be chosen.
  const fmt = (d) => `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${d.toLocaleString('en-GB', { month: 'long' })}`;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  for (let i = 1; i <= 21; i++) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 1) continue;
    day.add(new Option(fmt(d), iso(d)));
  }

  const dayOk = () => !!day.value;
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
      announce(!okDay ? 'Choose a day.' : 'Choose a time.');
      return;
    }
    submit.setAttribute('aria-disabled', 'true');
    submit.textContent = 'Booking…';
    setTimeout(() => {
      const d = new Date(`${day.value}T12:00:00`);
      const when = `${fmt(d)}, ${slotValue()}`;
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
