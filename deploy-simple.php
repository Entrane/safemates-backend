<?php
/**
 * Script de déploiement simple pour Hostinger
 * Place ce fichier dans /public_html/deploy-simple.php
 * Puis visite: https://ton-site.fr/deploy-simple.php pour déployer
 */

// Mot de passe de sécurité - CHANGE-LE !
define('DEPLOY_PASSWORD', 'SafeMates2024Deploy');

// Vérification du mot de passe
if (!isset($_GET['password']) || $_GET['password'] !== DEPLOY_PASSWORD) {
    die('❌ Accès refusé. Mot de passe incorrect.');
}

echo "<h1>🚀 Déploiement automatique SafeMates</h1>";
echo "<pre>";

// Chemin vers le dossier Git (ajuste selon ta structure Hostinger)
$gitPath = '/home/u574849695/domains/safemates.fr/git/MatchMates1.0-main';
$publicPath = '/home/u574849695/domains/safemates.fr/public_html';

echo "📂 Dossier Git: $gitPath\n";
echo "📂 Dossier Public: $publicPath\n\n";

// Vérifier que le dossier Git existe
if (!is_dir($gitPath)) {
    die("❌ Erreur: Le dossier Git n'existe pas à: $gitPath\n");
}

// Se déplacer dans le dossier Git et faire un pull
chdir($gitPath);

echo "🔄 Git pull en cours...\n";
$output = shell_exec('git pull origin main 2>&1');
echo $output . "\n\n";

// Liste des fichiers à copier
$filesToCopy = [
    'dashboard.html',
    'game.html',
    'index.html',
    'login.html',
    'signup.html',
    'profile.html',
    'contact.html',
    'moderation.html',
    'style.css',
    'style-enhanced.css',
    'components.css',
    'animations.js',
    '.htaccess'
];

echo "📋 Copie des fichiers:\n";
$copied = 0;
$failed = 0;

foreach ($filesToCopy as $file) {
    $source = $gitPath . '/' . $file;
    $dest = $publicPath . '/' . $file;

    if (file_exists($source)) {
        if (copy($source, $dest)) {
            echo "✅ $file copié\n";
            $copied++;
        } else {
            echo "❌ Erreur copie $file\n";
            $failed++;
        }
    } else {
        echo "⚠️  $file non trouvé\n";
    }
}

// Copier le dossier api/
echo "\n📁 Copie du dossier /api/...\n";
$apiSource = $gitPath . '/api';
$apiDest = $publicPath . '/api';

if (is_dir($apiSource)) {
    // Créer le dossier api s'il n'existe pas
    if (!is_dir($apiDest)) {
        mkdir($apiDest, 0755, true);
    }

    // Copier tous les fichiers PHP de l'API
    $apiFiles = glob($apiSource . '/*.php');
    foreach ($apiFiles as $apiFile) {
        $filename = basename($apiFile);
        if (copy($apiFile, $apiDest . '/' . $filename)) {
            echo "✅ api/$filename copié\n";
            $copied++;
        } else {
            echo "❌ Erreur copie api/$filename\n";
            $failed++;
        }
    }
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "✅ Fichiers copiés: $copied\n";
echo "❌ Échecs: $failed\n";
echo "\n🎉 Déploiement terminé!\n";
echo "🔄 Rafraîchis ton site en mode navigation privée pour voir les changements.\n";
echo "</pre>";
?>
