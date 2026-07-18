// certificate-manager.js - Certificate management functions

// ========== DATA MANAGEMENT ==========

// Get all certificates
function getAllCertificates() {
    try {
        const saved = localStorage.getItem('portfolio_certificates');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.log('Error loading certificates');
    }
    return [];
}

// Save certificates
function saveCertificates(certificates) {
    try {
        localStorage.setItem('portfolio_certificates', JSON.stringify(certificates));
    } catch (e) {
        console.log('Error saving certificates');
    }
}

function readImageFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve('');
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result || '');
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
    });
}

function getCertificateImageValue(imageInput, pathInput) {
    return new Promise(async (resolve) => {
        let imageValue = '';
        if (imageInput && imageInput.files && imageInput.files[0]) {
            try {
                imageValue = await readImageFileAsDataURL(imageInput.files[0]);
            } catch (e) {
                imageValue = '';
            }
        }

        if (!imageValue && pathInput && pathInput.value && pathInput.value.trim()) {
            imageValue = pathInput.value.trim();
        }

        resolve(imageValue);
    });
}

// ========== CRUD OPERATIONS ==========

// Add new certificate
function addCertificate(certificateData) {
    const certificates = getAllCertificates();
    
    // Check if certificate exists
    if (certificates.some(c => c.name.toLowerCase() === certificateData.name.toLowerCase())) {
        return { success: false, message: '⚠️ Certificate already exists!' };
    }
    
    const newCertificate = {
        id: Date.now().toString(),
        name: certificateData.name,
        issuer: certificateData.issuer || 'Unknown',
        date: certificateData.date || '',
        url: certificateData.url || '',
        image: certificateData.image || '',
        status: certificateData.status || 'completed',
        createdAt: new Date().toISOString()
    };
    
    certificates.push(newCertificate);
    saveCertificates(certificates);
    console.log('✅ Certificate added:', newCertificate.name);
    return { success: true, message: '✅ Certificate added successfully!', certificate: newCertificate };
}

// Delete certificate
function deleteCertificate(certificateId) {
    let certificates = getAllCertificates();
    const certificate = certificates.find(c => c.id === certificateId);
    certificates = certificates.filter(c => c.id !== certificateId);
    saveCertificates(certificates);
    console.log('🗑️ Certificate deleted:', certificate ? certificate.name : 'unknown');
    return { success: true, message: '✅ Certificate deleted!' };
}

function updateCertificate(certificateId, certificateData) {
    const certificates = getAllCertificates();
    const certificate = certificates.find(c => c.id === certificateId);
    if (!certificate) {
        return { success: false, message: '❌ Certificate not found' };
    }

    certificate.name = certificateData.name || certificate.name;
    certificate.issuer = certificateData.issuer || certificate.issuer;
    certificate.date = certificateData.date || '';
    certificate.url = certificateData.url || '';
    certificate.image = certificateData.image !== undefined ? certificateData.image : certificate.image;
    certificate.status = certificateData.status || certificate.status;
    certificate.updatedAt = new Date().toISOString();
    saveCertificates(certificates);
    return { success: true, message: '✅ Certificate updated successfully!' };
}

// Toggle certificate status
function toggleCertificateStatus(certificateId) {
    const certificates = getAllCertificates();
    const certificate = certificates.find(c => c.id === certificateId);
    if (certificate) {
        certificate.status = certificate.status === 'completed' ? 'in-progress' : 'completed';
        certificate.updatedAt = new Date().toISOString();
        saveCertificates(certificates);
        console.log('🔄 Certificate toggled:', certificate.name, '->', certificate.status);
        return { success: true, message: certificate.status === 'completed' ? '✅ Marked as completed!' : '🔄 Marked as in progress!' };
    }
    return { success: false, message: '❌ Certificate not found' };
}

// Get certificate statistics
function getCertificateStats() {
    const certificates = getAllCertificates();
    return {
        total: certificates.length,
        completed: certificates.filter(c => c.status === 'completed').length,
        inProgress: certificates.filter(c => c.status === 'in-progress').length
    };
}

// ========== RENDER FUNCTIONS ==========

// Render certificates list
function renderCertificates(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const certificates = getAllCertificates();
    
    if (certificates.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <i class="fas fa-certificate" style="font-size: 2rem; opacity: 0.5; display: block; margin-bottom: 0.5rem;"></i>
                <p>No certificates added yet.</p>
                <p style="font-size: 0.85rem;">Add your certificates using the button above.</p>
            </div>
        `;
        return;
    }
    
    const unlocked = typeof isUnlocked !== 'undefined' ? isUnlocked : false;
    
    // Sort: completed first, then in-progress
    const sorted = [...certificates].sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'completed' ? -1 : 1;
    });
    
    container.innerHTML = sorted.map(c => `
        <div class="certificate-card ${c.status === 'completed' ? 'cert-completed' : 'cert-inprogress'}">
            <div class="certificate-media">
                ${c.image ? `<img src="${c.image}" alt="${c.name}">` : `<div class="certificate-media-fallback"><i class="fas ${c.status === 'completed' ? 'fa-certificate' : 'fa-clock'}"></i></div>`}
            </div>
            <div class="certificate-info">
                <div class="certificate-header">
                    <h4>${c.name}</h4>
                    <span class="certificate-status ${c.status}">
                        ${c.status === 'completed' ? '✅ Completed' : '🔄 In Progress'}
                    </span>
                </div>
                <p class="certificate-issuer"><i class="fas fa-building"></i> ${c.issuer}</p>
                ${c.date ? `<p class="certificate-date"><i class="fas fa-calendar"></i> ${c.date}</p>` : ''}
                ${c.url ? `<a href="${c.url}" target="_blank" class="certificate-link"><i class="fas fa-external-link-alt"></i> View Certificate</a>` : ''}
                ${unlocked ? `
                    <div class="certificate-actions" style="margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn btn-sm ${c.status === 'completed' ? 'btn-outline' : 'btn-primary'}" 
                                onclick="toggleCertificateManager('${c.id}')">
                            ${c.status === 'completed' ? 'Mark Incomplete' : '✅ Mark Complete'}
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editCertificateManager('${c.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCertificateManager('${c.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// ========== GLOBAL FUNCTIONS FOR ONCLICK ==========

function toggleCertificateManager(id) {
    const result = toggleCertificateStatus(id);
    showToastManager(result.message);
    if (result.success) {
        renderCertificates('certificateListContainer');
        updateCertificateStats();
    }
}

function deleteCertificateManager(id) {
    if (confirm('Are you sure you want to delete this certificate?')) {
        const result = deleteCertificate(id);
        showToastManager(result.message);
        if (result.success) {
            renderCertificates('certificateListContainer');
            updateCertificateStats();
        }
    }
}

function editCertificateManager(id) {
    const certificates = getAllCertificates();
    const certificate = certificates.find(c => c.id === id);
    if (!certificate) return;

    const editSection = document.getElementById('editCertificateSection');
    const addSection = document.getElementById('addCertificateSection');
    const listSection = document.getElementById('certificateListSection');

    if (editSection) {
        document.getElementById('editCertificateId').value = certificate.id;
        document.getElementById('editCertificateNameInput').value = certificate.name || '';
        document.getElementById('editCertificateIssuerInput').value = certificate.issuer || '';
        document.getElementById('editCertificateDateInput').value = certificate.date || '';
        document.getElementById('editCertificateUrlInput').value = certificate.url || '';
        document.getElementById('editCertificateStatusSelect').value = certificate.status || 'completed';
        const imagePathInput = document.getElementById('editCertificateImagePathInput');
        if (imagePathInput) {
            imagePathInput.value = certificate.image && !String(certificate.image).startsWith('data:') ? certificate.image : '';
        }
        const preview = document.getElementById('editCertificateImagePreview');
        if (preview) {
            preview.innerHTML = certificate.image
                ? `<img src="${certificate.image}" alt="${certificate.name}">`
                : '<span>No image selected</span>';
        }
        editSection.style.display = 'block';
        if (addSection) addSection.style.display = 'none';
        if (listSection) listSection.style.display = 'block';
    }
}

function updateCertificateStats() {
    const stats = getCertificateStats();
    const statsContainer = document.getElementById('certificateStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Total Certificates</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #22c55e;">${stats.completed}</div>
                <div class="stat-label">✅ Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #eab308;">${stats.inProgress}</div>
                <div class="stat-label">🔄 In Progress</div>
            </div>
        `;
    }
}

// ========== INITIALIZATION ==========

function initCertificateManager() {
    // Show/Hide Certificate section
    const showBtn = document.getElementById('showCertificateBtn');
    const addSection = document.getElementById('addCertificateSection');
    const listSection = document.getElementById('certificateListSection');
    const editSection = document.getElementById('editCertificateSection');
    
    if (showBtn && addSection && listSection) {
        showBtn.addEventListener('click', function() {
            const isVisible = addSection.style.display === 'block';
            addSection.style.display = isVisible ? 'none' : 'block';
            listSection.style.display = isVisible ? 'none' : 'block';
            if (editSection) editSection.style.display = 'none';
            if (!isVisible) {
                renderCertificates('certificateListContainer');
                updateCertificateStats();
            }
            // Hide other sections
            const addLearning = document.getElementById('addLearningSection');
            const editLearning = document.getElementById('editLearningSection');
            const deleteLearning = document.getElementById('deleteLearningSection');
            const importLearning = document.getElementById('importLearningSection');
            if (addLearning) addLearning.style.display = 'none';
            if (editLearning) editLearning.style.display = 'none';
            if (deleteLearning) deleteLearning.style.display = 'none';
            if (importLearning) importLearning.style.display = 'none';
            if (typeof setLearningPageView === 'function') {
                setLearningPageView(isVisible ? 'learning' : 'certificate');
            }
        });
    }
    
    const addBtn = document.getElementById('showAddCertificateBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            addSection.style.display = 'block';
            listSection.style.display = 'block';
            if (editSection) editSection.style.display = 'none';
            const message = document.getElementById('certificateMessage');
            if (message) message.textContent = '';
            renderCertificates('certificateListContainer');
            updateCertificateStats();
        });
    }

    // Add Certificate
    const submitAddBtn = document.getElementById('addCertificateBtn');
    if (submitAddBtn) {
        submitAddBtn.addEventListener('click', async function() {
            const name = document.getElementById('certificateNameInput').value.trim();
            const issuer = document.getElementById('certificateIssuerInput').value.trim();
            const date = document.getElementById('certificateDateInput').value;
            const url = document.getElementById('certificateUrlInput').value.trim();
            const status = document.getElementById('certificateStatusSelect').value;
            const message = document.getElementById('certificateMessage');
            const imageInput = document.getElementById('certificateImageInput');
            const imagePathInput = document.getElementById('certificateImagePathInput');
            let image = '';
            
            if (!name) {
                if (message) {
                    message.textContent = '⚠️ Please enter a certificate name';
                    message.style.color = '#ef4444';
                }
                return;
            }

            image = await getCertificateImageValue(imageInput, imagePathInput);
            if (imageInput && imageInput.files && imageInput.files[0] && !image) {
                if (message) {
                    message.textContent = '⚠️ Could not read the selected image';
                    message.style.color = '#ef4444';
                }
                return;
            }
            image = image || '';
            
            const result = addCertificate({
                name: name,
                issuer: issuer || 'Unknown',
                date: date || '',
                url: url || '',
                image: image,
                status: status
            });
            
            if (message) {
                message.textContent = result.message;
                message.style.color = result.success ? '#22c55e' : '#ef4444';
            }
            
            if (result.success) {
                document.getElementById('certificateNameInput').value = '';
                document.getElementById('certificateIssuerInput').value = '';
                document.getElementById('certificateDateInput').value = '';
                document.getElementById('certificateUrlInput').value = '';
                document.getElementById('certificateStatusSelect').value = 'completed';
                if (imageInput) imageInput.value = '';
                if (imagePathInput) imagePathInput.value = '';
                const preview = document.getElementById('certificateImagePreview');
                if (preview) preview.innerHTML = '';
                renderCertificates('certificateListContainer');
                updateCertificateStats();
                showToastManager(result.message);
                setTimeout(() => {
                    if (message) message.textContent = '';
                }, 3000);
            }
        });
    }

    // Save edited certificate
    const saveEditBtn = document.getElementById('saveEditCertificateBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', async function() {
            const id = document.getElementById('editCertificateId').value;
            const name = document.getElementById('editCertificateNameInput').value.trim();
            const issuer = document.getElementById('editCertificateIssuerInput').value.trim();
            const date = document.getElementById('editCertificateDateInput').value;
            const url = document.getElementById('editCertificateUrlInput').value.trim();
            const status = document.getElementById('editCertificateStatusSelect').value;
            const message = document.getElementById('editCertificateMessage');
            const imageInput = document.getElementById('editCertificateImageInput');
            const imagePathInput = document.getElementById('editCertificateImagePathInput');
            let image;

            if (!name) {
                if (message) {
                    message.textContent = '⚠️ Please enter a certificate name';
                    message.style.color = '#ef4444';
                }
                return;
            }

            image = await getCertificateImageValue(imageInput, imagePathInput);
            if (imageInput && imageInput.files && imageInput.files[0] && !image) {
                if (message) {
                    message.textContent = '⚠️ Could not read the selected image';
                    message.style.color = '#ef4444';
                }
                return;
            }

            const result = updateCertificate(id, {
                name: name,
                issuer: issuer || 'Unknown',
                date: date || '',
                url: url || '',
                image: image ? image : undefined,
                status: status
            });

            if (message) {
                message.textContent = result.message;
                message.style.color = result.success ? '#22c55e' : '#ef4444';
            }

            if (result.success) {
                renderCertificates('certificateListContainer');
                updateCertificateStats();
                showToastManager(result.message);
                if (editSection) editSection.style.display = 'none';
                setTimeout(() => {
                    if (message) message.textContent = '';
                }, 3000);
            }
        });
    }
    
    // Cancel Add Certificate
    const cancelBtn = document.getElementById('cancelAddCertificateBtn');
    if (cancelBtn && addSection) {
        cancelBtn.addEventListener('click', function() {
            addSection.style.display = 'none';
            listSection.style.display = 'none';
            document.getElementById('certificateNameInput').value = '';
            document.getElementById('certificateIssuerInput').value = '';
            document.getElementById('certificateDateInput').value = '';
            document.getElementById('certificateUrlInput').value = '';
            document.getElementById('certificateStatusSelect').value = 'completed';
            if (document.getElementById('certificateImageInput')) document.getElementById('certificateImageInput').value = '';
            if (document.getElementById('certificateImagePathInput')) document.getElementById('certificateImagePathInput').value = '';
            const preview = document.getElementById('certificateImagePreview');
            if (preview) preview.innerHTML = '';
            const msg = document.getElementById('certificateMessage');
            if (msg) msg.textContent = '';
        });
    }

    // Cancel Edit Certificate
    const cancelEditBtn = document.getElementById('cancelEditCertificateBtn');
    if (cancelEditBtn && editSection) {
        cancelEditBtn.addEventListener('click', function() {
            editSection.style.display = 'none';
            document.getElementById('editCertificateId').value = '';
            document.getElementById('editCertificateNameInput').value = '';
            document.getElementById('editCertificateIssuerInput').value = '';
            document.getElementById('editCertificateDateInput').value = '';
            document.getElementById('editCertificateUrlInput').value = '';
            document.getElementById('editCertificateStatusSelect').value = 'completed';
            if (document.getElementById('editCertificateImageInput')) document.getElementById('editCertificateImageInput').value = '';
            if (document.getElementById('editCertificateImagePathInput')) document.getElementById('editCertificateImagePathInput').value = '';
            const preview = document.getElementById('editCertificateImagePreview');
            if (preview) preview.innerHTML = '';
            const msg = document.getElementById('editCertificateMessage');
            if (msg) msg.textContent = '';
        });
    }
}

// Make functions globally available
window.getAllCertificates = getAllCertificates;
window.saveCertificates = saveCertificates;
window.addCertificate = addCertificate;
window.deleteCertificate = deleteCertificate;
window.toggleCertificateStatus = toggleCertificateStatus;
window.getCertificateStats = getCertificateStats;
window.renderCertificates = renderCertificates;
window.toggleCertificateManager = toggleCertificateManager;
window.deleteCertificateManager = deleteCertificateManager;
window.updateCertificateStats = updateCertificateStats;
window.initCertificateManager = initCertificateManager;
window.editCertificateManager = editCertificateManager;