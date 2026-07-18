// file-importer.js - Parse txt/all_projects.txt and txt/all_learnings.txt
//
// To change the text file format later, edit parseProjectsFile() and
// parseLearningsFile() below. Fetching is handled in data-loader.js.

function parseStatusLine(line) {
    const match = line.match(/^Status:\s*(completed|in-progress|not-started)/i);
    return match ? match[1].toLowerCase() : null;
}

function statusToCompleted(status) {
    return status === 'completed';
}

function inferCategoryFromSection(sectionName) {
    const lower = sectionName.toLowerCase();
    if (lower.includes('certification') || lower.includes('cert')) return 'cert';
    if (lower.includes('core') || lower.includes('programming') || lower.includes('development') ||
        lower.includes('backend') || lower.includes('frontend') || lower.includes('database') ||
        lower.includes('java') || lower.includes('python') || lower.includes('c++') ||
        lower.includes('web development') || lower.includes('software') || 
        lower.includes('data science') || lower.includes('machine learning')) {
        return 'core';
    }
    if (lower.includes('devops') || lower.includes('tools') || lower.includes('cloud') ||
        lower.includes('container') || lower.includes('ci/cd') || lower.includes('monitoring') ||
        lower.includes('automation') || lower.includes('testing') || lower.includes('library')) {
        return 'tools';
    }
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios') || 
        lower.includes('react native') || lower.includes('flutter') || lower.includes('swift') ||
        lower.includes('kotlin')) {
        return 'mobile';
    }
    return 'tools';
}

function getIconForProject(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('ecommerce') || nameLower.includes('shop') || nameLower.includes('store') || nameLower.includes('buy')) return 'fa-store';
    if (nameLower.includes('social') || nameLower.includes('chat') || nameLower.includes('message') || nameLower.includes('media')) return 'fa-comments';
    if (nameLower.includes('pos') || nameLower.includes('sale') || nameLower.includes('billing') || nameLower.includes('invoice')) return 'fa-receipt';
    if (nameLower.includes('university') || nameLower.includes('school') || nameLower.includes('education') || nameLower.includes('campus') || nameLower.includes('college')) return 'fa-university';
    if (nameLower.includes('portfolio') || nameLower.includes('website') || nameLower.includes('blog')) return 'fa-globe';
    if (nameLower.includes('data') || nameLower.includes('visual') || nameLower.includes('dashboard') || nameLower.includes('analytics') || nameLower.includes('analyzer')) return 'fa-chart-bar';
    if (nameLower.includes('media') || nameLower.includes('music') || nameLower.includes('player') || nameLower.includes('stream')) return 'fa-music';
    if (nameLower.includes('voice') || nameLower.includes('assistant') || nameLower.includes('jarvis') || nameLower.includes('ai') || nameLower.includes('chatbot')) return 'fa-microphone';
    if (nameLower.includes('secure') || nameLower.includes('vault') || nameLower.includes('encrypt') || nameLower.includes('password')) return 'fa-lock';
    if (nameLower.includes('health') || nameLower.includes('medical') || nameLower.includes('patient') || nameLower.includes('fit') || nameLower.includes('track')) return 'fa-heartbeat';
    if (nameLower.includes('travel') || nameLower.includes('trip') || nameLower.includes('tour') || nameLower.includes('buddy')) return 'fa-plane';
    if (nameLower.includes('bank') || nameLower.includes('finance') || nameLower.includes('expense') || nameLower.includes('budget')) return 'fa-money-bill-wave';
    if (nameLower.includes('hotel') || nameLower.includes('hospitality')) return 'fa-hotel';
    if (nameLower.includes('library') || nameLower.includes('book') || nameLower.includes('nest')) return 'fa-book';
    if (nameLower.includes('game') || nameLower.includes('pixel') || nameLower.includes('playground')) return 'fa-gamepad';
    if (nameLower.includes('quiz') || nameLower.includes('exam') || nameLower.includes('assessment')) return 'fa-tasks';
    if (nameLower.includes('url') || nameLower.includes('link') || nameLower.includes('shortener')) return 'fa-link';
    if (nameLower.includes('stock') || nameLower.includes('market') || nameLower.includes('trading')) return 'fa-chart-line';
    if (nameLower.includes('inventory') || nameLower.includes('warehouse')) return 'fa-boxes';
    if (nameLower.includes('lab') || nameLower.includes('science')) return 'fa-flask';
    if (nameLower.includes('mail') || nameLower.includes('email')) return 'fa-envelope';
    if (nameLower.includes('code') || nameLower.includes('snippet')) return 'fa-code';
    if (nameLower.includes('contact') || nameLower.includes('address')) return 'fa-address-book';
    if (nameLower.includes('calculator') || nameLower.includes('math')) return 'fa-calculator';
    if (nameLower.includes('weather') || nameLower.includes('forecast')) return 'fa-cloud-sun';
    if (nameLower.includes('organizer') || nameLower.includes('file')) return 'fa-folder-open';
    if (nameLower.includes('recipe') || nameLower.includes('cook')) return 'fa-utensils';
    if (nameLower.includes('event') || nameLower.includes('ticket')) return 'fa-calendar-alt';
    if (nameLower.includes('translate') || nameLower.includes('language')) return 'fa-language';
    if (nameLower.includes('vulnerability') || nameLower.includes('scan') || nameLower.includes('security')) return 'fa-shield-alt';
    if (nameLower.includes('monitor') || nameLower.includes('system')) return 'fa-desktop';
    return 'fa-code';
}

// Parse projects from all_projects.txt
function parseProjectsFile(text) {
    const lines = text.split('\n');
    const projects = [];
    let currentProject = null;
    let inDescription = false;
    let descriptionLines = [];
    let isProjectSection = false;

    console.log('📝 Parsing projects file...');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line === '---' || line === '==========') continue;

        if (/^PROJECTS?$/i.test(line)) {
            isProjectSection = true;
            console.log('📂 Found projects section');
            continue;
        }

        if (!isProjectSection) continue;

        // Match project line: optional emoji/prefix + number + dot + name
        // Examples: "🛒 1. BuyNest - E-Commerce Platform" or "1. My Project"
        const projectMatch = line.match(/^(.+?\s+)?(\d+)\.\s*(.+)$/);
        
        if (projectMatch) {
            if (currentProject && currentProject.name) {
                if (descriptionLines.length > 0) {
                    currentProject.desc = descriptionLines.join(' ').trim();
                    descriptionLines = [];
                }
                projects.push(currentProject);
                console.log('📌 Found project:', currentProject.name);
            }

            const projectName = projectMatch[3].trim();
            currentProject = {
                name: projectName,
                tech: [],
                desc: '',
                icon: getIconForProject(projectName),
                status: 'not-started',
                isCustom: true,
                id: 'project_' + Date.now() + '_' + (projects.length + 1)
            };
            inDescription = false;
            descriptionLines = [];
            continue;
        }

        if (!currentProject) continue;

        const status = parseStatusLine(line);
        if (status) {
            currentProject.status = status;
            console.log('  Status:', status);
            continue;
        }

        const techMatch = line.match(/^(🧰|🔧|💻|Technologies|Tech Stack|Tech|Stack|Used|Tools)[:]?\s*(.+)/i);
        if (techMatch) {
            const techStr = techMatch[2] || '';
            currentProject.tech = techStr.split(/[,|•\-]\s*/).map(t => t.trim()).filter(Boolean);
            console.log('  Tech:', currentProject.tech);
            inDescription = false;
            continue;
        }

        const descMatch = line.match(/^(📌|Description|About|Details|Features|📝)[:]?\s*(.*)/i);
        if (descMatch) {
            inDescription = true;
            if (descMatch[2]) descriptionLines.push(descMatch[2]);
            continue;
        }

        if (inDescription) {
            descriptionLines.push(line);
        }
    }

    if (currentProject && currentProject.name) {
        if (descriptionLines.length > 0) {
            currentProject.desc = descriptionLines.join(' ').trim();
        }
        projects.push(currentProject);
        console.log('📌 Found project:', currentProject.name);
    }

    console.log('✅ Parsed', projects.length, 'projects');
    return projects;
}

// Parse learnings from all_learnings.txt
function parseLearningsFile(text) {
    const lines = text.split(/\r?\n/);
    const learnings = [];
    let currentSection = '';
    let currentCategory = 'core';
    let currentRoadmapGroup = '';
    let currentRoadmapSubgroup = '';
    let pendingLearning = null;
    let isLearningSection = false;

    console.log('📝 Parsing learnings file...');

    function flushLearning() {
        if (pendingLearning && pendingLearning.name) {
            learnings.push(pendingLearning);
            console.log('📖 Found learning:', pendingLearning.name);
            pendingLearning = null;
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line === '---' || line === '==========') {
            if (line === '---') {
                currentRoadmapSubgroup = '';
            }
            continue;
        }

        const looksLikeLearningRoadmap = /^LEARNINGS?$/i.test(line) || /learning roadmap/i.test(line) || (/^#{1,3}\s*/.test(line) && /learning/i.test(line));

        if (!isLearningSection && !looksLikeLearningRoadmap) {
            continue;
        }

        if (!isLearningSection) {
            isLearningSection = true;
            console.log('📂 Found learnings section');
        }

        const headingMatch = line.match(/^(#{1,3})\s*(.+)$/);
        if (headingMatch) {
            flushLearning();
            const headingLevel = headingMatch[1].length;
            const headingText = headingMatch[2].trim();

            if (headingLevel === 2) {
                currentRoadmapGroup = headingText;
                currentRoadmapSubgroup = '';
                currentSection = headingText;
                currentCategory = inferCategoryFromSection(currentSection);
                console.log('🗂️ Roadmap Group:', currentRoadmapGroup);
            } else if (headingLevel === 3) {
                currentRoadmapSubgroup = headingText;
                currentSection = headingText;
                currentCategory = inferCategoryFromSection(currentSection);
                console.log('🗂️ Roadmap Subgroup:', currentRoadmapSubgroup);
            }
            continue;
        }

        const bulletMatch = line.match(/^[-*•]\s*(.+)$/);
        if (bulletMatch) {
            flushLearning();
            const name = bulletMatch[1].trim();
            const statusMatch = name.match(/^(.*?)\s*Status:\s*(completed|in-progress|not-started)/i);
            let finalName = name;
            let status = null;

            if (statusMatch) {
                finalName = statusMatch[1].trim();
                status = statusMatch[2].toLowerCase();
            }

            pendingLearning = {
                name: finalName,
                issuer: 'Self-Study',
                skill: finalName,
                category: currentCategory,
                completed: status === 'completed',
                icon: 'fa-book',
                roadmapGroup: currentRoadmapGroup || currentSection || 'Learning Roadmap',
                roadmapSubgroup: currentRoadmapSubgroup || '',
                id: 'learning_' + Date.now() + '_' + (learnings.length + 1)
            };
            continue;
        }

        const sectionMatch = line.match(/^📚\s*(.+)/);
        if (sectionMatch) {
            flushLearning();
            currentSection = sectionMatch[1].trim();
            currentCategory = inferCategoryFromSection(currentSection);
            currentRoadmapGroup = currentSection;
            currentRoadmapSubgroup = '';
            console.log('📂 Section:', currentSection, '-> Category:', currentCategory);
            continue;
        }

        const itemMatch = line.match(/^📖\s*(.+)/);
        if (itemMatch) {
            flushLearning();
            const name = itemMatch[1].trim();
            const statusMatch = name.match(/^(.*?)\s*Status:\s*(completed|in-progress|not-started)/i);
            let finalName = name;
            let status = null;

            if (statusMatch) {
                finalName = statusMatch[1].trim();
                status = statusMatch[2].toLowerCase();
            }

            pendingLearning = {
                name: finalName,
                issuer: 'Self-Study',
                skill: finalName,
                category: currentCategory,
                completed: status === 'completed',
                icon: 'fa-book',
                roadmapGroup: currentRoadmapGroup || currentSection || 'Learning Roadmap',
                roadmapSubgroup: currentRoadmapSubgroup || '',
                id: 'learning_' + Date.now() + '_' + (learnings.length + 1)
            };

            if (status) {
                console.log('  Status:', status);
            }
            continue;
        }

        if (pendingLearning) {
            const status = parseStatusLine(line);
            if (status) {
                pendingLearning.completed = statusToCompleted(status);
                console.log('  Status:', status, '-> Completed:', pendingLearning.completed);
                continue;
            }

            const issuerMatch = line.match(/^Issuer:|^By:|^Provider:|^Author:/i);
            if (issuerMatch) {
                const parts = line.split(':');
                if (parts.length > 1) {
                    pendingLearning.issuer = parts.slice(1).join(':').trim();
                }
                continue;
            }

            const skillMatch = line.match(/^Skill:|^Details:|^Topics:|^Technologies:/i);
            if (skillMatch) {
                const parts = line.split(':');
                if (parts.length > 1) {
                    pendingLearning.skill = parts.slice(1).join(':').trim();
                }
                continue;
            }
        }
    }

    flushLearning();
    console.log('✅ Parsed', learnings.length, 'learnings');
    return learnings;
}

function syncProjectsFromText(text, options) {
    const replace = options && options.replace;
    const projects = parseProjectsFile(text);

    console.log('🔄 Syncing projects (replace:', replace, ')');

    if (replace) {
        const projectsWithIds = projects.map((p, index) => ({
            ...p,
            id: p.id || 'project_' + Date.now() + '_' + index
        }));
        saveProjects(projectsWithIds);
        console.log('✅ Replaced with', projectsWithIds.length, 'projects');
        return { added: projectsWithIds.length, updated: 0, total: projectsWithIds.length };
    }

    const existing = getAllProjects() || [];
    const map = new Map(existing.map(p => [p.name.toLowerCase(), p]));
    let added = 0;
    let updated = 0;

    projects.forEach(proj => {
        const key = proj.name.toLowerCase();
        if (map.has(key)) {
            const item = map.get(key);
            if (proj.tech.length) item.tech = proj.tech;
            if (proj.desc) item.desc = proj.desc;
            item.status = proj.status;
            item.icon = proj.icon;
            updated++;
        } else {
            proj.id = proj.id || 'project_' + Date.now() + '_' + added;
            map.set(key, proj);
            added++;
        }
    });

    saveProjects(Array.from(map.values()));
    console.log('✅ Added', added, 'updated', updated, 'total', projects.length);
    return { added, updated, total: projects.length };
}

function syncLearningsFromText(text, options) {
    const replace = options && options.replace;
    const learnings = parseLearningsFile(text);

    console.log('🔄 Syncing learnings (replace:', replace, ')');

    if (replace) {
        const learningsWithIds = learnings.map((l, index) => ({
            ...l,
            id: l.id || 'learning_' + Date.now() + '_' + index
        }));
        saveLearnings(learningsWithIds);
        console.log('✅ Replaced with', learningsWithIds.length, 'learnings');
        return { added: learningsWithIds.length, updated: 0, total: learningsWithIds.length };
    }

    const existing = getAllLearnings() || [];
    const map = new Map(existing.map(l => [l.name.toLowerCase(), l]));
    let added = 0;
    let updated = 0;

    learnings.forEach(l => {
        const key = l.name.toLowerCase();
        if (map.has(key)) {
            const item = map.get(key);
            item.completed = l.completed;
            item.category = l.category;
            item.skill = l.skill;
            item.issuer = l.issuer;
            updated++;
        } else {
            l.id = l.id || 'learning_' + Date.now() + '_' + added;
            map.set(key, l);
            added++;
        }
    });

    saveLearnings(Array.from(map.values()));
    console.log('✅ Added', added, 'updated', updated, 'total', learnings.length);
    return { added, updated, total: learnings.length };
}

function setupFileImporter(containerId, importButtonId, fileInputId, messageId, type) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Container not found:', containerId);
        return;
    }

    if (document.getElementById(fileInputId)) {
        console.log('File importer already exists');
        return;
    }

    const importHTML = `
        <div class="file-import-area" style="margin-top: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 12px; border: 2px dashed var(--border-color);">
            <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <button class="btn btn-primary" id="${importButtonId}">
                    <i class="fas fa-file-import"></i> Choose ${type === 'learning' ? 'Learnings' : 'Projects'} File
                </button>
                <input type="file" id="${fileInputId}" accept=".txt,.md" style="display: none;" />
                <span style="font-size: 0.85rem; color: var(--text-muted);">
                    <i class="fas fa-info-circle"></i> Import .txt or .md files
                </span>
            </div>
            <div id="${messageId}" style="margin-top: 0.5rem; font-size: 0.9rem;"></div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', importHTML);

    const importBtn = document.getElementById(importButtonId);
    const fileInput = document.getElementById(fileInputId);
    const messageEl = document.getElementById(messageId);

    if (importBtn && fileInput) {
        importBtn.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (messageEl) {
                messageEl.textContent = '⏳ Processing file...';
                messageEl.style.color = '#eab308';
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                let result;
                if (type === 'learning') {
                    result = syncLearningsFromText(text, { replace: true });
                } else {
                    result = syncProjectsFromText(text, { replace: true });
                }

                let msg = type === 'learning'
                    ? `✅ Imported ${result.added} learnings`
                    : `✅ Imported ${result.added} projects`;

                if (messageEl) {
                    messageEl.textContent = msg;
                    messageEl.style.color = '#22c55e';
                }

                if (typeof renderAll === 'function') {
                    setTimeout(() => {
                        renderAll();
                        if (typeof updateLearningStats === 'function') updateLearningStats();
                        if (typeof updateProjectStats === 'function') updateProjectStats();
                        if (typeof updateHomePage === 'function') updateHomePage();
                        if (typeof renderSkillsGrids === 'function') renderSkillsGrids();
                        if (typeof updateCVContent === 'function') updateCVContent();
                    }, 200);
                }
                if (typeof showToastManager === 'function') {
                    showToastManager(msg);
                }
                fileInput.value = '';
            };
            reader.onerror = function() {
                if (messageEl) {
                    messageEl.textContent = '❌ Failed to read file';
                    messageEl.style.color = '#ef4444';
                }
            };
            reader.readAsText(file);
        });
    }
}

// Make functions globally available
window.syncProjectsFromText = syncProjectsFromText;
window.syncLearningsFromText = syncLearningsFromText;
window.setupFileImporter = setupFileImporter;
window.parseProjectsFile = parseProjectsFile;
window.parseLearningsFile = parseLearningsFile;
window.getIconForProject = getIconForProject;