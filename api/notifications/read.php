<?php
/**
 * Endpoint /api/notifications/{id}/read
 * Marquer une notification comme lue
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

// Récupérer l'ID de la notification depuis l'URL
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
preg_match('/\/notifications\/(\d+)\/read/', $path, $matches);
$notificationId = $matches[1] ?? null;

if (!$notificationId) {
    sendJSON(['error' => 'ID notification manquant'], 400);
}

try {
    $db = getDB();

    // Marquer comme lue
    $stmt = $db->prepare("
        UPDATE notifications
        SET is_read = 1, updated_at = NOW()
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$notificationId, $userId]);

    sendJSON(['success' => true]);

} catch (Exception $e) {
    error_log("Erreur /api/notifications/read: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
