// js/theme.js

const html = document.documentElement;
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// 1. Check Local Storage or System Preference on Load
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
} else {
    html.classList.remove('dark');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
}

// 2. Handle Click
if(themeToggleBtn){
    themeToggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        
        if (html.classList.contains('dark')) {
            localStorage.theme = 'dark';
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            localStorage.theme = 'light';
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
    });
}