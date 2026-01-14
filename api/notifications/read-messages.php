<?php
/**
 * Endpoint /api/notifications/read-messages
 * Marquer toutes les notifications de messages d'un utilisateur comme lues
 */

require_once __DIR__ . '/../config.php';

$authUser = requireAuth();
$userId = $authUser['userId'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Méthode non autorisée'], 405);
}

$input = getJsonInput();
$fromUsername = $input['fromUsername'] ?? null;

if (!$fromUsername) {
    sendJSON(['error' => 'Paramètre fromUsername manquant'], 400);
}

try {
    $db = getDB();

    // Récupérer l'ID de l'utilisateur source
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$fromUsername]);
    $fromUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$fromUser) {
        sendJSON(['error' => 'Utilisateur non trouvé'], 404);
    }

    $fromUserId = $fromUser['id'];

    // Marquer toutes les notifications de messages de cet utilisateur comme lues
    $stmt = $db->prepare("
        UPDATE notifications
        SET is_read = 1, updated_at = NOW()
        WHERE user_id = ?
        AND type = 'new_message'
        AND JSON_EXTRACT(data, '$.from_user_id') = ?
        AND is_read = 0
    ");
    $stmt->execute([$userId, $fromUserId]);

    sendJSON([
        'success' => true,
        'marked_count' => $stmt->rowCount()
    ]);

} catch (Exception $e) {
    error_log("Erreur /api/notifications/read-messages: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
