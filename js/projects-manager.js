// projects-manager.js - Project management functions

// Get all projects
function getAllProjects() {
    try {
        const saved = localStorage.getItem('portfolio_projects');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.log('Error loading projects');
    }
    return null;
}

// Save projects
function saveProjects(projects) {
    try {
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
    } catch (e) {
        console.log('Error saving projects');
    }
}

// Add new project
function addProjectManager(projectData) {
    const projects = getAllProjects() || [];
    
    // Check if project exists
    if (projects.some(p => p.name.toLowerCase() === projectData.name.toLowerCase())) {
        return { success: false, message: '⚠️ Project already exists!' };
    }
    
    const newProject = {
        id: Date.now().toString(),
        name: projectData.name,
        tech: projectData.tech || [],
        desc: projectData.desc || "",
        icon: projectData.icon || "fa-code",
        status: projectData.status || "not-started",
        isCustom: true,
        createdAt: new Date().toISOString()
    };
    
    projects.push(newProject);
    saveProjects(projects);
    console.log('✅ Project added:', newProject.name);
    return { success: true, message: '✅ Project added successfully!', project: newProject };
}

// Update project status
function updateProjectStatus(projectId, newStatus) {
    const projects = getAllProjects() || [];
    const project = projects.find(p => p.id === projectId);
    if (project) {
        project.status = newStatus;
        project.updatedAt = new Date().toISOString();
        saveProjects(projects);
        console.log('🔄 Project status updated:', project.name, '->', newStatus);
        return { success: true, message: '✅ Status updated!' };
    }
    return { success: false, message: '❌ Project not found' };
}

// Delete project
function deleteProject(projectId) {
    let projects = getAllProjects() || [];
    const project = projects.find(p => p.id === projectId);
    projects = projects.filter(p => p.id !== projectId);
    saveProjects(projects);
    console.log('🗑️ Project deleted:', project ? project.name : 'unknown');
    return { success: true, message: '✅ Project deleted!' };
}

// Get projects by status
function getProjectsByStatus(status) {
    const projects = getAllProjects() || [];
    return projects.filter(p => p.status === status);
}

// Get project statistics
function getProjectStats() {
    const projects = getAllProjects() || [];
    return {
        total: projects.length,
        completed: projects.filter(p => p.status === 'completed').length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        notStarted: projects.filter(p => p.status === 'not-started').length
    };
}

// Render projects grid
function renderProjectsGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Container not found:', containerId);
        return;
    }
    
    let projects = getAllProjects() || [];

    if (projects.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1; text-align: center; padding: 2rem;">No projects available.</p>';
        return;
    }

    const sortedProjects = [...projects].sort((a, b) => {
        const order = { 'completed': 0, 'in-progress': 1, 'not-started': 2 };
        return (order[a.status] || 3) - (order[b.status] || 3);
    });

    let displayProjects = sortedProjects;
    if (containerId === 'featuredProjectsGrid') {
        displayProjects = sortedProjects.slice(0, 6);
    }
    
    // Check if unlocked for showing management controls
    const unlocked = typeof isUnlocked !== 'undefined' ? isUnlocked : false;
    
    container.innerHTML = displayProjects.map(proj => `
        <div class="project-card ${proj.status}">
            <div class="project-icon"><i class="fas ${proj.icon || 'fa-code'}"></i></div>
            <h3>${proj.name}</h3>
            <div class="tech-stack">${(proj.tech || []).map(t => `<span class="tech-badge">${t}</span>`).join('')}</div>
            <p>${proj.desc || 'No description provided'}</p>
            <div class="project-status">
                <span class="status-badge status-${proj.status}">${formatStatus(proj.status)}</span>
                ${unlocked ? `
                    <div class="management-controls" style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <select class="status-select" onchange="updateProjectStatusManager('${proj.id}', this.value)">
                            <option value="not-started" ${proj.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                            <option value="in-progress" ${proj.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${proj.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        ${proj.isCustom ? `<button class="btn btn-sm btn-danger" onclick="deleteProjectManager('${proj.id}')"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Format status
function formatStatus(status) {
    const labels = {
        'completed': '✅ Completed',
        'in-progress': '🔄 In Progress',
        'not-started': '⏳ Not Started'
    };
    return labels[status] || status;
}

// Update project status (global function for onclick)
function updateProjectStatusManager(id, status) {
    const result = updateProjectStatus(id, status);
    showToastManager(result.message);
    if (result.success) {
        renderProjectsGrid('allProjectsGrid');
        renderProjectsGrid('featuredProjectsGrid');
        updateProjectStats();
        updateHomePage();
    }
}

// Delete project (global function for onclick)
function deleteProjectManager(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        const result = deleteProject(id);
        showToastManager(result.message);
        if (result.success) {
            renderProjectsGrid('allProjectsGrid');
            renderProjectsGrid('featuredProjectsGrid');
            updateProjectStats();
            updateHomePage();
        }
    }
}

// Update project stats
function updateProjectStats() {
    const stats = getProjectStats();
    const statsContainer = document.getElementById('projectStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Total Projects</div>
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
                <div class="stat-number" style="color: #6b7280;">${stats.notStarted}</div>
                <div class="stat-label">⏳ Not Started</div>
            </div>
        `;
    }
}

// Make functions globally available
window.getAllProjects = getAllProjects;
window.saveProjects = saveProjects;
window.addProjectManager = addProjectManager;
window.updateProjectStatus = updateProjectStatus;
window.deleteProject = deleteProject;
window.updateProjectStatusManager = updateProjectStatusManager;
window.deleteProjectManager = deleteProjectManager;
window.getProjectStats = getProjectStats;
window.updateProjectStats = updateProjectStats;
window.renderProjectsGrid = renderProjectsGrid;