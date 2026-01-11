<?php
/**
 * ====================================================
 * WEBHOOK DE DÉPLOIEMENT AUTOMATIQUE
 * Script appelé par GitHub à chaque push
 * ====================================================
 */

// Clé secrète pour sécuriser le webhook (à définir dans GitHub)
define('WEBHOOK_SECRET', 'CHANGEZ_CETTE_CLE_SECRETE_12345');

// Vérifier que la requête vient bien de GitHub
$headers = getallheaders();
$signature = isset($headers['X-Hub-Signature-256']) ? $headers['X-Hub-Signature-256'] : '';

// Récupérer le payload
$payload = file_get_contents('php://input');

// Vérifier la signature (sécurité)
$hash = 'sha256=' . hash_hmac('sha256', $payload, WEBHOOK_SECRET);

if (!hash_equals($hash, $signature)) {
    http_response_code(403);
    die('Signature invalide');
}

// Logger le déploiement
$logFile = __DIR__ . '/deploy-log.txt';
$timestamp = date('Y-m-d H:i:s');

file_put_contents($logFile, "\n=== Déploiement $timestamp ===\n", FILE_APPEND);

// Décoder le payload JSON
$data = json_decode($payload, true);

if (isset($data['ref']) && $data['ref'] === 'refs/heads/main') {
    file_put_contents($logFile, "Push sur la branche main détecté\n", FILE_APPEND);

    // Chemin du dépôt Git (à adapter selon votre configuration Hostinger)
    $repoPath = '/home/u123456789/git/safemates-backend';
    $publicPath = __DIR__; // public_html

    // Commandes Git
    $commands = [
        "cd $repoPath",
        "git fetch origin main",
        "git reset --hard origin/main",
        "git pull origin main"
    ];

    foreach ($commands as $cmd) {
        $output = shell_exec($cmd . ' 2>&1');
        file_put_contents($logFile, "Commande: $cmd\n", FILE_APPEND);
        file_put_contents($logFile, "Résultat: $output\n", FILE_APPEND);
    }

    // Copier les fichiers vers public_html
    file_put_contents($logFile, "Copie des fichiers...\n", FILE_APPEND);

    // Liste des fichiers à copier
    $filesToCopy = [
        '*.html',
        '*.css',
        '*.js',
        '.htaccess',
        'manifest.json'
    ];

    foreach ($filesToCopy as $pattern) {
        $copyCmd = "cp -f $repoPath/$pattern $publicPath/ 2>&1";
        $output = shell_exec($copyCmd);
        file_put_contents($logFile, "Copie $pattern: $output\n", FILE_APPEND);
    }

    // Copier le dossier api
    $output = shell_exec("cp -rf $repoPath/api/* $publicPath/api/ 2>&1");
    file_put_contents($logFile, "Copie api/: $output\n", FILE_APPEND);

    // Copier les images
    $imageDirs = ['Image', 'csgo_rank', 'lol_rank', 'Valorant_rank', 'fortnite rank', 'rocketleague_rank', 'warzone_rank'];
    foreach ($imageDirs as $dir) {
        if (file_exists("$repoPath/$dir")) {
            $output = shell_exec("cp -rf $repoPath/$dir $publicPath/ 2>&1");
            file_put_contents($logFile, "Copie $dir/: $output\n", FILE_APPEND);
        }
    }

    file_put_contents($logFile, "✅ Déploiement terminé avec succès\n", FILE_APPEND);

    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Déploiement effectué']);
} else {
    file_put_contents($logFile, "Push ignoré (pas sur main)\n", FILE_APPEND);
    http_response_code(200);
    echo json_encode(['status' => 'ignored', 'message' => 'Branche ignorée']);
}

file_put_contents($logFile, "=== Fin du déploiement ===\n\n", FILE_APPEND);
?>
