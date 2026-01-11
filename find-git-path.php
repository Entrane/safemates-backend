<?php
/**
 * Script pour trouver le chemin Git sur Hostinger
 * Upload ce fichier et visite-le pour trouver où est ton dépôt Git
 */

echo "<h1>🔍 Recherche du dossier Git</h1>";
echo "<pre>";

// Chemin de base Hostinger
$baseDir = dirname(__DIR__);
echo "📂 Dossier actuel: " . __DIR__ . "\n";
echo "📂 Dossier parent: $baseDir\n\n";

// Chemins possibles pour le dépôt Git
$possiblePaths = [
    '/home/u639530603/domains/safemates.fr/git',
    '/home/u639530603/git',
    '/home/u639530603/public_html/git',
    dirname(__DIR__) . '/git',
    '/home/u574849695/domains/safemates.fr/git',
    '/home/u574849695/git'
];

echo "🔎 Recherche dans les emplacements possibles:\n\n";

foreach ($possiblePaths as $path) {
    echo "Vérification: $path\n";

    if (is_dir($path)) {
        echo "  ✅ TROUVÉ!\n";

        // Lister les sous-dossiers
        $dirs = scandir($path);
        echo "  Contenu:\n";
        foreach ($dirs as $dir) {
            if ($dir != '.' && $dir != '..') {
                $fullPath = $path . '/' . $dir;
                echo "    - $dir " . (is_dir($fullPath) ? "(dossier)" : "(fichier)") . "\n";

                // Vérifier si c'est un dépôt Git
                if (is_dir($fullPath . '/.git')) {
                    echo "      🎯 DÉPÔT GIT DÉTECTÉ!\n";
                    echo "      Chemin complet: $fullPath\n";
                }
            }
        }
        echo "\n";
    } else {
        echo "  ❌ N'existe pas\n\n";
    }
}

// Scanner le home directory
$homeDir = '/home/' . get_current_user();
echo "🏠 Home directory: $homeDir\n";
echo "👤 User actuel: " . get_current_user() . "\n\n";

// Lister tous les dossiers dans le home
if (is_dir($homeDir)) {
    echo "📁 Contenu du home directory:\n";
    $homeDirs = scandir($homeDir);
    foreach ($homeDirs as $dir) {
        if ($dir != '.' && $dir != '..' && is_dir($homeDir . '/' . $dir)) {
            echo "  - $dir/\n";
        }
    }
}

echo "</pre>";
?>
