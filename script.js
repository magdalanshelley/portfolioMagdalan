const themeBtn = document.getElementById('themeBtn');
const body = document.body;

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeBtn.textContent = '☀️ Day Sky';
    }
});

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        themeBtn.textContent = '☀️ Day Sky';
        localStorage.setItem('theme', 'dark');
    } else {
        themeBtn.textContent = '🌙 Night Sky';
        localStorage.setItem('theme', 'light');
    }
});
