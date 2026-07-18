// main.js compatibility shim.
// The portfolio bootstrapping and page logic now live in app-bootstrap.js and app-page-logic.js.
if (typeof window.initPortfolioApp === 'function') {
    window.initPortfolioApp();
}
