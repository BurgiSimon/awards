// Fade-up everything on scroll.
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.style.opacity = 1;
  e.target.style.transform = 'none';
}));
document.querySelectorAll('section, .card').forEach((el) => { el.style.opacity = 0; el.style.transform = 'translateY(30px)'; el.style.transition = 'all .8s ease'; io.observe(el); });
