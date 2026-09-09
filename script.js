/**
 * Portfolio Mael — Logique Globale
 * Gestion : Thème (Sombre/Clair), Langue (FR/EN), Mode Édition Directe, Sauvegarde HTML, Export PDF & Filtres Projets
 */

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
    showToast(newTheme === 'dark' ? 'Thème Sombre activé' : 'Thème Clair activé');
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
    showToast(newLang === 'fr' ? 'Langue : Français' : 'Language : English');
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
    // Retirer le focus en cours pour valider la dernière frappe
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }

    const wasEditing = isEditingActive;
    const body = document.body;
    const editableZones = document.querySelectorAll('.editable-area');

    // Nettoyer temporairement les attributs d'édition pour générer un fichier propre
    body.classList.remove('editing-active');
    editableZones.forEach(zone => {
        zone.removeAttribute('contenteditable');
        zone.removeAttribute('spellcheck');
    });

    // Déterminer le nom du fichier courant
    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (!currentPath.endsWith('.html')) {
        currentPath += '.html';
    }
    const outputFilename = currentPath.replace('.html', '_modifie.html');

    // Cloner et nettoyer les toasts ou scripts d'état
    const fullHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    // Création du blob et téléchargement
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = outputFilename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUrl);

    // Rétablir l'état d'édition si actif
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
    }, 2400);
}

// --- 8. Initialisation au Chargement du DOM ---
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

    // Détection de la page courante pour la classe .active dans la nav
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-bar .nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});