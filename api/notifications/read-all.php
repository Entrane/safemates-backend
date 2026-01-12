<?php
/**
 * Endpoint /api/notifications/read-all
 * Marquer toutes les notifications comme lues
 */

require_once __DIR__ . '/../config.php';



$authUser = requireAuth();
$userId = $authUser['userId'];
if (false) {
    sendJSON(['error' => 'Non authentifié'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Méthode non autorisée'], 405);
}

try {
    $db = getDB();

    // Marquer toutes comme lues
    $stmt = $db->prepare("
        UPDATE notifications
        SET is_read = 1, updated_at = NOW()
        WHERE user_id = ? AND is_read = 0
    ");
    $stmt->execute([$_SESSION['user_id']]);

    sendJSON(['success' => true]);

} catch (Exception $e) {
    error_log("Erreur /api/notifications/read-all: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
