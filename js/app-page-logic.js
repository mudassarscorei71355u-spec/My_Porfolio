// app-page-logic.js - Page-specific rendering, CV export, and management controls

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

function updateCVContent() {
    const additionalSkills = ['Typing', 'Video Editing', 'DaVinci Resolve'];

    const projectsContainer = document.getElementById('cvProjectsContainer');
    if (projectsContainer) {
        const projects = getAllProjects() || [];
        const order = { 'completed': 0, 'in-progress': 1, 'not-started': 2 };
        const sorted = [...projects]
            .filter(p => p.status !== 'not-started')
            .sort((a, b) => (order[a.status] || 3) - (order[b.status] || 3))
            .slice(0, 6);

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

    const learningContainer = document.getElementById('cvLearningContainer');
    if (learningContainer) {
        const learnings = getAllLearnings() || [];
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
        const completed = learnings.filter(l => l.completed);
        const inProgress = learnings.filter(l => !l.completed);

        if (completed.length > 0) {
            html += `<div class="cv-learning-group"><strong>✅ Completed:</strong><br>`;
            const topCompleted = completed.slice(0, 8);
            html += topCompleted.map(l => `<span class="cv-learning-tag">${l.name}</span>`).join(' ');
            if (completed.length > 8) {
                html += ` <span class="cv-learning-tag" style="opacity:0.6;">+${completed.length - 8}</span>`;
            }
            html += `</div>`;
        }

        if (inProgress.length > 0) {
            html += `<div class="cv-learning-group"><strong>🔄 In Progress:</strong><br>`;
            const topInProgress = inProgress.slice(0, 8);
            html += topInProgress.map(l => `<span class="cv-learning-tag cv-inprogress">${l.name}</span>`).join(' ');
            if (inProgress.length > 8) {
                html += ` <span class="cv-learning-tag cv-inprogress" style="opacity:0.6;">+${inProgress.length - 8}</span>`;
            }
            html += `</div>`;
        }

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

    const skillsContainer = document.getElementById('cvSkillsContainer');
    if (skillsContainer) {
        const { coreSkills, toolsSkills } = getSkillsFromLearnings();
        const learnings = getAllLearnings() || [];
        const completedTopics = learnings.filter(l => l.completed).map(l => l.name).slice(0, 4);
        const topCore = coreSkills.slice(0, 6);
        const topTools = toolsSkills.slice(0, 6);

        skillsContainer.innerHTML = `
            <div class="skill-group"><strong>🔧 Core:</strong> ${topCore.join(', ') || '—'}</div>
            <div class="skill-group"><strong>🛠️ Tools:</strong> ${topTools.join(', ') || '—'}</div>
            <div class="skill-group"><strong>📋 Additional:</strong> ${additionalSkills.join(', ')}</div>
            ${completedTopics.length ? `<div class="skill-group"><strong>✅ Recent:</strong> ${completedTopics.join(', ')}</div>` : ''}
        `;
    }

    const learningCount = document.getElementById('learningCount');
    if (learningCount) {
        const learnings = getAllLearnings() || [];
        const completed = learnings.filter(l => l.completed).length;
        const total = learnings.length;
        learningCount.textContent = total > 0 ? ` (${completed}/${total} topics)` : '';
    }
}

function setupDownloadCV() {
    const downloadBtn = document.getElementById('downloadCVBtn');
    if (!downloadBtn) return;

    if (typeof html2pdf === 'undefined') {
        downloadBtn.style.opacity = '0.5';
        downloadBtn.title = 'html2pdf library not loaded';
        return;
    }

    const LIGHT_PALETTE = {
        pageBg: '#f0f4f8',
        cardBg: '#ffffff',
        border: '#e2e8f0',
        textPrimary: '#1a2a4f',
        textSecondary: '#4a5568',
        textMuted: '#718096',
        accent: '#3b82f6',
        chipBg: '#eff6ff',
        chipText: '#3b82f6'
    };
    const DARK_PALETTE = {
        pageBg: '#0f172a',
        cardBg: '#1e293b',
        border: '#334155',
        textPrimary: '#f1f5f9',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        accent: '#60a5fa',
        chipBg: '#1e3a5f',
        chipText: '#60a5fa'
    };

    function hexToRgb(hex) {
        const h = hex.replace('#', '');
        return [
            parseInt(h.substring(0, 2), 16),
            parseInt(h.substring(2, 4), 16),
            parseInt(h.substring(4, 6), 16)
        ];
    }

    function buildExportCss(p) {
        return `
            body.cv-export-mode #cvContent {
                width: 794px !important;
                max-width: 794px !important;
                margin: 0 !important;
                padding: 16px;
                background: ${p.pageBg};
                color: ${p.textPrimary};
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
                background: ${p.cardBg};
                color: ${p.textPrimary};
                border: 1px solid ${p.border};
                border-radius: 14px;
                padding: 18px;
                box-shadow: none;
            }
            body.cv-export-mode #cvContent .cv-header {
                text-align: center;
                border-bottom: 2px solid ${p.accent};
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
                color: ${p.textPrimary};
            }
            body.cv-export-mode #cvContent .cv-title {
                font-size: 0.8rem;
                margin-bottom: 6px;
                color: ${p.accent};
                font-weight: 500;
            }
            body.cv-export-mode #cvContent .cv-contact-info {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 8px;
                font-size: 0.65rem;
                color: ${p.textMuted};
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
                color: ${p.textSecondary};
            }
            body.cv-export-mode #cvContent .cv-section-block {
                margin-bottom: 12px;
            }
            body.cv-export-mode #cvContent .cv-section-block h3 {
                font-size: 0.85rem;
                margin: 0 0 6px 0;
                padding-bottom: 3px;
                border-bottom: 2px solid ${p.accent};
                color: ${p.accent};
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
                color: ${p.textPrimary};
            }
            body.cv-export-mode #cvContent .cv-item-date {
                font-size: 0.65rem;
                color: ${p.accent};
            }
            body.cv-export-mode #cvContent .cv-item-subtitle {
                font-size: 0.7rem;
                color: ${p.textSecondary};
                margin-top: 1px;
            }
            body.cv-export-mode #cvContent .cv-item p {
                margin: 2px 0 0 0;
                font-size: 0.65rem;
                color: ${p.textMuted};
                line-height: 1.2;
            }
            body.cv-export-mode #cvContent .cv-tech-tags {
                margin-top: 3px;
                background: ${p.chipBg};
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 0.6rem;
                font-weight: 500;
                color: ${p.chipText};
                display: inline-flex;
                flex-wrap: wrap;
                gap: 3px;
                border: 1px solid ${p.border};
            }
            body.cv-export-mode #cvContent .skills-grid-cv {
                display: grid;
                grid-template-columns: 1fr;
                gap: 4px;
            }
            body.cv-export-mode #cvContent .skill-group {
                padding: 3px 0;
                border-bottom: 1px solid ${p.border};
                color: ${p.textSecondary};
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
                background: ${p.pageBg};
                border-radius: 6px;
                border: 1px solid ${p.border};
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
                color: ${p.textSecondary};
            }
            body.cv-export-mode #cvContent .cv-learning-tag {
                display: inline-block;
                background: ${p.chipBg};
                color: ${p.chipText};
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 0.6rem;
                margin-right: 3px;
                margin-bottom: 2px;
                border: 1px solid ${p.border};
            }
            body.cv-export-mode #cvContent .cv-two-columns {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 10px;
            }
            body.cv-export-mode #cvContent .cv-two-columns ul {
                padding-left: 16px;
                margin-top: 3px;
                color: ${p.textSecondary};
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
    }

    const EXPORT_STYLE_ID = 'cv-export-style';
    function applyExportStyle(palette) {
        let styleEl = document.getElementById(EXPORT_STYLE_ID);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = EXPORT_STYLE_ID;
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = buildExportCss(palette);
    }

    const PAGE_W_MM = 210;
    const PAGE_H_MM = 297;
    const MARGIN_MM = 5;
    const CAPTURE_SCALE = 3;
    const UNSPLITTABLE_SELECTOR = '.cv-header, .cv-summary-block, .cv-item, .skill-group, .cv-learning-group, .certifications-list';

    function nextFrame() {
        return new Promise(function(resolve) {
            requestAnimationFrame(function() {
                requestAnimationFrame(resolve);
            });
        });
    }

    function getForbiddenZones(container) {
        const containerRect = container.getBoundingClientRect();
        const zones = [];
        container.querySelectorAll(UNSPLITTABLE_SELECTOR).forEach(function(el) {
            if (el.offsetParent === null) return;
            const r = el.getBoundingClientRect();
            if (r.height <= 0) return;
            const top = (r.top - containerRect.top) * CAPTURE_SCALE;
            const bottom = (r.bottom - containerRect.top) * CAPTURE_SCALE;
            zones.push([top, bottom]);
        });
        zones.sort(function(a, b) { return a[0] - b[0]; });
        const merged = [];
        zones.forEach(function(z) {
            if (merged.length && z[0] <= merged[merged.length - 1][1] + 1) {
                merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], z[1]);
            } else {
                merged.push(z.slice());
            }
        });
        return merged;
    }

    function findSafeCut(target, zones, minY) {
        for (let i = 0; i < zones.length; i++) {
            const top = zones[i][0];
            const bottom = zones[i][1];
            if (target > top && target < bottom) {
                if (top > minY) return top;
                return target;
            }
        }
        return target;
    }

    async function captureElement(el, backgroundColor) {
        void el.offsetHeight;
        await nextFrame();

        const canvas = await html2pdf().set({
            html2canvas: {
                scale: CAPTURE_SCALE,
                useCORS: true,
                allowTaint: true,
                backgroundColor: backgroundColor,
                logging: false,
                scrollX: 0,
                scrollY: 0
            }
        }).from(el).toCanvas().get('canvas');
        return canvas;
    }

    function paginateCanvasOntoPdf(pdf, canvas, zones, pageTracker, pageBgRgb) {
        const availableWMM = PAGE_W_MM - 2 * MARGIN_MM;
        const availableHMM = PAGE_H_MM - 2 * MARGIN_MM;
        const mmPerPx = availableWMM / canvas.width;
        const pageHeightPx = availableHMM / mmPerPx;

        let y = 0;
        while (y < canvas.height - 1) {
            let targetEnd = Math.min(y + pageHeightPx, canvas.height);
            if (targetEnd < canvas.height) {
                const safe = findSafeCut(targetEnd, zones, y);
                targetEnd = safe > y ? safe : targetEnd;
            }
            const sliceHeightPx = Math.max(1, targetEnd - y);

            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = Math.ceil(sliceHeightPx);
            const ctx = sliceCanvas.getContext('2d');
            ctx.fillStyle = 'rgb(' + pageBgRgb.join(',') + ')';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(canvas, 0, y, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

            if (pageTracker.used) {
                pdf.addPage();
            }
            pageTracker.used = true;

            pdf.setFillColor(pageBgRgb[0], pageBgRgb[1], pageBgRgb[2]);
            pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, 'F');

            const imgWMM = availableWMM;
            const imgHMM = sliceHeightPx * mmPerPx;
            const imgData = sliceCanvas.toDataURL('image/jpeg', 0.98);
            pdf.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM, imgWMM, imgHMM);

            y = targetEnd;
        }
    }

    downloadBtn.addEventListener('click', async function() {
        const cvContent = document.getElementById('cvContent');
        if (!cvContent) return;

        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        const isDark = document.body.classList.contains('dark');
        const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;
        const pageBgRgb = hexToRgb(palette.pageBg);

        applyExportStyle(palette);
        document.body.classList.add('cv-export-mode');
        window.scrollTo(0, 0);

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
            const scratchEl = document.createElement('div');
            scratchEl.style.cssText = 'width:2px;height:2px;background:' + palette.pageBg + ';';
            document.body.appendChild(scratchEl);
            const pdf = await html2pdf()
                .set({ jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
                .from(scratchEl)
                .toPdf()
                .get('pdf');
            scratchEl.remove();

            while (pdf.getNumberOfPages() > 1) {
                pdf.deletePage(pdf.getNumberOfPages());
            }
            pdf.setPage(1);

            const pageTracker = { used: false };

            if (page2Root) {
                page2Root.style.display = 'none';
                await nextFrame();
                let zones = getForbiddenZones(cvContent);
                let canvas = await captureElement(cvContent, palette.pageBg);
                paginateCanvasOntoPdf(pdf, canvas, zones, pageTracker, pageBgRgb);

                page2Root.style.display = '';
                Array.prototype.forEach.call(cvContent.children, function(child) {
                    if (child !== page2Root) child.style.display = 'none';
                });
                await nextFrame();
                zones = getForbiddenZones(cvContent);
                canvas = await captureElement(cvContent, palette.pageBg);
                paginateCanvasOntoPdf(pdf, canvas, zones, pageTracker, pageBgRgb);
            } else {
                const zones = getForbiddenZones(cvContent);
                const canvas = await captureElement(cvContent, palette.pageBg);
                paginateCanvasOntoPdf(pdf, canvas, zones, pageTracker, pageBgRgb);
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

    const addLearningSection = document.getElementById('addLearningSection');
    const editLearningSection = document.getElementById('editLearningSection');
    const deleteLearningSection = document.getElementById('deleteLearningSection');
    const importLearningSection = document.getElementById('importLearningSection');
    const addCertificateSection = document.getElementById('addCertificateSection');
    const editCertificateSection = document.getElementById('editCertificateSection');
    const certificateListSection = document.getElementById('certificateListSection');

    if (isCertificate) {
        if (addLearningSection) addLearningSection.style.display = 'none';
        if (editLearningSection) editLearningSection.style.display = 'none';
        if (deleteLearningSection) deleteLearningSection.style.display = 'none';
        if (importLearningSection) importLearningSection.style.display = 'none';
        if (certificateListSection) certificateListSection.style.display = 'block';
    } else {
        if (addCertificateSection) addCertificateSection.style.display = 'none';
        if (editCertificateSection) editCertificateSection.style.display = 'none';
        if (certificateListSection) certificateListSection.style.display = 'none';
        if (learningContentSection) learningContentSection.style.display = 'block';
    }
}

function setupLearningStatsToggle() {
    const buttons = document.querySelectorAll('.stats-toggle-btn');
    if (!buttons.length) return;

    buttons.forEach((button) => {
        button.addEventListener('click', function() {
            setLearningPageView(button.getAttribute('data-view'));
        });
    });

    setLearningPageView('learning');
}

function setupLearningPageControls() {
    const showAddBtn = document.getElementById('showAddLearningBtn');
    const addSection = document.getElementById('addLearningSection');
    const editSection = document.getElementById('editLearningSection');
    const deleteSection = document.getElementById('deleteLearningSection');
    const importSection = document.getElementById('importLearningSection');

    if (showAddBtn && addSection) {
        showAddBtn.addEventListener('click', function() {
            try {
                const activeView = document.querySelector('.stats-toggle-btn.active')?.getAttribute('data-view') || 'learning';
                if (activeView === 'certificate') {
                    const certAddBtn = document.getElementById('showAddCertificateBtn');
                    if (certAddBtn) {
                        certAddBtn.click();
                        return;
                    }
                }
            } catch (e) {}

            addSection.style.display = addSection.style.display === 'none' ? 'block' : 'none';
            if (editSection) editSection.style.display = 'none';
            if (deleteSection) deleteSection.style.display = 'none';
            if (importSection) importSection.style.display = 'none';
            setLearningPageView('learning');
        });
    }

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

    const cancelEditBtn = document.getElementById('cancelEditLearningBtn');
    if (cancelEditBtn && editSection) {
        cancelEditBtn.addEventListener('click', function() {
            editSection.style.display = 'none';
            const msg = document.getElementById('editLearningMessage');
            if (msg) msg.textContent = '';
        });
    }

    const cancelDeleteBtn = document.getElementById('cancelDeleteLearningBtn');
    if (cancelDeleteBtn && deleteSection) {
        cancelDeleteBtn.addEventListener('click', function() {
            deleteSection.style.display = 'none';
            const msg = document.getElementById('deleteLearningMessage');
            if (msg) msg.textContent = '';
        });
    }

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

function setupProjectPageControls() {
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

    const cancelEditBtn = document.getElementById('cancelEditProjectBtn');
    if (cancelEditBtn && editSection) {
        cancelEditBtn.addEventListener('click', function() {
            editSection.style.display = 'none';
            const msg = document.getElementById('editProjectMessage');
            if (msg) msg.textContent = '';
        });
    }

    const cancelDeleteBtn = document.getElementById('cancelDeleteProjectBtn');
    if (cancelDeleteBtn && deleteSection) {
        cancelDeleteBtn.addEventListener('click', function() {
            deleteSection.style.display = 'none';
            const msg = document.getElementById('deleteProjectMessage');
            if (msg) msg.textContent = '';
        });
    }

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

function setupLearningImport() {
    const showImportBtn = document.getElementById('showImportLearningBtn');
    const importSection = document.getElementById('importLearningSection');

    if (showImportBtn && importSection) {
        showImportBtn.addEventListener('click', function() {
            importSection.style.display = importSection.style.display === 'none' ? 'block' : 'none';
            const addSection = document.getElementById('addLearningSection');
            const editSection = document.getElementById('editLearningSection');
            const deleteSection = document.getElementById('deleteLearningSection');
            if (addSection) addSection.style.display = 'none';
            if (editSection) editSection.style.display = 'none';
            if (deleteSection) deleteSection.style.display = 'none';

            if (!document.getElementById('learningFileInput')) {
                setupFileImporter('learningImportArea', 'learningImportBtn', 'learningFileInput', 'learningImportMessage', 'learning');
            }
        });
    }

    const cancelImportBtn = document.getElementById('cancelImportLearningBtn');
    if (cancelImportBtn && importSection) {
        cancelImportBtn.addEventListener('click', function() {
            importSection.style.display = 'none';
            const msg = document.getElementById('learningImportMessage');
            if (msg) msg.textContent = '';
        });
    }
}

function setupProjectImport() {
    const showImportBtn = document.getElementById('showImportProjectBtn');
    const importSection = document.getElementById('importProjectSection');

    if (showImportBtn && importSection) {
        showImportBtn.addEventListener('click', function() {
            importSection.style.display = importSection.style.display === 'none' ? 'block' : 'none';
            const addSection = document.getElementById('addProjectSection');
            const editSection = document.getElementById('editProjectSection');
            const deleteSection = document.getElementById('deleteProjectSection');
            if (addSection) addSection.style.display = 'none';
            if (editSection) editSection.style.display = 'none';
            if (deleteSection) deleteSection.style.display = 'none';

            if (!document.getElementById('projectFileInput')) {
                setupFileImporter('projectImportArea', 'projectImportBtn', 'projectFileInput', 'projectImportMessage', 'project');
            }
        });
    }

    const cancelImportBtn = document.getElementById('cancelImportProjectBtn');
    if (cancelImportBtn && importSection) {
        cancelImportBtn.addEventListener('click', function() {
            importSection.style.display = 'none';
            const msg = document.getElementById('projectImportMessage');
            if (msg) msg.textContent = '';
        });
    }
}

window.renderSkillsGrids = renderSkillsGrids;
window.updateCVContent = updateCVContent;
window.setupDownloadCV = setupDownloadCV;
window.setLearningPageView = setLearningPageView;
window.setupLearningStatsToggle = setupLearningStatsToggle;
window.setupLearningPageControls = setupLearningPageControls;
window.populateEditLearningSelect = populateEditLearningSelect;
window.populateDeleteLearningSelect = populateDeleteLearningSelect;
window.setupProjectPageControls = setupProjectPageControls;
window.populateEditProjectSelect = populateEditProjectSelect;
window.populateDeleteProjectSelect = populateDeleteProjectSelect;
window.setupLearningImport = setupLearningImport;
window.setupProjectImport = setupProjectImport;
