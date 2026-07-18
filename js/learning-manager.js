// learning-manager.js - Learning management functions

// Get all learnings
function getAllLearnings() {
    try {
        const saved = localStorage.getItem('portfolio_learnings');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.log('Error loading learnings');
    }
    return null;
}

// Save learnings
function saveLearnings(learnings) {
    try {
        localStorage.setItem('portfolio_learnings', JSON.stringify(learnings));
    } catch (e) {
        console.log('Error saving learnings');
    }
}

// Get skills
function getAllSkills() {
    try {
        const saved = localStorage.getItem('portfolio_skills');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.log('Error loading skills');
    }
    return null;
}

// Save skills
function saveSkills(skills) {
    try {
        localStorage.setItem('portfolio_skills', JSON.stringify(skills));
    } catch (e) {
        console.log('Error saving skills');
    }
}

// Get skills from learnings
function getSkillsFromLearnings() {
    const learnings = getAllLearnings() || [];
    const coreSkills = [];
    const toolsSkills = [];
    
    learnings.forEach(l => {
        if (l.category === 'core') {
            coreSkills.push(l.name);
        } else if (l.category === 'tools') {
            toolsSkills.push(l.name);
        } else if (l.category === 'cert') {
            toolsSkills.push(l.name + ' (Cert)');
        }
        // Add individual skills from the skill field
        if (l.skill && l.skill !== l.name) {
            const skills = l.skill.split(',').map(s => s.trim());
            skills.forEach(s => {
                if (s && !coreSkills.includes(s) && !toolsSkills.includes(s) && s !== l.name) {
                    toolsSkills.push(s);
                }
            });
        }
    });
    
    // Remove duplicates
    return { 
        coreSkills: [...new Set(coreSkills)], 
        toolsSkills: [...new Set(toolsSkills)] 
    };
}

// Add new learning
function addLearningManager(learningData) {
    const learnings = getAllLearnings() || [];
    
    if (learnings.some(l => l.name.toLowerCase() === learningData.name.toLowerCase())) {
        return { success: false, message: '⚠️ This learning already exists!' };
    }
    
    const newLearning = {
        id: Date.now().toString(),
        name: learningData.name,
        issuer: learningData.issuer || "Self-Study",
        skill: learningData.skill || learningData.name,
        category: learningData.category || "core",
        completed: learningData.completed || false,
        icon: learningData.icon || "fa-book",
        createdAt: new Date().toISOString()
    };
    
    learnings.push(newLearning);
    saveLearnings(learnings);
    console.log('✅ Learning added:', newLearning.name);
    return { success: true, message: '✅ Learning added successfully!', learning: newLearning };
}

// Toggle learning completion
function toggleLearningCompleteManager(learningId) {
    const learnings = getAllLearnings() || [];
    const learning = learnings.find(l => l.id === learningId);
    if (learning) {
        learning.completed = !learning.completed;
        learning.updatedAt = new Date().toISOString();
        saveLearnings(learnings);
        console.log('🔄 Learning toggled:', learning.name, '->', learning.completed ? 'completed' : 'in progress');
        return { success: true, message: learning.completed ? '✅ Marked as completed!' : '🔄 Marked as in progress!' };
    }
    return { success: false, message: '❌ Learning not found' };
}

// Delete learning
function deleteLearningManager(learningId) {
    let learnings = getAllLearnings() || [];
    const learning = learnings.find(l => l.id === learningId);
    learnings = learnings.filter(l => l.id !== learningId);
    saveLearnings(learnings);
    console.log('🗑️ Learning deleted:', learning ? learning.name : 'unknown');
    return { success: true, message: '✅ Learning deleted!' };
}

// Get learning statistics
function getLearningStats() {
    const learnings = getAllLearnings() || [];
    return {
        total: learnings.length,
        completed: learnings.filter(l => l.completed).length,
        inProgress: learnings.filter(l => !l.completed).length,
        byCategory: {
            core: learnings.filter(l => l.category === 'core').length,
            tools: learnings.filter(l => l.category === 'tools').length,
            cert: learnings.filter(l => l.category === 'cert').length
        }
    };
}

// Render learnings grid
function renderLearningsGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Container not found:', containerId);
        return;
    }
    
    const learnings = getAllLearnings() || [];
    if (learnings.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1; text-align: center; padding: 2rem;">No learnings available.</p>';
        return;
    }

    const grouped = groupLearningsByMajorArea(learnings);
    const unlocked = typeof isUnlocked !== 'undefined' ? isUnlocked : false;
    const featured = containerId === 'featuredLearningsGrid';

    let html = '';
    Object.entries(grouped).forEach(([groupName, items]) => {
        const visibleItems = featured ? items.slice(0, 3) : items;
        if (!visibleItems.length) return;

        html += `
            <div class="learning-group-card" style="grid-column: 1 / -1; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 18px; padding: 1rem 1.1rem; margin-bottom: 0.8rem; box-shadow: 0 2px 8px var(--shadow);">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.75rem;">
                    <h3 style="margin:0; font-size:1rem; color:var(--text-primary);">${groupName}</h3>
                    <span class="course-badge">${visibleItems.length} topics</span>
                </div>
                <div style="display:grid; gap:0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                    ${visibleItems.map(l => `
                        <div class="course-card ${l.completed ? 'completed' : ''}" style="margin:0; min-height:100%;">
                            <div class="course-img" style="display:flex; align-items:center; justify-content:center; background: var(--accent-soft); height: 110px;">
                                <i class="fas ${l.icon || 'fa-book'}" style="font-size: 2.6rem; color: var(--accent);"></i>
                            </div>
                            <div class="course-info">
                                <div class="course-header">
                                    <h3>${l.name}</h3>
                                    <span class="course-status ${l.completed ? 'completed' : 'in-progress'}">
                                        ${l.completed ? '✅ Done' : '🔄 In Progress'}
                                    </span>
                                </div>
                                <p style="font-size:0.8rem; color: var(--text-muted); margin-top:0.35rem;">${l.roadmapSubgroup || l.skill || l.name}</p>
                                ${unlocked ? `
                                    <div class="course-actions management-controls" style="display:flex; gap:5px; flex-wrap:wrap; margin-top:10px;">
                                        <button class="btn btn-sm ${l.completed ? 'btn-outline' : 'btn-primary'}" onclick="toggleLearningManager('${l.id}')">
                                            ${l.completed ? 'Mark Incomplete' : '✅ Mark Complete'}
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteLearningManager('${l.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html || '<p style="color: var(--text-muted); grid-column: 1 / -1; text-align: center; padding: 2rem;">No learnings available.</p>';
}

function groupLearningsByMajorArea(learnings) {
    const roadmapGroups = {};

    learnings.forEach((learning) => {
        const groupName = learning.roadmapGroup || 'Learning Roadmap';
        if (!roadmapGroups[groupName]) roadmapGroups[groupName] = [];
        roadmapGroups[groupName].push(learning);
    });

    if (Object.keys(roadmapGroups).length) {
        return roadmapGroups;
    }

    const groups = {
        'Full Stack Development': [],
        'Backend Development': [],
        'Frontend Development': [],
        'Programming Languages': [],
        'Data Science & AI': [],
        'Database & Cloud': [],
        'Tools & DevOps': [],
        'Mobile & UI': []
    };

    const normalize = (value = '') => value.toLowerCase();

    learnings.forEach((learning) => {
        const name = learning.name || '';
        const lower = normalize(name);
        let group = 'Tools & DevOps';

        if (/(java|spring|jpa|hibernate|servlet|jsp|jdbc)/i.test(lower) || /(backend|api|rest|microservice)/i.test(lower)) {
            group = 'Backend Development';
        } else if (/(react|next|javascript|html|css|tailwind|bootstrap|vue|svelte|frontend|ui|ux)/i.test(lower)) {
            group = 'Frontend Development';
        } else if (/(python|tkinter|pyqt|fastapi|flask|django|pandas|numpy|matplotlib|seaborn|plotly|scikit|tensorflow|jupyter|selenium|beautifulsoup|scraping)/i.test(lower)) {
            group = 'Programming Languages';
        } else if (/(ai|machine learning|ml|data science|nlp|opencv|chatgpt|prompt|vision|tensorflow|pytorch|llm)/i.test(lower)) {
            group = 'Data Science & AI';
        } else if (/(database|sql|postgres|oracle|mongodb|sqlite|cloud|aws|azure|gcp|docker|kubernetes|devops|git|github|jenkins|prometheus|grafana|linux|shell)/i.test(lower)) {
            group = 'Database & Cloud';
        } else if (/(mobile|android|ios|flutter|react native|kotlin|swift|mobile)/i.test(lower)) {
            group = 'Mobile & UI';
        } else if (/(full stack|full-stack|web development|certification|certificate)/i.test(lower)) {
            group = 'Full Stack Development';
        }

        if (!groups[group]) groups[group] = [];
        groups[group].push(learning);
    });

    return Object.fromEntries(Object.entries(groups).filter(([, items]) => items.length));
}

// Global functions for onclick
function toggleLearningManager(id) {
    const result = toggleLearningCompleteManager(id);
    showToastManager(result.message);
    if (result.success) {
        renderLearningsGrid('coursesGrid');
        renderLearningsGrid('featuredLearningsGrid');
        updateLearningStats();
        updateHomePage();
    }
}

function deleteLearningManager(id) {
    if (confirm('Are you sure you want to delete this learning?')) {
        const result = deleteLearningManager(id);
        showToastManager(result.message);
        if (result.success) {
            renderLearningsGrid('coursesGrid');
            renderLearningsGrid('featuredLearningsGrid');
            updateLearningStats();
            updateHomePage();
        }
    }
}

// Update learning stats
function updateLearningStats() {
    const stats = getLearningStats();
    const statsContainer = document.getElementById('learningStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Total Topics</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #22c55e;">${stats.completed}</div>
                <div class="stat-label">✅ Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #eab308;">${stats.inProgress}</div>
                <div class="stat-label">🔄 In Progress</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: var(--accent);">${stats.byCategory.core}</div>
                <div class="stat-label">Core Skills</div>
            </div>
        `;
    }
}

// Update home page
function updateHomePage() {
    const learnings = getAllLearnings() || [];
    const completed = learnings.filter(l => l.completed).length;
    const inProgress = learnings.filter(l => !l.completed).length;
    const total = learnings.length;

    const projects = getAllProjects() || [];
    const projectStats = {
        total: projects.length,
        inProgress: projects.filter(p => p.status === 'in-progress').length
    };

    const learningSummary = document.getElementById('homeLearningSummary');
    if (learningSummary) {
        const recent = learnings.filter(l => !l.completed).slice(0, 3).map(l => l.name).join(', ')
            || learnings.slice(-3).map(l => l.name).join(', ');
        if (total > 0) {
            learningSummary.textContent = `Self-Study: ${completed}/${total} completed • ${inProgress} in progress • ${projectStats.inProgress} projects in progress`;
            if (recent) {
                learningSummary.textContent += ` • Recent: ${recent}`;
            }
        } else {
            learningSummary.textContent = `Self-Study: Add learnings to track your progress`;
        }
    }

    const footerSmall = document.querySelector('.footer-small');
    if (footerSmall && projectStats.total > 0) {
        footerSmall.textContent = `${projectStats.total} Projects | Full-Stack Developer | UET Taxila`;
    }
    
    // Update core strengths
    const coreStrengths = document.getElementById('homeCoreStrengths');
    if (coreStrengths) {
        const skills = getSkillsFromLearnings();
        const allSkills = [...skills.coreSkills, ...skills.toolsSkills];
        if (allSkills.length > 0) {
            coreStrengths.textContent = allSkills.slice(0, 12).join(', ') + (allSkills.length > 12 ? '...' : '');
        } else {
            coreStrengths.textContent = 'Add learnings to see your skills';
        }
    }
}

// Make functions globally available
window.getAllLearnings = getAllLearnings;
window.saveLearnings = saveLearnings;
window.addLearningManager = addLearningManager;
window.toggleLearningCompleteManager = toggleLearningCompleteManager;
window.deleteLearningManager = deleteLearningManager;
window.getLearningStats = getLearningStats;
window.updateLearningStats = updateLearningStats;
window.renderLearningsGrid = renderLearningsGrid;
window.toggleLearningManager = toggleLearningManager;
window.getSkillsFromLearnings = getSkillsFromLearnings;
window.updateHomePage = updateHomePage;