/* ---------- theme toggle (persisted; night sky is the default) ---------- */
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setThemeUI(isDark) {
    themeBtn.querySelector('.theme-btn-label').textContent = isDark ? 'Day Sky' : 'Night Sky';
    themeBtn.querySelector('.theme-btn-icon').textContent = isDark ? '☀' : '✦';
}
body.classList.toggle('dark-mode', localStorage.getItem('theme') !== 'light');
setThemeUI(body.classList.contains('dark-mode'));

themeBtn.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark-mode');
    setThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    readColors();
    if (reduceMotion) draw(0);
});

/* ---------- starfield: one canvas instead of 100+ animated elements ---------- */
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
let stars = [], shooter = null, nextShot = 4000, W = 0, H = 0, palette = [];
const rnd = (a, b) => a + Math.random() * (b - a);

function readColors() {
    const cs = getComputedStyle(body);
    const v = (n) => cs.getPropertyValue(n).trim();
    const dark = body.classList.contains('dark-mode');
    palette = dark ? [v('--star'), v('--star'), v('--star'), v('--pink'), v('--aqua'), v('--violet')]
                   : [v('--pink'), v('--violet'), v('--gold'), v('--blue')];
    canvas.dataset.max = dark ? 0.9 : 0.55;
}

function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(170, Math.round((W * H) / 9000));
    stars = Array.from({ length: count }, () => {
        const big = Math.random() < 0.08;
        return { x: rnd(0, W), y: rnd(0, H), r: big ? rnd(1.4, 2) : rnd(.4, 1.2), p: rnd(0, 6.28), s: rnd(.4, 1.4), c: Math.floor(rnd(0, palette.length)), big };
    });
}

function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const max = +canvas.dataset.max;
    for (const s of stars) {
        const a = reduceMotion ? .6 : .25 + .75 * (.5 + .5 * Math.sin(t / 1000 * s.s + s.p));
        ctx.globalAlpha = a * max;
        ctx.fillStyle = palette[s.c % palette.length];
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
        if (s.big) { /* four-point glint on the brightest few */
            ctx.fillRect(s.x - s.r * 4, s.y - .4, s.r * 8, .8);
            ctx.fillRect(s.x - .4, s.y - s.r * 4, .8, s.r * 8);
        }
    }
    if (!reduceMotion) {
        if (!shooter && t > nextShot) shooter = { x: rnd(W * .3, W), y: rnd(0, H * .35), t0: t };
        if (shooter) {
            const k = (t - shooter.t0) / 900;
            if (k >= 1) { shooter = null; nextShot = t + rnd(6000, 12000); }
            else {
                const x = shooter.x - k * 420, y = shooter.y + k * 420;
                const g = ctx.createLinearGradient(x, y, x + 110, y - 110);
                g.addColorStop(0, palette[0]); g.addColorStop(1, 'transparent');
                ctx.globalAlpha = (1 - k) * max; ctx.strokeStyle = g; ctx.lineWidth = 1.6;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 110, y - 110); ctx.stroke();
            }
        }
    }
    ctx.globalAlpha = 1;
}

readColors(); resize();
window.addEventListener('resize', resize);
if (reduceMotion) draw(0);
else (function loop(t) { draw(t); requestAnimationFrame(loop); })(0);

/* ---------- scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
} else revealEls.forEach((el) => el.classList.add('is-visible'));
