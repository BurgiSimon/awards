// Fade-up everything on scroll.
const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')));
document.querySelectorAll('section, .card').forEach((el) => { el.style.opacity = 0; el.style.transform = 'translateY(30px)'; el.style.transition = 'all .8s ease'; io.observe(el); });
document.querySelectorAll('.in').forEach(() => {});
