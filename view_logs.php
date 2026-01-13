#!/usr/bin/env php
<?php
/**
 * Script pour afficher les derniers logs d'erreur
 * Utile pour diagnostiquer les problèmes SQL
 */

// Tentative de lecture du fichier error_log
$possibleLogPaths = [
    ini_get('error_log'),
    __DIR__ . '/error_log',
    __DIR__ . '/../logs/error_log',
    '/var/log/php_errors.log',
    '/tmp/php_errors.log'
];

echo "🔍 Recherche des logs d'erreur PHP\n\n";

$logFound = false;
foreach ($possibleLogPaths as $path) {
    if (empty($path)) continue;

    echo "Vérification: {$path}\n";

    if (file_exists($path) && is_readable($path)) {
        echo "✅ Fichier trouvé: {$path}\n\n";
        echo "📋 Dernières 100 lignes du log:\n";
        echo str_repeat("=", 80) . "\n";

        // Lire les dernières lignes
        $lines = file($path);
        $lastLines = array_slice($lines, -100);

        // Filtrer pour ne garder que les lignes liées au matchmaking
        $matchmakingLines = [];
        foreach ($lastLines as $line) {
            if (stripos($line, 'MATCHMAKING') !== false ||
                stripos($line, 'SQL ERROR') !== false ||
                stripos($line, 'SQL Condition') !== false ||
                stripos($line, 'Preferred Ranks') !== false ||
                stripos($line, 'search.php') !== false) {
                $matchmakingLines[] = $line;
            }
        }

        if (!empty($matchmakingLines)) {
            echo "\n🎯 Lignes liées au MATCHMAKING:\n";
            echo str_repeat("-", 80) . "\n";
            foreach ($matchmakingLines as $line) {
                echo $line;
            }
        } else {
            echo "\n⚠️  Aucune ligne liée au matchmaking trouvée dans les 100 dernières lignes.\n";
            echo "Affichage des 20 dernières lignes générales:\n\n";
            foreach (array_slice($lastLines, -20) as $line) {
                echo $line;
            }
        }

        $logFound = true;
        break;
    }
}

if (!$logFound) {
    echo "\n❌ Aucun fichier de log trouvé aux emplacements suivants:\n";
    foreach ($possibleLogPaths as $path) {
        if (!empty($path)) {
            echo "  - {$path}\n";
        }
    }

    echo "\n💡 Configuration PHP actuelle:\n";
    echo "  - error_log: " . ini_get('error_log') . "\n";
    echo "  - log_errors: " . ini_get('log_errors') . "\n";
    echo "  - display_errors: " . ini_get('display_errors') . "\n";
}

echo "\n" . str_repeat("=", 80) . "\n";
?>
