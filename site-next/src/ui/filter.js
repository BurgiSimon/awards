// /recipes: the group and tag filter. Without script the group links above it do the same job, so the form is
// revealed only here. One group at a time (pressing it again shows every group) and one tag; the count line is a
// polite status region, so a screen reader hears how many entries remain.
export function initFilter(scroll) {
  const form = document.querySelector('form[data-filter]');
  if (!form) return;
  const buttons = [...form.querySelectorAll('[data-filter-group]')];
  const select = form.querySelector('select[name="tag"]');
  const entries = [...document.querySelectorAll('.entry[data-group]')];
  const groups = [...document.querySelectorAll('section.group')];
  const count = document.querySelector('[data-filter-count]');
  let group = '';

  function apply() {
    const tag = select?.value ?? '';
    let shown = 0;
    for (const li of entries) {
      const ok = (!group || li.dataset.group === group) && (!tag || li.dataset.tags.split(' ').includes(tag));
      li.hidden = !ok;
      if (ok) shown++;
    }
    for (const section of groups) section.hidden = !section.querySelector('.entry:not([hidden])');
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filterGroup === group)));
    if (count) count.textContent = shown === entries.length ? `${shown} entries shown` : `${shown} of ${entries.length} entries shown`;
    scroll?.resize();
  }

  buttons.forEach((b) => b.addEventListener('click', () => {
    group = group === b.dataset.filterGroup ? '' : b.dataset.filterGroup;
    apply();
  }));
  select?.addEventListener('change', apply);
  form.addEventListener('submit', (e) => e.preventDefault());
}
