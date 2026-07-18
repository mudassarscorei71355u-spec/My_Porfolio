// manager.js - Management functions for Projects and Learning

// Password management
const DEFAULT_PASSWORD = "Dany@3655";
let currentPassword = DEFAULT_PASSWORD;
let isUnlocked = false;

// Verify password
function verifyPassword(input) {
    return input === currentPassword;
}

// Change password
function changePassword(oldPass, newPass, repeatPass) {
    if (oldPass !== currentPassword) {
        return { success: false, message: '❌ Old password is incorrect' };
    }
    if (newPass.length < 6) {
        return { success: false, message: '❌ New password must be at least 6 characters' };
    }
    if (newPass !== repeatPass) {
        return { success: false, message: '❌ Passwords do not match' };
    }
    currentPassword = newPass;
    saveManagerState();
    return { success: true, message: '✅ Password changed successfully!' };
}

// Load manager state
function loadManagerState() {
    try {
        const saved = localStorage.getItem('portfolio_manager_state');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.password) currentPassword = data.password;
            if (data.isUnlocked !== undefined) isUnlocked = data.isUnlocked;
            return data;
        }
    } catch (e) {
        console.log('No saved state');
    }
    return null;
}

// Save manager state
function saveManagerState() {
    try {
        localStorage.setItem('portfolio_manager_state', JSON.stringify({
            password: currentPassword,
            isUnlocked: isUnlocked
        }));
    } catch (e) {
        console.log('Error saving state');
    }
}

// Check if unlocked
function checkUnlocked() {
    return isUnlocked;
}

// Set unlocked status
function setUnlocked(status) {
    isUnlocked = status;
    saveManagerState();
    renderManagementUI();
    updateLockStatus();
    // Show/hide add forms on homepage
    updateHomepageForms();
    console.log('🔓 Unlock status:', isUnlocked ? 'Unlocked' : 'Locked');
}

// Update homepage forms visibility
function updateHomepageForms() {
    const addLearningForm = document.getElementById('addLearningForm');
    const addProjectForm = document.getElementById('addProjectForm');
    const passwordForm = document.getElementById('passwordForm');
    const unlockedStatus = document.getElementById('unlockedStatus');

    if (isUnlocked) {
        if (addLearningForm) addLearningForm.style.display = 'block';
        if (addProjectForm) addProjectForm.style.display = 'block';
        if (passwordForm) passwordForm.style.display = 'none';
        if (unlockedStatus) unlockedStatus.style.display = 'block';
    } else {
        if (addLearningForm) addLearningForm.style.display = 'none';
        if (addProjectForm) addProjectForm.style.display = 'none';
        if (passwordForm) passwordForm.style.display = 'block';
        if (unlockedStatus) unlockedStatus.style.display = 'none';
    }
}

// Show toast message
function showToastManager(message) {
    const toast = document.getElementById('customToast');
    if (toast) {
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        // Clear any existing timeout
        if (window.toastTimeout) {
            clearTimeout(window.toastTimeout);
        }
        window.toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2500);
    } else {
        // Fallback alert if toast doesn't exist
        console.log('Toast:', message);
    }
}

// Render management UI based on unlock status
function renderManagementUI() {
    // For homepage management controls
    const managementElements = document.querySelectorAll('.management-controls');
    managementElements.forEach(el => {
        if (isUnlocked) {
            el.style.display = 'flex';
            el.classList.add('visible');
        } else {
            el.style.display = 'none';
            el.classList.remove('visible');
        }
    });
    
    // For project page controls
    const projectControls = document.getElementById('projectManagementControls');
    if (projectControls) {
        projectControls.style.display = isUnlocked ? 'flex' : 'none';
    }
    
    // For learning page controls
    const learningControls = document.getElementById('learningManagementControls');
    if (learningControls) {
        learningControls.style.display = isUnlocked ? 'flex' : 'none';
    }
    
    // Update lock status display
    updateLockStatus();
    // Update homepage forms
    updateHomepageForms();
}

// Update lock status
function updateLockStatus() {
    const lockStatuses = document.querySelectorAll('.lock-status');
    lockStatuses.forEach(el => {
        el.textContent = isUnlocked ? '🔓 Unlocked' : '🔒 Locked';
        el.style.color = isUnlocked ? '#22c55e' : '#ef4444';
    });
    
    // Also handle the homepage unlock status
    const unlockedStatus = document.getElementById('unlockedStatus');
    if (unlockedStatus) {
        unlockedStatus.style.display = isUnlocked ? 'block' : 'none';
    }
}

// Make functions globally available
window.verifyPassword = verifyPassword;
window.changePassword = changePassword;
window.setUnlocked = setUnlocked;
window.isUnlocked = isUnlocked;
window.renderManagementUI = renderManagementUI;
window.updateLockStatus = updateLockStatus;
window.updateHomepageForms = updateHomepageForms;
window.showToastManager = showToastManager;
window.loadManagerState = loadManagerState;
window.saveManagerState = saveManagerState;