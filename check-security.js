#!/usr/bin/env node

/**
 * Script de Vérification de la Sécurité - MatchMates
 *
 * Ce script vérifie que toutes les configurations de sécurité sont en place
 * avant le déploiement en production.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration de sécurité...\n');

let errors = [];
let warnings = [];
let success = [];

// Vérification 1 : Fichier .env existe
console.log('1️⃣  Vérification du fichier .env...');
if (fs.existsSync('.env')) {
    success.push('✅ Fichier .env trouvé');

    // Lire le contenu
    const envContent = fs.readFileSync('.env', 'utf8');

    // Vérifier JWT_SECRET
    const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
    if (jwtSecretMatch) {
        const jwtSecret = jwtSecretMatch[1].trim();

        if (jwtSecret === 'votre_cle_secrete_jwt_tres_longue_et_securisee_123456789' ||
            jwtSecret === 'CHANGEZ_CETTE_CLE_AVEC_UNE_VALEUR_UNIQUE' ||
            jwtSecret === 'votre_cle_secrete_jwt_tres_longue_et_securisee_a_changer_absolument_123456789') {
            errors.push('❌ JWT_SECRET utilise la valeur par défaut - DANGEREUX !');
            console.log('   ⚠️  Générez une clé sécurisée avec :');
            console.log('   node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
        } else if (jwtSecret.length < 32) {
            warnings.push('⚠️  JWT_SECRET est trop courte (minimum 32 caractères recommandé)');
        } else {
            success.push('✅ JWT_SECRET configurée');
        }
    } else {
        errors.push('❌ JWT_SECRET non définie dans .env');
    }

    // Vérifier NODE_ENV
    if (envContent.includes('NODE_ENV=production')) {
        success.push('✅ NODE_ENV=production configuré');
    } else {
        warnings.push('⚠️  NODE_ENV n\'est pas en production');
    }

    // Vérifier ALLOWED_ORIGINS
    const allowedOriginsMatch = envContent.match(/ALLOWED_ORIGINS=(.+)/);
    if (allowedOriginsMatch) {
        const origins = allowedOriginsMatch[1];
        if (origins.includes('localhost') && envContent.includes('NODE_ENV=production')) {
            warnings.push('⚠️  ALLOWED_ORIGINS contient localhost en production');
        }
        success.push('✅ ALLOWED_ORIGINS configuré');
    } else {
        warnings.push('⚠️  ALLOWED_ORIGINS non défini');
    }

} else {
    errors.push('❌ Fichier .env manquant');
    console.log('   Copiez .env.example vers .env : cp .env.example .env');
}

// Vérification 2 : .gitignore contient .env
console.log('\n2️⃣  Vérification du .gitignore...');
if (fs.existsSync('.gitignore')) {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    if (gitignoreContent.includes('.env')) {
        success.push('✅ .env est dans .gitignore');
    } else {
        errors.push('❌ .env n\'est PAS dans .gitignore - RISQUE DE FUITE !');
    }
    if (gitignoreContent.includes('*.sqlite')) {
        success.push('✅ Fichiers SQLite dans .gitignore');
    }
    if (gitignoreContent.includes('logs/')) {
        success.push('✅ Dossier logs dans .gitignore');
    }
} else {
    warnings.push('⚠️  Fichier .gitignore manquant');
}

// Vérification 3 : Dossier logs
console.log('\n3️⃣  Vérification du dossier logs...');
if (fs.existsSync('logs')) {
    success.push('✅ Dossier logs existe');

    // Vérifier les permissions (Unix uniquement)
    if (process.platform !== 'win32') {
        const stats = fs.statSync('logs');
        const mode = stats.mode.toString(8);
        if (mode.endsWith('755') || mode.endsWith('750')) {
            success.push('✅ Permissions du dossier logs correctes');
        } else {
            warnings.push(`⚠️  Permissions du dossier logs : ${mode.slice(-3)} (recommandé: 755)`);
        }
    }
} else {
    warnings.push('⚠️  Dossier logs n\'existe pas (sera créé automatiquement)');
}

// Vérification 4 : Modules de sécurité installés
console.log('\n4️⃣  Vérification des dépendances de sécurité...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const securityModules = [
    'helmet',
    'express-rate-limit',
    'express-validator',
    'cors',
    'hpp',
    'winston',
    'dotenv',
    'bcrypt'
];

securityModules.forEach(module => {
    if (packageJson.dependencies && packageJson.dependencies[module]) {
        success.push(`✅ Module ${module} installé`);
    } else {
        errors.push(`❌ Module de sécurité manquant : ${module}`);
    }
});

// Vérification 5 : Fichiers de sécurité présents
console.log('\n5️⃣  Vérification des fichiers de sécurité...');
const securityFiles = [
    'validators.js',
    'logger.js',
    'rateLimiter.js',
    'SECURITY.md'
];

securityFiles.forEach(file => {
    if (fs.existsSync(file)) {
        success.push(`✅ Fichier ${file} présent`);
    } else {
        errors.push(`❌ Fichier de sécurité manquant : ${file}`);
    }
});

// Vérification 6 : Base de données
console.log('\n6️⃣  Vérification de la base de données...');
if (fs.existsSync('database.sqlite')) {
    success.push('✅ Base de données existe');

    // Vérifier les permissions (Unix uniquement)
    if (process.platform !== 'win32') {
        const stats = fs.statSync('database.sqlite');
        const mode = stats.mode.toString(8);
        if (mode.endsWith('600')) {
            success.push('✅ Permissions de la base de données correctes (600)');
        } else {
            warnings.push(`⚠️  Permissions de la base de données : ${mode.slice(-3)} (recommandé: 600)`);
            console.log('   Correction : chmod 600 database.sqlite');
        }
    }
} else {
    warnings.push('⚠️  Base de données n\'existe pas encore (sera créée au premier lancement)');
}

// Vérification 7 : npm audit
console.log('\n7️⃣  Vérification des vulnérabilités npm...');
console.log('   (Exécutez manuellement : npm audit)');

// Résumé
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ DE LA VÉRIFICATION\n');

if (success.length > 0) {
    console.log('✅ SUCCÈS (' + success.length + ')');
    success.forEach(s => console.log('   ' + s));
}

if (warnings.length > 0) {
    console.log('\n⚠️  AVERTISSEMENTS (' + warnings.length + ')');
    warnings.forEach(w => console.log('   ' + w));
}

if (errors.length > 0) {
    console.log('\n❌ ERREURS CRITIQUES (' + errors.length + ')');
    errors.forEach(e => console.log('   ' + e));
}

console.log('\n' + '='.repeat(60));

// Verdict final
if (errors.length === 0 && warnings.length === 0) {
    console.log('\n🎉 EXCELLENT ! Toutes les vérifications sont passées.');
    console.log('   Votre application est prête pour la production.\n');
    process.exit(0);
} else if (errors.length === 0) {
    console.log('\n✅ BON ! Quelques avertissements, mais rien de critique.');
    console.log('   Vérifiez les avertissements avant le déploiement.\n');
    process.exit(0);
} else {
    console.log('\n❌ ATTENTION ! Des erreurs critiques doivent être corrigées.');
    console.log('   NE PAS déployer en production dans cet état !\n');
    process.exit(1);
}
