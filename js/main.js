// main.js - Main application file

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Portfolio App Initializing...');
    
    // Load saved state
    const savedState = loadManagerState();
    if (savedState) {
        currentPassword = savedState.password;
        if (savedState.isUnlocked !== undefined) {
            isUnlocked = savedState.isUnlocked;
        }
    }

    // Initialize theme
    initTheme();

    // Fetch projects & learnings from txt/ files before first render
    console.log('Loading data from txt/all_projects.txt and txt/all_learnings.txt...');
    try {
        await loadDataFromTxtFiles();
    } catch (e) {
        console.warn('Error loading txt files:', e.message);
    }

    renderAll();
    setupEventHandlers();
    setupPageManagementControls();
    updateLearningStats();
    updateProjectStats();
    renderManagementUI();
    updateLockStatus();
    updateHomepageForms();

    console.log('✅ Portfolio App Ready!');
    console.log('📊 Current state:');
    console.log('  - Learnings:', (getAllLearnings() || []).length);
    console.log('  - Projects:', (getAllProjects() || []).length);

    // Set up periodic auto-reload check (every 30 seconds)
    setInterval(async function() {
        try {
            const reloaded = await loadDataFromTxtFiles();
            if (reloaded) {
                renderAll();
                updateLearningStats();
                updateProjectStats();
                console.log('Data reloaded from files');
            }
        } catch (e) {
            // Silent fail for background reload
        }
    }, 30000);
});

// Render all components
function renderAll() {
    try {
        // Learning grid - main page
        const coursesGrid = document.getElementById('coursesGrid');
        if (coursesGrid) {
            renderLearningsGrid('coursesGrid');
        }
        
        // Featured learning grid (homepage)
        const featuredGrid = document.getElementById('featuredLearningsGrid');
        if (featuredGrid) {
            renderLearningsGrid('featuredLearningsGrid');
        }
        
        // Projects grid - main page
        const allProjectsGrid = document.getElementById('allProjectsGrid');
        if (allProjectsGrid) {
            renderProjectsGrid('allProjectsGrid');
        }
        
        // Featured projects grid (homepage)
        const featuredProjectsGrid = document.getElementById('featuredProjectsGrid');
        if (featuredProjectsGrid) {
            renderProjectsGrid('featuredProjectsGrid');
        }
        
        // Home page updates
        updateHomePage();
        
        // Skills
        renderSkillsGrids();
        
        // CV content
        updateCVContent();
        
        // Management UI
        renderManagementUI();
        updateLockStatus();
        updateHomepageForms();
        
        console.log('✅ Render complete');
    } catch (e) {
        console.error('❌ Error during render:', e);
    }
}

// Setup event handlers
function setupEventHandlers() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu
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
    
    // Copy handlers
    setupCopyHandlers();
    
    // Password unlock
    setupPasswordHandler();
    
    // Add learning form (home page)
    setupAddLearningForm();
    
    // Add project form (home page)
    setupAddProjectForm();

    // CV PDF download
    setupDownloadCV();

    // Reload button if exists
    const reloadBtn = document.getElementById('reloadDataBtn');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', async function() {
            await reloadDataFromTxtFiles();
        });
    }

    // Also show reload button if we're in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const reloadBtn = document.getElementById('reloadDataBtn');
        if (reloadBtn) {
            reloadBtn.style.display = 'inline-flex';
        }
    }
}

// Setup password handler
function setupPasswordHandler() {
    const unlockBtn = document.getElementById('unlockBtn');
    const passwordInput = document.getElementById('passwordInput');
    const passwordForm = document.getElementById('passwordForm');
    const addLearningForm = document.getElementById('addLearningForm');
    const addProjectForm = document.getElementById('addProjectForm');
    const unlockedStatus = document.getElementById('unlockedStatus');
    
    // Check if already unlocked from saved state
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
    
    // Change password
    setupChangePassword();
}

// Setup change password
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

// Setup add learning form (home page)
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

// Setup add project form (home page)
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

// Setup copy handlers
function setupCopyHandlers() {
    document.querySelectorAll('.copy-icon, .copy-phone-footer, .copy-email-footer').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.dataset.copy || this.textContent.trim();
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    showToastManager('📋 Copied!');
                }).catch(() => {
                    // Fallback for non-HTTPS
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

// Theme functions
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

function formatCVStatus(status) {
    const labels = {
        'completed': '✅ Completed',
        'in-progress': '🔄 In Progress',
        'not-started': '⏳ Not Started'
    };
    return labels[status] || status;
}

function renderSkillsGrids() {
    const { coreSkills, toolsSkills } = getSkillsFromLearnings();
    const coreList = document.getElementById('coreSkillsList');
    const toolsList = document.getElementById('toolsSkillsList');

    if (coreList) {
        const items = coreSkills.slice(0, 16);
        coreList.innerHTML = items.length
            ? items.map(s => `<span class="skill-tag">${s}</span>`).join('')
            : '<span class="skill-tag">No skills yet</span>';
    }

    if (toolsList) {
        const items = toolsSkills.slice(0, 20);
        toolsList.innerHTML = items.length
            ? items.map(s => `<span class="skill-tag">${s}</span>`).join('')
            : '<span class="skill-tag">No skills yet</span>';
    }
}

// ========== UPDATED CV CONTENT FUNCTION ==========
// ========== UPDATED CV CONTENT FUNCTION - BALANCED ==========
function updateCVContent() {
    const additionalSkills = ['Typing', 'Video Editing', 'DaVinci Resolve'];

    // ========== PROJECTS SECTION ==========
    const projectsContainer = document.getElementById('cvProjectsContainer');
    if (projectsContainer) {
        const projects = getAllProjects() || [];
        const order = { 'completed': 0, 'in-progress': 1, 'not-started': 2 };
        const sorted = [...projects]
            .filter(p => p.status !== 'not-started')
            .sort((a, b) => (order[a.status] || 3) - (order[b.status] || 3))
            .slice(0, 6); // Reduced to 6 to balance columns

        projectsContainer.innerHTML = sorted.length
            ? sorted.map(proj => `
                <div class="cv-item">
                    <div class="cv-item-header">
                        <span class="cv-item-title">${proj.name}</span>
                        <span class="cv-item-date">${formatCVStatus(proj.status)}</span>
                    </div>
                    <p>${proj.desc ? proj.desc.substring(0, 80) + (proj.desc.length > 80 ? '...' : '') : 'No description.'}</p>
                    ${proj.tech && proj.tech.length ? `<div class="cv-tech-tags">${proj.tech.slice(0, 3).join(' | ')}${proj.tech.length > 3 ? ' +' + (proj.tech.length - 3) : ''}</div>` : ''}
                </div>
            `).join('')
            : '<p style="color: var(--text-muted); grid-column: 1 / -1;">No projects available.</p>';
    }

    // ========== LEARNING SECTION - MORE CONDENSED ==========
    const learningContainer = document.getElementById('cvLearningContainer');
    if (learningContainer) {
        const learnings = getAllLearnings() || [];
        
        // Group learnings by category
        const categories = {
            'core': { label: 'Core Skills', icon: '🔧', items: [] },
            'tools': { label: 'Tools & Frameworks', icon: '🛠️', items: [] },
            'cert': { label: 'Certifications', icon: '📜', items: [] }
        };

        learnings.forEach(l => {
            if (categories[l.category]) {
                categories[l.category].items.push(l);
            }
        });

        let html = '';

        // Show Completed Highlights (top 8 only - reduced)
        const completed = learnings.filter(l => l.completed);
        const inProgress = learnings.filter(l => !l.completed);

        if (completed.length > 0) {
            html += `<div class="cv-learning-group"><strong>✅ Completed:</strong><br>`;
            const topCompleted = completed.slice(0, 8);
            html += topCompleted.map(l => 
                `<span class="cv-learning-tag">${l.name}</span>`
            ).join(' ');
            if (completed.length > 8) {
                html += ` <span class="cv-learning-tag" style="opacity:0.6;">+${completed.length - 8}</span>`;
            }
            html += `</div>`;
        }

        // Show In-Progress Highlights (top 8 only - reduced)
        if (inProgress.length > 0) {
            html += `<div class="cv-learning-group"><strong>🔄 In Progress:</strong><br>`;
            const topInProgress = inProgress.slice(0, 8);
            html += topInProgress.map(l => 
                `<span class="cv-learning-tag cv-inprogress">${l.name}</span>`
            ).join(' ');
            if (inProgress.length > 8) {
                html += ` <span class="cv-learning-tag cv-inprogress" style="opacity:0.6;">+${inProgress.length - 8}</span>`;
            }
            html += `</div>`;
        }

        // Show Category Breakdown - condensed to one line
        let categorySummary = '';
        Object.keys(categories).forEach(key => {
            const cat = categories[key];
            const count = cat.items.length;
            const completedCount = cat.items.filter(l => l.completed).length;
            if (count > 0) {
                categorySummary += `<span class="cv-learning-tag">${cat.icon} ${cat.label}: ${completedCount}/${count}</span>`;
            }
        });
        if (categorySummary) {
            html += `<div class="cv-learning-group"><strong>📊 Summary:</strong><br>${categorySummary}</div>`;
        }

        learningContainer.innerHTML = html || '<p style="color: var(--text-muted);">No learnings available.</p>';
    }

    // ========== SKILLS SECTION - MORE CONDENSED ==========
    const skillsContainer = document.getElementById('cvSkillsContainer');
    if (skillsContainer) {
        const { coreSkills, toolsSkills } = getSkillsFromLearnings();
        const learnings = getAllLearnings() || [];
        const completedTopics = learnings.filter(l => l.completed).map(l => l.name).slice(0, 4);

        // Get top 6 core skills and top 6 tools
        const topCore = coreSkills.slice(0, 6);
        const topTools = toolsSkills.slice(0, 6);

        skillsContainer.innerHTML = `
            <div class="skill-group"><strong>🔧 Core:</strong> ${topCore.join(', ') || '—'}</div>
            <div class="skill-group"><strong>🛠️ Tools:</strong> ${topTools.join(', ') || '—'}</div>
            <div class="skill-group"><strong>📋 Additional:</strong> ${additionalSkills.join(', ')}</div>
            ${completedTopics.length ? `<div class="skill-group"><strong>✅ Recent:</strong> ${completedTopics.join(', ')}</div>` : ''}
        `;
    }

    // ========== UPDATE LEARNING COUNT ==========
    const learningCount = document.getElementById('learningCount');
    if (learningCount) {
        const learnings = getAllLearnings() || [];
        const completed = learnings.filter(l => l.completed).length;
        const total = learnings.length;
        learningCount.textContent = total > 0 
            ? ` (${completed}/${total} topics)`
            : '';
    }
}
function setupDownloadCV() {
    const downloadBtn = document.getElementById('downloadCVBtn');
    if (!downloadBtn) return;

    // ------------------------------------------------------------------
    // WHAT WAS STILL WRONG
    // ------------------------------------------------------------------
    // html2pdf's automatic pagination takes ONE tall screenshot of the
    // whole CV and slices it into page-height chunks by raw pixel row.
    // It has no idea that .cv-body-grid is two side-by-side columns. If
    // column 2 (Projects) renders taller than column 1 (Education/
    // Skills) — which varies by device/font metrics, hence "only on
    // mobile" — the slice line lands in the MIDDLE of column 2. Page 2
    // then shows just the tail end of column 2 with nothing next to it,
    // which is the "column 2 shifted" symptom. And because that leftover
    // fragment doesn't span the full width the way a normal full row
    // does, it also reads as "not centered."
    //
    // FIX: stop slicing a single flat image at all. Capture each logical
    // page (1: header+summary+education+skills+projects,
    // 2: Learning Highlights) as its OWN complete image, shrink each one
    // (if needed) so it always fits within one page's height without
    // ever cutting through a column, then place each image on its own
    // PDF page with manually computed, guaranteed-centered coordinates.
    //
    // NOTE: earlier versions of this function required separate global
    // `html2canvas` / `window.jspdf` objects. Not every html2pdf CDN
    // build exposes those (yours doesn't, which is why the button was
    // greyed out). This version only needs `html2pdf` itself — it gets
    // the canvas and jsPDF instance through html2pdf's own worker API
    // (`.toCanvas()`, `.toPdf()`, `.get('pdf')`), which is always
    // available since html2pdf bundles both internally regardless of
    // whether it re-exports them as separate globals.
    // ------------------------------------------------------------------

    if (typeof html2pdf === 'undefined') {
        downloadBtn.style.opacity = '0.5';
        downloadBtn.title = 'html2pdf library not loaded';
        return;
    }

    const EXPORT_STYLE_ID = 'cv-export-style';
    if (!document.getElementById(EXPORT_STYLE_ID)) {
        const styleEl = document.createElement('style');
        styleEl.id = EXPORT_STYLE_ID;
        styleEl.textContent = `
            /* No zoom/scale hacks here anymore — see note below on why. */
            body.cv-export-mode #cvContent {
                width: 794px !important;
                max-width: 794px !important;
                margin: 0 !important;
                padding: 16px;
                background: #0f172a;
                color: #f1f5f9;
                font-family: Inter, Arial, sans-serif;
                line-height: 1.2;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            body.cv-export-mode #cvContent * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            body.cv-export-mode #cvContent .cv-container {
                width: 100%;
                background: #1e293b;
                color: #f1f5f9;
                border: 1px solid #334155;
                border-radius: 14px;
                padding: 18px;
                box-shadow: none;
            }
            body.cv-export-mode #cvContent .cv-header {
                text-align: center;
                border-bottom: 2px solid #60a5fa;
                margin-bottom: 12px;
                padding-bottom: 10px;
            }
            body.cv-export-mode #cvContent .avatar-circle {
                width: 90px !important;
                height: 90px !important;
                margin: 0 auto 6px !important;
                border-radius: 50%;
                overflow: hidden;
            }
            body.cv-export-mode #cvContent .avatar-circle img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            body.cv-export-mode #cvContent .cv-name {
                font-size: 1.2rem;
                font-weight: 700;
                margin-bottom: 2px;
                color: #f1f5f9;
            }
            body.cv-export-mode #cvContent .cv-title {
                font-size: 0.8rem;
                margin-bottom: 6px;
                color: #60a5fa;
                font-weight: 500;
            }
            body.cv-export-mode #cvContent .cv-contact-info {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 8px;
                font-size: 0.65rem;
                color: #94a3b8;
                line-height: 1.2;
            }
            body.cv-export-mode #cvContent .cv-body-grid {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                gap: 16px;
                align-items: flex-start;
                width: 100%;
            }
            body.cv-export-mode #cvContent .cv-column {
                width: 50% !important;
                flex: 0 0 50% !important;
                max-width: 50% !important;
                display: flex;
                flex-direction: column;
                min-width: 0;
            }
            body.cv-export-mode #cvContent .cv-summary-block {
                width: 100%;
                margin-bottom: 10px;
            }
            body.cv-export-mode #cvContent .cv-summary-block p {
                margin: 0;
                font-size: 0.7rem;
                line-height: 1.3;
                color: #cbd5e1;
            }
            body.cv-export-mode #cvContent .cv-section-block {
                margin-bottom: 12px;
            }
            body.cv-export-mode #cvContent .cv-section-block h3 {
                font-size: 0.85rem;
                margin: 0 0 6px 0;
                padding-bottom: 3px;
                border-bottom: 2px solid #60a5fa;
                color: #60a5fa;
                font-weight: 600;
            }
            body.cv-export-mode #cvContent .cv-item {
                margin-bottom: 8px;
            }
            body.cv-export-mode #cvContent .cv-item-header {
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 4px;
                margin-bottom: 1px;
            }
            body.cv-export-mode #cvContent .cv-item-title {
                font-weight: 600;
                font-size: 0.75rem;
                color: #f1f5f9;
            }
            body.cv-export-mode #cvContent .cv-item-date {
                font-size: 0.65rem;
                color: #60a5fa;
            }
            body.cv-export-mode #cvContent .cv-item-subtitle {
                font-size: 0.7rem;
                color: #cbd5e1;
                margin-top: 1px;
            }
            body.cv-export-mode #cvContent .cv-item p {
                margin: 2px 0 0 0;
                font-size: 0.65rem;
                color: #94a3b8;
                line-height: 1.2;
            }
            body.cv-export-mode #cvContent .cv-tech-tags {
                margin-top: 3px;
                background: #1e3a5f;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 0.6rem;
                font-weight: 500;
                color: #60a5fa;
                display: inline-flex;
                flex-wrap: wrap;
                gap: 3px;
                border: 1px solid #334155;
            }
            body.cv-export-mode #cvContent .skills-grid-cv {
                display: grid;
                grid-template-columns: 1fr;
                gap: 4px;
            }
            body.cv-export-mode #cvContent .skill-group {
                padding: 3px 0;
                border-bottom: 1px solid #334155;
                color: #cbd5e1;
                font-size: 0.7rem;
                line-height: 1.2;
            }
            body.cv-export-mode #cvContent .cv-projects-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 6px;
            }
            body.cv-export-mode #cvContent .cv-projects-grid .cv-item {
                padding: 6px;
                background: #0f172a;
                border-radius: 6px;
                border: 1px solid #334155;
                margin-bottom: 0;
            }
            body.cv-export-mode #cvContent .cv-projects-grid .cv-item p {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                font-size: 0.6rem;
            }
            body.cv-export-mode #cvContent .cv-learnings-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 4px;
            }
            body.cv-export-mode #cvContent .certifications-list {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            body.cv-export-mode #cvContent .cv-learning-group {
                margin-bottom: 6px;
                font-size: 0.7rem;
                color: #cbd5e1;
            }
            body.cv-export-mode #cvContent .cv-learning-tag {
                display: inline-block;
                background: #1e3a5f;
                color: #60a5fa;
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 0.6rem;
                margin-right: 3px;
                margin-bottom: 2px;
                border: 1px solid #334155;
            }
            body.cv-export-mode #cvContent .cv-two-columns {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 10px;
            }
            body.cv-export-mode #cvContent .cv-two-columns ul {
                padding-left: 16px;
                margin-top: 3px;
                color: #cbd5e1;
                font-size: 0.7rem;
            }
            body.cv-export-mode #cvContent .cv-two-columns li {
                margin-bottom: 2px;
            }
            body.cv-export-mode {
                overflow: hidden;
            }
            body.cv-export-mode #cvContent {
                position: relative;
                z-index: 2147483647;
            }
        `;
        document.head.appendChild(styleEl);
    }

    // A4 page geometry in mm, and the px<->mm relationship implied by
    // the 794px export width (794px was chosen because at 96dpi that's
    // exactly the width of an A4 page: 210mm * 96/25.4 ≈ 794px).
    const PAGE_W_MM = 210;
    const PAGE_H_MM = 297;
    const MARGIN_MM = 5;

    function nextFrame() {
        return new Promise(function(resolve) {
            requestAnimationFrame(function() {
                requestAnimationFrame(resolve);
            });
        });
    }

    // Captures `el` via html2pdf's own worker chain and returns the
    // resulting canvas. Using html2pdf().toCanvas() instead of calling
    // html2canvas directly means we only ever depend on the one library
    // that's confirmed to be loaded.
    async function captureElement(el) {
        // Force a synchronous reflow so any pending layout changes (like
        // the cv-export-mode width override, or a display toggle on a
        // sibling) are fully applied before html2canvas reads geometry.
        void el.offsetHeight;
        await nextFrame();

        // No explicit width/height/windowWidth here: #cvContent is
        // already fixed at 794px on the real DOM (via cv-export-mode),
        // so html2canvas measures it correctly on its own. Passing a
        // separately-measured rect risked a stale/early reading, which
        // is what was causing the cropped/cut-off capture.
        const canvas = await html2pdf().set({
            html2canvas: {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#0f172a',
                logging: false,
                scrollX: 0,
                scrollY: 0
            }
        }).from(el).toCanvas().get('canvas');
        return canvas;
    }

    // Paints `canvas` onto the CURRENT page of `pdf`, centered both
    // horizontally and vertically within the printable area. Filling the
    // printable width exactly and computing x from that width is what
    // guarantees true centering — no reliance on html2pdf's internal
    // placement. A solid background rect is painted first so nothing
    // html2pdf may have already drawn on this page shows through.
    function paintCanvasOnCurrentPage(pdf, canvas) {
        pdf.setFillColor(15, 23, 42); // #0f172a
        pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, 'F');

        const availableWMM = PAGE_W_MM - 2 * MARGIN_MM;
        const availableHMM = PAGE_H_MM - 2 * MARGIN_MM;

        // True "contain" fit: scale the image down by whichever axis
        // needs it more, preserving aspect ratio (no distortion, no
        // cropping), then center it on both axes. If the content is
        // short, this fills full width (the common case). If a section
        // is unusually tall, this shrinks it uniformly instead of
        // letting it get cut or squashed.
        const naturalWMM = availableWMM;
        const naturalHMM = naturalWMM * (canvas.height / canvas.width);
        const scale = Math.min(1, availableHMM / naturalHMM);

        const imgWMM = naturalWMM * scale;
        const imgHMM = naturalHMM * scale;

        const x = MARGIN_MM + (availableWMM - imgWMM) / 2;
        const y = MARGIN_MM + (availableHMM - imgHMM) / 2;

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', x, y, imgWMM, imgHMM);
    }

    downloadBtn.addEventListener('click', async function() {
        const cvContent = document.getElementById('cvContent');
        if (!cvContent) return;

        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        if (!document.body.classList.contains('dark')) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            updateThemeIcon(true);
        }

        document.body.classList.add('cv-export-mode');
        window.scrollTo(0, 0);

        // Split into logical pages without moving any DOM nodes: find
        // the element marking the start of page 2 (Learning Highlights),
        // and toggle visibility of everything before/after it in turn.
        const pageBreakEl = cvContent.querySelector('.page-break, .cv-learning-section-wrapper');
        let page2Root = null;
        if (pageBreakEl) {
            page2Root = pageBreakEl;
            while (page2Root.parentElement && page2Root.parentElement !== cvContent) {
                page2Root = page2Root.parentElement;
            }
        }

        function cleanup() {
            document.body.classList.remove('cv-export-mode');
            if (page2Root) page2Root.style.removeProperty('display');
            Array.prototype.forEach.call(cvContent.children, function(child) {
                child.style.removeProperty('display');
            });
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
        }

        try {
            await nextFrame();

            // Get a bare jsPDF instance through html2pdf's own worker
            // chain. IMPORTANT: we seed this from a trivial 1px scratch
            // element, NOT the real cvContent — running toPdf() on the
            // full, un-hidden CV would let html2pdf auto-paginate it by
            // itself (the exact bug we're fixing), leaving a leftover,
            // unmasked page behind. The scratch element guarantees
            // exactly one trivial page to start from; the A4 page size
            // itself comes from the jsPDF option below, independent of
            // the scratch element's tiny size.
            const scratchEl = document.createElement('div');
            scratchEl.style.cssText = 'width:2px;height:2px;background:#0f172a;';
            document.body.appendChild(scratchEl);
            const pdf = await html2pdf()
                .set({ jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
                .from(scratchEl)
                .toPdf()
                .get('pdf');
            scratchEl.remove();

            // Defensive: make sure we start from exactly one known page.
            while (pdf.getNumberOfPages() > 1) {
                pdf.deletePage(pdf.getNumberOfPages());
            }
            pdf.setPage(1);

            if (page2Root) {
                // --- PAGE 1: everything except page2Root ---
                page2Root.style.display = 'none';
                await nextFrame();
                let canvas = await captureElement(cvContent);
                paintCanvasOnCurrentPage(pdf, canvas);

                // --- PAGE 2: only page2Root ---
                page2Root.style.display = '';
                Array.prototype.forEach.call(cvContent.children, function(child) {
                    if (child !== page2Root) child.style.display = 'none';
                });
                await nextFrame();
                canvas = await captureElement(cvContent);
                pdf.addPage();
                paintCanvasOnCurrentPage(pdf, canvas);
            } else {
                // No page-break marker found: export as a single page.
                const canvas = await captureElement(cvContent);
                paintCanvasOnCurrentPage(pdf, canvas);
            }

            pdf.save('Mudassar_Hussain_CV.pdf');
            cleanup();
            showToastManager('✅ CV downloaded!');
        } catch (err) {
            console.error('PDF generation error:', err);
            cleanup();
            showToastManager('❌ PDF generation failed');
        }
    });
}
function setLearningPageView(view) {
    const buttons = document.querySelectorAll('.stats-toggle-btn');
    const learningSection = document.getElementById('learningStatsSection');
    const certificateSection = document.getElementById('certificateStatsSection');
    const learningContentSection = document.getElementById('learningContentSection');
    const isCertificate = view === 'certificate';

    buttons.forEach((button) => {
        const isActive = button.getAttribute('data-view') === view;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    if (learningSection) {
        learningSection.style.display = isCertificate ? 'none' : 'block';
    }
    if (certificateSection) {
        certificateSection.style.display = isCertificate ? 'block' : 'none';
    }
    if (learningContentSection) {
        learningContentSection.style.display = isCertificate ? 'none' : 'block';
    }

    if (isCertificate) {
        updateCertificateStats();
    } else {
        updateLearningStats();
    }

    // Ensure form sections stay in sync with the selected view
    const addLearningSection = document.getElementById('addLearningSection');
    const editLearningSection = document.getElementById('editLearningSection');
    const deleteLearningSection = document.getElementById('deleteLearningSection');
    const importLearningSection = document.getElementById('importLearningSection');

    const addCertificateSection = document.getElementById('addCertificateSection');
    const editCertificateSection = document.getElementById('editCertificateSection');
    const certificateListSection = document.getElementById('certificateListSection');

    if (isCertificate) {
        // Hide learning-specific panels when viewing certificates
        if (addLearningSection) addLearningSection.style.display = 'none';
        if (editLearningSection) editLearningSection.style.display = 'none';
        if (deleteLearningSection) deleteLearningSection.style.display = 'none';
        if (importLearningSection) importLearningSection.style.display = 'none';

        // Show certificate list by default
        if (certificateListSection) certificateListSection.style.display = 'block';
    } else {
        // Hide certificate-specific panels when viewing learnings
        if (addCertificateSection) addCertificateSection.style.display = 'none';
        if (editCertificateSection) editCertificateSection.style.display = 'none';
        if (certificateListSection) certificateListSection.style.display = 'none';

        // Ensure learning content is visible
        if (learningContentSection) learningContentSection.style.display = 'block';
    }
}

function setupLearningStatsToggle() {
    const buttons = document.querySelectorAll('.stats-toggle-btn');

    if (!buttons.length) {
        return;
    }

    buttons.forEach((button) => {
        button.addEventListener('click', function() {
            setLearningPageView(button.getAttribute('data-view'));
        });
    });

    setLearningPageView('learning');
}

// Learning page controls
function setupLearningPageControls() {
    // Show Add Learning form
    const showAddBtn = document.getElementById('showAddLearningBtn');
    const addSection = document.getElementById('addLearningSection');
    const editSection = document.getElementById('editLearningSection');
    const deleteSection = document.getElementById('deleteLearningSection');
    const importSection = document.getElementById('importLearningSection');
    
    if (showAddBtn && addSection) {
        showAddBtn.addEventListener('click', function() {
            // If currently viewing Certificates, delegate to the Certificate Add button if available
            try {
                const activeView = document.querySelector('.stats-toggle-btn.active')?.getAttribute('data-view') || 'learning';
                if (activeView === 'certificate') {
                    const certAddBtn = document.getElementById('showAddCertificateBtn');
                    if (certAddBtn) {
                        certAddBtn.click();
                        return;
                    }
                }
            } catch (e) {
                // fallback to default behavior
            }

            addSection.style.display = addSection.style.display === 'none' ? 'block' : 'none';
            if (editSection) editSection.style.display = 'none';
            if (deleteSection) deleteSection.style.display = 'none';
            if (importSection) importSection.style.display = 'none';
            setLearningPageView('learning');
        });
    }
    
    // Show Edit Learning form
    const showEditBtn = document.getElementById('showEditLearningBtn');
    if (showEditBtn && editSection) {
        showEditBtn.addEventListener('click', function() {
            editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
            if (addSection) addSection.style.display = 'none';
            if (deleteSection) deleteSection.style.display = 'none';
            if (importSection) importSection.style.display = 'none';
            populateEditLearningSelect();
            setLearningPageView('learning');
        });
    }
    
    // Show Delete Learning form
    const showDeleteBtn = document.getElementById('showDeleteLearningBtn');
    if (showDeleteBtn && deleteSection) {
        showDeleteBtn.addEventListener('click', function() {
            deleteSection.style.display = deleteSection.style.display === 'none' ? 'block' : 'none';
            if (addSection) addSection.style.display = 'none';
            if (editSection) editSection.style.display = 'none';
            if (importSection) importSection.style.display = 'none';
            populateDeleteLearningSelect();
            setLearningPageView('learning');
        });
    }
    
    // Cancel Add Learning
    const cancelAddBtn = document.getElementById('cancelAddLearningBtn');
    if (cancelAddBtn && addSection) {
        cancelAddBtn.addEventListener('click', function() {
            addSection.style.display = 'none';
            const input = document.getElementById('learningInputPage');
            if (input) input.value = '';
            const msg = document.getElementById('learningPageMessage');
            if (msg) msg.textContent = '';
        });
    }
    
    // Cancel Edit Learning
    const cancelEditBtn = document.getElementById('cancelEditLearningBtn');
    if (cancelEditBtn && editSection) {
        cancelEditBtn.addEventListener('click', function() {
            editSection.style.display = 'none';
            const msg = document.getElementById('editLearningMessage');
            if (msg) msg.textContent = '';
        });
    }
    
    // Cancel Delete Learning
    const cancelDeleteBtn = document.getElementById('cancelDeleteLearningBtn');
    if (cancelDeleteBtn && deleteSection) {
        cancelDeleteBtn.addEventListener('click', function() {
            deleteSection.style.display = 'none';
            const msg = document.getElementById('deleteLearningMessage');
            if (msg) msg.textContent = '';
        });
    }
    
    // Add Learning
    const addBtn = document.getElementById('addLearningPageBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            const name = document.getElementById('learningInputPage').value.trim();
            const category = document.getElementById('categorySelectPage').value;
            const message = document.getElementById('learningPageMessage');
            
            if (!name) {
                if (message) {
                    message.textContent = '⚠️ Please enter what you learned';
                    message.style.color = '#ef4444';
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
            
            if (message) {
                message.textContent = result.message;
                message.style.color = result.success ? '#22c55e' : '#ef4444';
            }
            
            if (result.success) {
                document.getElementById('learningInputPage').value = '';
                renderAll();
                updateLearningStats();
                showToastManager(result.message);
                setTimeout(() => {
                    document.getElementById('addLearningSection').style.display = 'none';
                    if (message) message.textContent = '';
                }, 1500);
            }
        });
    }
    
    // Save Edit Learning
    const saveEditBtn = document.getElementById('saveEditLearningBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', function() {
            const select = document.getElementById('editLearningSelect');
            const name = document.getElementById('editLearningName').value.trim();
            const skill = document.getElementById('editLearningSkill').value.trim();
            const category = document.getElementById('editLearningCategory').value;
            const message = document.getElementById('editLearningMessage');
            
            if (!select || !select.value) {
                if (message) {
                    message.textContent = '⚠️ Please select a learning to edit';
                    message.style.color = '#ef4444';
                }
                return;
            }
            
            if (!name) {
                if (message) {
                    message.textContent = '⚠️ Please enter a name';
                    message.style.color = '#ef4444';
                }
                return;
            }
            
            const learnings = getAllLearnings() || [];
            const index = learnings.findIndex(l => l.id === select.value);
            
            if (index === -1) {
                if (message) {
                    message.textContent = '❌ Learning not found';
                    message.style.color = '#ef4444';
                }
                return;
            }
            
            learnings[index].name = name;
            if (skill) learnings[index].skill = skill;
            learnings[index].category = category;
            learnings[index].updatedAt = new Date().toISOString();
            
            saveLearnings(learnings);
            if (message) {
                message.textContent = '✅ Learning updated successfully!';
                message.style.color = '#22c55e';
            }
            renderAll();
            updateLearningStats();
            showToastManager('✅ Learning updated!');
            
            setTimeout(() => {
                document.getElementById('editLearningSection').style.display = 'none';
                if (message) message.textContent = '';
            }, 1500);
        });
    }
    
    // Confirm Delete Learning
    const confirmDeleteBtn = document.getElementById('confirmDeleteLearningBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const select = document.getElementById('deleteLearningSelect');
            const message = document.getElementById('deleteLearningMessage');
            
            if (!select || !select.value) {
                if (message) {
                    message.textContent = '⚠️ Please select a learning to delete';
                    message.style.color = '#ef4444';
                }
                return;
            }
            
            if (confirm('Are you sure you want to delete this learning?')) {
                const result = deleteLearningManager(select.value);
                if (message) {
                    message.textContent = result.message;
                    message.style.color = result.success ? '#22c55e' : '#ef4444';
                }
                
                if (result.success) {
                    renderAll();
                    updateLearningStats();
                    showToastManager(result.message);
                    setTimeout(() => {
                        document.getElementById('deleteLearningSection').style.display = 'none';
                        if (message) message.textContent = '';
                    }, 1500);
                }
            }
        });
    }
}

// Populate edit learning select
function populateEditLearningSelect() {
    const select = document.getElementById('editLearningSelect');
    if (!select) return;
    
    const learnings = getAllLearnings() || [];
    select.innerHTML = '<option value="">Select a learning...</option>';
    learnings.forEach(l => {
        const option = document.createElement('option');
        option.value = l.id;
        option.textContent = `${l.name} (${l.completed ? '✅' : '🔄'})`;
        select.appendChild(option);
    });
    
    select.addEventListener('change', function() {
        const learnings = getAllLearnings() || [];
        const learning = learnings.find(l => l.id === this.value);
        if (learning) {
            const nameInput = document.getElementById('editLearningName');
            const skillInput = document.getElementById('editLearningSkill');
            const categorySelect = document.getElementById('editLearningCategory');
            if (nameInput) nameInput.value = learning.name || '';
            if (skillInput) skillInput.value = learning.skill || '';
            if (categorySelect) categorySelect.value = learning.category || 'core';
        }
    });
}

// Populate delete learning select
function populateDeleteLearningSelect() {
    const select = document.getElementById('deleteLearningSelect');
    if (!select) return;
    
    const learnings = getAllLearnings() || [];
    select.innerHTML = '<option value="">Select a learning...</option>';
    learnings.forEach(l => {
        const option = document.createElement('option');
        option.value = l.id;
        option.textContent = `${l.name} (${l.completed ? '✅' : '🔄'})`;
        select.appendChild(option);
    });
}

// Project page controls
function setupProjectPageControls() {
    // Show Add Project form
    const showAddBtn = document.getElementById('showAddProjectBtn');
    const addSection = document.getElementById('addProjectSection');
    const editSection = document.getElementById('editProjectSection');
    const deleteSection = document.getElementById('deleteProjectSection');
    const importSection = document.getElementById('importProjectSection');
    
    if (showAddBtn && addSection) {
        showAddBtn.addEventListener('click', function() {
            addSection.style.display = addSection.style.display === 'none' ? 'block' : 'none';
            if (editSection) editSection.style.display = 'none';
            if (deleteSection) deleteSection.style.display = 'none';
            if (importSection) importSection.style.display = 'none';
        });
    }
    
    // Show Edit Project form
    const showEditBtn = document.getElementById('showEditProjectBtn');
    if (showEditBtn && editSection) {
        showEditBtn.addEventListener('click', function() {
            editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
            if (addSection) addSection.style.display = 'none';
            if (deleteSection) deleteSection.style.display = 'none';
            if (importSection) importSection.style.display = 'none';
            populateEditProjectSelect();
        });
    }
    
    // Show Delete Project form
    const showDeleteBtn = document.getElementById('showDeleteProjectBtn');
    if (showDeleteBtn && deleteSection) {
        showDeleteBtn.addEventListener('click', function() {
            deleteSection.style.display = deleteSection.style.display === 'none' ? 'block' : 'none';
            if (addSection) addSection.style.display = 'none';
            if (editSection) editSection.style.display = 'none';
            if (importSection) importSection.style.display = 'none';
            populateDeleteProjectSelect();
        });
    }
    
    // Cancel Add Project
    const cancelAddBtn = document.getElementById('cancelAddProjectBtn');
    if (cancelAddBtn && addSection) {
        cancelAddBtn.addEventListener('click', function() {
            addSection.style.display = 'none';
            const nameInput = document.getElementById('projectNameInputPage');
            const techInput = document.getElementById('projectTechInputPage');
            const descInput = document.getElementById('projectDescInputPage');
            const msg = document.getElementById('projectPageMessage');
            if (nameInput) nameInput.value = '';
            if (techInput) techInput.value = '';
            if (descInput) descInput.value = '';
            if (msg) msg.textContent = '';
        });
    }
    
    // Cancel Edit Project
    const cancelEditBtn = document.getElementById('cancelEditProjectBtn');
    if (cancelEditBtn && editSection) {
        cancelEditBtn.addEventListener('click', function() {
            editSection.style.display = 'none';
            const msg = document.getElementById('editProjectMessage');
            if (msg) msg.textContent = '';
        });
    }
    
    // Cancel Delete Project
    const cancelDeleteBtn = document.getElementById('cancelDeleteProjectBtn');
    if (cancelDeleteBtn && deleteSection) {
        cancelDeleteBtn.addEventListener('click', function() {
            deleteSection.style.display = 'none';
            const msg = document.getElementById('deleteProjectMessage');
            if (msg) msg.textContent = '';
        });
    }
    
    // Add Project
    const addBtn = document.getElementById('addProjectPageBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            const name = document.getElementById('projectNameInputPage').value.trim();
            const tech = document.getElementById('projectTechInputPage').value.split(',').map(t => t.trim()).filter(t => t);
            const desc = document.getElementById('projectDescInputPage').value.trim();
            const status = document.getElementById('projectStatusSelectPage').value;
            const message = document.getElementById('projectPageMessage');
            
            if (!name) {
                if (message) {
                    message.textContent = '⚠️ Please enter a project name';
                    message.style.color = '#ef4444';
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
            
            if (message) {
                message.textContent = result.message;
                message.style.color = result.success ? '#22c55e' : '#ef4444';
            }
            
            if (result.success) {
                document.getElementById('projectNameInputPage').value = '';
                document.getElementById('projectTechInputPage').value = '';
                document.getElementById('projectDescInputPage').value = '';
                renderAll();
                updateProjectStats();
                showToastManager(result.message);
                setTimeout(() => {
                    document.getElementById('addProjectSection').style.display = 'none';
                    if (message) message.textContent = '';
                }, 1500);
            }
        });
    }
    
    // Save Edit Project
    const saveEditBtn = document.getElementById('saveEditProjectBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', function() {
            const select = document.getElementById('editProjectSelect');
            const name = document.getElementById('editProjectName').value.trim();
            const tech = document.getElementById('editProjectTech').value.split(',').map(t => t.trim()).filter(t => t);
            const desc = document.getElementById('editProjectDesc').value.trim();
            const status = document.getElementById('editProjectStatus').value;
            const message = document.getElementById('editProjectMessage');
            
            if (!select || !select.value) {
                if (message) {
                    message.textContent = '⚠️ Please select a project to edit';
                    message.style.color = '#ef4444';
                }
                return;
            }
            
            if (!name) {
                if (message) {
                    message.textContent = '⚠️ Please enter a name';
                    message.style.color = '#ef4444';
                }
                return;
            }
            
            const projects = getAllProjects() || [];
            const index = projects.findIndex(p => p.id === select.value);
            
            if (index === -1) {
                if (message) {
                    message.textContent = '❌ Project not found';
                    message.style.color = '#ef4444';
                }
                return;
            }
            
            projects[index].name = name;
            if (tech.length) projects[index].tech = tech;
            if (desc) projects[index].desc = desc;
            projects[index].status = status;
            projects[index].updatedAt = new Date().toISOString();
            
            saveProjects(projects);
            if (message) {
                message.textContent = '✅ Project updated successfully!';
                message.style.color = '#22c55e';
            }
            renderAll();
            updateProjectStats();
            showToastManager('✅ Project updated!');
            
            setTimeout(() => {
                document.getElementById('editProjectSection').style.display = 'none';
                if (message) message.textContent = '';
            }, 1500);
        });
    }
    
    // Confirm Delete Project
    const confirmDeleteBtn = document.getElementById('confirmDeleteProjectBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const select = document.getElementById('deleteProjectSelect');
            const message = document.getElementById('deleteProjectMessage');
            
            if (!select || !select.value) {
                if (message) {
                    message.textContent = '⚠️ Please select a project to delete';
                    message.style.color = '#ef4444';
                }
                return;
            }
            
            if (confirm('Are you sure you want to delete this project?')) {
                const result = deleteProject(select.value);
                if (message) {
                    message.textContent = result.message;
                    message.style.color = result.success ? '#22c55e' : '#ef4444';
                }
                
                if (result.success) {
                    renderAll();
                    updateProjectStats();
                    showToastManager(result.message);
                    setTimeout(() => {
                        document.getElementById('deleteProjectSection').style.display = 'none';
                        if (message) message.textContent = '';
                    }, 1500);
                }
            }
        });
    }
}

// Populate edit project select
function populateEditProjectSelect() {
    const select = document.getElementById('editProjectSelect');
    if (!select) return;
    
    const projects = getAllProjects() || [];
    select.innerHTML = '<option value="">Select a project...</option>';
    projects.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        const statusEmoji = p.status === 'completed' ? '✅' : p.status === 'in-progress' ? '🔄' : '⏳';
        option.textContent = `${p.name} ${statusEmoji}`;
        select.appendChild(option);
    });
    
    select.addEventListener('change', function() {
        const projects = getAllProjects() || [];
        const project = projects.find(p => p.id === this.value);
        if (project) {
            const nameInput = document.getElementById('editProjectName');
            const techInput = document.getElementById('editProjectTech');
            const descInput = document.getElementById('editProjectDesc');
            const statusSelect = document.getElementById('editProjectStatus');
            if (nameInput) nameInput.value = project.name || '';
            if (techInput) techInput.value = (project.tech || []).join(', ');
            if (descInput) descInput.value = project.desc || '';
            if (statusSelect) statusSelect.value = project.status || 'not-started';
        }
    });
}

// Populate delete project select
function populateDeleteProjectSelect() {
    const select = document.getElementById('deleteProjectSelect');
    if (!select) return;
    
    const projects = getAllProjects() || [];
    select.innerHTML = '<option value="">Select a project...</option>';
    projects.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        const statusEmoji = p.status === 'completed' ? '✅' : p.status === 'in-progress' ? '🔄' : '⏳';
        option.textContent = `${p.name} ${statusEmoji}`;
        select.appendChild(option);
    });
}

// Setup import buttons for Learning page
function setupLearningImport() {
    const showImportBtn = document.getElementById('showImportLearningBtn');
    const importSection = document.getElementById('importLearningSection');
    
    if (showImportBtn && importSection) {
        showImportBtn.addEventListener('click', function() {
            importSection.style.display = importSection.style.display === 'none' ? 'block' : 'none';
            // Hide other sections
            const addSection = document.getElementById('addLearningSection');
            const editSection = document.getElementById('editLearningSection');
            const deleteSection = document.getElementById('deleteLearningSection');
            if (addSection) addSection.style.display = 'none';
            if (editSection) editSection.style.display = 'none';
            if (deleteSection) deleteSection.style.display = 'none';
            
            // Setup file importer if not already done
            if (!document.getElementById('learningFileInput')) {
                setupFileImporter('learningImportArea', 'learningImportBtn', 'learningFileInput', 'learningImportMessage', 'learning');
            }
        });
    }
    
    // Cancel import
    const cancelImportBtn = document.getElementById('cancelImportLearningBtn');
    if (cancelImportBtn && importSection) {
        cancelImportBtn.addEventListener('click', function() {
            importSection.style.display = 'none';
            const msg = document.getElementById('learningImportMessage');
            if (msg) msg.textContent = '';
        });
    }
}

// Setup import buttons for Projects page
function setupProjectImport() {
    const showImportBtn = document.getElementById('showImportProjectBtn');
    const importSection = document.getElementById('importProjectSection');
    
    if (showImportBtn && importSection) {
        showImportBtn.addEventListener('click', function() {
            importSection.style.display = importSection.style.display === 'none' ? 'block' : 'none';
            // Hide other sections
            const addSection = document.getElementById('addProjectSection');
            const editSection = document.getElementById('editProjectSection');
            const deleteSection = document.getElementById('deleteProjectSection');
            if (addSection) addSection.style.display = 'none';
            if (editSection) editSection.style.display = 'none';
            if (deleteSection) deleteSection.style.display = 'none';
            
            // Setup file importer if not already done
            if (!document.getElementById('projectFileInput')) {
                setupFileImporter('projectImportArea', 'projectImportBtn', 'projectFileInput', 'projectImportMessage', 'project');
            }
        });
    }
    
    // Cancel import
    const cancelImportBtn = document.getElementById('cancelImportProjectBtn');
    if (cancelImportBtn && importSection) {
        cancelImportBtn.addEventListener('click', function() {
            importSection.style.display = 'none';
            const msg = document.getElementById('projectImportMessage');
            if (msg) msg.textContent = '';
        });
    }
}

// Make global functions available
window.toggleLearningManager = toggleLearningManager;
window.deleteLearningManager = deleteLearningManager;
window.updateProjectStatusManager = updateProjectStatusManager;
window.deleteProjectManager = deleteProjectManager;
window.toggleTheme = toggleTheme;
window.toggleLearningCompleteManager = toggleLearningCompleteManager;
window.addLearningManager = addLearningManager;
window.addProjectManager = addProjectManager;
window.getAllProjects = getAllProjects;
window.getAllLearnings = getAllLearnings;
window.saveProjects = saveProjects;
window.saveLearnings = saveLearnings;
window.deleteProject = deleteProject;
window.updateProjectStatus = updateProjectStatus;
window.setUnlocked = setUnlocked;
window.isUnlocked = isUnlocked;
window.reloadDataFromTxtFiles = reloadDataFromTxtFiles;
window.renderAll = renderAll;
window.renderSkillsGrids = renderSkillsGrids;
window.updateCVContent = updateCVContent;