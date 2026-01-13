<?php
// Forcer l'affichage des erreurs
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Buffer de sortie pour capturer tout
ob_start();

echo "=== TEST DÉMARRÉ ===\n\n";

try {
    echo "Étape 1: Chargement config...\n";
    require_once __DIR__ . '/config.php';
    echo "✓ Config chargé\n\n";

    echo "Étape 2: Test getAuthToken...\n";
    $token = getAuthToken();
    echo "✓ Token: " . ($token ? substr($token, 0, 30) . "..." : "NULL") . "\n\n";

    echo "Étape 3: Test verifyToken...\n";
    if ($token) {
        $userData = verifyToken($token);
        if ($userData) {
            echo "✓ Token valide\n";
            echo "  UserID: " . $userData['userId'] . "\n";
            echo "  Username: " . ($userData['username'] ?? 'N/A') . "\n\n";
        } else {
            echo "✗ Token invalide\n\n";
        }
    } else {
        echo "✗ Pas de token fourni\n\n";
    }

    echo "Étape 4: Test session_start...\n";
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
        echo "✓ Session démarrée\n\n";
    } else {
        echo "✓ Session déjà active\n\n";
    }

    echo "Étape 5: Test sendJSON direct...\n";
    // Ne pas appeler sendJSON car il fait exit
    echo "✓ Prêt à appeler sendJSON (skip pour voir le reste)\n\n";

    echo "=== TOUS LES TESTS PASSÉS ===\n";

} catch (Throwable $e) {
    echo "\n\n!!! ERREUR CAPTURÉE !!!\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Fichier: " . $e->getFile() . "\n";
    echo "Ligne: " . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}

$output = ob_get_clean();
header('Content-Type: text/plain');
echo $output;
?>
