/* ---------- theme toggle (persisted; night sky is the default) ---------- */
const themeBtn = document.getElementById('themeBtn');
const body = document.body;
const themeLabel = themeBtn.querySelector('.theme-btn-label');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setThemeUI(isDark) {
    themeLabel.textContent = isDark ? 'Day Sky' : 'Night Sky';
    themeBtn.querySelector('.theme-btn-icon').textContent = isDark ? '☀' : '✦';
}

if (localStorage.getItem('theme') === 'light') body.classList.remove('dark-mode');
else body.classList.add('dark-mode');
setThemeUI(body.classList.contains('dark-mode'));

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    setThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

/* ---------- generated sky: twinkling stars, sparkles, rising bubbles ---------- */
const sky = document.querySelector('.sky-fx');
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function spawn(cls, vars) {
    const el = document.createElement('span');
    el.className = cls;
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty('--' + k, v));
    sky.prepend(el);
}

if (sky) {
    const small = window.innerWidth < 600;
    const colors = ['var(--pink)', 'var(--violet)', 'var(--aqua)', 'var(--gold)'];
    for (let i = 0; i < (small ? 45 : 90); i++)
        spawn('dot', { x: rnd(0, 100) + '%', y: rnd(0, 100) + '%', s: rnd(1, 3) + 'px', d: rnd(2.5, 6) + 's', l: -rnd(0, 6) + 's' });
    for (let i = 0; i < (small ? 7 : 14); i++)
        spawn('sparkle', { x: rnd(2, 96) + '%', y: rnd(2, 96) + '%', s: rnd(9, 20) + 'px', c: pick(colors), d: rnd(3, 6) + 's', l: -rnd(0, 6) + 's' });
    for (let i = 0; i < (small ? 6 : 12); i++)
        spawn('bubble', { x: rnd(0, 95) + '%', s: rnd(22, 78) + 'px', sw: rnd(-80, 80) + 'px', d: rnd(16, 34) + 's', l: -rnd(0, 30) + 's' });
}

/* ---------- click anywhere: little star burst ---------- */
if (!reduceMotion) {
    document.addEventListener('click', (e) => {
        const colors = ['var(--pink)', 'var(--violet)', 'var(--aqua)', 'var(--gold)'];
        for (let i = 0; i < 7; i++) {
            const b = document.createElement('span');
            const a = (Math.PI * 2 * i) / 7 + rnd(-.3, .3), r = rnd(30, 70);
            b.className = 'burst';
            b.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--c:${pick(colors)};--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r}px`;
            body.appendChild(b);
            setTimeout(() => b.remove(), 850);
        }
    });
}

/* ---------- scroll-triggered reveal + staggered cards ---------- */
document.querySelectorAll('.cert-grid, .projects-grid').forEach((grid) =>
    [...grid.children].forEach((card, i) => card.style.setProperty('--i', i)));

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
