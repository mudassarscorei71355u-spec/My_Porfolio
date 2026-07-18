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
    }, 1800);
});
