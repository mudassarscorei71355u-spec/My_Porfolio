// main.js - Application entry point
// Keeps a small startup layer separate from shared app logic.

document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.initPortfolioApp === 'function') {
        window.initPortfolioApp();
    }

    window.setTimeout(function() {
        if (typeof window.hidePageLoader === 'function') {
            window.hidePageLoader();
        }
        window.setTimeout(function() {
            window.dispatchEvent(new Event('portfolio:ready'));
        }, 450);
    }, 1800);
});
