/* ---------- theme toggle (unchanged behavior, persisted) ---------- */
const themeBtn = document.getElementById('themeBtn');
const body = document.body;
const themeLabel = themeBtn.querySelector('.theme-btn-label');

function setThemeUI(isDark) {
    themeLabel.textContent = isDark ? 'Day Sky' : 'Night Sky';
    themeBtn.querySelector('.theme-btn-icon').textContent = isDark ? '☀' : '✦';
}

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
    setThemeUI(body.classList.contains('dark-mode'));
});

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    setThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

/* ---------- scroll-triggered reveal for sections ---------- */
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el) => io.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
}
