<?php
/**
 * API de heartbeat pour maintenir l'activité utilisateur
 * POST /api/heartbeat.php
 *
 * Appelé périodiquement par le frontend pour indiquer que l'utilisateur est actif
 */

require_once 'config.php';

// Vérifier l'authentification
$user = requireAuth();

try {
    $db = getDB();

    // Mettre à jour le timestamp d'activité
    $stmt = $db->prepare('
        INSERT INTO user_sessions (user_id, last_activity)
        VALUES (?, NOW())
        ON DUPLICATE KEY UPDATE last_activity = NOW()
    ');
    $stmt->execute([$user['userId']]);

    sendJSON([
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s')
    ], 200);

} catch (PDOException $e) {
    error_log("Erreur heartbeat: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de la mise à jour de l\'activité'], 500);
}
?>
