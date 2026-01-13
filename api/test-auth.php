<?php
/**
 * Test de l'authentification isolée
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

echo json_encode(['step' => 0, 'message' => 'Début du test']);

try {
    // Étape 1: Charger config
    require_once __DIR__ . '/config.php';
    echo "\n" . json_encode(['step' => 1, 'message' => 'Config chargé']);

    // Étape 2: Test getAuthToken
    $token = getAuthToken();
    echo "\n" . json_encode(['step' => 2, 'token' => $token ? substr($token, 0, 20) . '...' : 'null']);

    // Étape 3: Test requireAuth (c'est probablement ici que ça plante)
    $authUser = requireAuth();
    echo "\n" . json_encode(['step' => 3, 'userId' => $authUser['userId']]);

} catch (Exception $e) {
    echo "\n" . json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
