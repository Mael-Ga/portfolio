// Gestion du thème (Clair / Sombre)
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('cv_theme', newTheme);
    
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.innerHTML = newTheme === 'dark' ? '<span>☀️ Mode Clair</span>' : '<span>🌙 Mode Sombre</span>';
}

// Gestion de la langue (FR / EN)
function toggleLang() {
    const html = document.documentElement;
    const currentLang = html.getAttribute('data-lang') || 'fr';
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    
    html.setAttribute('data-lang', newLang);
    localStorage.setItem('cv_lang', newLang);
    
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.innerHTML = newLang === 'fr' ? '<span>🇬🇧 English</span>' : '<span>🇫🇷 Français</span>';
}

// Export PDF
function downloadPDF() {
    window.print();
}

// Sauvegarde du fichier HTML modifié
function saveHTML() {
    if(document.activeElement) document.activeElement.blur();
    
    let filename = window.location.pathname.split("/").pop() || "index.html";
    if (!filename.endsWith('.html')) filename += '.html';
    filename = filename.replace('.html', '_modifie.html');

    const htmlContent = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

// Initialisation au chargement de la page
(function() {
    // Thème
    const savedTheme = localStorage.getItem('cv_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.innerHTML = savedTheme === 'dark' ? '<span>☀️ Mode Clair</span>' : '<span>🌙 Mode Sombre</span>';
    
    // Langue
    const savedLang = localStorage.getItem('cv_lang') || 'fr';
    document.documentElement.setAttribute('data-lang', savedLang);
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) langBtn.innerHTML = savedLang === 'fr' ? '<span>🇬🇧 English</span>' : '<span>🇫🇷 Français</span>';

    // Lien actif dans la navigation
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll('.nav-links a').forEach(link => {
        if(link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
})();