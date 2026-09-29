/**
 * Portfolio Maël Galan — Logique Interactive iOS Liquid Glass
 * Gestion : Thème (Sombre/Clair), Bilinguisme (FR/EN), Mode Édition Directe,
 *           Sauvegarde HTML, Impression PDF A4, Filtres de Projets & Notifications Toast iOS
 */

// 1. Toast Notification Apple iOS
function showToast(message) {
    let toast = document.getElementById('ios-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ios-toast';
        toast.className = 'ios-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('visible');
    }, 2600);
}

// 2. Gestion du Thème (Dark / Light)
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', nextTheme);
    try {
        localStorage.setItem('portfolio_theme', nextTheme);
    } catch (e) {}

    updateThemeButton(nextTheme);
    showToast(nextTheme === 'dark' ? 'Mode Sombre activé' : 'Mode Clair activé');
}

function updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    if (theme === 'dark') {
        btn.innerHTML = '<span class="lang-fr">Clair</span><span class="lang-en">Light</span>';
    } else {
        btn.innerHTML = '<span class="lang-fr">Sombre</span><span class="lang-en">Dark</span>';
    }
}

// 3. Gestion de la Langue (FR / EN)
function toggleLang() {
    const html = document.documentElement;
    const currentLang = html.getAttribute('data-lang') || 'fr';
    const nextLang = currentLang === 'fr' ? 'en' : 'fr';

    html.setAttribute('data-lang', nextLang);
    try {
        localStorage.setItem('portfolio_lang', nextLang);
    } catch (e) {}

    updateLangButton(nextLang);
    showToast(nextLang === 'fr' ? 'Langue : Français' : 'Language : English');
}

function updateLangButton(lang) {
    const btn = document.getElementById('lang-toggle-btn');
    if (!btn) return;
    btn.innerHTML = lang === 'fr' 
        ? '<span>EN</span>' 
        : '<span>FR</span>';
}

// 4. Mode Édition Directe (In-Place Edit)
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
            editBtn.innerHTML = '<span class="lang-fr">Terminer</span><span class="lang-en">Done</span>';
        }
        showToast('Mode Édition activé');
    } else {
        body.classList.remove('editing-active');
        editableZones.forEach(zone => {
            zone.removeAttribute('contenteditable');
        });
        if (editBtn) {
            editBtn.classList.remove('active');
            editBtn.innerHTML = '<span class="lang-fr">Éditer</span><span class="lang-en">Edit</span>';
        }
        showToast('Modifications verrouillées');
    }
}

// 5. Sauvegarde du code HTML modifié
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

    const clonedDoc = document.documentElement.cloneNode(true);
    clonedDoc.querySelectorAll('#ios-toast').forEach(el => el.remove());

    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (!currentPath.endsWith('.html')) {
        currentPath += '.html';
    }
    const outputFilename = currentPath.includes('_modifie') 
        ? currentPath 
        : currentPath.replace('.html', '_modifie.html');

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

    showToast('Fichier sauvegardé : ' + outputFilename);
}

// 6. Impression & Export PDF A4
function downloadPDF() {
    window.print();
}

// 7. Filtre Interactif des Projets
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

// 8. Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    try {
        const savedTheme = localStorage.getItem('portfolio_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeButton(savedTheme);
        }

        const savedLang = localStorage.getItem('portfolio_lang');
        if (savedLang) {
            document.documentElement.setAttribute('data-lang', savedLang);
            updateLangButton(savedLang);
        }
    } catch (e) {}
});