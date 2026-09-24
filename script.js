/**
 * Portfolio Mael — Logique Globale & Intégration QuickLiquid (Apple Liquid Glass)
 * Gestion : QuickLiquid Engine, Thème (Sombre/Clair), Langue (FR/EN), 
 *           Mode Édition Directe, Sauvegarde HTML, Export PDF & Filtres Projets
 */

// Tableau des instances actives de LiquidGlassEngine pour synchronisation dynamique
let activeGlassEngines = [];

// --- 1. Gestion du Thème (Dark / Light) ---
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    try {
        localStorage.setItem('portfolio_theme', newTheme);
    } catch (e) {}

    updateThemeButton(newTheme);

    // Mettre à jour l'apparence des moteurs LiquidGlass actifs
    activeGlassEngines.forEach(engine => {
        try {
            if (engine && typeof engine.updateConfig === 'function') {
                engine.updateConfig({ appearance: newTheme });
            }
        } catch (e) {
            console.warn('Erreur mise à jour QuickLiquid:', e);
        }
    });

    showToast(newTheme === 'dark' ? '✨ Mode Sombre VisionOS activé' : '☀️ Mode Clair Dépoli activé');
}

function updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    if (theme === 'dark') {
        btn.innerHTML = '<span>☀️ <span class="lang-fr">Mode Clair</span><span class="lang-en">Light Mode</span></span>';
    } else {
        btn.innerHTML = '<span>🌙 <span class="lang-fr">Mode Sombre</span><span class="lang-en">Dark Mode</span></span>';
    }
}

// --- 2. Gestion de la Langue (FR / EN) ---
function toggleLang() {
    const html = document.documentElement;
    const currentLang = html.getAttribute('data-lang') || 'fr';
    const newLang = currentLang === 'fr' ? 'en' : 'fr';

    html.setAttribute('data-lang', newLang);
    try {
        localStorage.setItem('portfolio_lang', newLang);
    } catch (e) {}

    updateLangButton(newLang);
    showToast(newLang === 'fr' ? '🇫🇷 Langue : Français' : '🇬🇧 Language : English');
}

function updateLangButton(lang) {
    const btn = document.getElementById('lang-toggle-btn');
    if (!btn) return;
    btn.innerHTML = lang === 'fr' 
        ? '<span>🇬🇧 English</span>' 
        : '<span>🇫🇷 Français</span>';
}

// --- 3. Mode Édition Directe (In-Place HTML Editing) ---
let isEditingActive = false;

function toggleEditMode() {
    isEditingActive = !isEditingActive;
    const body = document.body;
    const editBtn = document.getElementById('edit-toggle-btn');
    const editableZones = document.querySelectorAll('.editable-area');

    if (isEditingActive) {
        body.classList.add('editing-active');
        editableZones.forEach(zone => {
            zone.setAttribute('contenteditable', 'true');
            zone.setAttribute('spellcheck', 'false');
        });
        if (editBtn) {
            editBtn.classList.add('active');
            editBtn.innerHTML = '<span>🔓 <span class="lang-fr">Verrouiller</span><span class="lang-en">Lock Edit</span></span>';
        }
        showToast('✏️ Mode Édition activé : cliquez sur le texte pour modifier');
    } else {
        body.classList.remove('editing-active');
        editableZones.forEach(zone => {
            zone.removeAttribute('contenteditable');
        });
        if (editBtn) {
            editBtn.classList.remove('active');
            editBtn.innerHTML = '<span>✏️ <span class="lang-fr">Éditer</span><span class="lang-en">Edit</span></span>';
        }
        showToast('🔒 Mode Édition verrouillé');
    }
}

// --- 4. Sauvegarde du Fichier HTML Modifié ---
function saveHTML() {
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }

    const wasEditing = isEditingActive;
    const body = document.body;
    const editableZones = document.querySelectorAll('.editable-area');

    body.classList.remove('editing-active');
    editableZones.forEach(zone => {
        zone.removeAttribute('contenteditable');
        zone.removeAttribute('spellcheck');
    });

    // Nettoyer les calques temporaires QuickLiquid injectés avant téléchargement pour un fichier HTML pur
    const clonedDoc = document.documentElement.cloneNode(true);
    clonedDoc.querySelectorAll('.ql-lens, .ql-tint, .ql-sheen, .ql-rim, .ql-noise, svg[id^="ql"]').forEach(el => el.remove());
    clonedDoc.querySelectorAll('.ql-content').forEach(wrapper => {
        const parent = wrapper.parentNode;
        while (wrapper.firstChild) {
            parent.insertBefore(wrapper.firstChild, wrapper);
        }
        wrapper.remove();
    });

    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (!currentPath.endsWith('.html')) {
        currentPath += '.html';
    }
    const outputFilename = currentPath.replace('.html', '_modifie.html');

    const fullHtml = '<!DOCTYPE html>\n' + clonedDoc.outerHTML;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = outputFilename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUrl);

    if (wasEditing) {
        body.classList.add('editing-active');
        editableZones.forEach(zone => {
            zone.setAttribute('contenteditable', 'true');
            zone.setAttribute('spellcheck', 'false');
        });
    }

    showToast('💾 Fichier sauvegardé : ' + outputFilename);
}

// --- 5. Export PDF (Print A4) ---
function downloadPDF() {
    window.print();
}

// --- 6. Filtre Interactif des Projets (Page projets.html) ---
function filterProjects(category, btnElement) {
    const cards = document.querySelectorAll('.project-card');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category') || '';
        if (category === 'all' || cardCat.includes(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// --- 7. Toast de Notification Minimaliste ---
function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'toast-msg no-print';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// --- 8. Initialisation et Intégration du Moteur QuickLiquid ---
async function setupQuickLiquid() {
    let Engine = window.LiquidGlassEngine;

    // Si non présent sur window, tentative d'importation dynamique ES Module
    if (!Engine) {
        try {
            const mod = await import('./quick-liquid.bundle.mjs');
            Engine = mod.LiquidGlassEngine || window.LiquidGlassEngine;
        } catch (err) {
            console.log('QuickLiquid module fallback via script tag', err);
        }
    }

    if (!Engine) {
        console.warn('QuickLiquid Engine non disponible - Repli gracieux CSS activé.');
        return;
    }

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    // A. Barre d'en-tête (Top Header / Floating Dock)
    const header = document.querySelector('.top-header');
    if (header) {
        try {
            const glass = new Engine(header, {
                material: 'regular',
                borderRadius: 32,
                dynamicLighting: true,
                cursorTracking: true,
                hoverLighting: true,
                chromaticAberration: 0.18,
                appearance: currentTheme
            });
            activeGlassEngines.push(glass);
        } catch (e) {
            console.warn('Erreur QuickLiquid header:', e);
        }
    }

    // B. Barre de contrôles (Floating Controls Bar)
    const controls = document.querySelector('.controls-bar');
    if (controls) {
        try {
            const glass = new Engine(controls, {
                material: 'thin',
                borderRadius: 20,
                dynamicLighting: true,
                cursorTracking: true,
                hoverLighting: true,
                chromaticAberration: 0.14,
                appearance: currentTheme
            });
            activeGlassEngines.push(glass);
        } catch (e) {
            console.warn('Erreur QuickLiquid controls:', e);
        }
    }

    // C. Cartes Métriques (Index)
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        try {
            const glass = new Engine(card, {
                material: 'clear',
                borderRadius: 20,
                dynamicLighting: true,
                cursorTracking: true,
                hoverLighting: true,
                chromaticAberration: 0.22,
                appearance: currentTheme
            });
            if (typeof glass.enableLiquidPress === 'function') {
                glass.enableLiquidPress({ scale: 0.94, squish: 0.025 });
            }
            activeGlassEngines.push(glass);
        } catch (e) {
            console.warn('Erreur QuickLiquid metric card:', e);
        }
    });

    // D. Cartes de Projets (Projects)
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        try {
            const glass = new Engine(card, {
                material: 'thin',
                borderRadius: 24,
                dynamicLighting: true,
                cursorTracking: true,
                hoverLighting: true,
                chromaticAberration: 0.16,
                appearance: currentTheme
            });
            if (typeof glass.enableLiquidPress === 'function') {
                glass.enableLiquidPress({ scale: 0.98, squish: 0.012 });
            }
            activeGlassEngines.push(glass);
        } catch (e) {
            console.warn('Erreur QuickLiquid project card:', e);
        }
    });

    // E. Boutons d'Action Clés avec Liquid Press
    const actionButtons = document.querySelectorAll('.btn-ctrl, .filter-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('pointerdown', () => {
            btn.style.transform = 'scale(0.94) translateY(1px)';
        });
        const resetBtn = () => {
            btn.style.transform = '';
        };
        btn.addEventListener('pointerup', resetBtn);
        btn.addEventListener('pointerleave', resetBtn);
        btn.addEventListener('pointercancel', resetBtn);
    });

    // F. Status Pill avec halo réactif
    const statusPill = document.querySelector('.status-pill');
    if (statusPill) {
        statusPill.addEventListener('mouseenter', () => {
            statusPill.style.transform = 'scale(1.05)';
        });
        statusPill.addEventListener('mouseleave', () => {
            statusPill.style.transform = '';
        });
    }
}

// --- 9. Initialisation au Chargement du DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Restaurer le thème
    let savedTheme = 'dark';
    try {
        savedTheme = localStorage.getItem('portfolio_theme') || 'dark';
    } catch (e) {}
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);

    // Restaurer la langue
    let savedLang = 'fr';
    try {
        savedLang = localStorage.getItem('portfolio_lang') || 'fr';
    } catch (e) {}
    document.documentElement.setAttribute('data-lang', savedLang);
    updateLangButton(savedLang);

    // Initialiser le moteur QuickLiquid
    setupQuickLiquid();
});