// The page has no motion; the year in the footer is kept current.
const foot = document.querySelector('.foot p');
if (foot) foot.textContent = `© ${new Date().getFullYear()} Northfield Studio Ltd`;
