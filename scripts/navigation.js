const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('nav__links--open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
}