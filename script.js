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
    readColors(); resize();
    if (reduceMotion) draw(0);
});

/* ---------- starfield: one canvas instead of 100+ animated elements ---------- */
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
let stars = [], galaxies = [], sparks = [], shooter = null, nextShot = 4000, W = 0, H = 0, palette = [];
const rnd = (a, b) => a + Math.random() * (b - a);

function readColors() {
    const cs = getComputedStyle(body);
    const v = (n) => cs.getPropertyValue(n).trim();
    const dark = body.classList.contains('dark-mode');
    palette = dark ? [v('--star'), v('--star'), v('--star'), v('--pink'), v('--aqua'), v('--violet')]
                   : [v('--pink'), v('--violet'), v('--gold'), v('--blue')];
    canvas.dataset.max = dark ? 0.9 : 0.55;
}

/* tiny spiral galaxy, pre-rendered once as a sprite */
function makeGalaxy(d, c1, c2) {
    const cv = document.createElement('canvas'); cv.width = cv.height = d * 2;
    const g = cv.getContext('2d'), c = d;
    const halo = g.createRadialGradient(c, c, 0, c, c, d);
    halo.addColorStop(0, '#fff'); halo.addColorStop(.12, c1); halo.addColorStop(.45, c2 + '55'); halo.addColorStop(1, 'transparent');
    g.fillStyle = halo; g.globalAlpha = .55; g.fillRect(0, 0, d * 2, d * 2);
    g.globalAlpha = 1;
    for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 90; i++) {
        const t = i / 90, a = arm * Math.PI + t * 4.2, r = t * d * .92 + 2, j = (Math.random() - .5) * d * .12 * t + .5;
        g.globalAlpha = (1 - t) * .9; g.fillStyle = t < .5 ? c1 : c2;
        g.beginPath(); g.arc(c + Math.cos(a) * r + j, c + Math.sin(a) * r + j, 1 + (1 - t) * 1.6, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1; g.fillStyle = '#fff'; g.beginPath(); g.arc(c, c, d * .06, 0, 6.283); g.fill();
    return cv;
}

function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const small = W < 600;
    const hues = palette.length > 4 ? [palette[3], palette[4], palette[5]] : palette;
    galaxies = Array.from({ length: small ? 4 : 7 }, (_, i) => ({
        img: makeGalaxy(Math.round(rnd(26, 56)), hues[i % hues.length], hues[(i + 1) % hues.length]),
        x: rnd(0, W), y: rnd(0, H), v: rnd(.05, .16), rot: rnd(.05, .14) * (i % 2 ? 1 : -1), tilt: rnd(.45, .8), p: rnd(0, 6.28) }));
    sparks = Array.from({ length: small ? 8 : 14 }, () => ({ x: rnd(0, W), y: rnd(0, H), s: rnd(6, 13), p: rnd(0, 6.28), sp: rnd(.5, 1.2), c: Math.floor(rnd(0, 4)) }));
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
    /* gem sparkles: 4-point stars */
    const SS = [[0,-1],[.22,-.22],[1,0],[.22,.22],[0,1],[-.22,.22],[-1,0],[-.22,-.22]];
    for (const s of sparks) {
        const k = reduceMotion ? .7 : .5 + .5 * Math.sin(t / 1000 * s.sp + s.p), r = s.s * (.4 + .6 * k);
        ctx.globalAlpha = (.25 + .75 * k) * max; ctx.fillStyle = palette[(s.c + 3) % palette.length];
        ctx.beginPath(); SS.forEach(([a, b], i) => ctx[i ? 'lineTo' : 'moveTo'](s.x + a * r, s.y + b * r)); ctx.closePath(); ctx.fill();
    }
    /* spiral galaxies, slowly turning and drifting */
    for (const b of galaxies) {
        const s = b.img.width;
        if (!reduceMotion) { b.y -= b.v; if (b.y < -s) { b.y = H + s; b.x = rnd(0, W); } }
        ctx.save(); ctx.globalAlpha = .85 * max; ctx.translate(b.x, b.y);
        ctx.scale(1, b.tilt); ctx.rotate(reduceMotion ? b.p : t / 1000 * b.rot + b.p);
        ctx.drawImage(b.img, -s / 2, -s / 2); ctx.restore();
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
