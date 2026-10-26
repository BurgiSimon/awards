// The caption-line header: it tucks away while the reader scrolls down and comes back on the first
// scroll up, so the ballot is always one flick away. On the home page it also says, in words,
// which chapter the reader is in. Instant under reduced motion (the CSS drops the transition).
const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
const COUNT = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

export function initHead() {
  const head = document.querySelector('[data-head]');
  if (!head) return;
  // publish the header's height so html's scroll-padding keeps focused fields clear of it
  const publish = () => document.documentElement.style.setProperty('--head-h', `${Math.ceil(head.offsetHeight)}px`);
  new ResizeObserver(publish).observe(head);
  publish();
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const delta = y - lastY;
    if (y < head.offsetHeight * 2) head.classList.remove('is-tucked');
    else if (delta > 6 && !head.contains(document.activeElement)) head.classList.add('is-tucked');
    else if (delta < -6) head.classList.remove('is-tucked');
    lastY = y;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });

  const where = head.querySelector('[data-head-where]');
  const chapters = [...document.querySelectorAll('main [data-chapter]')];
  if (!where || document.body.dataset.page !== 'home' || chapters.length < 2) return;
  const name = (section) => {
    if (section.dataset.chapter === 'dawn') return 'Dawn, 14 June 2027';
    const h = section.querySelector('h2');
    return (h?.textContent || '').trim().replace(/[.?!]+$/, '');
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const i = chapters.indexOf(e.target);
      where.hidden = i === 0;
      where.textContent = `You're in “${name(e.target)}”, the ${ORDINAL[i]} of ${COUNT[chapters.length]}`;
    }
  }, { rootMargin: '-45% 0px -55% 0px' });
  chapters.forEach((c) => io.observe(c));
}
