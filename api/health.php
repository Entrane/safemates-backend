<?php
/**
 * API de vérification de santé
 * GET /api/health.php
 */

require_once 'config.php';

try {
    // Vérifier la connexion à la base de données
    $db = getDB();

    sendJSON([
        'status' => 'OK',
        'message' => 'API MatchMates opérationnelle',
        'timestamp' => date('c'),
        'database' => USE_SQLITE ? 'SQLite' : 'MySQL'
    ], 200);

} catch (Exception $e) {
    sendJSON([
        'status' => 'ERROR',
        'message' => 'Problème de connexion à la base de données'
    ], 500);
}
?>
