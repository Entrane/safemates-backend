#!/usr/bin/env node
// ====================================================
// Script pour mettre à jour les versions de cache
// Ajoute un timestamp aux fichiers CSS/JS pour forcer le rechargement
// ====================================================

const fs = require('fs');
const path = require('path');

// Générer un timestamp unique
const version = Date.now();

// Fichiers HTML à mettre à jour
const htmlFiles = [
    'dashboard.html',
    'game.html',
    'login.html',
    'signup.html',
    'contact.html',
    'moderation.html',
    'index.html',
    'profile.html'
];

console.log(`🔄 Mise à jour des versions de cache avec timestamp: ${version}`);

// Fonction pour mettre à jour un fichier HTML
function updateCacheVersion(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Fichier ignoré (n'existe pas): ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');

        // Remplacer les versions dans les liens CSS et JS
        // Pattern: href="file.css?v=TIMESTAMP" ou src="file.js?v=TIMESTAMP"
        content = content.replace(
            /(href|src)=["']([^"']+\.(css|js))(\?v=\d+)?["']/g,
            (match, attr, file, ext) => {
                // Ne pas modifier les URLs externes (http:// ou https://)
                if (file.startsWith('http://') || file.startsWith('https://')) {
                    return match;
                }
                return `${attr}="${file}?v=${version}"`;
            }
        );

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Mis à jour: ${filePath}`);
    } catch (error) {
        console.error(`❌ Erreur pour ${filePath}:`, error.message);
    }
}

// Mettre à jour tous les fichiers HTML
htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    updateCacheVersion(filePath);
});

console.log('');
console.log('✅ Mise à jour terminée !');
console.log(`📌 Nouvelle version: ${version}`);
console.log('');
console.log('Les navigateurs vont maintenant recharger tous les CSS/JS au prochain accès.');
