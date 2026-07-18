// app-bootstrap.js - Core portfolio initialization and shared interactions

async function initPortfolioApp() {
    if (window.__portfolioBootstrapInitialized) {
        return;
    }
    window.__portfolioBootstrapInitialized = true;

    console.log('🚀 Portfolio App Initializing...');

    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.remove('is-hidden');
    }
    document.documentElement.classList.add('page-loading');
    document.documentElement.classList.remove('page-loaded');
    document.body.classList.remove('page-loaded');
    document.body.classList.add('page-loading');

    const savedState = typeof loadManagerState === 'function' ? loadManagerState() : null;
    if (savedState) {
        if (typeof currentPassword !== 'undefined') {
            currentPassword = savedState.password;
        }
        if (savedState.isUnlocked !== undefined) {
            isUnlocked = savedState.isUnlocked;
        }
    }

    if (typeof initTheme === 'function') {
        initTheme();
    }

    console.log('Loading data from txt/all_projects.txt and txt/all_learnings.txt...');
    try {
        await loadDataFromTxtFiles();
    } catch (e) {
        console.warn('Error loading txt files:', e.message);
    }

    if (typeof renderAll === 'function') {
        renderAll();
    }
    if (typeof setupEventHandlers === 'function') {
        setupEventHandlers();
    }
    if (typeof setupPageManagementControls === 'function') {
        setupPageManagementControls();
    }
    if (typeof updateLearningStats === 'function') {
        updateLearningStats();
    }
    if (typeof updateProjectStats === 'function') {
        updateProjectStats();
    }
    if (typeof renderManagementUI === 'function') {
        renderManagementUI();
    }
    if (typeof updateLockStatus === 'function') {
        updateLockStatus();
    }
    if (typeof updateHomepageForms === 'function') {
        updateHomepageForms();
    }

    console.log('✅ Portfolio App Ready!');
    console.log('📊 Current state:');
    console.log('  - Learnings:', (getAllLearnings() || []).length);
    console.log('  - Projects:', (getAllProjects() || []).length);

    setInterval(async function() {
        try {
            const reloaded = await loadDataFromTxtFiles();
            if (reloaded) {
                if (typeof renderAll === 'function') {
                    renderAll();
                }
                if (typeof updateLearningStats === 'function') {
                    updateLearningStats();
                }
                if (typeof updateProjectStats === 'function') {
                    updateProjectStats();
                }
                console.log('Data reloaded from files');
            }
        } catch (e) {
            // Silent fail for background reload
        }
    }, 30000);
}

function renderAll() {
    try {
        const coursesGrid = document.getElementById('coursesGrid');
        if (coursesGrid) {
            renderLearningsGrid('coursesGrid');
        }

        const featuredGrid = document.getElementById('featuredLearningsGrid');
        if (featuredGrid) {
            renderLearningsGrid('featuredLearningsGrid');
        }

        const allProjectsGrid = document.getElementById('allProjectsGrid');
        if (allProjectsGrid) {
            renderProjectsGrid('allProjectsGrid');
        }

        const featuredProjectsGrid = document.getElementById('featuredProjectsGrid');
        if (featuredProjectsGrid) {
            renderProjectsGrid('featuredProjectsGrid');
        }

        updateHomePage();

        if (typeof renderSkillsGrids === 'function') {
            renderSkillsGrids();
        }

        if (typeof updateCVContent === 'function') {
            updateCVContent();
        }

        renderManagementUI();
        updateLockStatus();
        updateHomepageForms();

        console.log('✅ Render complete');
    } catch (e) {
        console.error('❌ Error during render:', e);
    }
}

function setupEventHandlers() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('show');
            });
        });
    }

    setupCopyHandlers();
    setupPasswordHandler();
    setupAddLearningForm();
    setupAddProjectForm();
    setupDownloadCV();

    const reloadBtn = document.getElementById('reloadDataBtn');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', async function() {
            await reloadDataFromTxtFiles();
        });
    }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const localReloadBtn = document.getElementById('reloadDataBtn');
        if (localReloadBtn) {
            localReloadBtn.style.display = 'inline-flex';
        }
    }
}

function setupPasswordHandler() {
    const unlockBtn = document.getElementById('unlockBtn');
    const passwordInput = document.getElementById('passwordInput');
    const passwordForm = document.getElementById('passwordForm');
    const addLearningForm = document.getElementById('addLearningForm');
    const addProjectForm = document.getElementById('addProjectForm');
    const unlockedStatus = document.getElementById('unlockedStatus');

    if (isUnlocked) {
        if (passwordForm) passwordForm.style.display = 'none';
        if (addLearningForm) addLearningForm.style.display = 'block';
        if (addProjectForm) addProjectForm.style.display = 'block';
        if (unlockedStatus) unlockedStatus.style.display = 'block';
        renderManagementUI();
        updateLockStatus();
        updateHomepageForms();
    }

    if (unlockBtn && passwordInput) {
        unlockBtn.addEventListener('click', function() {
            const pass = passwordInput.value;
            if (verifyPassword(pass)) {
                setUnlocked(true);
                if (passwordForm) passwordForm.style.display = 'none';
                if (addLearningForm) addLearningForm.style.display = 'block';
                if (addProjectForm) addProjectForm.style.display = 'block';
                if (unlockedStatus) unlockedStatus.style.display = 'block';
                showToastManager('🔓 Unlocked! You can now manage content.');
                passwordInput.value = '';
                renderAll();
                renderManagementUI();
                updateLockStatus();
                updateHomepageForms();
            } else {
                showToastManager('❌ Incorrect password');
                passwordInput.value = '';
                passwordInput.focus();
            }
        });

        passwordInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                unlockBtn.click();
            }
        });
    }

    setupChangePassword();
}

function setupChangePassword() {
    const showChangePasswordBtn = document.getElementById('showChangePasswordBtn');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const passwordMessage = document.getElementById('passwordMessage');

    if (showChangePasswordBtn && changePasswordForm) {
        showChangePasswordBtn.addEventListener('click', function() {
            changePasswordForm.style.display = changePasswordForm.style.display === 'none' ? 'block' : 'none';
            if (passwordMessage) passwordMessage.textContent = '';
        });
    }

    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', function() {
            const oldPass = document.getElementById('oldPasswordInput').value;
            const newPass = document.getElementById('newPasswordInput').value;
            const repeatPass = document.getElementById('repeatPasswordInput').value;

            const result = changePassword(oldPass, newPass, repeatPass);
            if (passwordMessage) {
                passwordMessage.textContent = result.message;
                passwordMessage.style.color = result.success ? '#22c55e' : '#ef4444';
            }

            if (result.success) {
                document.getElementById('oldPasswordInput').value = '';
                document.getElementById('newPasswordInput').value = '';
                document.getElementById('repeatPasswordInput').value = '';
                setTimeout(() => {
                    if (changePasswordForm) changePasswordForm.style.display = 'none';
                    if (passwordMessage) passwordMessage.textContent = '';
                }, 2000);
            }
        });
    }

    if (cancelPasswordBtn && changePasswordForm) {
        cancelPasswordBtn.addEventListener('click', function() {
            changePasswordForm.style.display = 'none';
            document.getElementById('oldPasswordInput').value = '';
            document.getElementById('newPasswordInput').value = '';
            document.getElementById('repeatPasswordInput').value = '';
            if (passwordMessage) passwordMessage.textContent = '';
        });
    }
}

function setupAddLearningForm() {
    const addBtn = document.getElementById('addLearningBtn');
    const learningInput = document.getElementById('learningInput');
    const categorySelect = document.getElementById('categorySelect');
    const learningMessage = document.getElementById('learningMessage');

    if (addBtn && learningInput) {
        addBtn.addEventListener('click', function() {
            const name = learningInput.value.trim();
            const category = categorySelect ? categorySelect.value : 'core';

            if (!name) {
                if (learningMessage) {
                    learningMessage.textContent = '⚠️ Please enter what you learned';
                    learningMessage.style.color = '#ef4444';
                }
                return;
            }

            const result = addLearningManager({
                name: name,
                category: category,
                issuer: 'Self-Study',
                skill: name,
                completed: false
            });

            if (learningMessage) {
                learningMessage.textContent = result.message;
                learningMessage.style.color = result.success ? '#22c55e' : '#ef4444';
            }

            if (result.success) {
                learningInput.value = '';
                renderAll();
                updateLearningStats();
                showToastManager(result.message);
            }

            setTimeout(() => {
                if (learningMessage) learningMessage.textContent = '';
            }, 3000);
        });

        learningInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                addBtn.click();
            }
        });
    }
}

function setupAddProjectForm() {
    const addBtn = document.getElementById('addProjectBtn');
    const nameInput = document.getElementById('projectNameInput');
    const techInput = document.getElementById('projectTechInput');
    const descInput = document.getElementById('projectDescInput');
    const statusSelect = document.getElementById('projectStatusSelect');
    const projectMessage = document.getElementById('projectMessage');

    if (addBtn && nameInput) {
        addBtn.addEventListener('click', function() {
            const name = nameInput.value.trim();
            const tech = techInput ? techInput.value.split(',').map(t => t.trim()).filter(t => t) : [];
            const desc = descInput ? descInput.value.trim() : '';
            const status = statusSelect ? statusSelect.value : 'not-started';

            if (!name) {
                if (projectMessage) {
                    projectMessage.textContent = '⚠️ Please enter a project name';
                    projectMessage.style.color = '#ef4444';
                }
                return;
            }

            const result = addProjectManager({
                name: name,
                tech: tech,
                desc: desc,
                status: status,
                icon: 'fa-code'
            });

            if (projectMessage) {
                projectMessage.textContent = result.message;
                projectMessage.style.color = result.success ? '#22c55e' : '#ef4444';
            }

            if (result.success) {
                nameInput.value = '';
                if (techInput) techInput.value = '';
                if (descInput) descInput.value = '';
                renderAll();
                updateProjectStats();
                showToastManager(result.message);
            }

            setTimeout(() => {
                if (projectMessage) projectMessage.textContent = '';
            }, 3000);
        });
    }
}

function setupCopyHandlers() {
    document.querySelectorAll('.copy-icon, .copy-phone-footer, .copy-email-footer').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.dataset.copy || this.textContent.trim();
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    showToastManager('📋 Copied!');
                }).catch(() => {
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    showToastManager('📋 Copied!');
                });
            }
        });
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme === 'dark' || savedTheme === null;

    if (shouldUseDark) {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon(true);
    } else {
        document.body.classList.remove('dark');
        updateThemeIcon(false);
    }
}

function updateThemeIcon(isDark) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
    showToastManager(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
}

function hidePageLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.add('is-hidden');
    }
    document.documentElement.classList.remove('page-loading');
    document.documentElement.classList.add('page-loaded');
    document.body.classList.remove('page-loading');
    document.body.classList.add('page-loaded');
}

function setupPageManagementControls() {
    if (typeof setupLearningPageControls === 'function') {
        setupLearningPageControls();
    }
    if (typeof setupProjectPageControls === 'function') {
        setupProjectPageControls();
    }
    if (typeof setupLearningStatsToggle === 'function') {
        setupLearningStatsToggle();
    }
    if (typeof setupLearningImport === 'function') {
        setupLearningImport();
    }
    if (typeof setupProjectImport === 'function') {
        setupProjectImport();
    }
}

window.initPortfolioApp = initPortfolioApp;
window.renderAll = renderAll;
window.setupEventHandlers = setupEventHandlers;
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;
window.updateThemeIcon = updateThemeIcon;
window.hidePageLoader = hidePageLoader;
window.setupPageManagementControls = setupPageManagementControls;
