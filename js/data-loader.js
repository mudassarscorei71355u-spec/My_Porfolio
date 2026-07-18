// data-loader.js - Fetch projects & learnings from txt/ files on page load
// Works on GitHub Pages (project sites and user sites) without a backend.

/** Tracks whether each file loaded successfully (used for empty-state messages). */
let projectsLoadedFromFile = false;
let learningsLoadedFromFile = false;

/**
 * Returns the site root URL (one level above pages/ when viewing subpages).
 * Example: .../My_Portfolio/pages/projects.html -> .../My_Portfolio/
 */
function getSiteRootUrl() {
    const pageUrl = window.location.href;
    const path = window.location.pathname.replace(/\\/g, '/');

    if (path.includes('/pages/')) {
        return new URL('../', pageUrl);
    }

    // index.html at repo root, or trailing-slash folder URLs
    if (/[^/]+\.html$/i.test(path)) {
        return new URL('./', pageUrl);
    }

    return new URL('./', pageUrl);
}

/**
 * Build ordered fetch URLs for a txt data file.
 * Primary path: txt/<fileName> relative to site root (GitHub Pages safe).
 */
function buildTxtFileUrlCandidates(fileName) {
    const candidates = [];
    const pageUrl = window.location.href;
    const root = getSiteRootUrl();

    candidates.push(new URL('txt/' + fileName, root).href);

    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/')) {
        candidates.push(new URL('../txt/' + fileName, pageUrl).href);
    } else {
        candidates.push(new URL('./txt/' + fileName, pageUrl).href);
        candidates.push(new URL('txt/' + fileName, pageUrl).href);
    }

    return [...new Set(candidates)];
}

function getFallbackText(fileName) {
    if (fileName === 'all_learnings.txt') {
        return `# 📚 Learning Roadmap

## Learning 1 (Months 1–3): Python Programming Mastery
- Python Fundamentals
- Python Data Analysis
- Pandas
- NumPy
- Tkinter
- Flask
- FastAPI
- Django

## Learning 2 (Months 4–6): Java Programming + OOP
- Core Java
- Spring Boot
- Spring MVC
- JDBC
- Hibernate

## Learning 3 (Months 7–9): Data Structures & Algorithms (DSA)
- Arrays
- Linked Lists
- Trees
- Graphs
- Sorting Algorithms

## Learning 4 (Months 10–12): Frontend Development
- HTML5
- CSS3
- JavaScript (ES6+)
- React.js
- Next.js

## Learning 5 (Months 13–15): Backend Development
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- WebSockets

## Learning 6 (Months 16–18): Database Engineering
- PostgreSQL
- MongoDB
- SQLite
- SQL Optimization
- Database Design

## Learning 7 (Months 19–21): C++ Programming & System Development
- Core C++
- STL
- File Handling
- Memory Management
- Socket Programming

## Learning 8 (Months 22–24): DevOps & Cloud Engineering
- Linux/Unix CLI
- Git & GitHub
- Docker
- Kubernetes
- AWS Basics

## Learning 9 (Months 25–27): Artificial Intelligence & Machine Learning
- AI-Assisted Learning
- Prompt Engineering
- OpenAI API
- Machine Learning Basics
- Computer Vision

## Learning 10 (Months 28–30): Mobile Development
- React Native
- Flutter
- Android Development (Kotlin)
- iOS Development (Swift)

## Learning 11 (Months 31–33): Professional Tools & Software Engineering
- VS Code
- IntelliJ IDEA
- Postman
- Figma
- Markdown`;
    }

    if (fileName === 'all_projects.txt') {
        return `PROJECTS
1. Portfolio Website
2. AI Dashboard`;
    }

    return '';
}

/**
 * Fetch a text file, trying multiple URL candidates for GitHub Pages compatibility.
 */
async function fetchTextFile(fileName) {
    const candidates = buildTxtFileUrlCandidates(fileName);
    let lastError = null;

    for (const url of candidates) {
        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
                lastError = new Error('HTTP ' + response.status + ' for ' + url);
                continue;
            }

            const text = await response.text();
            if (!text.trim()) {
                lastError = new Error('Empty response from ' + url);
                continue;
            }

            return { text: text, url: url };
        } catch (error) {
            lastError = error;
        }
    }

    const fallbackText = getFallbackText(fileName);
    if (fallbackText) {
        console.warn('Using bundled fallback data for', fileName);
        return { text: fallbackText, url: 'fallback://' + fileName };
    }

    throw lastError || new Error('Unable to load ' + fileName);
}

/**
 * Load and parse all_projects.txt, then sync to in-memory/localStorage state.
 * Parsing rules live in file-importer.js (parseProjectsFile / syncProjectsFromText).
 */
async function loadProjects() {
    try {
        const result = await fetchTextFile('all_projects.txt');
        console.log('Projects loaded from:', result.url);

        const syncResult = syncProjectsFromText(result.text, { replace: true });
        projectsLoadedFromFile = syncResult.total > 0;
        console.log('Parsed', syncResult.total, 'projects');
        return projectsLoadedFromFile;
    } catch (error) {
        console.warn('Projects file could not be loaded:', error.message);
        projectsLoadedFromFile = false;
        saveProjects([]);
        return false;
    }
}

/**
 * Load and parse all_learnings.txt, then sync to in-memory/localStorage state.
 * Parsing rules live in file-importer.js (parseLearningsFile / syncLearningsFromText).
 */
async function loadLearnings() {
    try {
        const result = await fetchTextFile('all_learnings.txt');
        console.log('Learnings loaded from:', result.url);

        const syncResult = syncLearningsFromText(result.text, { replace: true });
        learningsLoadedFromFile = syncResult.total > 0;
        console.log('Parsed', syncResult.total, 'learnings');
        return learningsLoadedFromFile;
    } catch (error) {
        console.warn('Learnings file could not be loaded:', error.message);
        learningsLoadedFromFile = false;
        saveLearnings([]);
        return false;
    }
}

/**
 * Fetch both data files in parallel and refresh the UI.
 */
async function loadDataFromTxtFiles() {
    console.log('Loading portfolio data from txt/ files...');

    await Promise.all([loadProjects(), loadLearnings()]);

    return projectsLoadedFromFile || learningsLoadedFromFile;
}

/** Re-render all dynamic sections after data changes. */
function triggerFullRender() {
    try {
        if (typeof renderAll === 'function') {
            renderAll();
        } else {
            if (typeof renderLearningsGrid === 'function') {
                renderLearningsGrid('coursesGrid');
                renderLearningsGrid('featuredLearningsGrid');
            }
            if (typeof renderProjectsGrid === 'function') {
                renderProjectsGrid('allProjectsGrid');
                renderProjectsGrid('featuredProjectsGrid');
            }
            if (typeof updateLearningStats === 'function') updateLearningStats();
            if (typeof updateProjectStats === 'function') updateProjectStats();
            if (typeof updateHomePage === 'function') updateHomePage();
            if (typeof renderSkillsGrids === 'function') renderSkillsGrids();
            if (typeof updateCVContent === 'function') updateCVContent();
        }

        if (typeof renderManagementUI === 'function') renderManagementUI();
        if (typeof updateLockStatus === 'function') updateLockStatus();
        if (typeof updateHomepageForms === 'function') updateHomepageForms();
    } catch (error) {
        console.error('Error during re-render:', error);
    }
}

/** Manual refresh (e.g. reload button in dev). */
async function reloadDataFromTxtFiles() {
    if (typeof showToastManager === 'function') {
        showToastManager('Reloading data from files...');
    }

    const loaded = await loadDataFromTxtFiles();
    triggerFullRender();

    if (typeof showToastManager === 'function') {
        showToastManager(loaded ? 'Data reloaded successfully!' : 'Could not load data files.');
    }

    return loaded;
}

window.loadProjects = loadProjects;
window.loadLearnings = loadLearnings;
window.loadDataFromTxtFiles = loadDataFromTxtFiles;
window.reloadDataFromTxtFiles = reloadDataFromTxtFiles;
window.triggerFullRender = triggerFullRender;
window.projectsLoadedFromFile = function () { return projectsLoadedFromFile; };
window.learningsLoadedFromFile = function () { return learningsLoadedFromFile; };
