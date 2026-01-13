#!/usr/bin/env node

/**
 * Script de déploiement automatique
 * Déploie les fichiers modifiés vers Hostinger via FTP
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FTP_CONFIG = {
    host: '92.113.28.141',
    user: 'u639530603',
    password: 'En70freva=',
    remotePath: '/domains/safemates.fr/public_html/'
};

// Fichiers à toujours déployer
const CRITICAL_FILES = [
    'server.js',
    'game.html',
    'api/rank-mapping.php',
    'database.sqlite',
    'test_match.js',
    'verify_ranks.js',
    'fix_invalid_ranks.js'
];

function deployFile(file) {
    const ftpUrl = `ftp://${FTP_CONFIG.host}${FTP_CONFIG.remotePath}${file}`;
    const auth = `${FTP_CONFIG.user}:${FTP_CONFIG.password}`;

    try {
        console.log(`📤 Déploiement: ${file}`);
        execSync(`curl -T "${file}" -u "${auth}" "${ftpUrl}" --ftp-create-dirs`, {
            stdio: 'inherit',
            shell: true
        });
        console.log(`✅ ${file} déployé`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur lors du déploiement de ${file}:`, error.message);
        return false;
    }
}

function main() {
    console.log('🚀 Démarrage du déploiement automatique vers Hostinger\n');

    let successCount = 0;
    let errorCount = 0;

    for (const file of CRITICAL_FILES) {
        if (fs.existsSync(file)) {
            if (deployFile(file)) {
                successCount++;
            } else {
                errorCount++;
            }
        } else {
            console.log(`⚠️  ${file} n'existe pas, ignoré`);
        }
    }

    console.log(`\n📊 Résumé: ${successCount} fichiers déployés, ${errorCount} erreurs`);

    if (errorCount === 0) {
        console.log('✅ Déploiement terminé avec succès !');
        process.exit(0);
    } else {
        console.log('⚠️  Déploiement terminé avec des erreurs');
        process.exit(1);
    }
}

main();
